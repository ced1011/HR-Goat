variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "vpc_id" {
  description = "ID of the existing VPC"
  type        = string
}

variable "project_name" {
  description = "Name of the project for resource naming"
  type        = string
  default     = "hrgoat"
}

variable "ec2_ami_id" {
  description = "AMI ID for the EC2 instance"
  type        = string
  default     = "ami-0c7217cdde317cfec" # Amazon Linux 2023 AMI in us-east-1
}

variable "ec2_instance_type" {
  description = "Instance type for the EC2 instance"
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  description = "Name of the SSH key pair to use for EC2 instance"
  type        = string
}

variable "db_instance_class" {
  description = "Instance class for the RDS instance"
  type        = string
  default     = "db.t3.micro"
}

variable "db_username" {
  description = "Username for the RDS instance"
  type        = string
  default     = "admin"
}

variable "db_password" {
  description = "Password for the RDS instance"
  type        = string
  sensitive   = true
} 