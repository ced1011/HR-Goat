#!/bin/bash
set -e

echo "Starting entrypoint script..."

# Check if environment variables are provided
DB_HOST=${DB_HOST:-"localhost"}
DB_USER=${DB_USER:-"user"}
DB_PASSWORD=${DB_PASSWORD:-"password"}
DB_NAME=${DB_NAME:-"hrportal"}
FRONTEND_PORT=${FRONTEND_PORT:-"80"}
BACKEND_PORT=${BACKEND_PORT:-"5001"}

echo "Setting FRONTEND_PORT to $FRONTEND_PORT"
echo "Setting BACKEND_PORT to $BACKEND_PORT"

# Create .env file for backend
cat > /app/.env << EOL
VITE_API_URL=/api
DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
FRONTEND_PORT=$FRONTEND_PORT
BACKEND_PORT=$BACKEND_PORT
EOL

echo "Created .env file with size $(wc -c < /app/.env) bytes"

# List directory contents for debugging
echo "Directory contents:"
ls -la /app

# Check if server.js exists
if [ ! -f /app/server.js ]; then
  echo "Creating server.js symlink..."
  ln -s /app/server/server.js /app/server.js
fi

# Check if package.json exists
if [ -f /app/package.json ]; then
  echo "package.json exists with size $(wc -c < /app/package.json) bytes"
fi

# Check which script to run
if grep -q "\"start\":" /app/server/package.json; then
  echo "Starting backend server..."
  cd /app/server && node server.js &
else
  echo "No start script found, running server.js directly..."
  cd /app && node server.js &
fi

# Start frontend server
echo "Starting frontend server..."
cd /app && node frontend-server.js &

# Keep container running
tail -f /dev/null 