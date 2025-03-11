import axios from 'axios';
import { authService } from './auth-service';

const baseUrl = 'http://localhost:5001/api';

export const getNotifications = async () => {
  const user = authService.getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const response = await axios.get(`${baseUrl}/notifications`, { 
    headers: { 'user-id': user.id },
    withCredentials: true 
  });
  return response.data;
};

export const markAsRead = async (id: number) => {
  const user = authService.getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const response = await axios.put(`${baseUrl}/notifications/${id}`, {}, { 
    headers: { 'user-id': user.id },
    withCredentials: true 
  });
  return response.data;
};

export const deleteNotification = async (id: number) => {
  const user = authService.getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const response = await axios.delete(`${baseUrl}/notifications/${id}`, { 
    headers: { 'user-id': user.id },
    withCredentials: true 
  });
  return response.data;
}; 