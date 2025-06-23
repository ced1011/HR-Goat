# Unified Server Architecture

This document explains the new unified server architecture that eliminates the need for proxies and combines frontend and backend into a single Express server.

## Why Unified Server?

The previous architecture had several issues:
- **Multiple proxy layers**: Frontend server proxied to backend, adding latency
- **Complex Docker setup**: Used `socat` for port redirection
- **Unnecessary separation**: Frontend and backend ran as separate processes
- **Configuration complexity**: Multiple servers to configure and maintain

## New Architecture Benefits

1. **Single Process**: One Express server handles both frontend and backend
2. **No Proxy Needed**: API routes are served directly, no proxy overhead
3. **Simplified Docker**: One container, one port, no port redirection
4. **Better Performance**: Direct API calls without proxy hops
5. **Easier Debugging**: All logs in one place

## How It Works

The unified server (`unified-server.js`) combines:
- **Static File Serving**: Serves the built React app from `/dist`
- **API Routes**: All `/api/*` routes handled directly
- **SPA Routing**: Catch-all route serves `index.html` for client-side routing
- **Database Connection**: Same MySQL connection pool as before

## Running Locally

### Development Mode
```bash
# Terminal 1: Run Vite dev server for hot reloading
npm run dev

# Terminal 2: Run backend server
cd server && npm start
```

### Production Mode
```bash
# Build frontend and run unified server
npm run start
```

## Docker Deployment

### Build and Run with Docker
```bash
# Build the image
docker build -f Dockerfile.unified -t hrgoat-unified .

# Run the container
docker run -p 8080:8080 \
  -e DB_HOST=your-db-host \
  -e DB_USER=your-db-user \
  -e DB_PASSWORD=your-db-password \
  hrgoat-unified
```

### Using Docker Compose
```bash
# Start all services
docker-compose -f docker-compose.unified.yml up -d

# View logs
docker-compose -f docker-compose.unified.yml logs -f

# Stop services
docker-compose -f docker-compose.unified.yml down
```

## Environment Variables

- `PORT`: Server port (default: 8080)
- `DB_HOST`: MySQL host
- `DB_USER`: MySQL username  
- `DB_PASSWORD`: MySQL password
- `DB_NAME`: Database name (default: hrportal)

## API Endpoints

All API endpoints remain the same, just without the proxy:
- `GET /api/employees` - Get all employees
- `POST /api/auth/login` - User login
- `GET /api/notifications` - Get notifications
- etc.

## Migration Notes

1. **Frontend Code**: No changes needed! API calls still use `/api/*`
2. **Port Change**: Default port is now 8080 (was 80 for frontend, 5001 for backend)
3. **Single Log Stream**: All logs (frontend serving + API) in one place

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>
```

### Database Connection Issues
- Ensure MySQL is running
- Check environment variables
- Verify database credentials

### Static Files Not Found
- Ensure `npm run build` was run
- Check that `/dist` directory exists
- Verify file paths in unified-server.js 