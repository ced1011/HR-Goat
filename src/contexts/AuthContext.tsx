
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '@/lib/api-services/auth-service';
import { User, LoginCredentials, AuthState } from '@/lib/api-models';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Check if user is already logged in
    const user = authService.getCurrentUser();
    setState({
      user,
      isAuthenticated: !!user,
      isLoading: false
    });
  }, []);
  
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    const response = await authService.login(credentials);
    
    if (response.error || !response.data) {
      toast.error('Login failed', { description: response.error || 'Invalid credentials' });
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
    
    setState({
      user: response.data,
      isAuthenticated: true,
      isLoading: false
    });
    
    toast.success('Login successful', { description: `Welcome back, ${response.data.username}!` });
    
    // Redirect to dashboard or intended page
    const origin = location.state?.from?.pathname || '/dashboard';
    navigate(origin);
    
    return true;
  };
  
  const logout = () => {
    authService.logout();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    toast.info('You have been logged out');
    navigate('/');
  };
  
  const contextValue: AuthContextType = {
    ...state,
    login,
    logout
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
