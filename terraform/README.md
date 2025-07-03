# Terraform Infrastructure for HRGoat

This directory contains the Terraform configuration for deploying the infrastructure required for the HRGoat HR Management Portal application.

## Infrastructure Components

- **EC2 Instance**: Runs the HRGoat application
- **RDS MySQL Instance**: Database for the application
- **Security Groups**: For both EC2 and RDS
- **Networking**: Uses existing VPC and public subnets

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) (v1.2.0 or newer)
- AWS CLI configured with appropriate credentials
- An existing VPC in your AWS account
- An SSH key pair in your AWS account

## Configuration

1. Copy the example variables file:

```bash
cp terraform.tfvars.example terraform.tfvars
```

2. Edit `terraform.tfvars` to set your specific values:

```hcl
aws_region        = "us-west-1"              # Your preferred AWS region
vpc_id           = "vpc-0123456789abcdef0"   # Your existing VPC ID
project_name     = "hrgoat"                  # Project name for resource naming
ec2_ami_id       = "ami-0c7217cdde317cfec"   # AMI ID (default is Amazon Linux 2023 in us-west-1)
ec2_instance_type = "t2.micro"               # EC2 instance type
key_name         = "your-key-pair-name"      # Your SSH key pair name
db_instance_class = "db.t3.micro"            # RDS instance class
db_username      = "admin"                   # RDS username
db_password      = "YourStrongPassword123!"  # RDS password (use a secure password)
```

## Manual Deployment

If you want to deploy manually (without GitHub Actions):

1. Initialize Terraform:

```bash
terraform init
```

2. Preview the changes:

```bash
terraform plan
```

3. Apply the configuration:

```bash
terraform apply
```

4. Confirm by typing `yes` when prompted.

## Outputs

After deployment, Terraform will output:

- EC2 instance public IP and DNS
- RDS endpoint and port
- Database connection string

## Cleanup

To destroy all resources created by this configuration:

```bash
terraform destroy
```

## Security Considerations

- The RDS instance is configured with public access for demonstration purposes
- In a production environment, consider:
  - Using private subnets for RDS
  - Implementing more restrictive security group rules
  - Setting up a bastion host for secure database access
  - Using AWS Secrets Manager for database credentials 