# EC2 Kernel 5.13+ Configuration Guide

This guide explains how to configure EC2 instances with Linux kernel version 5.13 and higher using Terraform.

## Available AMI Options with Kernel 5.13+

### 1. Amazon Linux 2023 (Recommended)
- **Kernel Version**: 6.1+
- **AMI Data Source**: `data.aws_ami.amazon_linux_2023`
- **Pros**: 
  - Latest Amazon Linux with long-term support
  - Optimized for AWS services
  - Built-in AWS CLI and SSM Agent
  - SELinux enabled by default
- **Cons**: 
  - Some packages differ from Amazon Linux 2
  - No `amazon-linux-extras` repository

### 2. Ubuntu 22.04 LTS (Jammy Jellyfish)
- **Kernel Version**: 5.15+
- **AMI Data Source**: `data.aws_ami.ubuntu_22_04`
- **Pros**:
  - Long-term support until 2027
  - Large package repository
  - Good container support
- **Cons**:
  - Requires manual AWS tool installation
  - Different package manager (apt vs yum)

### 3. Ubuntu 20.04 LTS with HWE Kernel
- **Kernel Version**: 5.13+
- **AMI Data Source**: `data.aws_ami.ubuntu_20_04_hwe`
- **Pros**:
  - Stable and mature
  - Hardware Enablement (HWE) kernel
- **Cons**:
  - Older base system
  - Requires kernel upgrade after launch

### 4. Debian 11 (Bullseye)
- **Kernel Version**: 5.10 (upgradeable to 5.13+)
- **AMI Data Source**: `data.aws_ami.debian_11`
- **Pros**:
  - Very stable
  - Minimal base system
- **Cons**:
  - Requires manual kernel upgrade
  - Limited AWS-specific optimizations

## Current Configuration

The Terraform configuration is currently set to use **Amazon Linux 2023** for both the application and Jenkins instances. This provides kernel 6.1+, which exceeds the 5.13 requirement.

## How to Switch AMIs

To use a different AMI, simply change the `ami` parameter in the EC2 instance resources:

```hcl
# For Ubuntu 22.04
resource "aws_instance" "app_instance" {
  ami = data.aws_ami.ubuntu_22_04.id
  # ... rest of configuration
}

# For Ubuntu 20.04 with HWE
resource "aws_instance" "app_instance" {
  ami = data.aws_ami.ubuntu_20_04_hwe.id
  # ... rest of configuration
}

# For Debian 11
resource "aws_instance" "app_instance" {
  ami = data.aws_ami.debian_11.id
  # ... rest of configuration
}
```

## Important Considerations When Switching AMIs

### 1. User Data Script Compatibility

Different distributions require different commands:

**Amazon Linux 2023:**
```bash
yum install -y docker
systemctl enable docker
systemctl start docker
```

**Ubuntu 22.04/20.04:**
```bash
apt-get update
apt-get install -y docker.io
systemctl enable docker
systemctl start docker
```

**Debian 11:**
```bash
apt-get update
apt-get install -y docker.io
systemctl enable docker
systemctl start docker
```

### 2. Package Names

Package names may differ between distributions:
- Amazon Linux: `amazon-ssm-agent`
- Ubuntu/Debian: `amazon-ssm-agent` (requires manual installation)

### 3. Java Installation

- Amazon Linux 2023: `java-11-amazon-corretto`
- Ubuntu: `openjdk-11-jdk`
- Debian: `openjdk-11-jdk`

### 4. AWS Tools

Amazon Linux comes with AWS tools pre-installed, while Ubuntu/Debian require manual installation:

```bash
# Ubuntu/Debian
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

## Kernel Version Verification

To verify the kernel version after instance launch:

```bash
uname -r
```

Expected outputs:
- Amazon Linux 2023: `6.1.x` or higher
- Ubuntu 22.04: `5.15.x` or higher
- Ubuntu 20.04 HWE: `5.13.x` or higher
- Debian 11: `5.10.x` (upgradeable)

## Upgrading Kernel on Debian 11

If using Debian 11 and need kernel 5.13+:

```bash
# Add backports repository
echo "deb http://deb.debian.org/debian bullseye-backports main" | sudo tee /etc/apt/sources.list.d/backports.list
sudo apt update

# Install newer kernel from backports
sudo apt install -t bullseye-backports linux-image-amd64

# Reboot to use new kernel
sudo reboot
```

## Security Considerations

1. **Amazon Linux 2023** has SELinux enabled by default
2. **Ubuntu** uses AppArmor for security
3. **Debian** has minimal security frameworks by default

Ensure your security configurations are compatible with your chosen distribution.

## Performance Considerations

Kernel 5.13+ brings several performance improvements:
- Better CPU scheduling
- Improved memory management
- Enhanced container performance
- Better support for modern hardware

## Monitoring and Troubleshooting

After deployment, monitor:
1. Instance boot times
2. Application compatibility
3. System logs (`/var/log/user-data.log`)
4. Service status (`systemctl status docker`)

## Rollback Strategy

If you need to rollback to Amazon Linux 2 (kernel 4.14):
1. Change `ami = data.aws_ami.amazon_linux_2023.id` back to `ami = data.aws_ami.amazon_linux_2.id`
2. Restore the original user_data scripts
3. Run `terraform plan` to verify changes
4. Run `terraform apply` to deploy 