# HRGoat Backend Server

This is a Node.js Express server that acts as a backend for the HRGoat application. 
It handles the database operations and provides APIs for the frontend to communicate with the MySQL database.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

   For development with auto-restart:
   ```
   npm run dev
   ```

## API Endpoints

- `GET /api/test-connection` - Test the database connection
- `POST /api/run-setup-script` - Create database tables
- `POST /api/run-mock-data-script` - Insert mock data
- `GET /api/database-stats` - Get statistics about database tables

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
```

You can also customize the database configuration in server.js if needed.
