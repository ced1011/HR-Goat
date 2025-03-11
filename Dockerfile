FROM node:18-bullseye

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Create a script to update database configuration at runtime
RUN echo '#!/bin/sh \n\
echo "Updating database configuration..." \n\
sed -i "s|DB_HOST=.*|DB_HOST=$DB_HOST|g" .env \n\
sed -i "s|DB_USER=.*|DB_USER=$DB_USER|g" .env \n\
sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD|g" .env \n\
sed -i "s|DB_NAME=.*|DB_NAME=$DB_NAME|g" .env \n\
echo "Database configuration updated." \n\
npm start \n\
' > /app/docker-entrypoint.sh && chmod +x /app/docker-entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"] 