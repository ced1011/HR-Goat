const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const fetch = require('node-fetch');

console.log('Simple frontend server starting...');
const PORT = process.env.FRONTEND_PORT || 80;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5002';

// List of supported content types
const contentTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

// Create HTTP server
const server = http.createServer(async (req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Parse URL and pathname
  const parsedUrl = url.parse(req.url);
  const pathname = decodeURIComponent(parsedUrl.pathname);
  
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, user-id');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 204; // No content
    res.end();
    return;
  }
  
  // Handle API requests - proxy to backend
  if (pathname.startsWith('/api/')) {
    try {
      await proxyRequest(req, res, pathname);
    } catch (error) {
      console.error('Error proxying request:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal Server Error', message: error.message }));
    }
    return;
  }
  
  // Handle dummy API for compatibility with port 5001
  if (pathname === '/dummy-api/notifications') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, message: 'Please use port 8080 instead', data: [] }));
    return;
  }
  
  // Handle static file requests
  let filePath;
  if (pathname === '/') {
    // Serve index.html for root path
    filePath = path.join(__dirname, 'dist', 'index.html');
  } else {
    // Serve files from dist directory
    filePath = path.join(__dirname, 'dist', pathname);
  }
  
  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      console.log(`File not found: ${filePath}, serving index.html instead`);
      // For SPA, return index.html for all non-file routes
      filePath = path.join(__dirname, 'dist', 'index.html');
      serveFile(filePath, res);
    } else {
      serveFile(filePath, res);
    }
  });
});

// Function to serve a static file
function serveFile(filePath, res) {
  const extname = path.extname(filePath).toLowerCase();
  const contentType = contentTypes[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(`Error reading file: ${filePath}`, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
      return;
    }
    
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.end(data);
  });
}

// Function to proxy API requests to backend
async function proxyRequest(req, res, pathname) {
  // Create request URL for backend
  const backendUrl = `${BACKEND_URL}${pathname}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;
  
  // Create options for fetch
  const options = {
    method: req.method,
    headers: {},
  };
  
  // Copy headers from request to fetch options
  for (const [key, value] of Object.entries(req.headers)) {
    // Skip host header
    if (key.toLowerCase() !== 'host') {
      options.headers[key] = value;
    }
  }
  
  // Handle request body for non-GET requests
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    // Read request body
    const body = await readRequestBody(req);
    if (body) {
      options.body = body;
    }
  }
  
  // Make request to backend
  try {
    const response = await fetch(backendUrl, options);
    
    // Set status code
    res.statusCode = response.status;
    
    // Copy headers from backend response
    for (const [key, value] of Object.entries(response.headers.raw())) {
      res.setHeader(key, value);
    }
    
    // Get response body
    const responseBody = await response.buffer();
    
    // Send response
    res.end(responseBody);
  } catch (error) {
    console.error(`Error proxying to ${backendUrl}:`, error);
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Bad Gateway', message: 'Error communicating with backend' }));
  }
}

// Function to read request body
function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    req.on('end', () => {
      if (chunks.length === 0) {
        resolve(null);
      } else {
        resolve(Buffer.concat(chunks));
      }
    });
    
    req.on('error', (err) => {
      reject(err);
    });
  });
}

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 