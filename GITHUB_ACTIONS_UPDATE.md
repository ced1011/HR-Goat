# GitHub Actions Updates for Unified Server

This document explains the changes made to GitHub Actions workflows to support the unified server architecture.

## Changes Made

### 1. **Dockerfile Reference**
- Updated build command to use `Dockerfile.unified` instead of the default `Dockerfile`
- This ensures the unified server is built and deployed

### 2. **Port Configuration**
- Changed from dual ports (80 and 5001) to single port 8080
- Updated port mapping: `-p 80:8080` (maps container port 8080 to EC2 port 80)
- Removed separate FRONTEND_PORT and BACKEND_PORT environment variables
- Added single PORT environment variable set to 8080

### 3. **Environment Variables**
Updated environment variables in docker run command:
- Removed: `FRONTEND_PORT`, `BACKEND_PORT`
- Added: `PORT=8080`
- Kept: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

## Files Modified

1. **`.github/workflows/create-infrastructure.yml`**
   - Build step now uses `Dockerfile.unified`
   - Deploy command updated for unified server port configuration

2. **`Jenkinsfile`** (if using Jenkins)
   - Build step now uses `Dockerfile.unified`
   - Deploy command updated to use port 8080

## Testing the Changes

When you run the GitHub Actions workflow:

1. It will build the unified server using `Dockerfile.unified`
2. Push the image to ECR
3. Deploy to EC2 with the correct port mapping
4. The application will be accessible on port 80 of the ALB/EC2 instance

## Important Notes

- The unified server runs on port 8080 internally
- Port 80 on the EC2 instance is mapped to port 8080 in the container
- All API calls are handled directly without proxy
- Frontend and backend are served from the same process

## Rollback Plan

If you need to rollback to the old architecture:
1. Revert the changes in this commit
2. The workflows will use the original `Dockerfile` and port configuration
3. Redeploy using the GitHub Actions workflow 