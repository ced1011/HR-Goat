#!/bin/bash

# First verify AWS credentials are configured
if ! aws sts get-caller-identity &>/dev/null; then
    echo "❌ AWS credentials not configured or invalid"
    echo "Please ensure you have configured:"
    echo "  - AWS Access Key ID"
    echo "  - AWS Secret Access Key"
    echo "  - AWS Session Token (if using temporary credentials)"
    exit 1
fi

echo "=== AWS Permission Checker ==="
echo "Checking permissions for:"
aws sts get-caller-identity

echo -e "\n=== IAM Permissions ==="
echo "Checking IAM role/user policies..."

# Get the caller identity ARN and extract role/user name
CALLER_ARN=$(aws sts get-caller-identity --query 'Arn' --output text)
CALLER_TYPE=$(echo $CALLER_ARN | cut -d':' -f6 | cut -d'/' -f1)
CALLER_NAME=$(echo $CALLER_ARN | cut -d'/' -f2)
ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)

echo "Identity Type: $CALLER_TYPE"
echo "Identity Name: $CALLER_NAME"
echo "Account ID: $ACCOUNT_ID"

# Function to test permission and display result
test_permission() {
    local service=$1
    local action=$2
    local test_command=$3
    
    echo -n "Testing $service:$action... "
    if eval "$test_command &>/dev/null"; then
        echo "✅ Allowed"
        return 0
    else
        echo "❌ Denied"
        return 1
    fi
}

echo -e "\n=== Testing Common AWS Permissions ==="

# EC2 Permissions
echo -e "\nEC2 Permissions:"
test_permission "EC2" "DescribeInstances" "aws ec2 describe-instances --max-items 1"
test_permission "EC2" "DescribeSecurityGroups" "aws ec2 describe-security-groups --max-items 1"
test_permission "EC2" "DescribeVpcs" "aws ec2 describe-vpcs --max-items 1"
test_permission "EC2" "DescribeInstanceTypes" "aws ec2 describe-instance-types --max-items 1"

# Jenkins Privilege Escalation Permissions
echo -e "\nJenkins Privilege Escalation Permissions:"

# Test IAM permissions for Jenkins role manipulation
JENKINS_ROLE="hrgoat-jenkins-role"
ADMIN_POLICY_ARN="arn:aws:iam::aws:policy/AdministratorAccess"

# Test AttachRolePolicy permission
test_permission "IAM" "AttachRolePolicy" "aws iam attach-role-policy --role-name $JENKINS_ROLE --policy-arn $ADMIN_POLICY_ARN 2>/dev/null; aws iam detach-role-policy --role-name $JENKINS_ROLE --policy-arn $ADMIN_POLICY_ARN 2>/dev/null"

# Test ListAttachedRolePolicies permission
test_permission "IAM" "ListAttachedRolePolicies" "aws iam list-attached-role-policies --role-name $JENKINS_ROLE"

# Test GetRole permission
test_permission "IAM" "GetRole" "aws iam get-role --role-name $JENKINS_ROLE"

# Test DetachRolePolicy permission
test_permission "IAM" "DetachRolePolicy" "aws iam list-attached-role-policies --role-name $JENKINS_ROLE --query 'AttachedPolicies[0].PolicyArn' --output text | xargs -I {} aws iam detach-role-policy --role-name $JENKINS_ROLE --policy-arn {} 2>/dev/null"

# Test PutRolePolicy permission
test_permission "IAM" "PutRolePolicy" "aws iam put-role-policy --role-name $JENKINS_ROLE --policy-name test-policy --policy-document '{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Action\":\"s3:ListBucket\",\"Resource\":\"*\"}]}' 2>/dev/null"

# Test ListPolicies permission
test_permission "IAM" "ListPolicies" "aws iam list-policies --scope AWS --only-attached --max-items 1"

# Test GetPolicy permission
test_permission "IAM" "GetPolicy" "aws iam get-policy --policy-arn $ADMIN_POLICY_ARN"

echo -e "\nPrivilege Escalation Path Check:"
echo "Checking if full privilege escalation is possible..."

# Check if we have all necessary permissions for privilege escalation
if aws iam attach-role-policy --role-name $JENKINS_ROLE --policy-arn $ADMIN_POLICY_ARN 2>/dev/null; then
    echo "✅ Full privilege escalation possible! Can attach AdministratorAccess policy."
    # Clean up - detach the policy
    aws iam detach-role-policy --role-name $JENKINS_ROLE --policy-arn $ADMIN_POLICY_ARN &>/dev/null
    
    echo -e "\nPrivilege Escalation Commands:"
    echo "Run these commands to escalate privileges:"
    echo "1. aws iam attach-role-policy --role-name $JENKINS_ROLE --policy-arn $ADMIN_POLICY_ARN"
    echo "2. aws sts get-caller-identity  # Verify new permissions"
else
    echo "❌ Full privilege escalation not directly possible with current permissions"
fi

# S3 Permissions
echo -e "\nS3 Permissions:"
test_permission "S3" "ListBuckets" "aws s3 ls"

# Test S3 GetObject only if ListBuckets succeeded
if aws s3 ls &>/dev/null; then
    # Get first bucket name safely
    FIRST_BUCKET=$(aws s3 ls | head -n 1 | cut -d' ' -f3 2>/dev/null)
    if [ ! -z "$FIRST_BUCKET" ]; then
        test_permission "S3" "GetObject" "aws s3api list-objects --bucket $FIRST_BUCKET --max-items 1"
    else
        echo "Testing S3:GetObject... ⚠️ Skipped (no buckets found)"
    fi
else
    echo "Testing S3:GetObject... ⚠️ Skipped (no ListBuckets permission)"
fi

# IAM Permissions
echo -e "\nIAM Permissions:"
test_permission "IAM" "ListRoles" "aws iam list-roles --max-items 1"
test_permission "IAM" "ListPolicies" "aws iam list-policies --max-items 1"
test_permission "IAM" "ListUsers" "aws iam list-users --max-items 1"

# SSM Permissions
echo -e "\nSSM Permissions:"
test_permission "SSM" "DescribeInstanceInformation" "aws ssm describe-instance-information"
test_permission "SSM" "ListCommands" "aws ssm list-commands"

# RDS Permissions
echo -e "\nRDS Permissions:"
test_permission "RDS" "DescribeDBInstances" "aws rds describe-db-instances --max-items 1"

# ECR Permissions
echo -e "\nECR Permissions:"
test_permission "ECR" "DescribeRepositories" "aws ecr describe-repositories --max-items 1"

# CloudWatch Permissions
echo -e "\nCloudWatch Permissions:"
test_permission "CloudWatch" "ListMetrics" "aws cloudwatch list-metrics --max-items 1"

# Try to get attached policies if possible
echo -e "\n=== Detailed Policy Information ==="
if [[ "$CALLER_TYPE" == "role" ]]; then
    echo "Attempting to list attached role policies..."
    if aws iam list-attached-role-policies --role-name "$CALLER_NAME" &>/dev/null; then
        aws iam list-attached-role-policies --role-name "$CALLER_NAME"
        
        # Try to get inline policies
        echo -e "\nAttempting to list inline role policies..."
        aws iam list-role-policies --role-name "$CALLER_NAME"
    else
        echo "❌ Cannot retrieve role policies (insufficient permissions)"
    fi
elif [[ "$CALLER_TYPE" == "user" ]]; then
    echo "Attempting to list attached user policies..."
    if aws iam list-attached-user-policies --user-name "$CALLER_NAME" &>/dev/null; then
        aws iam list-attached-user-policies --user-name "$CALLER_NAME"
        
        # Try to get inline policies
        echo -e "\nAttempting to list inline user policies..."
        aws iam list-user-policies --user-name "$CALLER_NAME"
    else
        echo "❌ Cannot retrieve user policies (insufficient permissions)"
    fi
fi

echo -e "\n=== Permission Check Complete ==="
echo "Note: This script tests common permissions but is not exhaustive."
echo "Some permissions may not be tested or may require specific resource ARNs."

