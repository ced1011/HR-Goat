output "app_instance_id" {
  description = "ID of the application EC2 instance"
  value       = aws_instance.app_instance.id
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