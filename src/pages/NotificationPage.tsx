import React, { useEffect, useState } from 'react';
import { getNotifications, markAsRead, deleteNotification } from '../lib/api-services/notification-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Trash2, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

const NotificationPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <Button variant="outline" onClick={fetchNotifications}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <Card className="mb-4">
          <CardContent className="pt-6">
            <p className="text-center text-red-500">{error}</p>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card className="mb-4">
          <CardContent className="pt-6 flex flex-col items-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">You have no notifications</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => (
            <Card key={notification.id} className={notification.is_read ? 'bg-background' : 'bg-muted/20'}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-primary" />
                    <CardTitle className="text-lg">
                      {notification.is_read ? (
                        notification.message
                      ) : (
                        <span className="font-bold">{notification.message}</span>
                      )}
                    </CardTitle>
                  </div>
                  {!notification.is_read && (
                    <Badge variant="default" className="ml-2">New</Badge>
                  )}
                </div>
                <CardDescription>
                  {notification.created_at && 
                    formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end space-x-2">
                  {!notification.is_read && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Mark as Read
                    </Button>
                  )}
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(notification.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationPage; 