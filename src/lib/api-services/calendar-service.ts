import { CalendarEvent, ApiResponse } from '../api-models';

// Use the proxy configuration from vite.config.ts
const baseUrl = '/api';

// Helper function to safely parse JSON responses
const safelyParseJson = async (response: Response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse JSON response:', text.substring(0, 100) + '...');
    throw new Error(`Server returned invalid JSON: ${response.status} ${response.statusText}`);
  }
};

export const calendarService = {
  // Get all calendar events
  async getCalendarEvents(): Promise<ApiResponse<CalendarEvent[]>> {
    try {
      const response = await fetch(`${baseUrl}/calendar-events`);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const data = await safelyParseJson(response);
      
      // The server returns { data: [...], error: null }
      return data;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return { 
        data: [], 
        error: error instanceof Error ? error.message : 'Failed to fetch calendar events' 
      };
    }
  },
  
  // Get a calendar event by ID
  async getCalendarEventById(id: number): Promise<ApiResponse<CalendarEvent>> {
    try {
      const response = await fetch(`${baseUrl}/calendar-events/${id}`);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const data = await safelyParseJson(response);
      
      // The server returns { data: {...}, error: null }
      return data;
    } catch (error) {
      console.error('Error fetching calendar event:', error);
      return { 
        data: {} as CalendarEvent, 
        error: error instanceof Error ? error.message : 'Failed to fetch calendar event' 
      };
    }
  },
  
  // Create a new calendar event
  async createCalendarEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt' | 'creatorName'>): Promise<ApiResponse<CalendarEvent>> {
    try {
      const response = await fetch(`${baseUrl}/calendar-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const data = await safelyParseJson(response);
      
      // The server returns { data: {...}, error: null }
      return data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return { 
        data: {} as CalendarEvent, 
        error: error instanceof Error ? error.message : 'Failed to create calendar event' 
      };
    }
  },
  
  // Update a calendar event
  async updateCalendarEvent(id: number, updates: Partial<CalendarEvent>): Promise<ApiResponse<CalendarEvent>> {
    try {
      const response = await fetch(`${baseUrl}/calendar-events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const data = await safelyParseJson(response);
      
      // The server returns { data: {...}, error: null }
      return data;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      return { 
        data: {} as CalendarEvent, 
        error: error instanceof Error ? error.message : 'Failed to update calendar event' 
      };
    }
  },
  
  // Delete a calendar event
  async deleteCalendarEvent(id: number): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${baseUrl}/calendar-events/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const data = await safelyParseJson(response);
      
      // The server returns { data: true, error: null }
      return data;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      return { 
        data: false, 
        error: error instanceof Error ? error.message : 'Failed to delete calendar event' 
      };
    }
  },
  
  // Reset calendar events with fresh mock data
  async resetCalendarEvents(): Promise<ApiResponse<{ success: boolean, message: string }>> {
    try {
      const response = await fetch(`${baseUrl}/reset-calendar-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await safelyParseJson(response);
      return data;
    } catch (error) {
      console.error('Error resetting calendar events:', error);
      return {
        data: { success: false, message: 'Failed to reset calendar events' },
        error: error instanceof Error ? error.message : 'Failed to reset calendar events'
      };
    }
  }
}; 