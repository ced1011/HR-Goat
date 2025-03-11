import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'manager' | 'employee')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = ['admin', 'manager', 'employee'] 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    console.log('\n[AUTH-ROUTE] Protected route accessed:', {
      path: location.pathname,
      isAuthenticated,
      userRole: user?.role || 'none',
      isLoading,
      allowedRoles,
      timestamp: new Date().toISOString()
    });
  }, [location.pathname, isAuthenticated, user, isLoading, allowedRoles]);
  
  // Show loading state
  if (isLoading) {
    console.log('[AUTH-ROUTE] Authentication loading, showing loading state');
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('[AUTH-ROUTE] User not authenticated, redirecting to login');
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  // Check role-based access if roles are specified
  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log('[AUTH-ROUTE] User lacks required role, redirecting to unauthorized page', {
      userRole: user.role,
      requiredRoles: allowedRoles
    });
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Render children if authorized
  console.log('[AUTH-ROUTE] Access granted to protected route');
  return <>{children}</>;
};

export default ProtectedRoute;
