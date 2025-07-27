#!/bin/bash

# Script to install Cortex XDR agent via AWS SSM
# This script checks AWS CLI availability and uses SSM to install XDR agent

set -e

echo "=== Cortex XDR Agent Installation Script ==="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check AWS CLI installation
echo "Checking AWS CLI installation..."
if ! command_exists aws; then
    echo "ERROR: AWS CLI is not installed or not in PATH"
    echo "Installing AWS CLI v2..."
    
    # Install AWS CLI v2
    cd /tmp
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip -q awscliv2.zip
    sudo ./aws/install
    rm -rf awscliv2.zip aws/
    
    # Verify installation
    if ! aws --version; then
        echo "ERROR: Failed to install AWS CLI"
        exit 1
    fi
fi

echo "AWS CLI version: $(aws --version)"

# Check AWS credentials
echo -e "\nChecking AWS credentials..."
if ! aws sts get-caller-identity &>/dev/null; then
    echo "ERROR: AWS credentials not configured or invalid"
    echo "Please configure AWS credentials using one of the following methods:"
    echo "  1. IAM Instance Profile (recommended for EC2)"
    echo "  2. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)"
    echo "  3. AWS credentials file (~/.aws/credentials)"
    exit 1
fi

# Display caller identity
echo "AWS Identity:"
aws sts get-caller-identity

# Get instance ID if provided as argument, otherwise try to detect
if [ $# -eq 0 ]; then
    echo -e "\nNo instance ID provided. Attempting to detect..."
    if [ -f /var/lib/jenkins/workspace/.jenkins_instance_id ]; then
        INSTANCE_ID=$(cat /var/lib/jenkins/workspace/.jenkins_instance_id)
    else
        echo "ERROR: Instance ID not provided and cannot be detected"
        echo "Usage: $0 <instance-id> [xdr-installer-path]"
        exit 1
    fi
else
    INSTANCE_ID="$1"
fi

# XDR installer path (default or provided)
XDR_INSTALLER="${2:-/home/ubuntu/xdr_install/hrgoat-allinone.tar.gz}"

echo -e "\nTarget Instance: $INSTANCE_ID"
echo "XDR Installer: $XDR_INSTALLER"

# Check if instance is managed by SSM
echo -e "\nChecking SSM agent status on target instance..."
SSM_STATUS=$(aws ssm describe-instance-information --filters "Key=InstanceIds,Values=$INSTANCE_ID" --query 'InstanceInformationList[0].PingStatus' --output text 2>/dev/null || echo "NotFound")

if [ "$SSM_STATUS" == "NotFound" ] || [ "$SSM_STATUS" == "None" ]; then
    echo "ERROR: Instance $INSTANCE_ID is not registered with SSM or SSM agent is not running"
    echo "Please ensure:"
    echo "  1. SSM Agent is installed and running on the instance"
    echo "  2. Instance has proper IAM role with SSM permissions"
    echo "  3. Instance can reach SSM endpoints"
    exit 1
fi

echo "SSM Agent Status: $SSM_STATUS"

# Install XDR agent via SSM
echo -e "\nInstalling Cortex XDR agent on instance $INSTANCE_ID..."

# Create the installation command
INSTALL_COMMAND=$(cat <<'EOF'
#!/bin/bash
set -e

echo "Starting Cortex XDR agent installation..."

# Check if XDR installer exists
XDR_INSTALLER="/home/ubuntu/xdr_install/hrgoat-allinone.tar.gz"
if [ ! -f "$XDR_INSTALLER" ]; then
    echo "ERROR: XDR installer not found at $XDR_INSTALLER"
    
    # Try alternative locations
    for alt_path in "/tmp/xdr_install/hrgoat-allinone.tar.gz" "/opt/xdr_install/hrgoat-allinone.tar.gz" "/xdr_install/hrgoat-allinone.tar.gz"; do
        if [ -f "$alt_path" ]; then
            echo "Found installer at: $alt_path"
            XDR_INSTALLER="$alt_path"
            break
        fi
    done
    
    if [ ! -f "$XDR_INSTALLER" ]; then
        echo "ERROR: Could not find XDR installer in any expected location"
        exit 1
    fi
fi

# Create installation directory
mkdir -p /tmp/xdr_install
cd /tmp/xdr_install

# Extract installer
echo "Extracting XDR installer..."
tar -xzf "$XDR_INSTALLER"

# Find and run the installation script
if [ -f "install.sh" ]; then
    echo "Running XDR installation script..."
    chmod +x install.sh
    ./install.sh
elif [ -f "cortex-xdr-installer" ]; then
    echo "Running Cortex XDR installer..."
    chmod +x cortex-xdr-installer
    ./cortex-xdr-installer
else
    echo "ERROR: No installation script found in the package"
    ls -la
    exit 1
fi

# Check installation status
if systemctl is-active --quiet cortex-xdr || systemctl is-active --quiet traps; then
    echo "SUCCESS: Cortex XDR agent installed and running"
else
    echo "WARNING: XDR agent installed but service not detected as running"
fi

# Clean up
cd /
rm -rf /tmp/xdr_install

echo "XDR agent installation completed"
EOF
)

# Send SSM command
echo "Sending installation command via SSM..."
COMMAND_ID=$(aws ssm send-command \
    --instance-ids "$INSTANCE_ID" \
    --document-name "AWS-RunShellScript" \
    --parameters "commands=$INSTALL_COMMAND" \
    --comment "Install Cortex XDR Agent" \
    --query "Command.CommandId" \
    --output text)

if [ -z "$COMMAND_ID" ]; then
    echo "ERROR: Failed to send SSM command"
    exit 1
fi

echo "SSM Command ID: $COMMAND_ID"

# Wait for command to complete
echo -e "\nWaiting for installation to complete..."
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    STATUS=$(aws ssm get-command-invocation \
        --command-id "$COMMAND_ID" \
        --instance-id "$INSTANCE_ID" \
        --query "Status" \
        --output text 2>/dev/null || echo "Pending")
    
    case $STATUS in
        Success)
            echo -e "\n✅ XDR agent installation completed successfully!"
            
            # Get command output
            echo -e "\nInstallation output:"
            aws ssm get-command-invocation \
                --command-id "$COMMAND_ID" \
                --instance-id "$INSTANCE_ID" \
                --query "StandardOutputContent" \
                --output text
            
            exit 0
            ;;
        Failed|Cancelled|TimedOut|Cancelling)
            echo -e "\n❌ XDR agent installation failed with status: $STATUS"
            
            # Get error output
            echo -e "\nError output:"
            aws ssm get-command-invocation \
                --command-id "$COMMAND_ID" \
                --instance-id "$INSTANCE_ID" \
                --query "StandardErrorContent" \
                --output text
            
            exit 1
            ;;
        *)
            echo -n "."
            sleep 10
            ATTEMPT=$((ATTEMPT + 1))
            ;;
    esac
done

echo -e "\n⏱️ Installation timed out after $((MAX_ATTEMPTS * 10)) seconds"
echo "You can check the status manually with:"
echo "aws ssm get-command-invocation --command-id $COMMAND_ID --instance-id $INSTANCE_ID"
exit 1 