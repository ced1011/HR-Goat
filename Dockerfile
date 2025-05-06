# Use a Node.js image
FROM node:16-alpine

# Install socat for port redirection
RUN apk add --no-cache bash curl wget socat


# Create app directory
WORKDIR /app

# Copy frontend build
COPY dist/ ./dist/

# Copy backend files
COPY server/ ./server/

# Copy src directory with SQL files
COPY src/ ./src/


COPY public/ ./public/

COPY scripts/ ./scripts/

# Create default avatar file
RUN echo '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="128" height="128"><circle cx="32" cy="32" r="32" fill="#e0e0e0"/><path d="M32 16c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm0 38c-6.7 0-12.8-3.1-17-8 0-5.5 11.3-8.5 17-8.5s17 3 17 8.5c-4.2 4.9-10.3 8-17 8z" fill="#bdbdbd"/></svg>' > ./dist/default-avatar.svg

# Install backend dependencies
WORKDIR /app/server
RUN npm install

# Return to app directory
WORKDIR /app

# Create empty .env file (will be populated by entrypoint script)
RUN touch .env

# Install minimal dependencies for our simple HTTP server
RUN npm init -y && \
    npm install node-fetch@2.6.1

# Copy our simple server file
COPY simple-server.js /app/simple-server.js

# Create entrypoint script
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'set -e' >> /app/entrypoint.sh && \
    echo 'echo "Starting entrypoint script..."' >> /app/entrypoint.sh && \
    echo 'DB_HOST=${DB_HOST:-"localhost"}' >> /app/entrypoint.sh && \
    echo 'DB_USER=${DB_USER:-"user"}' >> /app/entrypoint.sh && \
    echo 'DB_PASSWORD=${DB_PASSWORD:-"password"}' >> /app/entrypoint.sh && \
    echo 'DB_NAME=${DB_NAME:-"hrportal"}' >> /app/entrypoint.sh && \
    echo 'FRONTEND_PORT=${FRONTEND_PORT:-"80"}' >> /app/entrypoint.sh && \
    echo 'BACKEND_PORT=${BACKEND_PORT:-"5002"}' >> /app/entrypoint.sh && \
    echo 'BACKEND_URL="http://localhost:${BACKEND_PORT}"' >> /app/entrypoint.sh && \
    echo 'echo "Setting FRONTEND_PORT to $FRONTEND_PORT"' >> /app/entrypoint.sh && \
    echo 'echo "Setting BACKEND_PORT to $BACKEND_PORT"' >> /app/entrypoint.sh && \
    echo 'echo "VITE_API_URL=/api" > /app/.env' >> /app/entrypoint.sh && \
    echo 'echo "VITE_BASE_URL=http://localhost:8080" >> /app/.env' >> /app/entrypoint.sh && \
    echo 'echo "DB_HOST=$DB_HOST" >> /app/.env' >> /app/entrypoint.sh && \
    echo 'echo "DB_USER=$DB_USER" >> /app/.env' >> /app/entrypoint.sh && \
    echo 'echo "DB_PASSWORD=$DB_PASSWORD" >> /app/.env' >> /app/entrypoint.sh && \
    echo 'echo "DB_NAME=$DB_NAME" >> /app/.env' >> /app/entrypoint.sh && \
    echo 'echo "FRONTEND_PORT=$FRONTEND_PORT" >> /app/.env' >> /app/entrypoint.sh && \
    echo 'echo "BACKEND_PORT=$BACKEND_PORT" >> /app/.env' >> /app/entrypoint.sh && \
    echo 'echo "BACKEND_URL=$BACKEND_URL" >> /app/.env' >> /app/entrypoint.sh && \
    echo 'cp /app/.env /app/server/.env' >> /app/entrypoint.sh && \
    echo 'echo "Created .env file and copied to server directory"' >> /app/entrypoint.sh && \
    echo 'echo "Directory contents:"' >> /app/entrypoint.sh && \
    echo 'ls -la /app' >> /app/entrypoint.sh && \
    echo 'if [ ! -f /app/server.js ]; then' >> /app/entrypoint.sh && \
    echo '  echo "Creating server.js symlink..."' >> /app/entrypoint.sh && \
    echo '  ln -s /app/server/server.js /app/server.js' >> /app/entrypoint.sh && \
    echo 'fi' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo '# Start the backend server with a different internal port (5002)' >> /app/entrypoint.sh && \
    echo 'echo "Starting backend server on port $BACKEND_PORT..."' >> /app/entrypoint.sh && \
    echo 'cd /app/server && PORT=$BACKEND_PORT node server.js &' >> /app/entrypoint.sh && \
    echo 'BACKEND_PID=$!' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo '# Allow a moment for the backend to start' >> /app/entrypoint.sh && \
    echo 'sleep 2' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo '# Start the frontend server' >> /app/entrypoint.sh && \
    echo 'echo "Starting frontend server on port $FRONTEND_PORT..."' >> /app/entrypoint.sh && \
    echo 'cd /app && BACKEND_URL=$BACKEND_URL node simple-server.js &' >> /app/entrypoint.sh && \
    echo 'FRONTEND_PID=$!' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo '# Start socat to redirect port 5001 traffic to the frontend server' >> /app/entrypoint.sh && \
    echo 'echo "Setting up port redirection: port 5001 -> port 80..."' >> /app/entrypoint.sh && \
    echo 'socat TCP-LISTEN:5001,fork,reuseaddr TCP:localhost:80 &' >> /app/entrypoint.sh && \
    echo 'SOCAT_PID=$!' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo '# Create a script to modify server.js to include CORS headers' >> /app/entrypoint.sh && \
    echo 'cat > /tmp/add_cors.js << "EOF"' >> /app/entrypoint.sh && \
    echo 'const fs = require("fs");' >> /app/entrypoint.sh && \
    echo 'const serverPath = "/app/server/server.js";' >> /app/entrypoint.sh && \
    echo 'const content = fs.readFileSync(serverPath, "utf8");' >> /app/entrypoint.sh && \
    echo 'if (!content.includes("Access-Control-Allow-Credentials")) {' >> /app/entrypoint.sh && \
    echo '  const corsConfig = `  origin: ["http://localhost", "http://localhost:80", "http://localhost:8080", "http://localhost:8081", "http://localhost:5001"],\n  credentials: true,\n  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],\n  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization", "user-id"]`;' >> /app/entrypoint.sh && \
    echo '  const modifiedContent = content.replace("  origin: [", "  // Modified CORS config\n" + corsConfig + "\n  // Original config\n  // origin: [");' >> /app/entrypoint.sh && \
    echo '  fs.writeFileSync(serverPath, modifiedContent);' >> /app/entrypoint.sh && \
    echo '  console.log("Added CORS headers to server.js");' >> /app/entrypoint.sh && \
    echo '} else {' >> /app/entrypoint.sh && \
    echo '  console.log("CORS headers already exist in server.js");' >> /app/entrypoint.sh && \
    echo '}' >> /app/entrypoint.sh && \
    echo 'EOF' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo '# Run the script to add CORS headers' >> /app/entrypoint.sh && \
    echo 'node /tmp/add_cors.js' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo '# Monitor and restart socat if it dies' >> /app/entrypoint.sh && \
    echo 'monitor_socat() {' >> /app/entrypoint.sh && \
    echo '  while true; do' >> /app/entrypoint.sh && \
    echo '    if ! kill -0 $SOCAT_PID 2>/dev/null; then' >> /app/entrypoint.sh && \
    echo '      echo "Socat died, restarting..."' >> /app/entrypoint.sh && \
    echo '      socat TCP-LISTEN:5001,fork,reuseaddr TCP:localhost:80 &' >> /app/entrypoint.sh && \
    echo '      SOCAT_PID=$!' >> /app/entrypoint.sh && \
    echo '    fi' >> /app/entrypoint.sh && \
    echo '    sleep 5' >> /app/entrypoint.sh && \
    echo '  done' >> /app/entrypoint.sh && \
    echo '}' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo '# Start monitoring in background' >> /app/entrypoint.sh && \
    echo 'monitor_socat &' >> /app/entrypoint.sh && \
    echo 'MONITOR_PID=$!' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo '# Handle shutdown gracefully' >> /app/entrypoint.sh && \
    echo 'trap "kill $BACKEND_PID $FRONTEND_PID $SOCAT_PID $MONITOR_PID; exit" SIGINT SIGTERM' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo '# Wait for any process to exit' >> /app/entrypoint.sh && \
    echo 'wait -n' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo '# Exit with status of process that exited first' >> /app/entrypoint.sh && \
    echo 'exit $?' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Expose ports 80 and 5001
EXPOSE 80 5001

# Set entrypoint to our new script
ENTRYPOINT ["/app/entrypoint.sh"] 