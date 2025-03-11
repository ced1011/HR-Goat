#!/bin/bash

# HR Portal Symphony Infrastructure Setup Script

echo "HR Portal Symphony Infrastructure Setup"
echo "======================================="
echo

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "Terraform is not installed. Please install it first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install it first."
    exit 1
fi

# Check AWS credentials
echo "Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "AWS credentials are not configured. Please run 'aws configure' first."
    exit 1
fi
echo "AWS credentials are configured."
echo

# Initialize Terraform
echo "Initializing Terraform..."
cd terraform
terraform init
echo

# Plan Terraform
echo "Planning Terraform deployment..."
terraform plan
echo

# Confirm deployment
read -p "Do you want to deploy the infrastructure? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Deployment cancelled."
    exit 0
fi

# Apply Terraform
echo "Deploying infrastructure..."
terraform apply -auto-approve
echo

# Get outputs
echo "Getting deployment outputs..."
app_instance_id=$(terraform output -raw app_instance_id)
jenkins_instance_id=$(terraform output -raw jenkins_instance_id)
app_instance_public_ip=$(terraform output -raw app_instance_public_ip)
jenkins_instance_public_ip=$(terraform output -raw jenkins_instance_public_ip)
rds_endpoint=$(terraform output -raw rds_endpoint)
ecr_repository_url=$(terraform output -raw ecr_repository_url)
echo

# Print summary
echo "Deployment Summary"
echo "=================="
echo "Application Instance ID: $app_instance_id"
echo "Application Instance Public IP: $app_instance_public_ip"
echo "Jenkins Instance ID: $jenkins_instance_id"
echo "Jenkins Instance Public IP: $jenkins_instance_public_ip"
echo "RDS Endpoint: $rds_endpoint"
echo "ECR Repository URL: $ecr_repository_url"
echo

# Instructions for GitHub Actions
echo "GitHub Actions Setup"
echo "===================="
echo "Add the following secrets to your GitHub repository:"
echo "AWS_ACCESS_KEY_ID: Your AWS access key"
echo "AWS_SECRET_ACCESS_KEY: Your AWS secret key"
echo "ECR_REPOSITORY: $ecr_repository_url"
echo "EC2_INSTANCE_ID: $app_instance_id"
echo "RDS_HOST: $rds_endpoint"
echo

# Instructions for Jenkins
echo "Jenkins Setup"
echo "============="
echo "1. Access Jenkins at: http://$jenkins_instance_public_ip:8080"
echo "2. Follow the setup instructions to complete Jenkins configuration"
echo "3. Install required plugins: AWS Steps, Docker Pipeline, Pipeline, Git Integration"
echo "4. Add the following credentials in Jenkins:"
echo "   - aws-credentials: AWS credentials for ECR and SSM access"
echo "   - ECR_REPOSITORY: $ecr_repository_url"
echo "   - EC2_INSTANCE_ID: $app_instance_id"
echo "   - RDS_HOST: $rds_endpoint"
echo

# Instructions for SSM
echo "SSM Connection"
echo "=============="
echo "Connect to application instance:"
echo "aws ssm start-session --target $app_instance_id"
echo
echo "Connect to Jenkins instance:"
echo "aws ssm start-session --target $jenkins_instance_id"
echo

echo "Setup complete!" 