# HRGoat HR Management Portal

## About the Project
HRGoat is an intentionally vulnerable HR management portal designed to demonstrate cloud security vulnerabilities in a controlled environment. It's a comprehensive training tool created for:
- Security professionals practicing cloud-based exploitation
- DevOps engineers learning secure deployment practices
- Development teams studying secure coding
- Organizations conducting security awareness training

## ⚠️ Security Advisory
**WARNING**: This application contains deliberate security vulnerabilities. Deploy only in isolated, controlled environments. Never use in production or connect to sensitive systems.

## Project Structure
```
/
├── src/               # Frontend application code (React)
├── server/            # Backend server code (Node.js/Express)
├── terraform/         # Infrastructure as Code for AWS deployment
└── .github/workflows/ # CI/CD pipelines for automated deployment
```

## Features
- Employee management (create, update, delete, bulk upload)
- Document handling and storage
- User authentication and authorization
- Profile management
- Calendar events
- Payroll & benefits
- Performance tracking
- Notifications

## Deployment with GitHub Actions

### Prerequisites
- GitHub account
- AWS account with appropriate permissions
- Required GitHub secrets:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`

### Deployment Steps
1. Fork this repository to your GitHub account
2. Configure AWS credentials in GitHub Secrets:
   - Navigate to "Settings" → "Secrets"
   - Add required AWS credentials
3. Deploy infrastructure:
   - Go to "Actions" tab
   - Select "Create Infrastructure and Deploy Application"
   - Click "Run workflow"
4. Access application using provided URLs in workflow output:
   - Application Load Balancer URL
   - EC2 instance IP addresses
   - Jenkins server URL

## Vulnerability Overview & Exploitation Guide

### 1. SQL Injection
**Location**: Employee search functionality
**Impact**: Data exposure, potential database compromise

### 2. Insecure Deserialization
**Location**: Employee bulk upload feature
**Impact**: Remote code execution on application container

### 3. Container Escape
**Location**: Docker container configuration
**Impact**: Host system access from container

### 4. Jenkins Exploitation
**Location**: Jenkins instance (port 8080)
**Impact**: CI/CD pipeline compromise

### 5. Privilege Escalation
**Location**: EC2 & Jenkins instances
**Impact**: Full system compromise

### 6. AWS IAM Privilege Escalation
**Location**: EC2 instance roles
**Impact**: AWS account compromise

> For detailed exploitation steps and payloads, see [EXPLOITATION.md](EXPLOITATION.md)

## Security Remediation
1. SQL Injection: Implement parameterized queries
2. Deserialization: Avoid user-controlled data deserialization
3. Container Security: Remove privileged flag
4. Network Segmentation: Implement proper VPC security
5. Jenkins Security: Enforce strong authentication
6. IAM Security: Apply least privilege principle

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer
This software is provided for educational purposes only. Unauthorized security testing is illegal. The author is not responsible for any misuse of this software.
