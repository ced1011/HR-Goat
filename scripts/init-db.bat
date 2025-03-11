@echo off
REM Database initialization script for HR Portal Symphony

REM Check if environment variables are set
if "%DB_HOST%"=="" goto :missing_vars
if "%DB_USER%"=="" goto :missing_vars
if "%DB_PASSWORD%"=="" goto :missing_vars

REM Default database name
if "%DB_NAME%"=="" set DB_NAME=hrportal

echo Initializing database: %DB_NAME%
echo Host: %DB_HOST%
echo User: %DB_USER%

REM Wait for the database to be available
echo Waiting for database to be available...
set /a attempts=0
:wait_loop
set /a attempts+=1
mysql -h "%DB_HOST%" -u "%DB_USER%" -p"%DB_PASSWORD%" -e "SELECT 1" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Database is available.
    goto :run_script
)

if %attempts% equ 30 (
    echo Error: Could not connect to the database after 30 attempts.
    exit /b 1
)

echo Waiting for database to be available... Attempt %attempts%/30
timeout /t 2 >nul
goto :wait_loop

:run_script
REM Run the SQL script
echo Running database initialization script...
mysql -h "%DB_HOST%" -u "%DB_USER%" -p"%DB_PASSWORD%" < "%~dp0init-db.sql"

if %ERRORLEVEL% equ 0 (
    echo Database initialization completed successfully.
) else (
    echo Error: Database initialization failed.
    exit /b 1
)

echo Database setup complete!
exit /b 0

:missing_vars
echo Error: Database environment variables not set.
echo Please set DB_HOST, DB_USER, and DB_PASSWORD.
exit /b 1 