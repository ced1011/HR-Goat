import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Login from './pages/Login';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Payroll from './pages/Payroll';
import Performance from './pages/Performance';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import DatabaseSetup from './pages/DatabaseSetup';
import Unauthorized from './pages/Unauthorized';
import Documents from './pages/Documents';
import SystemTools from './pages/SystemTools';
import Calendar from './pages/Calendar';
import Reports from './pages/Reports';
import ProfilePage from './pages/ProfilePage';
import NotificationPage from './pages/NotificationPage';

import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

import './App.css';

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <Router>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected routes with layout */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/employees" element={<Employees />} />
                      <Route path="/employees/:id" element={<Profile />} />
                      <Route path="/payroll" element={<Payroll />} />
                      <Route path="/performance" element={<Performance />} />
                      <Route path="/documents" element={<Documents />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/database-setup" element={<DatabaseSetup />} />
                      <Route path="/system-tools" element={<SystemTools />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/notifications" element={<NotificationPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
