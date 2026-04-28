# Project Context: Mandibular Retrognathia Prediction App

## Global Architecture
This is a Monorepo containing a full-stack surgical jaw prediction application.
- **Frontend**: React (located in `/frontend`)
- **Backend**: Node.js (located in `/backend`)
- **Shared Logic**: Joi validation and types (located in `/shared`)
- **Infrastructure**: Terraform (located in `/infra`)
- **Serverless**: 40MB Python/ML models (located in `/lambda`)
- **Migrations**: SQL scripts for PostgreSQL schema changes (located in `/migrations`)

## Infrastructure & AWS Guidelines
- **Terraform Version**: Strictly use **Terraform 1.14.9**.
- **Terraform Features**: Support Terraform Stacks and advanced S3 backend validation.
- **AWS Provider**: Use AWS Provider `~> 6.0`.
- **Handoff**: Never hardcode ARNs. Save resource IDs to `aws_ssm_parameter` and fetch them in CI/CD workflows.
- **RDS**: Use PostgreSQL RDS. Manage schema changes only via the `/migrations` folder.

## Coding Standards
- **Monorepo**: We use NPM Workspaces. Command format: `npm install <pkg> -w <folder>`.
- **Lambda Strategy**: Small models (40MB) are zipped and uploaded to S3 via Terraform (No ECR required).
- **Validation**: Use Joi schemas from the `/shared` folder for both Frontend and Backend.
- **React**: Functional components + Hooks only. Tailwind CSS for styling.

## Mandatory Task Flow
1. Check `/migrations` before proposing any RDS/Database changes.
2. Verify SSM parameter storage for any new AWS resource created in `/infra`.
3. Use modern HCL (1.14+) syntax for variables and locals in module source/version attributes.
