#!/bin/bash
# Script to switch from CentOS Stream 9 to Amazon Linux 2023

echo "Switching EC2 instances from CentOS Stream 9 to Amazon Linux 2023..."

# Update terraform.tfvars or use command line
terraform apply \
  -var="ec2_kernel_version=amazon-linux-2023" \
  -var="project_name=hrgoat" \
  -var="db_password=hrportaladmin123" \
  -var="aws_region=us-east-1" \
  -auto-approve

echo "Switch complete. Amazon Linux 2023 has built-in SSM Agent support." 