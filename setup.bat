@echo off
echo HR Portal Symphony Infrastructure Setup
echo =======================================
echo.

REM Check if AWS CLI is installed
where aws >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo AWS CLI is not installed. Please install it first.
    exit /b 1
)

REM Check if Terraform is installed
where terraform >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Terraform is not installed. Please install it first.
    exit /b 1
)

REM Check if Docker is installed
where docker >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Docker is not installed. Please install it first.
    exit /b 1
)

REM Check AWS credentials
echo Checking AWS credentials...
aws sts get-caller-identity >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo AWS credentials are not configured. Please run 'aws configure' first.
    exit /b 1
)
echo AWS credentials are configured.
echo.

REM Initialize Terraform
echo Initializing Terraform...
cd terraform
terraform init
echo.

REM Plan Terraform
echo Planning Terraform deployment...
terraform plan
echo.

REM Confirm deployment
set /p confirm=Do you want to deploy the infrastructure? (y/n): 
if /i not "%confirm%"=="y" (
    echo Deployment cancelled.
    exit /b 0
)

REM Apply Terraform
echo Deploying infrastructure...
terraform apply -auto-approve
echo.

REM Get outputs
echo Getting deployment outputs...
for /f "tokens=*" %%a in ('terraform output -raw app_instance_id') do set app_instance_id=%%a
for /f "tokens=*" %%a in ('terraform output -raw jenkins_instance_id') do set jenkins_instance_id=%%a
for /f "tokens=*" %%a in ('terraform output -raw app_instance_public_ip') do set app_instance_public_ip=%%a
for /f "tokens=*" %%a in ('terraform output -raw jenkins_instance_public_ip') do set jenkins_instance_public_ip=%%a
for /f "tokens=*" %%a in ('terraform output -raw rds_endpoint') do set rds_endpoint=%%a
for /f "tokens=*" %%a in ('terraform output -raw ecr_repository_url') do set ecr_repository_url=%%a
echo.

REM Print summary
echo Deployment Summary
echo ==================
echo Application Instance ID: %app_instance_id%
echo Application Instance Public IP: %app_instance_public_ip%
echo Jenkins Instance ID: %jenkins_instance_id%
echo Jenkins Instance Public IP: %jenkins_instance_public_ip%
echo RDS Endpoint: %rds_endpoint%
echo ECR Repository URL: %ecr_repository_url%
echo.

REM Instructions for GitHub Actions
echo GitHub Actions Setup
echo ====================
echo Add the following secrets to your GitHub repository:
echo AWS_ACCESS_KEY_ID: Your AWS access key
echo AWS_SECRET_ACCESS_KEY: Your AWS secret key
echo ECR_REPOSITORY: %ecr_repository_url%
echo EC2_INSTANCE_ID: %app_instance_id%
echo RDS_HOST: %rds_endpoint%
echo.

REM Instructions for Jenkins
echo Jenkins Setup
echo =============
echo 1. Access Jenkins at: http://%jenkins_instance_public_ip%:8080
echo 2. Follow the setup instructions to complete Jenkins configuration
echo 3. Install required plugins: AWS Steps, Docker Pipeline, Pipeline, Git Integration
echo 4. Add the following credentials in Jenkins:
echo    - aws-credentials: AWS credentials for ECR and SSM access
echo    - ECR_REPOSITORY: %ecr_repository_url%
echo    - EC2_INSTANCE_ID: %app_instance_id%
echo    - RDS_HOST: %rds_endpoint%
echo.

REM Instructions for SSM
echo SSM Connection
echo ==============
echo Connect to application instance:
echo aws ssm start-session --target %app_instance_id%
echo.
echo Connect to Jenkins instance:
echo aws ssm start-session --target %jenkins_instance_id%
echo.

echo Setup complete!
pause 