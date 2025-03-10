# HRGoat - Modern HR Management Portal

HRGoat is a comprehensive HR management portal that provides tools for employee management, document handling, calendar events, and more.

## System Requirements

- Node.js (v16 or higher)
- MySQL database
- Modern web browser (Chrome, Firefox, Edge, Safari)

## Getting Started

Follow these steps to set up and run the HRGoat application:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hr-portal-symphony
```

### 2. Install Dependencies

Install both frontend and backend dependencies:

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Database Setup

The application uses a MySQL database. The server will automatically create the database and tables on startup, but you need to ensure MySQL is running and accessible with the credentials specified in `server/server.js`.

### 4. Start the Backend Server

Start the backend server first:

```bash
cd server
npm start
```

The server will run on port 5001 by default. You should see output indicating that the database has been initialized and the server is running.

### 5. Start the Frontend Development Server

In a new terminal window, start the frontend development server:

```bash
npm run dev
```

The frontend will run on port 80 by default (or another available port if 80 is in use). You'll see output with the local URL where you can access the application.

### 6. Access the Application

Open your web browser and navigate to the URL shown in the terminal (typically http://localhost:80 or another port if 80 is in use).

## Features

HRGoat includes the following features:

- **Employee Management**: View and manage employee information
- **Document Management**: Upload, view, and download documents
- **Calendar Events**: Schedule and manage company events
- **Bank Account Management**: Manage employee bank accounts
- **User Authentication**: Secure login and role-based access control
- **Reports Dashboard**: View and analyze reports on employees, performance, and attendance with interactive visualizations

## Troubleshooting

### Connection Issues

If you encounter connection issues between the frontend and backend:

1. Ensure the backend server is running on port 5001
2. Check that the proxy configuration in `vite.config.ts` points to the correct backend URL
3. Restart both the frontend and backend servers

### Database Issues

If you encounter database issues:

1. Ensure MySQL is running and accessible
2. Check the database credentials in `server/server.js`
3. You can reset specific tables using the API endpoints (e.g., `/api/reset-calendar-events`)

### Dependency Issues

If you encounter issues with dependencies:

1. Clear npm cache: `npm cache clean --force`
2. Reinstall dependencies: `npm install --force`
3. Start the frontend with forced optimization: `npm run dev -- --force`

## Development Notes

- The frontend is built with React, TypeScript, and Vite
- The backend is built with Express.js and MySQL
- API endpoints are available at `/api/*`
- Static files (uploads) are served from `/uploads/*`

## Security Notice

This application includes intentionally vulnerable endpoints for educational purposes. Do not use these in a production environment. 