import React from 'react';
import { CalendarEvent } from '@/lib/api-models';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Edit, 
  Trash2,
  Video,
  Briefcase,
  Palmtree,
  GraduationCap,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: CalendarEvent;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (id: number) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onEdit, onDelete }) => {
  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  // Get event type icon
  const getEventTypeIcon = () => {
    switch (event.eventType) {
      case 'meeting':
        return <Users className="h-4 w-4" />;
      case 'holiday':
        return <Palmtree className="h-4 w-4" />;
      case 'training':
        return <GraduationCap className="h-4 w-4" />;
      case 'conference':
        return <Video className="h-4 w-4" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };
  
  // Get event type color
  const getEventTypeColor = () => {
    switch (event.eventType) {
      case 'meeting':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'holiday':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'training':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'conference':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };
  
  const isSameDay = (date1: string, date2: string) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };
  
  return (
    <Card className="overflow-hidden">
      <div className={cn(
        "h-2",
        event.eventType === 'meeting' ? 'bg-blue-500' :
        event.eventType === 'holiday' ? 'bg-green-500' :
        event.eventType === 'training' ? 'bg-purple-500' :
        event.eventType === 'conference' ? 'bg-amber-500' :
        'bg-gray-500'
      )} />
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg">{event.title}</h3>
            <Badge variant="outline" className={cn("mt-1 capitalize", getEventTypeColor())}>
              {getEventTypeIcon()}
              <span className="ml-1">{event.eventType}</span>
            </Badge>
          </div>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-gray-500 hover:text-gray-700"
              onClick={() => onEdit(event)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-red-500 hover:text-red-700"
              onClick={() => onDelete(event.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {event.description && (
          <p className="text-sm text-gray-600 mt-2">{event.description}</p>
        )}
        
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-start">
            <Calendar className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
            <div>
              {isSameDay(event.startDate, event.endDate) ? (
                <span>{formatDate(event.startDate)}</span>
              ) : (
                <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
              )}
            </div>
          </div>
          
          <div className="flex items-start">
            <Clock className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
            <div>
              {formatTime(event.startDate)} - {formatTime(event.endDate)}
            </div>
          </div>
          
          {event.location && (
            <div className="flex items-start">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
              <div>{event.location}</div>
            </div>
          )}
          
          <div className="flex items-start">
            <User className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
            <div>Created by {event.creatorName || 'System'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard; 