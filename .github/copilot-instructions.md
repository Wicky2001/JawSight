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


## Backend-Specific Guidelines
- **Authentication**: JWT-based with Google OAuth. Store tokens in HTTP-only cookies.
- **Error Handling**: use `ApiError` class in `src/helpers/classes/ApiError.ts`.
- **HTTP Status Codes**: Use `http-status` package for all status codes in the backend.
- **Creating Controllers**: Wrap every controller function inside `catchAsync` from `src/helpers/error.handlers.ts`.

- **Database Operations**:
  - Use `db.sequelize.transaction(async (t) => { ... })` for operations involving multiple database writes.
  - Always pass `{ transaction: t }` to all queries inside the transaction.
  - Fetch the existing record first before update/delete operations.
  - If the record is not found, throw:
  
    ```ts
    throw new ApiError(status.NOT_FOUND, "Resource not found");
    ```

  - Keep transaction logic structured as:
  
    ```ts
    await db.sequelize.transaction(async (t) => {
      const existing = await db.Model.findOne({
        where: {
          id,
          // additional conditions if needed
        },
        transaction: t,
      });

      if (!existing) {
        throw new ApiError(status.NOT_FOUND, "Resource not found");
      }

      await existing.update(
        {
          // fields to update
        },
        { transaction: t },
      );

      // optional related operations
      // optional audit logs
    });
    ```

  - Only include fields/conditions that actually exist in the model.
  - Audit logging should be done inside the same transaction when applicable.        





## Mandatory Task Flow
1. Check `/migrations` before proposing any RDS/Database changes.
2. Verify SSM parameter storage for any new AWS resource created in `/infra`.
3. Use modern HCL (1.14+) syntax for variables and locals in module source/version attributes.
