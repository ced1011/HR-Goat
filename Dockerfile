# Use a Node.js image
FROM node:16-alpine

# Install socat for port redirection
RUN apk add --no-cache socat

# Create app directory
WORKDIR /app

# Copy frontend build
COPY dist/ ./dist/

# Copy backend files
COPY server/ ./server/

# Copy src directory with SQL files
COPY src/ ./src/

COPY examples/ ./examples/

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

# Copy frontend server and entrypoint script
COPY frontend-server.js /app/
COPY entrypoint.sh /app/

# Install required packages for frontend server
RUN npm init -y && \
    npm install express http-proxy-middleware node-fetch@2.6.1 cors

# Make entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Expose ports 80 and 5001
EXPOSE 80 5001

# Set entrypoint to our script
ENTRYPOINT ["/app/entrypoint.sh"]