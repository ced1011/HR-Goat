
// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  error: string | null;
}

// Authentication Types
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  employeeId?: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
