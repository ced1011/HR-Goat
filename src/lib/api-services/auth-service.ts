import { ApiResponse, User, LoginCredentials } from '../api-models';
import { toast } from 'sonner';

class AuthService {
  private storageKey = 'hr_portal_auth';
  private baseUrl = '/api';
  
  async login(credentials: LoginCredentials): Promise<ApiResponse<User | null>> {
    console.log('\n[AUTH-FRONTEND] Login attempt:', { 
      username: credentials.username,
      timestamp: new Date().toISOString()
    });
    
    try {
      console.log('[AUTH-FRONTEND] Sending login request to:', `${this.baseUrl}/auth/login`);
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      console.log('[AUTH-FRONTEND] Received response:', { 
        status: response.status,
        success: response.ok,
        timestamp: new Date().toISOString()
      });
      
      if (!response.ok) {
        console.log('[AUTH-FRONTEND] Login failed:', data.message);
        return {
          data: null,
          error: data.message || 'Invalid username or password'
        };
      }
      
      // Format user data
      const userData: User = data.user;
      console.log('[AUTH-FRONTEND] Login successful:', { 
        userId: userData.id,
        username: userData.username,
        role: userData.role,
        timestamp: new Date().toISOString()
      });
      
      // Store in localStorage for persistence
      this.saveToStorage(userData);
      console.log('[AUTH-FRONTEND] User data saved to localStorage');
      
      return {
        data: userData,
        error: null
      };
    } catch (error) {
      console.error('[AUTH-FRONTEND] Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during login';
      toast.error('Login failed', { description: errorMessage });
      
      return {
        data: null,
        error: errorMessage
      };
    }
  }
  
  logout(): void {
    console.log('\n[AUTH-FRONTEND] Logout initiated:', {
      user: this.getCurrentUser()?.username || 'unknown',
      timestamp: new Date().toISOString()
    });
    
    // Call the logout API endpoint
    fetch(`${this.baseUrl}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': this.getCurrentUser()?.id?.toString() || ''
      }
    }).then(() => {
      console.log('[AUTH-FRONTEND] Logout API call successful');
    }).catch(error => {
      console.error('[AUTH-FRONTEND] Logout API call failed:', error);
    });
    
    localStorage.removeItem(this.storageKey);
    console.log('[AUTH-FRONTEND] User data removed from localStorage');
    
    // Force page reload to clear app state
    console.log('[AUTH-FRONTEND] Redirecting to login page');
    window.location.href = '/';
  }
  
  getCurrentUser(): User | null {
    const storedData = localStorage.getItem(this.storageKey);
    if (!storedData) {
      console.log('[AUTH-FRONTEND] getCurrentUser: No user found in localStorage');
      return null;
    }
    
    try {
      const user = JSON.parse(storedData) as User;
      console.log('[AUTH-FRONTEND] getCurrentUser:', { 
        userId: user.id,
        username: user.username,
        role: user.role
      });
      return user;
    } catch (error) {
      console.error('[AUTH-FRONTEND] Error parsing user data from localStorage:', error);
      return null;
    }
  }
  
  isAuthenticated(): boolean {
    const isAuth = this.getCurrentUser() !== null;
    console.log('[AUTH-FRONTEND] isAuthenticated:', isAuth);
    return isAuth;
  }
  
  private saveToStorage(user: User): void {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }
}

export const authService = new AuthService();
