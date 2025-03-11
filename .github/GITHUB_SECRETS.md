# GitHub Secrets Configuration

This document explains how to set up the GitHub secrets required for the CI/CD workflows in this repository.

## Required Secrets

The following secrets need to be configured in your GitHub repository settings:

### AWS Credentials

| Secret Name | Description |
|-------------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS IAM user access key with permissions to create and manage resources |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM user secret key |
| `AWS_REGION` | AWS region where resources will be deployed (e.g., `us-east-1`) |

### Terraform Configuration

| Secret Name | Description |
|-------------|-------------|
| `VPC_ID` | ID of the existing VPC where resources will be deployed |
| `EC2_AMI_ID` | AMI ID for the EC2 instance (e.g., `ami-0c7217cdde317cfec` for Amazon Linux 2023 in us-east-1) |
| `EC2_INSTANCE_TYPE` | EC2 instance type (e.g., `t2.micro`) |
| `KEY_NAME` | Name of the SSH key pair in AWS to use for EC2 access |
| `DB_INSTANCE_CLASS` | RDS instance class (e.g., `db.t3.micro`) |
| `DB_USERNAME` | Username for the RDS instance |
| `DB_PASSWORD` | Password for the RDS instance |
| `TF_API_TOKEN` | (Optional) Terraform Cloud API token if using Terraform Cloud |

### Deployment Configuration

| Secret Name | Description |
|-------------|-------------|
| `SSH_PRIVATE_KEY` | Private SSH key corresponding to the key pair specified in `KEY_NAME` |
| `EC2_PUBLIC_IP` | (Optional) Public IP of the EC2 instance if deploying to an existing instance |
| `RDS_ENDPOINT` | (Optional) Endpoint of the RDS instance if deploying to an existing database |

## Setting Up Secrets

1. Go to your GitHub repository
2. Click on "Settings" > "Secrets and variables" > "Actions"
3. Click on "New repository secret"
4. Enter the name and value for each secret listed above
5. Click "Add secret"

## Required Permissions for AWS IAM User

The AWS IAM user whose credentials are used in the workflows should have the following permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:*",
                "rds:*",
                "iam:PassRole",
                "elasticloadbalancing:*",
                "cloudwatch:*",
                "logs:*",
                "s3:*"
            ],
            "Resource": "*"
        }
    ]
}
```

For production environments, it's recommended to use more restrictive permissions.

## Environment Setup

For different deployment environments (dev, staging, prod), you can set up environment-specific secrets:

1. Go to your GitHub repository
2. Click on "Settings" > "Environments"
3. Click "New environment"
4. Enter the environment name (e.g., "dev", "staging", "prod")
5. Add environment-specific secrets

This allows you to have different configurations for each environment.

## SSH Key Generation

If you need to generate a new SSH key pair:

1. Run the following command:
   ```bash
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/hrgoat_deploy_key -N ""
   ```

2. Import the public key to AWS:
   - Go to AWS EC2 Console
   - Navigate to "Key Pairs" under "Network & Security"
   - Click "Import key pair"
   - Upload the public key file (`~/.ssh/hrgoat_deploy_key.pub`)
   - Name it according to what you set in the `KEY_NAME` secret

3. Add the private key to GitHub secrets:
   - Copy the content of the private key file:
     ```bash
     cat ~/.ssh/hrgoat_deploy_key
     ```
   - Add it as the `SSH_PRIVATE_KEY` secret in GitHub 