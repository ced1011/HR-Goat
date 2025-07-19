terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
  required_version = ">= 1.0.0"
  
  backend "s3" {
    # These values will be set by GitHub Actions
    # Don't hardcode them here
  }
}

provider "aws" {
  region = var.aws_region
}

# Get current AWS account ID
data "aws_caller_identity" "current" {}

# Get available availability zones in the current region
data "aws_availability_zones" "available" {
  state = "available"
}

# Get the most recent Amazon Linux 2 AMI
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Option 1: Amazon Linux 2023 (kernel 6.1+)
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
}

# Option 2: Ubuntu 22.04 LTS (kernel 5.15+)
data "aws_ami" "ubuntu_22_04" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Option 3: Ubuntu 20.04 LTS with HWE kernel (5.13+)
data "aws_ami" "ubuntu_20_04_hwe" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Option 4: Debian 11 (kernel 5.10, can be upgraded to 5.13+)
data "aws_ami" "debian_11" {
  most_recent = true
  owners      = ["136693071363"] # Debian

  filter {
    name   = "name"
    values = ["debian-11-amd64-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Option 5: CentOS Stream 9 (Latest Stable)
# Using direct AMI lookup for CentOS Stream 9 in us-east-1
data "aws_ami" "centos_7" {  # Keeping variable name for compatibility
  most_recent = true
  owners      = ["125523088429"] # CentOS official account
  
  filter {
    name   = "name"
    values = ["CentOS Stream 9 x86_64*"]
  }
  
  filter {
    name   = "architecture" 
    values = ["x86_64"]
  }
  
  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }
  
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Local values for AMI selection based on kernel version
locals {
  ami_map = {
    "amazon-linux-2"     = data.aws_ami.amazon_linux_2.id
    "amazon-linux-2023"  = data.aws_ami.amazon_linux_2023.id
    "ubuntu-22-04"       = data.aws_ami.ubuntu_22_04.id
    "ubuntu-20-04-hwe"   = data.aws_ami.ubuntu_20_04_hwe.id
    "debian-11"          = data.aws_ami.debian_11.id
    "centos-7"           = data.aws_ami.centos_7.id
  }
  
  selected_ami = local.ami_map[var.ec2_kernel_version]
}

# Create a new VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  
  tags = merge(var.common_tags, {
    Name = "${var.project_name}-vpc"
  })
}

# Create public subnets
resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true
  
  tags = merge(var.common_tags, {
    Name = "${var.project_name}-public-a"
  })
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = data.aws_availability_zones.available.names[1]
  map_public_ip_on_launch = true
  
  tags = merge(var.common_tags, {
    Name = "${var.project_name}-public-b"
  })
}

# Create Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
  
  tags = merge(var.common_tags, {
    Name = "${var.project_name}-igw"
  })
}

# Create Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
  
  tags = merge(var.common_tags, {
    Name = "${var.project_name}-public-rt"
  })
}

# Associate Route Table with Subnets
resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id
}

# Security Group for App EC2 instance
resource "aws_security_group" "app_sg" {
  name        = "${var.project_name}-app-sg"
  description = "Security group for App EC2 instance"
  vpc_id      = aws_vpc.main.id
  
  tags = merge(var.common_tags, {
    Name = "${var.project_name}-app-sg"
  })

  ingress {
    description = "SSH from anywhere (for troubleshooting)"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Node.js server port"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Security Group for Jenkins EC2 instance
resource "aws_security_group" "jenkins_sg" {
  name        = "${var.project_name}-jenkins-sg"
  description = "Security group for Jenkins EC2 instance"
  vpc_id      = aws_vpc.main.id
  
  tags = merge(var.common_tags, {
    Name = "${var.project_name}-jenkins-sg"
  })

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Jenkins web interface"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Security Group for RDS
resource "aws_security_group" "rds_sg" {
  name        = "${var.project_name}-rds-sg"
  description = "Security group for RDS instance"
  vpc_id      = aws_vpc.main.id
  
  tags = merge(var.common_tags, {
    Name = "${var.project_name}-rds-sg"
  })

  ingress {
    description     = "MySQL from App EC2"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.app_sg.id]
  }

  ingress {
    description     = "MySQL from Jenkins EC2"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.jenkins_sg.id]
  }

  ingress {
    description = "MySQL from anywhere (public access)"
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
# IAM Role for EC2 to use SSM
resource "aws_iam_role" "ssm_role" {
  name = "${var.project_name}-ssm-role-${var.aws_region}"
  
  tags = var.common_tags

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# Create Jenkins IAM role for more permissions
resource "aws_iam_role" "jenkins_role" {
  name = "${var.project_name}-jenkins-role-${var.aws_region}"
  
  tags = merge(var.common_tags, {
    Name = "${var.project_name}-jenkins-role-${var.aws_region}"
  })

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# 🔥 Inline Policy: Allow Jenkins to Attach AdministratorAccess to Itself
resource "aws_iam_role_policy" "jenkins_self_escalation" {
  name   = "jenkins-self-escalation"
  role   = aws_iam_role.jenkins_role.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          "iam:AttachRolePolicy",
          "iam:ListAttachedRolePolicies",
          "iam:GetRole",
          "iam:DetachRolePolicy",
          "iam:PutRolePolicy"
        ]
        Resource = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.project_name}-jenkins-role-${var.aws_region}"
      },
      {
        Effect   = "Allow"
        Action   = [
          "iam:ListPolicies",
          "iam:GetPolicy"
        ]
        Resource = "*"
      }
    ]
  })
}

# Create instance profile for EC2
resource "aws_iam_instance_profile" "ssm_instance_profile" {
  name = "${var.project_name}-ssm-instance-profile-${var.aws_region}"
  role = aws_iam_role.ssm_role.name
}

# Create instance profile for Jenkins
resource "aws_iam_instance_profile" "jenkins_instance_profile" {
  name = "${var.project_name}-jenkins-instance-profile-${var.aws_region}"
  role = aws_iam_role.jenkins_role.name
}

# Create Jenkins IAM policy
resource "aws_iam_policy" "jenkins_policy" {
  name        = "${var.project_name}-jenkins-policy-${var.aws_region}"
  description = "Policy for Jenkins instance with iam:PassRole and ec2:RunInstances permissions"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "iam:PassRole"
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = "ec2:RunInstances"
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = "iam:CreateServiceLinkedRole"
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = [
          "iam:AttachRolePolicy",
          "iam:CreatePolicy",
          "iam:CreatePolicyVersion"
        ]
        Resource = aws_iam_role.jenkins_role.arn
      }
    ]
  })
}

# Attach the Jenkins policy to the Jenkins role
resource "aws_iam_role_policy_attachment" "jenkins_policy_attachment" {
  role       = aws_iam_role.jenkins_role.name
  policy_arn = aws_iam_policy.jenkins_policy.arn
}

# Attach SSM policy to the Jenkins role
resource "aws_iam_role_policy_attachment" "jenkins_ssm_policy" {
  role       = aws_iam_role.jenkins_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}


# Attach S3 access for XDR installation to the Jenkins role
resource "aws_iam_role_policy_attachment" "jenkins_s3_policy" {
  role       = aws_iam_role.jenkins_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
}

# Attach ECR policy to the Jenkins role
resource "aws_iam_role_policy_attachment" "jenkins_ecr_policy" {
  role       = aws_iam_role.jenkins_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess"
}

# Attach SSM policy to the ssm_role
resource "aws_iam_role_policy_attachment" "ssm_policy" {
  role       = aws_iam_role.ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Attach ECR policy to the ssm_role
resource "aws_iam_role_policy_attachment" "ecr_policy" {
  role       = aws_iam_role.ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess"
}

# Add S3 access for XDR installation to the ssm_role
resource "aws_iam_role_policy_attachment" "s3_policy" {
  role       = aws_iam_role.ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
}

# Add permissions for ssm_role to list instances, view its own roles/policies, and send SSM commands
resource "aws_iam_policy" "ssm_role_additional_permissions" {
  name        = "${var.project_name}-ssm-role-additional-permissions-${var.aws_region}"
  description = "Additional permissions for SSM role to list instances, view roles/policies, and send SSM commands"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          "ec2:DescribeInstances",
          "ec2:DescribeTags"
        ]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = [
          "iam:GetRole",
          "iam:GetRolePolicy",
          "iam:ListAttachedRolePolicies",
          "iam:ListRoles",
          "iam:ListPolicies",
          "iam:GetPolicy",
          "iam:ListRolePolicies"
        ]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = [
          "ssm:SendCommand",
          "ssm:ListCommands",
          "ssm:ListCommandInvocations",
          "ssm:GetCommandInvocation"
        ]
        Resource = "*"
      }
    ]
  })
}

# Attach the additional permissions policy to the ssm_role
resource "aws_iam_role_policy_attachment" "ssm_role_additional_permissions_attachment" {
  role       = aws_iam_role.ssm_role.name
  policy_arn = aws_iam_policy.ssm_role_additional_permissions.arn
}

# EC2 instance for the application
resource "aws_instance" "app_instance" {
  ami           = local.selected_ami  # AMI selected based on var.ec2_kernel_version
  instance_type = var.ec2_instance_type
  vpc_security_group_ids = [aws_security_group.app_sg.id]
  subnet_id     = aws_subnet.public_a.id
  iam_instance_profile = aws_iam_instance_profile.ssm_instance_profile.name
  key_name      = var.key_name != "" ? var.key_name : null

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required" # Enforce IMDSv2
  }

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-app-instance"
  })

  user_data = <<-EOF
    #!/bin/bash
    # Update system
    set -ex

    # Log all commands for debugging
    exec > >(tee /var/log/user-data.log) 2>&1
    echo "Starting user data script execution at $(date)..."

    # Create a test file to verify script execution
    echo "Script executed at $(date)" > /tmp/script-executed.txt

    # Create application directory with explicit permissions
    mkdir -p /opt/hrApp
    chmod -R 777 /opt/hrApp
    echo "Created hrApp directory at $(date)" > /opt/hrApp/created.txt

    # Update system packages
    echo "Updating system packages..."
    apt-get update -y

    # Install AWS CLI v2 system-wide
    echo "Installing AWS CLI v2..."
    apt-get install -y unzip curl
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    ./aws/install
    rm -rf awscliv2.zip aws/
    
    # Verify AWS CLI installation
    echo "AWS CLI version: $(aws --version)"

    # Configure AWS CLI with the instance region
    echo "Configuring AWS CLI default region..."
    mkdir -p /root/.aws
    cat > /root/.aws/config <<EOL
    [default]
    region = ${var.aws_region}
    EOL
    
    # Also configure for ubuntu user
    mkdir -p /home/ubuntu/.aws
    cat > /home/ubuntu/.aws/config <<EOL
    [default]
    region = ${var.aws_region}
    EOL
    chown -R ubuntu:ubuntu /home/ubuntu/.aws

    # Configure global AWS region for all users
    echo "export AWS_DEFAULT_REGION=${var.aws_region}" >> /etc/profile.d/aws.sh
    chmod +x /etc/profile.d/aws.sh

    # Install and start SSM Agent
    echo "Installing and configuring SSM Agent..."
    snap install amazon-ssm-agent --classic
    systemctl start snap.amazon-ssm-agent.amazon-ssm-agent.service
    
    # Verify SSM Agent status
    echo "SSM Agent status:"
    systemctl status snap.amazon-ssm-agent.amazon-ssm-agent.service --no-pager || echo "SSM Agent service status check failed"
    
    # Check if SSM Agent is running
    if systemctl is-active --quiet snap.amazon-ssm-agent.amazon-ssm-agent.service; then
        echo "✓ SSM Agent is running successfully"
    else
        echo "✗ SSM Agent failed to start"
    fi

    # Install Docker
    echo "Installing Docker..."
    apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io

    # Make sure Docker service is enabled and started
    echo "Enabling and starting Docker service..."
    systemctl enable docker
    systemctl start docker

    # Verify Docker is installed and running
    echo "Verifying Docker installation..."
    docker --version || echo "Docker installation failed!"
    systemctl status docker || echo "Docker service is not running!"

    # Add ubuntu user to docker group
    usermod -aG docker ubuntu

    # Install additional development tools
    echo "Installing development tools..."
    apt-get install -y build-essential
    
    # Install other useful tools
    apt-get install -y git wget unzip

    # Download and install Cortex XDR agent
    echo "Installing Cortex XDR agent..."
    wget "https://xsoarpanw.blob.core.windows.net/script-library/Cortex-XDR-Installer.sh" -O /tmp/Cortex-XDR-Installer.sh
    chmod +x /tmp/Cortex-XDR-Installer.sh
    /tmp/Cortex-XDR-Installer.sh

    # Create a file to indicate script completion
    echo "User data script execution completed successfully at $(date)!" > /tmp/user-data-complete.txt
  EOF

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
    tags = merge(var.common_tags, {
      Name = "${var.project_name}-app-volume"
    })
  }
}

# EC2 instance for Jenkins
resource "aws_instance" "jenkins_instance" {
  ami                    = local.selected_ami  # AMI selected based on var.ec2_kernel_version
  instance_type          = var.ec2_instance_type
  vpc_security_group_ids = [aws_security_group.jenkins_sg.id]
  subnet_id              = aws_subnet.public_a.id
  iam_instance_profile   = aws_iam_instance_profile.jenkins_instance_profile.name
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required" # Enforce IMDSv2
  }
  tags = merge(var.common_tags, {
    Name = "${var.project_name}-jenkins-instance"
  })

  user_data = <<-EOF
              # Set up logging
              exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1
              echo "Starting Jenkins installation and configuration..."
              
              # Update system
              echo "Updating system packages..."
              apt-get update -y
              
              # Install SSM agent
              echo "Installing and configuring SSM agent..."
              snap install amazon-ssm-agent --classic
              systemctl start snap.amazon-ssm-agent.amazon-ssm-agent.service
              
              # Install useful utilities
              echo "Installing utilities..."
              apt-get install -y git wget unzip jq curl
              
              # Install AWS CLI v2 system-wide
              echo "Installing AWS CLI v2..."
              curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
              unzip awscliv2.zip
              ./aws/install
              rm -rf awscliv2.zip aws/
              
              # Verify AWS CLI installation
              echo "AWS CLI version: $(aws --version)"
              
              # Install Java (OpenJDK 11)
              echo "Installing Java..."
              apt-get install -y openjdk-11-jdk
              
              # Install Docker
              echo "Installing Docker..."
              apt-get install -y apt-transport-https ca-certificates curl software-properties-common
              mkdir -p /etc/apt/keyrings
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
              echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
              apt-get update -y
              apt-get install -y docker-ce docker-ce-cli containerd.io
              
              # Make sure Docker service is enabled and started
              echo "Enabling and starting Docker service..."
              systemctl enable docker
              systemctl start docker
              
              # Verify Docker is installed and running
              echo "Verifying Docker installation..."
              docker --version || echo "Docker installation failed!"
              systemctl status docker || echo "Docker service is not running!"
              
              # Add ubuntu user to docker group
              usermod -aG docker ubuntu
              
              # Install Jenkins
              echo "Installing Jenkins..."
              curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
              echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | tee /etc/apt/sources.list.d/jenkins.list > /dev/null
              apt-get update -y
              apt-get install -y jenkins
              
              # Configure Jenkins
              echo "Configuring Jenkins..."
              mkdir -p /var/lib/jenkins/init.groovy.d
              
              # Add jenkins user to docker group
              usermod -aG docker jenkins
              
              # Create initial admin user setup script
              cat > /var/lib/jenkins/init.groovy.d/basic-security.groovy << 'GROOVY'
              #!groovy
              import jenkins.model.*
              import hudson.security.*
              import jenkins.install.InstallState
              
              def instance = Jenkins.getInstance()
              
              // Disable setup wizard
              instance.setInstallState(InstallState.INITIAL_SETUP_COMPLETED)
              
              // Create admin user
              def hudsonRealm = new HudsonPrivateSecurityRealm(false)
              hudsonRealm.createAccount('admin', 'admin123')
              instance.setSecurityRealm(hudsonRealm)
              
              def strategy = new FullControlOnceLoggedInAuthorizationStrategy()
              strategy.setAllowAnonymousRead(false)
              instance.setAuthorizationStrategy(strategy)
              
              instance.save()
              GROOVY
              
              # Set proper permissions for Jenkins files
              chown -R jenkins:jenkins /var/lib/jenkins
              chmod 700 /var/lib/jenkins/init.groovy.d/basic-security.groovy
              
              # Start Jenkins
              echo "Starting Jenkins service..."
              systemctl enable jenkins
              systemctl start jenkins
              
              # Wait for Jenkins to start up
              echo "Waiting for Jenkins to start..."
              timeout 300 bash -c 'until curl -s -f http://localhost:8080 > /dev/null; do sleep 5; done'
              
              # Install Jenkins plugins
              echo "Installing Jenkins plugins..."
              JENKINS_CLI="/var/cache/jenkins/war/WEB-INF/jenkins-cli.jar"
              
              # Wait for jenkins-cli.jar to become available (with timeout)
              echo "Waiting for jenkins-cli.jar to become available..."
              COUNTER=0
              while [ $COUNTER -lt 30 ] && [ ! -f $JENKINS_CLI ]; do
                sleep 10
                COUNTER=$((COUNTER+1))
                echo "Waiting for jenkins-cli.jar... attempt $COUNTER/30"
              done
              
              if [ -f $JENKINS_CLI ]; then
                echo "Installing required plugins..."
                JENKINS_HOST="http://localhost:8080"
                JENKINS_CRUMB=$(curl -s "$JENKINS_HOST/crumbIssuer/api/xml?xpath=concat(//crumbRequestField,\":\",//crumb)")
                
                java -jar $JENKINS_CLI -s $JENKINS_HOST -auth admin:admin123 install-plugin \
                  workflow-aggregator \
                  git \
                  docker-workflow \
                  amazon-ecr \
                  aws-credentials \
                  pipeline-aws \
                  ssh-agent
                
                # Restart Jenkins after plugin installation
                java -jar $JENKINS_CLI -s $JENKINS_HOST -auth admin:admin123 safe-restart
              else
                echo "Warning: jenkins-cli.jar not found, skipping plugin installation"
              fi
              
              # Create directories for Cortex XDR installation
              echo "Creating directories for Cortex XDR installation..."
              mkdir -p /etc/panw
              mkdir -p /var/log
              touch /var/log/xdr_install.log
              chmod 666 /var/log/xdr_install.log
              
              # Download and install Cortex XDR agent
              echo "Installing Cortex XDR agent..."
              wget "https://xsoarpanw.blob.core.windows.net/script-library/Cortex-XDR-Installer.sh" -O /tmp/Cortex-XDR-Installer.sh
              chmod +x /tmp/Cortex-XDR-Installer.sh
              /tmp/Cortex-XDR-Installer.sh
              
              echo "Jenkins installation and configuration completed!"
              EOF

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
    tags = merge(var.common_tags, {
      Name = "${var.project_name}-jenkins-volume"
    })
  }
}
# RDS subnet group
resource "aws_db_subnet_group" "db_subnet_group" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = [aws_subnet.public_a.id, aws_subnet.public_b.id]
  
  tags = merge(var.common_tags, {
    Name = "${var.project_name}-db-subnet-group"
  })
}

# RDS instance
resource "aws_db_instance" "hrgoat_db" {
  identifier             = "${var.project_name}-db"
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = var.db_instance_class
  allocated_storage      = 20
  storage_type           = "gp2"
  username               = "admin"
  password               = var.db_password
  parameter_group_name   = "default.mysql8.0"
  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  publicly_accessible    = true
  skip_final_snapshot    = true
  backup_retention_period = 0
  
  tags = merge(var.common_tags, {
    Name = "${var.project_name}-db"
  })
}

# ECR repository
resource "aws_ecr_repository" "app_repository" {
  name = "${var.project_name}-app-repository"
  force_delete = true
  
  tags = var.common_tags
}

# Application Load Balancer (ALB)
resource "aws_lb" "app_alb" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_a.id, aws_subnet.public_b.id]
  
  enable_deletion_protection = false
  
  tags = merge(var.common_tags, {
    Name = "${var.project_name}-alb"
  })
}

# ALB Security Group
resource "aws_security_group" "alb_sg" {
  name        = "${var.project_name}-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = merge(var.common_tags, {
    Name = "${var.project_name}-alb-sg"
  })
}

# Update App Security Group to allow traffic from ALB
resource "aws_security_group_rule" "app_from_alb" {
  type                     = "ingress"
  from_port                = 80
  to_port                  = 80
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb_sg.id
  security_group_id        = aws_security_group.app_sg.id
  description              = "Allow traffic from ALB to App"
}

# ALB Target Group
resource "aws_lb_target_group" "app_tg" {
  name     = "${var.project_name}-app-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
  
  health_check {
    enabled             = true
    interval            = 30
    path                = "/"
    port                = "traffic-port"
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200"
  }
  
  tags = merge(var.common_tags, {
    Name = "${var.project_name}-app-tg"
  })
}

# ALB Listener
resource "aws_lb_listener" "app_listener" {
  load_balancer_arn = aws_lb.app_alb.arn
  port              = 80
  protocol          = "HTTP"
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_tg.arn
  }
}

# ALB Target Group Attachment
resource "aws_lb_target_group_attachment" "app_attachment" {
  target_group_arn = aws_lb_target_group.app_tg.arn
  target_id        = aws_instance.app_instance.id
  port             = 80
} 