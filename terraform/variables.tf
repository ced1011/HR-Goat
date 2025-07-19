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

variable "ec2_kernel_version" {
  description = "Kernel version preference for EC2 instances. Options: 'amazon-linux-2' (kernel 4.14), 'amazon-linux-2023' (kernel 6.1+), 'ubuntu-22-04' (kernel 5.15+), 'ubuntu-20-04-hwe' (kernel 5.13+), 'debian-11' (kernel 5.10), 'centos-7' (CentOS Stream 9 - kernel 5.14+)"
  type        = string
  default     = "ubuntu-20-04-hwe"
  
  validation {
    condition = contains([
      "amazon-linux-2",
      "amazon-linux-2023",
      "ubuntu-22-04",
      "ubuntu-20-04-hwe",
      "debian-11",
      "centos-7"
    ], var.ec2_kernel_version)
    error_message = "Invalid kernel version. Must be one of: amazon-linux-2, amazon-linux-2023, ubuntu-22-04, ubuntu-20-04-hwe, debian-11, centos-7."
  }
}

variable "key_name" {
  description = "Name of the SSH key pair for EC2 access (optional, for troubleshooting)"
  type        = string
  default     = ""
} 