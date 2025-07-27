# Multi-Region Deployment Guide for HR-GOAT

## Overview

HR-GOAT now supports deployment to multiple AWS regions. This guide explains how to use the region selection feature during deployment and destruction of infrastructure.

## Supported Regions

The following AWS regions are currently supported:
- `us-east-1` (US East - N. Virginia)
- `us-east-2` (US East - Ohio)
- `us-west-1` (US West - N. California)
- `us-west-2` (US West - Oregon)
- `eu-west-1` (Europe - Ireland)
- `eu-west-2` (Europe - London)
- `eu-central-1` (Europe - Frankfurt)
- `ap-southeast-1` (Asia Pacific - Singapore)
- `ap-southeast-2` (Asia Pacific - Sydney)
- `ap-northeast-1` (Asia Pacific - Tokyo)

## Deploying Infrastructure

### Using GitHub Actions

1. Navigate to the **Actions** tab in your GitHub repository
2. Select **Create Infrastructure and Deploy Application**
3. Click **Run workflow**
4. Select your desired AWS region from the dropdown menu
5. Click **Run workflow** to start the deployment

The deployment will:
- Create a region-specific S3 bucket for Terraform state (e.g., `hrgoat-tfstate-do-not-delete-us-west-2-1234567890`)
- Deploy all resources in the selected region
- Use region-appropriate AMIs automatically

### Key Changes

1. **State Bucket Naming**: State buckets now include the region name to prevent conflicts
2. **AMI Selection**: The system automatically selects the appropriate Amazon Linux 2 AMI for your chosen region
3. **Availability Zones**: Subnets are created in the first two available zones of your selected region

## Destroying Infrastructure

### Using GitHub Actions

1. Navigate to the **Actions** tab in your GitHub repository
2. Select **Destroy Infrastructure**
3. Click **Run workflow**
4. Select the AWS region where your infrastructure is deployed
5. Type "destroy" in the confirmation field
6. Click **Run workflow** to start the destruction process

The destroy workflow will:
- Automatically find the region-specific state bucket
- Remove all infrastructure resources
- Clean up the state bucket

## Important Notes

### No Cross-Region Conflicts

Each region deployment is completely isolated:
- Separate state buckets per region
- Independent resource namespaces
- No overlap between deployments
- Region-specific IAM roles and policies

### Region-Specific Resources

Some resources are region-specific and handled automatically:
- **AMI IDs**: Amazon Linux 2 AMIs are automatically selected for each region
- **Availability Zones**: The first two available zones in each region are used
- **S3 Buckets**: Created with region-specific names
- **IAM Resources**: IAM roles and policies include the region in their names (e.g., `hrgoat-ssm-role-us-west-2`)

### IAM Resources Naming

To prevent conflicts when deploying to multiple regions, all IAM resources now include the region in their names:
- IAM Roles: `hrgoat-ssm-role-{region}`, `hrgoat-jenkins-role-{region}`
- IAM Instance Profiles: `hrgoat-ssm-instance-profile-{region}`, `hrgoat-jenkins-instance-profile-{region}`
- IAM Policies: `hrgoat-jenkins-policy-{region}`, `hrgoat-ssm-role-additional-permissions-{region}`

This ensures that each regional deployment has its own set of IAM resources, preventing naming conflicts.

### Local Development

If you're using local scripts (like `run-docker.bat`), you'll need to manually update:
- RDS endpoints
- ECR repository URLs
- Any other region-specific resources

### Jenkins Configuration

After deployment, if you're using Jenkins, update the environment variables:
- Set `AWS_REGION` to match your deployment region
- Update any hardcoded endpoints

## Troubleshooting

### State Bucket Not Found

If the destroy workflow can't find your state bucket:
1. Check you've selected the correct region
2. Verify the bucket exists in AWS S3 console
3. The workflow will check for both new (region-specific) and legacy bucket names

### AMI Not Found

If deployment fails due to AMI issues:
- The system uses the latest Amazon Linux 2 AMI
- Ensure your AWS account has access to the selected region
- Check AWS service availability in your chosen region

### Permission Issues

Ensure your AWS credentials have permissions to:
- Create resources in the selected region
- List and create S3 buckets
- All standard HR-GOAT permissions

## Best Practices

1. **Consistent Region Usage**: Always use the same region for create and destroy operations
2. **Document Deployments**: Keep track of which regions you've deployed to
3. **Cost Management**: Remember that resources in multiple regions incur separate charges
4. **Compliance**: Ensure your selected region meets your data residency requirements 