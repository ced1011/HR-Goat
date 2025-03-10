import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '@/lib/api-models';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface EventFormProps {
  event?: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt' | 'creatorName'>) => void;
  isSubmitting: boolean;
}

const EventForm: React.FC<EventFormProps> = ({ 
  event, 
  isOpen, 
  onClose,
  onSave,
  isSubmitting
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt' | 'creatorName'>>({
    title: '',
    description: '',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    location: '',
    eventType: 'meeting',
    createdBy: user?.id || 0
  });
  
  useEffect(() => {
    if (event) {
      // Format dates for datetime-local input (YYYY-MM-DDTHH:MM)
      const startDate = new Date(event.startDate).toISOString().slice(0, 16);
      const endDate = new Date(event.endDate).toISOString().slice(0, 16);
      
      setFormData({
        title: event.title,
        description: event.description,
        startDate,
        endDate,
        location: event.location,
        eventType: event.eventType,
        createdBy: event.createdBy
      });
    } else {
      // Reset form for new event
      setFormData({
        title: '',
        description: '',
        startDate: new Date().toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
        location: '',
        eventType: 'meeting',
        createdBy: user?.id || 0
      });
    }
  }, [event, user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure dates are in ISO format
    try {
      // Validate that end date is after start date
      const startDateTime = new Date(formData.startDate).getTime();
      const endDateTime = new Date(formData.endDate).getTime();
      
      if (endDateTime <= startDateTime) {
        toast.error('End date must be after start date');
        return;
      }
      
      // Format dates as ISO strings
      const formattedData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };
      
      onSave(formattedData);
    } catch (error) {
      console.error('Date validation error:', error);
      toast.error('Invalid date format. Please check your dates and try again.');
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Add New Event'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date & Time *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date & Time *</Label>
              <Input
                id="endDate"
                name="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type</Label>
              <Select 
                value={formData.eventType} 
                onValueChange={(value) => handleSelectChange('eventType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventForm; 