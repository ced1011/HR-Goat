#!/bin/bash

# Database initialization script for HR Portal Symphony

# Check if environment variables are set
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    echo "Error: Database environment variables not set."
    echo "Please set DB_HOST, DB_USER, and DB_PASSWORD."
    exit 1
fi

# Default database name
DB_NAME=${DB_NAME:-hrportal}

echo "Initializing database: $DB_NAME"
echo "Host: $DB_HOST"
echo "User: $DB_USER"

# Wait for the database to be available
echo "Waiting for database to be available..."
for i in {1..30}; do
    if mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1" >/dev/null 2>&1; then
        echo "Database is available."
        break
    fi
    
    if [ $i -eq 30 ]; then
        echo "Error: Could not connect to the database after 30 attempts."
        exit 1
    fi
    
    echo "Waiting for database to be available... Attempt $i/30"
    sleep 2
done

# Run the SQL script
echo "Running database initialization script..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" < "$(dirname "$0")/init-db.sql"

if [ $? -eq 0 ]; then
    echo "Database initialization completed successfully."
else
    echo "Error: Database initialization failed."
    exit 1
fi

echo "Database setup complete!" 