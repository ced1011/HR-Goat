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
    console.log('\n[AUTH-CONTEXT] Initializing authentication state');
    // Check if user is already logged in
    const user = authService.getCurrentUser();
    
    setState({
      user,
      isAuthenticated: !!user,
      isLoading: false
    });
    
    console.log('[AUTH-CONTEXT] Initial auth state set:', { 
      isAuthenticated: !!user,
      user: user ? { id: user.id, username: user.username, role: user.role } : null
    });
  }, []);
  
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    console.log('\n[AUTH-CONTEXT] Login process started:', { 
      username: credentials.username,
      timestamp: new Date().toISOString()
    });
    
    setState(prev => ({ ...prev, isLoading: true }));
    console.log('[AUTH-CONTEXT] Set loading state to true');
    
    const response = await authService.login(credentials);
    
    if (response.error || !response.data) {
      console.log('[AUTH-CONTEXT] Login failed:', response.error);
      toast.error('Login failed', { description: response.error || 'Invalid credentials' });
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
    
    console.log('[AUTH-CONTEXT] Login successful, updating auth state');
    setState({
      user: response.data,
      isAuthenticated: true,
      isLoading: false
    });
    
    toast.success('Login successful', { description: `Welcome back, ${response.data.username}!` });
    
    // Redirect to dashboard or intended page
    const origin = location.state?.from?.pathname || '/dashboard';
    console.log('[AUTH-CONTEXT] Redirecting to:', origin);
    navigate(origin);
    
    return true;
  };
  
  const logout = () => {
    console.log('\n[AUTH-CONTEXT] Logout process started');
    
    authService.logout();
    console.log('[AUTH-CONTEXT] AuthService logout called');
    
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    console.log('[AUTH-CONTEXT] Auth state reset');
    
    toast.info('You have been logged out');
    console.log('[AUTH-CONTEXT] Redirecting to home page');
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
    console.error('[AUTH-CONTEXT] useAuth called outside of AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
