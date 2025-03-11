import axios from 'axios';
import { authService } from './auth-service';

const baseUrl = 'http://localhost:5001/api';

export const getProfile = async () => {
  console.log('\n[AUTH-FRONTEND] Fetching user profile');
  
  const user = authService.getCurrentUser();
  if (!user) {
    console.log('[AUTH-FRONTEND] Profile fetch failed: User not authenticated');
    throw new Error('User not authenticated');
  }
  
  console.log('[AUTH-FRONTEND] Sending profile request with user ID:', user.id);
  try {
    const response = await axios.get(`${baseUrl}/profile`, { 
      headers: { 'user-id': user.id },
      withCredentials: true 
    });
    
    console.log('[AUTH-FRONTEND] Profile data received:', {
      status: response.status,
      timestamp: new Date().toISOString()
    });
    
    return response.data;
  } catch (error) {
    console.error('[AUTH-FRONTEND] Profile fetch error:', error);
    throw error;
  }
};

export const logout = async () => {
  console.log('\n[AUTH-FRONTEND] Logout requested from user-service');
  
  try {
    const response = await axios.post(`${baseUrl}/logout`, {}, { withCredentials: true });
    console.log('[AUTH-FRONTEND] Logout API response:', {
      status: response.status,
      message: response.data.message,
      timestamp: new Date().toISOString()
    });
    
    authService.logout();
    console.log('[AUTH-FRONTEND] Logout completed via authService');
    
    return response.data;
  } catch (error) {
    console.error('[AUTH-FRONTEND] Logout error:', error);
    throw error;
  }
}; 