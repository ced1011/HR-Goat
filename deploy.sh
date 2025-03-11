#!/bin/bash

# HRGoat Application Deployment Script
# This script helps deploy the HRGoat application to the EC2 instance

# Exit on any error
set -e

# Check if required variables are set
if [ -z "$EC2_IP" ]; then
  echo "Error: EC2_IP environment variable is not set"
  echo "Usage: EC2_IP=<ec2_public_ip> KEY_PATH=<path_to_key> DB_ENDPOINT=<rds_endpoint> DB_USER=<db_username> DB_PASS=<db_password> ./deploy.sh"
  exit 1
fi

if [ -z "$KEY_PATH" ]; then
  echo "Error: KEY_PATH environment variable is not set"
  echo "Usage: EC2_IP=<ec2_public_ip> KEY_PATH=<path_to_key> DB_ENDPOINT=<rds_endpoint> DB_USER=<db_username> DB_PASS=<db_password> ./deploy.sh"
  exit 1
fi

if [ -z "$DB_ENDPOINT" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASS" ]; then
  echo "Warning: Database connection details not fully provided. You'll need to configure them manually."
fi

# Get Terraform outputs if available
if [ -d "terraform" ] && [ -z "$EC2_IP" ]; then
  echo "Checking for Terraform outputs..."
  cd terraform
  if terraform output -json > /dev/null 2>&1; then
    EC2_IP=$(terraform output -raw ec2_instance_public_ip)
    DB_ENDPOINT=$(terraform output -raw rds_endpoint)
    DB_USER=$(terraform output -raw rds_username)
    echo "Found EC2 IP from Terraform: $EC2_IP"
    echo "Found DB endpoint from Terraform: $DB_ENDPOINT"
    echo "Found DB username from Terraform: $DB_USER"
    cd ..
  else
    echo "No Terraform outputs found, using environment variables."
    cd ..
  fi
fi

echo "=== HRGoat Application Deployment ==="
echo "Deploying to EC2 instance at $EC2_IP"

# Wait for SSH to be available
echo "Waiting for SSH to be available..."
while ! ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 -i "$KEY_PATH" ec2-user@"$EC2_IP" echo "SSH is ready" > /dev/null 2>&1; do
  echo "Waiting for SSH to be ready..."
  sleep 5
done

echo "SSH is ready. Starting deployment..."

# Create deployment script to run on the EC2 instance
cat > deploy_remote.sh << 'EOF'
#!/bin/bash
set -e

echo "=== Setting up HRGoat application ==="

# Clone the repository
if [ ! -d "hr-portal-symphony" ]; then
  echo "Cloning repository..."
  git clone https://github.com/your-username/hr-portal-symphony.git
fi

cd hr-portal-symphony

# Update the code if the repository already exists
if [ -d ".git" ]; then
  echo "Repository exists, pulling latest changes..."
  git pull
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Update database configuration if provided
if [ ! -z "$1" ] && [ ! -z "$2" ] && [ ! -z "$3" ]; then
  echo "Updating database configuration..."
  DB_HOST=$(echo "$1" | cut -d':' -f1)
  
  # Create backup of original config
  cp server/server.js server/server.js.bak
  
  # Update database configuration
  sed -i "s/host: '.*',/host: '$DB_HOST',/" server/server.js
  sed -i "s/user: '.*',/user: '$2',/" server/server.js
  sed -i "s/password: '.*',/password: '$3',/" server/server.js
  
  echo "Database configuration updated."
fi

# Start the application
echo "Starting the application..."
cd server
npm install
pm2 stop server || true
pm2 start server.js

echo "=== Deployment completed successfully ==="
echo "The application should now be running at http://$HOSTNAME:5001"
EOF

# Copy the deployment script to the EC2 instance
echo "Copying deployment script to EC2 instance..."
scp -o StrictHostKeyChecking=no -i "$KEY_PATH" deploy_remote.sh ec2-user@"$EC2_IP":~/deploy.sh

# Make the script executable
ssh -o StrictHostKeyChecking=no -i "$KEY_PATH" ec2-user@"$EC2_IP" "chmod +x ~/deploy.sh"

# Run the deployment script
echo "Running deployment script on EC2 instance..."
ssh -o StrictHostKeyChecking=no -i "$KEY_PATH" ec2-user@"$EC2_IP" "~/deploy.sh '$DB_ENDPOINT' '$DB_USER' '$DB_PASS'"

# Clean up
rm deploy_remote.sh

echo "=== Deployment completed ==="
echo "The HRGoat application should now be running at http://$EC2_IP:5001" 