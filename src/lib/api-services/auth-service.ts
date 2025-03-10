import { ApiResponse, User, LoginCredentials } from '../api-models';
import { toast } from 'sonner';

class AuthService {
  private storageKey = 'hr_portal_auth';
  private baseUrl = '/api';
  
  async login(credentials: LoginCredentials): Promise<ApiResponse<User | null>> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          data: null,
          error: data.message || 'Invalid username or password'
        };
      }
      
      // Format user data
      const userData: User = data.user;
      
      // Store in localStorage for persistence
      this.saveToStorage(userData);
      
      return {
        data: userData,
        error: null
      };
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during login';
      toast.error('Login failed', { description: errorMessage });
      
      return {
        data: null,
        error: errorMessage
      };
    }
  }
  
  logout(): void {
    localStorage.removeItem(this.storageKey);
    // Force page reload to clear app state
    window.location.href = '/';
  }
  
  getCurrentUser(): User | null {
    const storedData = localStorage.getItem(this.storageKey);
    if (!storedData) return null;
    
    try {
      return JSON.parse(storedData) as User;
    } catch {
      return null;
    }
  }
  
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
  
  private saveToStorage(user: User): void {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }
}

export const authService = new AuthService();
