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
  region = "us-east-1"
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
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true
  
  tags = merge(var.common_tags, {
    Name = "${var.project_name}-public-a"
  })
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
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
  name = "${var.project_name}-ssm-role"
  
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

# Attach SSM policy to the role
resource "aws_iam_role_policy_attachment" "ssm_policy" {
  role       = aws_iam_role.ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Attach ECR policy to the role
resource "aws_iam_role_policy_attachment" "ecr_policy" {
  role       = aws_iam_role.ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess"
}

# Create instance profile for EC2
resource "aws_iam_instance_profile" "ssm_instance_profile" {
  name = "${var.project_name}-ssm-instance-profile"
  role = aws_iam_role.ssm_role.name
}

# EC2 instance for the application
resource "aws_instance" "app_instance" {
  ami                    = var.ec2_ami_id
  instance_type          = var.ec2_instance_type
  vpc_security_group_ids = [aws_security_group.app_sg.id]
  subnet_id              = aws_subnet.public_a.id
  iam_instance_profile   = aws_iam_instance_profile.ssm_instance_profile.name
  
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
              yum update -y
              
              # Install AWS CLI first for SSM registration
              echo "Installing AWS CLI..."
              yum install -y aws-cli
              sudo yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm
              # Configure AWS CLI with the instance region
              echo "Configuring AWS CLI default region..."
              mkdir -p /root/.aws
              cat > /root/.aws/config <<EOL
              [default]
              region = us-east-1
              EOL
              
              # Install and start SSM Agent with special care
              echo "Installing and configuring SSM Agent..."
              yum install -y amazon-ssm-agent
              
              # Install Docker with robust error handling
              echo "Installing Docker..."
              amazon-linux-extras install -y docker || {
                echo "Failed to install Docker using amazon-linux-extras, trying alternative method..."
                yum install -y docker
              }
              
              # Make sure Docker service is enabled and started with retries
              echo "Enabling and starting Docker service..."
              systemctl enable docker
              
              # Try to start Docker with multiple attempts
              for i in {1..5}; do
                echo "Attempt $i to start Docker service..."
                systemctl start docker && break || {
                  echo "Start attempt $i failed, waiting and trying again..."
                  sleep 10
                }
              done
              
              # Verify Docker is installed and running
              echo "Verifying Docker installation..."
              docker --version || echo "Docker installation failed!"
              systemctl status docker || echo "Docker service is not running!"
              
              # Add ec2-user to docker group
              usermod -aG docker ec2-user
              
              # Install additional development tools
              echo "Installing development tools..."
              yum groupinstall -y "Development Tools"
              

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
  ami                    = var.ec2_ami_id
  instance_type          = var.ec2_instance_type
  vpc_security_group_ids = [aws_security_group.jenkins_sg.id]
  subnet_id              = aws_subnet.public_a.id
  iam_instance_profile   = aws_iam_instance_profile.ssm_instance_profile.name
  
  tags = merge(var.common_tags, {
    Name = "${var.project_name}-jenkins-instance"
  })

  user_data = <<-EOF
              #!/bin/bash
              # Update system
              yum update -y
              
              # Install SSM agent
              yum install -y amazon-ssm-agent
              systemctl enable amazon-ssm-agent
              systemctl start amazon-ssm-agent
              
              # Install Java
              yum install -y java-11-amazon-corretto
              
              # Install Jenkins
              wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
              rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
              yum install -y jenkins-2.270
              systemctl enable jenkins
              systemctl start jenkins
              
              # Add jenkins user to docker group
              usermod -aG docker jenkins
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
  from_port                = 3000
  to_port                  = 3000
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb_sg.id
  security_group_id        = aws_security_group.app_sg.id
  description              = "Allow traffic from ALB to App"
}

# ALB Target Group
resource "aws_lb_target_group" "app_tg" {
  name     = "${var.project_name}-app-tg"
  port     = 3000
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
  port             = 3000
} 