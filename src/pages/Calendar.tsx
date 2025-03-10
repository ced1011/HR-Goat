import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PageContainer from '@/components/layout/PageContainer';
import { CalendarEvent } from '@/lib/api-models';
import { calendarService } from '@/lib/api-services/calendar-service';
import EventCard from '@/components/calendar/EventCard';
import EventForm from '@/components/calendar/EventForm';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Calendar as CalendarIcon, Filter, RefreshCw } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const CalendarPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isResetting, setIsResetting] = useState(false);
  
  useEffect(() => {
    fetchEvents();
  }, []);
  
  useEffect(() => {
    // Apply filters
    let filtered = [...events];
    
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.eventType === filterType);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) || 
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query)
      );
    }
    
    setFilteredEvents(filtered);
  }, [events, filterType, searchQuery]);
  
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await calendarService.getCalendarEvents();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setEvents(response.data);
      setFilteredEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to load calendar events', {
        description: error instanceof Error ? error.message : 'Please try again later'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddEvent = () => {
    setSelectedEvent(null);
    setIsFormOpen(true);
  };
  
  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsFormOpen(true);
  };
  
  const handleDeleteEvent = (id: number) => {
    setEventToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteEvent = async () => {
    if (eventToDelete === null) return;
    
    try {
      const response = await calendarService.deleteCalendarEvent(eventToDelete);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Remove from local state
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventToDelete));
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event', {
        description: error instanceof Error ? error.message : 'Please try again later'
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };
  
  const handleSaveEvent = async (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt' | 'creatorName'>) => {
    setIsSubmitting(true);
    
    try {
      console.log('Saving event with data:', eventData);
      
      if (selectedEvent) {
        // Update existing event
        const response = await calendarService.updateCalendarEvent(selectedEvent.id, eventData);
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        // Update local state
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === selectedEvent.id ? response.data : event
          )
        );
        
        toast.success('Event updated successfully');
      } else {
        // Create new event
        const response = await calendarService.createCalendarEvent(eventData);
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        // Add to local state
        setEvents(prevEvents => [...prevEvents, response.data]);
        
        toast.success('Event created successfully');
      }
      
      setIsFormOpen(false);
    } catch (error) {
      console.error('Failed to save event:', error);
      toast.error('Failed to save event', {
        description: error instanceof Error ? error.message : 'Please try again later'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResetEvents = async () => {
    setIsResetting(true);
    try {
      const response = await calendarService.resetCalendarEvents();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      toast.success('Calendar events reset successfully');
      // Fetch the new events
      await fetchEvents();
    } catch (error) {
      console.error('Failed to reset events:', error);
      toast.error('Failed to reset calendar events', {
        description: error instanceof Error ? error.message : 'Please try again later'
      });
    } finally {
      setIsResetting(false);
    }
  };
  
  return (
    <PageContainer title="Calendar" description="View and manage company events">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
                <SelectItem value="holiday">Holidays</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="conference">Conferences</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={handleAddEvent} className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
          
          <Button 
            onClick={handleResetEvents} 
            variant="outline" 
            className="flex-1 sm:flex-none"
            disabled={isResetting}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isResetting ? 'animate-spin' : ''}`} />
            Reset Events
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No events found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {events.length === 0 
              ? "There are no events on the calendar yet." 
              : "No events match your current filters."}
          </p>
          {events.length === 0 && (
            <Button onClick={handleAddEvent} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Event
            </Button>
          )}
          {events.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => {
                setFilterType('all');
                setSearchQuery('');
              }} 
              className="mt-4"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
            />
          ))}
        </div>
      )}
      
      <EventForm
        event={selectedEvent || undefined}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveEvent}
        isSubmitting={isSubmitting}
      />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event from the calendar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteEvent} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
};

export default CalendarPage; 