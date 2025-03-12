
#!/bin/sh
set -e
echo "Starting entrypoint script..."
DB_HOST=${DB_HOST:-"localhost"}
DB_USER=${DB_USER:-"user"}
DB_PASSWORD=${DB_PASSWORD:-"password"}
DB_NAME=${DB_NAME:-"hrportal"}
FRONTEND_PORT=${FRONTEND_PORT:-"80"}
BACKEND_PORT=${BACKEND_PORT:-"5002"}
BACKEND_URL="http://localhost:${BACKEND_PORT}"
echo "Setting FRONTEND_PORT to $FRONTEND_PORT"
echo "Setting BACKEND_PORT to $BACKEND_PORT"
echo "VITE_API_URL=/api" > /app/.env
echo "VITE_BASE_URL=http://localhost:8080" >> /app/.env
echo "DB_HOST=$DB_HOST" >> /app/.env
echo "DB_USER=$DB_USER" >> /app/.env
echo "DB_PASSWORD=$DB_PASSWORD" >> /app/.env
echo "DB_NAME=$DB_NAME" >> /app/.env
echo "FRONTEND_PORT=$FRONTEND_PORT" >> /app/.env
echo "BACKEND_PORT=$BACKEND_PORT" >> /app/.env
echo "BACKEND_URL=$BACKEND_URL" >> /app/.env
cp /app/.env /app/server/.env
echo "Created .env file and copied to server directory"
echo "Directory contents:"
ls -la /app
if [ ! -f /app/server.js ]; then
  echo "Creating server.js symlink..."
  ln -s /app/server/server.js /app/server.js
fi

# Start the backend server with a different internal port (5002)
echo "Starting backend server on port $BACKEND_PORT..."
cd /app/server && PORT=$BACKEND_PORT node server.js &
BACKEND_PID=$!

# Allow a moment for the backend to start
sleep 2

# Start the frontend server
echo "Starting frontend server on port $FRONTEND_PORT..."
cd /app && BACKEND_URL=$BACKEND_URL node frontend-server.js &
FRONTEND_PID=$!

# Start socat to redirect port 5001 traffic to the frontend server
echo "Setting up port redirection: port 5001 -> port 80..."
socat TCP-LISTEN:5001,fork,reuseaddr TCP:localhost:80 &
SOCAT_PID=$!

# Create a script to modify server.js to include CORS headers
cat > /tmp/add_cors.js << "EOF"
const fs = require("fs");
const serverPath = "/app/server/server.js";
const content = fs.readFileSync(serverPath, "utf8");
if (!content.includes("Access-Control-Allow-Credentials")) {
  const corsConfig = `  origin: ["http://localhost", "http://localhost:80", "http://localhost:8080", "http://localhost:8081", "http://localhost:5001"],\n  credentials: true,\n  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],\n  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization", "user-id"]`;
  const modifiedContent = content.replace("  origin: [", "  // Modified CORS config\n" + corsConfig + "\n  // Original config\n  // origin: [");
  fs.writeFileSync(serverPath, modifiedContent);
  console.log("Added CORS headers to server.js");
} else {
  console.log("CORS headers already exist in server.js");
}
EOF

# Run the script to add CORS headers
node /tmp/add_cors.js

# Monitor and restart socat if it dies
monitor_socat() {
  while true; do
    if ! kill -0 $SOCAT_PID 2>/dev/null; then
      echo "Socat died, restarting..."
      socat TCP-LISTEN:5001,fork,reuseaddr TCP:localhost:80 &
      SOCAT_PID=$!
    fi
    sleep 5
  done
}

# Start monitoring in background
monitor_socat &
MONITOR_PID=$!

# Handle shutdown gracefully
trap "kill $BACKEND_PID $FRONTEND_PID $SOCAT_PID $MONITOR_PID; exit" SIGINT SIGTERM

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
