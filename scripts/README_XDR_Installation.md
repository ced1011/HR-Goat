# XDR Installation via AWS SSM

This guide explains how to install Cortex XDR agent on EC2 instances using AWS Systems Manager (SSM).

## Problem Summary

The Jenkins machine needs AWS CLI tools properly configured to install XDR agents via SSM on target EC2 instances.

## Solution Overview

### 1. AWS CLI is Already Installed

The Terraform configuration (`terraform/main.tf`) automatically installs AWS CLI v2 on the Jenkins EC2 instance during provisioning:
- AWS CLI v2 is installed system-wide at `/usr/local/bin/aws`
- A symlink is created at `/usr/bin/aws` for compatibility

### 2. Common Issues and Solutions

#### Issue: AWS CLI not accessible in Jenkins pipeline
**Symptoms:**
- "aws: command not found" errors in Jenkins builds
- SSM commands failing

**Solutions:**
1. Ensure AWS CLI is in Jenkins PATH:
   ```bash
   # Add to Jenkins environment variables
   PATH=/usr/local/bin:/usr/bin:$PATH
   ```

2. Verify AWS CLI installation:
   ```bash
   sudo -u jenkins aws --version
   ```

#### Issue: AWS credentials not configured
**Symptoms:**
- "Unable to locate credentials" errors
- SSM commands returning permission denied

**Solutions:**
1. The Jenkins instance uses an IAM instance profile (`jenkins_instance_profile`)
2. Ensure the IAM role has necessary permissions:
   - `ssm:SendCommand`
   - `ssm:GetCommandInvocation`
   - `ssm:DescribeInstanceInformation`
   - `ec2:DescribeInstances`

#### Issue: IMDSv2 enforcement
**Symptoms:**
- Credentials not being retrieved from instance metadata
- Older AWS SDK versions failing

**Solution:**
The instance enforces IMDSv2. The installed AWS CLI v2 supports this, but ensure all Jenkins AWS plugins are up to date.

## Installation Process

### Step 1: Verify AWS Tools
Run the verification stage in Jenkins pipeline to check AWS CLI availability:
```groovy
stage('Verify AWS Tools') {
    // Automatically checks AWS CLI, credentials, and SSM agent
}
```

### Step 2: Upload XDR Installer
Place the XDR installer in the `xdr_install/` directory:
```bash
xdr_install/hrgoat-allinone.tar.gz
```

### Step 3: Run Jenkins Pipeline with XDR Installation
1. Go to Jenkins UI
2. Build with parameters:
   - Select your AWS region
   - Check "Install XDR Agent" checkbox
3. The pipeline will:
   - Deploy the application
   - Upload XDR installer to the instance
   - Install XDR agent via SSM

### Step 4: Manual Installation (Alternative)
Use the provided script for manual installation:
```bash
./scripts/install-xdr-agent.sh <instance-id>
```

## Troubleshooting

### 1. Run Diagnostics
Use the troubleshooting script to diagnose issues:
```bash
# On Jenkins server
sudo -u jenkins ./scripts/troubleshoot-aws-jenkins.sh
```

### 2. Check SSM Agent on Target
Ensure SSM agent is running on the target instance:
```bash
aws ssm describe-instance-information --filters "Key=InstanceIds,Values=<instance-id>"
```

### 3. Verify IAM Permissions
Check Jenkins IAM role permissions:
```bash
./examples/check_aws_permissions.sh
```

### 4. Manual AWS CLI Installation
If AWS CLI is missing (shouldn't happen with current Terraform):
```bash
# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

## Required IAM Permissions

The Jenkins IAM role needs:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ssm:SendCommand",
                "ssm:GetCommandInvocation",
                "ssm:DescribeInstanceInformation",
                "ec2:DescribeInstances"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:CreateBucket",
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:DeleteBucket"
            ],
            "Resource": "arn:aws:s3:::hrgoat-xdr-temp-*"
        }
    ]
}
```

## Monitoring Installation

### Check Installation Status
```bash
# View SSM command history
aws ssm list-commands --filter "key=DocumentName,value=AWS-RunShellScript"

# Get specific command output
aws ssm get-command-invocation --command-id <command-id> --instance-id <instance-id>
```

### Verify XDR Agent
On the target instance:
```bash
# Check if XDR service is running
systemctl status cortex-xdr
# or
systemctl status traps
```

## Security Considerations

1. **Temporary S3 Bucket**: The installation process creates a temporary S3 bucket for file transfer, which is deleted after use.
2. **SSM Encryption**: All SSM communications are encrypted in transit.
3. **IAM Least Privilege**: Grant only necessary permissions to the Jenkins IAM role.

## Contact

For issues with:
- AWS Infrastructure: Check Terraform configuration
- Jenkins Pipeline: Review Jenkinsfile
- XDR Installation: Verify installer package in `xdr_install/` 