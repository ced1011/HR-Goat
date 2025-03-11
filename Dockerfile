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

# Create a simple server.js file if it doesn't exist
RUN if [ ! -f "server.js" ] && [ ! -f "index.js" ] && [ ! -f "app.js" ]; then \
    echo 'const http = require("http"); \
    const fs = require("fs"); \
    const path = require("path"); \
    const PORT = process.env.PORT || 80; \
    \
    const MIME_TYPES = { \
      ".html": "text/html", \
      ".js": "text/javascript", \
      ".css": "text/css", \
      ".json": "application/json", \
      ".png": "image/png", \
      ".jpg": "image/jpg", \
      ".gif": "image/gif", \
      ".svg": "image/svg+xml", \
      ".wav": "audio/wav", \
      ".mp4": "video/mp4", \
      ".woff": "application/font-woff", \
      ".ttf": "application/font-ttf", \
      ".eot": "application/vnd.ms-fontobject", \
      ".otf": "application/font-otf", \
      ".wasm": "application/wasm" \
    }; \
    \
    // Determine the static directory (dist or build) \
    let staticDir = "dist"; \
    if (!fs.existsSync(path.join(__dirname, "dist")) && fs.existsSync(path.join(__dirname, "build"))) { \
      staticDir = "build"; \
    } \
    \
    console.log(`Serving static files from ${staticDir} directory`); \
    \
    const server = http.createServer((req, res) => { \
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`); \
      \
      // Handle favicon.ico requests \
      if (req.url === "/favicon.ico") { \
        res.statusCode = 204; \
        res.end(); \
        return; \
      } \
      \
      // Normalize the URL path \
      let filePath = path.join(__dirname, staticDir, req.url === "/" ? "index.html" : req.url); \
      \
      // If the path doesnt have an extension, assume its a route and serve index.html \
      if (!path.extname(filePath)) { \
        filePath = path.join(__dirname, staticDir, "index.html"); \
      } \
      \
      const extname = String(path.extname(filePath)).toLowerCase(); \
      const contentType = MIME_TYPES[extname] || "application/octet-stream"; \
      \
      fs.readFile(filePath, (error, content) => { \
        if (error) { \
          if (error.code === "ENOENT") { \
            // File not found, try serving index.html \
            fs.readFile(path.join(__dirname, staticDir, "index.html"), (err, content) => { \
              if (err) { \
                res.writeHead(404); \
                res.end("File not found"); \
              } else { \
                res.writeHead(200, { "Content-Type": "text/html" }); \
                res.end(content, "utf-8"); \
              } \
            }); \
          } else { \
            // Server error \
            res.writeHead(500); \
            res.end(`Server Error: ${error.code}`); \
          } \
        } else { \
          // Success \
          res.writeHead(200, { "Content-Type": contentType }); \
          res.end(content, "utf-8"); \
        } \
      }); \
    }); \
    \
    server.listen(PORT, () => { \
      console.log(`Server running at http://localhost:${PORT}/`); \
      console.log(`Environment: DB_HOST=${process.env.DB_HOST}, DB_NAME=${process.env.DB_NAME}`); \
    });' > server.js; \
  fi

# Expose the port the app runs on
EXPOSE 80

# Create a script to update database configuration at runtime
RUN echo '#!/bin/bash\n\
set -x\n\
echo "Starting entrypoint script..."\n\
echo "Updating database configuration..."\n\
\n\
# Create .env file with the provided environment variables\n\
echo "DB_HOST=$DB_HOST" > .env\n\
echo "DB_USER=$DB_USER" >> .env\n\
echo "DB_PASSWORD=$DB_PASSWORD" >> .env\n\
echo "DB_NAME=$DB_NAME" >> .env\n\
\n\
echo "Database configuration created. Content of .env:"\n\
cat .env\n\
\n\
# Add port configuration for the application to use port 80\n\
export PORT=80\n\
echo "PORT set to: $PORT"\n\
\n\
# List available npm scripts\n\
echo "Available npm scripts:"\n\
npm run --json | grep name\n\
\n\
# Check for build directory structure\n\
echo "Directory structure:"\n\
ls -la\n\
if [ -d "dist" ]; then\n\
  echo "Contents of dist folder:"\n\
  ls -la dist\n\
fi\n\
if [ -d "build" ]; then\n\
  echo "Contents of build folder:"\n\
  ls -la build\n\
fi\n\
\n\
# Check available scripts and run the appropriate one\n\
echo "Attempting to run the application..."\n\
if npm run --json | grep -q \'"name": "dev"\'; then\n\
  echo "Running npm run dev"\n\
  exec npm run dev\n\
elif npm run --json | grep -q \'"name": "serve"\'; then\n\
  echo "Running npm run serve"\n\
  exec npm run serve\n\
elif npm run --json | grep -q \'"name": "preview"\'; then\n\
  echo "Running npm run preview"\n\
  exec npm run preview\n\
elif npm run --json | grep -q \'"name": "start:prod"\'; then\n\
  echo "Running npm run start:prod"\n\
  exec npm run start:prod\n\
else\n\
  echo "No suitable run script found. Starting built app with node."\n\
  if [ -f "dist/server.js" ]; then\n\
    echo "Running node dist/server.js"\n\
    exec node dist/server.js\n\
  elif [ -f "dist/index.js" ]; then\n\
    echo "Running node dist/index.js"\n\
    exec node dist/index.js\n\
  elif [ -f "build/server.js" ]; then\n\
    echo "Running node build/server.js"\n\
    exec node build/server.js\n\
  elif [ -f "build/index.js" ]; then\n\
    echo "Running node build/index.js"\n\
    exec node build/index.js\n\
  elif [ -f "server.js" ]; then\n\
    echo "Running node server.js"\n\
    exec node server.js\n\
  elif [ -f "index.js" ]; then\n\
    echo "Running node index.js"\n\
    exec node index.js\n\
  elif [ -f "app.js" ]; then\n\
    echo "Running node app.js"\n\
    exec node app.js\n\
  else\n\
    echo "Cannot find entry point. Starting a simple HTTP server to serve static files."\n\
    echo "Looking for JavaScript files:"\n\
    find . -name "*.js" | grep -v "node_modules" | sort\n\
    \n\
    # Create a simple HTTP server as a fallback\n\
    echo "const http = require(\\"http\\");" > simple-server.js\n\
    echo "const fs = require(\\"fs\\");" >> simple-server.js\n\
    echo "const path = require(\\"path\\");" >> simple-server.js\n\
    echo "const PORT = process.env.PORT || 80;" >> simple-server.js\n\
    echo "let staticDir = \\"dist\\";" >> simple-server.js\n\
    echo "if (!fs.existsSync(path.join(__dirname, \\"dist\\")) && fs.existsSync(path.join(__dirname, \\"build\\"))) {" >> simple-server.js\n\
    echo "  staticDir = \\"build\\";" >> simple-server.js\n\
    echo "}" >> simple-server.js\n\
    echo "console.log(\`Server running at http://localhost:\${PORT}/\`);" >> simple-server.js\n\
    echo "console.log(\`Serving static files from \${staticDir} directory\`);" >> simple-server.js\n\
    echo "console.log(\`Environment: DB_HOST=\${process.env.DB_HOST}, DB_NAME=\${process.env.DB_NAME}\`);" >> simple-server.js\n\
    echo "const server = http.createServer((req, res) => {" >> simple-server.js\n\
    echo "  console.log(\`\${new Date().toISOString()} - \${req.method} \${req.url}\`);" >> simple-server.js\n\
    echo "  res.writeHead(200, { \\"Content-Type\\": \\"text/html\\" });" >> simple-server.js\n\
    echo "  res.end(\\"<html><body><h1>HR Portal</h1><p>Application is running but no entry point was found.</p></body></html>\\");" >> simple-server.js\n\
    echo "});" >> simple-server.js\n\
    echo "server.listen(PORT);" >> simple-server.js\n\
    \n\
    exec node simple-server.js\n\
  fi\n\
fi\n' > /app/docker-entrypoint.sh && chmod +x /app/docker-entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"] 