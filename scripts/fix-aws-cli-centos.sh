#!/bin/bash
# Fix script to install AWS CLI v2 on CentOS Stream 9

echo "Installing AWS CLI v2 system-wide..."

# Install required tools
yum install -y unzip curl

# Download and install AWS CLI v2
cd /tmp
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip -q awscliv2.zip
./aws/install --update
rm -rf awscliv2.zip aws/

# Configure AWS region from instance metadata
REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region || echo "us-east-1")
echo "Detected region: $REGION"

# Configure AWS CLI for root
mkdir -p /root/.aws
cat > /root/.aws/config <<EOF
[default]
region = $REGION
EOF

# Configure AWS CLI for ec2-user
mkdir -p /home/ec2-user/.aws
cat > /home/ec2-user/.aws/config <<EOF
[default]
region = $REGION
EOF
chown -R ec2-user:ec2-user /home/ec2-user/.aws

# Set global AWS region
echo "export AWS_DEFAULT_REGION=$REGION" > /etc/profile.d/aws.sh
chmod +x /etc/profile.d/aws.sh

# Verify installation
echo "AWS CLI version:"
/usr/local/bin/aws --version

echo "AWS CLI fix completed!" 