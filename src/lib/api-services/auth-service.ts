
import { db } from '../database';
import { ApiResponse, User, LoginCredentials } from '../api-models';
import { toast } from 'sonner';

class AuthService {
  private storageKey = 'hr_portal_auth';
  
  async login(credentials: LoginCredentials): Promise<ApiResponse<User | null>> {
    try {
      const { username, password } = credentials;
      
      // Query the database for the user
      const result = await db.query<any[]>(
        'SELECT id, username, email, role, employee_id FROM users WHERE username = ? LIMIT 1',
        [username]
      );
      
      if (result.error || !result.data || result.data.length === 0) {
        return {
          data: null,
          error: 'Invalid username or password'
        };
      }
      
      const user = result.data[0];
      
      // In a real application, you would verify the password hash here
      // For demo purposes we'll accept the password as-is (never do this in production!)
      // This is just for demonstration purposes
      if (password !== 'password123') {
        return {
          data: null,
          error: 'Invalid username or password'
        };
      }
      
      // Update last login timestamp
      await db.query(
        'UPDATE users SET last_login = NOW() WHERE id = ?',
        [user.id]
      );
      
      // Format user data
      const userData: User = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        employeeId: user.employee_id
      };
      
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
