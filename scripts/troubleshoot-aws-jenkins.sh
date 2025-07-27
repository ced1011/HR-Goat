#!/bin/bash

# Troubleshooting script for AWS CLI on Jenkins
# Run this on the Jenkins server to diagnose AWS CLI issues

echo "=== AWS CLI Troubleshooting for Jenkins ==="
echo "Date: $(date)"
echo "Hostname: $(hostname)"
echo ""

# Function to print section headers
print_header() {
    echo ""
    echo "=== $1 ==="
    echo ""
}

print_header "System Information"
echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'=' -f2 | tr -d '"')"
echo "Kernel: $(uname -r)"
echo "Architecture: $(uname -m)"

print_header "User Context"
echo "Current user: $(whoami)"
echo "User ID: $(id)"
echo "Home directory: $HOME"
echo "Current directory: $(pwd)"

print_header "Jenkins Process Information"
if ps aux | grep -v grep | grep jenkins > /dev/null; then
    echo "Jenkins is running:"
    ps aux | grep -v grep | grep jenkins | head -1
    
    # Get Jenkins user
    JENKINS_USER=$(ps aux | grep -v grep | grep jenkins | head -1 | awk '{print $1}')
    echo ""
    echo "Jenkins user: $JENKINS_USER"
    echo "Jenkins user groups: $(groups $JENKINS_USER 2>/dev/null || echo 'Unable to get groups')"
else
    echo "Jenkins process not found running"
fi

print_header "AWS CLI Installation Check"

# Check in common locations
AWS_LOCATIONS=(
    "/usr/local/bin/aws"
    "/usr/bin/aws"
    "/bin/aws"
    "/opt/aws/bin/aws"
    "$HOME/.local/bin/aws"
    "/root/.local/bin/aws"
)

echo "Searching for AWS CLI in common locations:"
for loc in "${AWS_LOCATIONS[@]}"; do
    if [ -f "$loc" ]; then
        echo "✓ Found: $loc"
        if [ -x "$loc" ]; then
            echo "  Version: $($loc --version 2>&1)"
        else
            echo "  ⚠️  Not executable"
        fi
    else
        echo "✗ Not found: $loc"
    fi
done

# Check using which
echo ""
echo "Which aws: $(which aws 2>&1)"

# Check PATH
print_header "PATH Environment Variable"
echo "Current PATH:"
echo "$PATH" | tr ':' '\n' | nl

# Check if AWS CLI is in Jenkins user's PATH
if [ -n "$JENKINS_USER" ] && [ "$JENKINS_USER" != "$(whoami)" ]; then
    echo ""
    echo "Jenkins user's PATH:"
    su - $JENKINS_USER -c 'echo $PATH' 2>/dev/null || sudo -u $JENKINS_USER bash -c 'echo $PATH' 2>/dev/null || echo "Unable to get Jenkins user PATH"
fi

print_header "AWS Configuration"

# Check for AWS config files
echo "AWS configuration files:"
for config_dir in "$HOME/.aws" "/root/.aws" "/var/lib/jenkins/.aws" "/home/jenkins/.aws"; do
    if [ -d "$config_dir" ]; then
        echo "✓ Found: $config_dir"
        ls -la "$config_dir" 2>/dev/null | grep -E "(config|credentials)" || echo "  No config/credentials files"
    else
        echo "✗ Not found: $config_dir"
    fi
done

# Check environment variables
print_header "AWS Environment Variables"
env | grep -i aws | grep -v PASSWORD | sort || echo "No AWS environment variables found"

# Test AWS CLI functionality
print_header "AWS CLI Functionality Test"

if command -v aws >/dev/null 2>&1; then
    echo "Testing AWS CLI..."
    
    # Test basic command
    echo ""
    echo "1. Version check:"
    aws --version
    
    # Test STS get-caller-identity
    echo ""
    echo "2. Caller identity check:"
    if aws sts get-caller-identity 2>&1; then
        echo "✓ AWS credentials are working"
    else
        echo "✗ AWS credentials not configured or invalid"
    fi
    
    # Test SSM
    echo ""
    echo "3. SSM service check:"
    if aws ssm describe-instance-information --max-items 1 2>&1 | head -5; then
        echo "✓ Can access SSM service"
    else
        echo "✗ Cannot access SSM service"
    fi
else
    echo "AWS CLI not found in PATH"
fi

# Check IMDSv2
print_header "EC2 Instance Metadata Service (IMDS) Check"

# Check if we're on EC2
if curl -s -m 2 http://169.254.169.254/latest/meta-data/instance-id >/dev/null 2>&1; then
    echo "✓ Running on EC2 instance"
    echo "Testing IMDSv1..."
    INSTANCE_ID=$(curl -s -m 2 http://169.254.169.254/latest/meta-data/instance-id 2>/dev/null)
    if [ -n "$INSTANCE_ID" ]; then
        echo "✓ IMDSv1 accessible - Instance ID: $INSTANCE_ID"
    else
        echo "✗ IMDSv1 not accessible"
    fi
    
    echo ""
    echo "Testing IMDSv2..."
    TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" -s -m 2 2>/dev/null)
    if [ -n "$TOKEN" ]; then
        INSTANCE_ID=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s -m 2 http://169.254.169.254/latest/meta-data/instance-id 2>/dev/null)
        if [ -n "$INSTANCE_ID" ]; then
            echo "✓ IMDSv2 accessible - Instance ID: $INSTANCE_ID"
        else
            echo "✗ IMDSv2 not working properly"
        fi
    else
        echo "✗ Cannot get IMDSv2 token"
    fi
else
    echo "Not running on EC2 or IMDS is not accessible"
fi

# Jenkins-specific checks
print_header "Jenkins-Specific AWS Configuration"

JENKINS_HOME="${JENKINS_HOME:-/var/lib/jenkins}"
if [ -d "$JENKINS_HOME" ]; then
    echo "Jenkins home: $JENKINS_HOME"
    
    # Check for AWS plugins
    if [ -d "$JENKINS_HOME/plugins" ]; then
        echo ""
        echo "AWS-related Jenkins plugins:"
        ls -1 "$JENKINS_HOME/plugins" | grep -i aws | head -10 || echo "No AWS plugins found"
    fi
    
    # Check for credentials
    echo ""
    echo "Jenkins credentials.xml exists: $([ -f "$JENKINS_HOME/credentials.xml" ] && echo "Yes" || echo "No")"
else
    echo "Jenkins home directory not found at $JENKINS_HOME"
fi

print_header "Recommendations"

echo "Based on the checks above:"
echo ""

# Check if AWS CLI is installed
if ! command -v aws >/dev/null 2>&1; then
    echo "1. AWS CLI is not installed or not in PATH"
    echo "   Solution: Install AWS CLI v2:"
    echo "   curl \"https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip\" -o \"awscliv2.zip\""
    echo "   unzip awscliv2.zip && sudo ./aws/install"
    echo ""
fi

# Check if running as correct user
if [ "$(whoami)" != "jenkins" ] && [ -n "$JENKINS_USER" ]; then
    echo "2. Not running as Jenkins user"
    echo "   Solution: Run this script as Jenkins user:"
    echo "   sudo -u $JENKINS_USER $0"
    echo ""
fi

# Check AWS credentials
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo "3. AWS credentials not configured"
    echo "   Solutions:"
    echo "   - Use IAM instance profile (recommended for EC2)"
    echo "   - Configure Jenkins AWS credentials plugin"
    echo "   - Set AWS environment variables in Jenkins"
    echo ""
fi

echo "For XDR installation via SSM, ensure:"
echo "- AWS CLI is installed and in Jenkins PATH"
echo "- Jenkins has valid AWS credentials (IAM role or keys)"
echo "- Target instance has SSM agent running"
echo "- Jenkins IAM role has SSM permissions"

print_header "Script Complete" 