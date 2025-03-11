# HRGoat HR Management Portal

This repository contains the HRGoat HR Management Portal application, a comprehensive HR management system with features for employee management, document handling, calendar events, and more.

## Repository Structure

- **`/src`**: Frontend application code (React)
- **`/server`**: Backend server code (Node.js/Express)
- **`/terraform`**: Infrastructure as Code for AWS deployment
- **`/.github/workflows`**: CI/CD pipelines for automated deployment

## Features

- Employee management
- Document management
- Calendar events
- Payroll & benefits
- Performance tracking
- User authentication
- Profile management
- Notifications

## Development Setup

### Prerequisites

- Node.js (v16 or newer)
- npm (v7 or newer)
- MySQL database

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/your-username/hr-portal-symphony.git
cd hr-portal-symphony
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. In a separate terminal, start the backend server:

```bash
cd server
node server.js
```

## Deployment

### Manual Deployment

See the [terraform/README.md](terraform/README.md) file for instructions on manual deployment using Terraform.

### Automated Deployment with GitHub Actions

This repository includes GitHub Actions workflows for automated deployment:

1. **Infrastructure Deployment**: Deploys AWS infrastructure using Terraform
2. **Application Deployment**: Deploys the application to the EC2 instance
3. **Infrastructure Destruction**: Safely destroys the AWS infrastructure when needed

For more information on setting up the required GitHub secrets, see [.github/GITHUB_SECRETS.md](.github/GITHUB_SECRETS.md).

## Security Considerations

- The application includes intentional vulnerabilities for educational purposes
- Do not use in production without addressing these vulnerabilities
- See comments in the code marked with "VULNERABLE CODE" for details

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# HR Portal Symphony Infrastructure

This repository contains the infrastructure setup for the HR Portal Symphony application, including Terraform configurations for AWS resources, Docker containerization, and CI/CD pipelines.

## Infrastructure Components

- **VPC and Subnets**: Creates a new VPC with public subnets
- **EC2 Instances**:
  - Application instance for running the HR Portal
  - Jenkins instance (version 2.270) for CI/CD
  - Both instances are accessible via AWS Systems Manager (SSM) without SSH keys
- **Application Load Balancer (ALB)**:
  - Routes traffic to the application EC2 instance
  - Provides a stable DNS name for accessing the application
  - Handles health checks and improves availability
- **RDS Instance**:
  - Public RDS instance with no backups
  - Username: admin
  - Password: hrportaladmin123
- **ECR Repository**: For storing the application Docker image
- **CI/CD**: GitHub Actions workflow and Jenkins pipeline for automated deployment
- **Resource Tagging**: All resources are tagged with common tags for identification and management
- **State Management**: Terraform state is stored in an S3 bucket with a unique name for persistence and team collaboration

## Prerequisites

- AWS CLI installed and configured
- Terraform installed (version 1.0.0 or later)
- Docker installed (for local development)
- GitHub account (for GitHub Actions)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hr-portal-symphony.git
cd hr-portal-symphony
```

### 2. Deploy Using GitHub Actions

The repository includes GitHub Actions workflows for infrastructure management:

#### Creating the Infrastructure

1. Navigate to the "Actions" tab in your repository
2. Select the "Create Infrastructure and Deploy Application" workflow
3. Click "Run workflow"
4. Click "Run workflow" to start deployment

This workflow will:
- Create a unique S3 bucket for Terraform state with an epoch timestamp suffix
- Create the infrastructure using Terraform
- Build the Docker image and push it to ECR
- Deploy the container to the EC2 instance
- Output the S3 bucket name for reference when destroying infrastructure

#### Destroying the Infrastructure

1. Navigate to the "Actions" tab in your repository
2. Select the "Destroy Infrastructure" workflow
3. Click "Run workflow"
4. Enter the S3 bucket name that was created during deployment
5. Type "destroy" in the confirmation field
6. Click "Run workflow" to start destruction

### 3. Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# For Linux/macOS
./setup.sh

# For Windows
setup.bat
```

### 4. Configure GitHub Secrets

Add the following secrets to your GitHub repository:
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

### 5. Connect to EC2 Instances via SSM

Use the SSM connection commands from the setup script output:

```bash
# Connect to application instance
aws ssm start-session --target i-xxxxxxxxxxxxxxxxx

# Connect to Jenkins instance
aws ssm start-session --target i-yyyyyyyyyyyyyyyyy
```

### 6. Access Jenkins

1. Navigate to `http://<jenkins_instance_public_ip>:8080`
2. Follow the setup instructions to complete Jenkins configuration
3. Install required plugins:
   - AWS Steps
   - Docker Pipeline
   - Pipeline
   - Git Integration

### 7. Configure Jenkins Pipeline

1. Create a new pipeline job in Jenkins
2. Configure it to use the Jenkinsfile from your repository
3. Add the following credentials in Jenkins:
   - `aws-credentials`: AWS credentials for ECR and SSM access
   - `ECR_REPOSITORY`: ECR repository URL
   - `EC2_INSTANCE_ID`: Application EC2 instance ID
   - `RDS_HOST`: RDS endpoint

## Accessing the Application

After deployment, access the HR Portal application through the ALB at:
```
http://<alb_dns_name>
```

Alternatively, you can also access it directly via the EC2 instance at:
```
http://<app_instance_public_ip>:3000
```

## Resource Tagging

All AWS resources created by this infrastructure are tagged with the following common tags:

```hcl
common_tags = {
  App  = "HR-GOAT-APP"
  Note = "For security testing"
  Name = "DemoHRApp"
  Link = "https://github.com/SilentProcess87/cyber-lab-hr-simulator"
}
```

These tags help with resource identification, cost tracking, and management.

## Terraform State Management

The Terraform state is stored in an S3 bucket with a unique name using the format `hrgoat-tfstate-<timestamp>`. This approach:
- Ensures uniqueness for multiple deployments
- Prevents naming conflicts across different users or environments
- Allows each infrastructure deployment to have its own isolated state
- Automatically cleans up the bucket upon infrastructure destruction

## Troubleshooting

- **SSM Connection Issues**: Ensure the EC2 instances have internet access and the SSM agent is running
- **Docker Issues**: Check Docker logs on the application instance with `docker logs hrportal`
- **Database Connection**: Verify the RDS security group allows connections from the application EC2 instance
- **Terraform State Issues**: Check the S3 bucket for the presence of the state file

## Security Notes

- The RDS instance is publicly accessible with a fixed password for demonstration purposes
- In a production environment, consider:
  - Using AWS Secrets Manager for database credentials
  - Implementing private subnets for RDS
  - Enabling RDS backups
  - Using HTTPS with proper certificates
