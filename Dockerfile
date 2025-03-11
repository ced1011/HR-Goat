FROM node:18-bullseye

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with legacy-peer-deps flag to handle React version conflicts
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Create a default .env file
RUN touch .env

# Expose the port the app runs on
EXPOSE 80

# Create a script to update database configuration at runtime
RUN echo '#!/bin/sh \n\
echo "Updating database configuration..." \n\
# Create .env file with the provided environment variables \n\
cat > .env << EOF \n\
DB_HOST=${DB_HOST} \n\
DB_USER=${DB_USER} \n\
DB_PASSWORD=${DB_PASSWORD} \n\
DB_NAME=${DB_NAME} \n\
EOF \n\
echo "Database configuration created." \n\
# Add port configuration for the application to use port 80 \n\
export PORT=80 \n\
# Check available scripts and run the appropriate one \n\
if npm run | grep -q "start:prod"; then \n\
  echo "Running npm run start:prod" \n\
  npm run start:prod \n\
elif npm run | grep -q "serve"; then \n\
  echo "Running npm run serve" \n\
  npm run serve \n\
elif npm run | grep -q "preview"; then \n\
  echo "Running npm run preview" \n\
  npm run preview \n\
elif npm run | grep -q "dev"; then \n\
  echo "Running npm run dev" \n\
  npm run dev \n\
else \n\
  echo "No suitable run script found. Starting built app with node." \n\
  if [ -f "dist/server.js" ]; then \n\
    node dist/server.js \n\
  elif [ -f "dist/index.js" ]; then \n\
    node dist/index.js \n\
  elif [ -f "build/server.js" ]; then \n\
    node build/server.js \n\
  elif [ -f "build/index.js" ]; then \n\
    node build/index.js \n\
  else \n\
    echo "Cannot find entry point. Please check build output." \n\
    find ./dist -type f -name "*.js" | head -1 \n\
    find ./build -type f -name "*.js" | head -1 \n\
    ls -la \n\
    exit 1 \n\
  fi \n\
fi \n\
' > /app/docker-entrypoint.sh && chmod +x /app/docker-entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"] 