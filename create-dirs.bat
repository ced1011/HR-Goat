@echo off
echo Creating directory structure for HR Portal Symphony...

REM Create Terraform directory
if not exist terraform mkdir terraform

REM Create GitHub workflows directory
if not exist .github\workflows (
    if not exist .github mkdir .github
    mkdir .github\workflows
)

REM Create scripts directory
if not exist scripts mkdir scripts

echo Directory structure created successfully!
echo.
echo The following directories have been created:
echo - terraform: For Terraform configuration files
echo - .github\workflows: For GitHub Actions workflow files
echo - scripts: For database and utility scripts
echo.
echo You can now proceed with the setup process.
pause 