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
