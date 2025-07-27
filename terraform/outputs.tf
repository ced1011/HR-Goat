output "app_instance_id" {
  description = "ID of the application EC2 instance"
  value       = aws_instance.app_instance.id
}

output "aws_account_id" {
  description = "The AWS Account ID retrieved dynamically"
  value       = data.aws_caller_identity.current.account_id
}

output "jenkins_instance_id" {
  description = "ID of the Jenkins EC2 instance"
  value       = aws_instance.jenkins_instance.id
}

output "app_instance_public_ip" {
  description = "Public IP address of the application EC2 instance"
  value       = aws_instance.app_instance.public_ip
}

output "jenkins_instance_public_ip" {
  description = "Public IP address of the Jenkins EC2 instance"
  value       = aws_instance.jenkins_instance.public_ip
}

output "rds_endpoint" {
  description = "Endpoint of the RDS instance"
  value       = aws_db_instance.hrgoat_db.endpoint
}

output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.app_repository.repository_url
}

output "ssm_connection_command_app" {
  description = "Command to connect to the application instance using SSM"
  value       = "aws ssm start-session --target ${aws_instance.app_instance.id}"
}

output "ssm_connection_command_jenkins" {
  description = "Command to connect to the Jenkins instance using SSM"
  value       = "aws ssm start-session --target ${aws_instance.jenkins_instance.id}"
}

output "jenkins_url" {
  description = "URL to access Jenkins"
  value       = "http://${aws_instance.jenkins_instance.public_ip}:8080"
}

output "app_url" {
  description = "URL to access the application"
  value       = "http://${aws_instance.app_instance.public_ip}:3000"
}

output "vpc_id" {
  description = "ID of the created VPC"
  value       = aws_vpc.main.id
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.app_alb.dns_name
}

output "app_alb_url" {
  description = "URL to access the application through ALB"
  value       = "http://${aws_lb.app_alb.dns_name}"
}

output "selected_kernel_version" {
  description = "Selected kernel version for EC2 instances"
  value       = var.ec2_kernel_version
}

output "selected_ami_id" {
  description = "AMI ID used for EC2 instances"
  value       = local.selected_ami
}

output "kernel_version_info" {
  description = "Information about the selected kernel version"
  value = {
    selection = var.ec2_kernel_version
    ami_id    = local.selected_ami
    expected_kernel = {
      "amazon-linux-2"     = "4.14.x"
      "amazon-linux-2023"  = "6.1.x+"
      "ubuntu-22-04"       = "5.15.x+"
      "ubuntu-20-04-hwe"   = "5.13.x+"
      "debian-11"          = "5.10.x (upgradeable to 5.13+)"
      "centos-7"           = "5.14.x+ (CentOS Stream 9)"
    }[var.ec2_kernel_version]
  }
}

output "verify_kernel_command" {
  description = "Commands to verify kernel version on deployed instances"
  value = {
    app_instance = "aws ssm start-session --target ${aws_instance.app_instance.id} --document-name AWS-RunShellScript --parameters 'commands=[\"uname -r\"]'"
    jenkins_instance = "aws ssm start-session --target ${aws_instance.jenkins_instance.id} --document-name AWS-RunShellScript --parameters 'commands=[\"uname -r\"]'"
  }
} 