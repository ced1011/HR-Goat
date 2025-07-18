#!/bin/bash
# Debug script for SSM Agent issues on CentOS Stream 9

echo "=== SSM Agent Debug Script for CentOS Stream 9 ==="
echo "Run this script on the EC2 instance if you have SSH access"
echo ""

# Check if SSM Agent is installed
echo "1. Checking if SSM Agent is installed..."
if rpm -q amazon-ssm-agent >/dev/null 2>&1; then
    echo "✓ SSM Agent is installed"
    rpm -q amazon-ssm-agent
else
    echo "✗ SSM Agent is NOT installed"
fi

# Check SSM Agent service status
echo ""
echo "2. Checking SSM Agent service status..."
systemctl status amazon-ssm-agent --no-pager || echo "Service not found"

# Check if the service is enabled
echo ""
echo "3. Checking if SSM Agent is enabled..."
systemctl is-enabled amazon-ssm-agent 2>/dev/null || echo "Service not enabled"

# Check SSM Agent logs
echo ""
echo "4. Recent SSM Agent logs (if available)..."
if [ -f /var/log/amazon/ssm/amazon-ssm-agent.log ]; then
    tail -n 50 /var/log/amazon/ssm/amazon-ssm-agent.log
else
    echo "SSM Agent log file not found"
fi

# Check instance metadata service
echo ""
echo "5. Checking instance metadata service..."
curl -s http://169.254.169.254/latest/meta-data/instance-id && echo "" || echo "Cannot reach metadata service"

# Check IAM role
echo ""
echo "6. Checking IAM role..."
curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/ && echo "" || echo "No IAM role found"

# Check network connectivity to SSM endpoints
echo ""
echo "7. Checking connectivity to SSM endpoints..."
for endpoint in ssm.us-east-1.amazonaws.com ec2messages.us-east-1.amazonaws.com ssmessages.us-east-1.amazonaws.com; do
    echo -n "Testing $endpoint: "
    nc -zv $endpoint 443 2>&1 | grep -q succeeded && echo "✓ OK" || echo "✗ Failed"
done

# Try to reinstall SSM Agent
echo ""
echo "8. Fix attempt - Reinstalling SSM Agent..."
echo "Run these commands to reinstall:"
echo "sudo yum remove -y amazon-ssm-agent"
echo "sudo yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm"
echo "sudo systemctl enable amazon-ssm-agent"
echo "sudo systemctl start amazon-ssm-agent"
echo "sudo systemctl status amazon-ssm-agent" 