output "ec2_instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.app_server.public_ip
}

output "ec2_instance_public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = aws_instance.app_server.public_dns
}

output "rds_endpoint" {
  description = "Endpoint of the RDS instance"
  value       = aws_db_instance.default.endpoint
}

output "rds_port" {
  description = "Port of the RDS instance"
  value       = aws_db_instance.default.port
}

output "rds_username" {
  description = "Username for the RDS instance"
  value       = aws_db_instance.default.username
}

output "connection_string" {
  description = "MySQL connection string for the application"
  value       = "mysql://${aws_db_instance.default.username}:${aws_db_instance.default.password}@${aws_db_instance.default.endpoint}/${aws_db_instance.default.db_name}"
  sensitive   = true
} 