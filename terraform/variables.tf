variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project for resource naming"
  type        = string
  default     = "hrgoat"
}

variable "ec2_ami_id" {
  description = "AMI ID for the EC2 instances"
  type        = string
  default     = "ami-0277155c3f0ab2930"
}

variable "ec2_instance_type" {
  description = "Instance type for the EC2 instances"
  type        = string
  default     = "t2.micro"
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
  default     = "hrportaladmin123"
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {
    App  = "HR-GOAT-APP"
    Note = "For security testing"
    Name = "DemoHRApp"
    Link = "https://github.com/SilentProcess87/cyber-lab-hr-simulator"
  }
} 