import React, { useState, useEffect } from 'react';
import { Bell, Menu, X, Search, User, LogOut, Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getNotifications, markAsRead, deleteNotification } from '@/lib/api-services/notification-service';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getDefaultAvatar } from '@/lib/utils';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
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
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  
  return (
    <header className="h-16 px-4 md:px-6 bg-white border-b border-hr-silver/20 sticky top-0 z-40 transition-all duration-300 glassmorphism">
      <div className="flex items-center justify-between h-full max-w-[1920px] mx-auto">
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleSidebar} 
            className="p-2 rounded-full hover:bg-hr-silver/10 transition-colors"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5 text-hr-text-primary" />
            ) : (
              <Menu className="h-5 w-5 text-hr-text-primary" />
            )}
          </button>
          
          <div onClick={() => navigate('/')} className="cursor-pointer select-none">
            <h1 className="text-xl font-medium tracking-tight">
              <span className="text-hr-blue">HR</span>Goat
            </h1>
          </div>
        </div>
        
        <div className={cn(
          "hidden md:flex items-center rounded-full bg-hr-silver/10 px-3 py-1.5 transition-all duration-300",
          searchFocused && "ring-2 ring-hr-blue/20 bg-white"
        )}>
          <Search className="h-4 w-4 text-hr-text-secondary mr-2" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent border-none outline-none text-sm w-60 placeholder:text-hr-text-secondary"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="relative p-1.5 rounded-full hover:bg-hr-silver/10 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-hr-text-secondary" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-hr-blue rounded-full"></span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-[70vh] overflow-auto">
              <DropdownMenuLabel className="flex justify-between items-center">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount} new
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {loading ? (
                <div className="py-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-6 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </div>
              ) : (
                <>
                  {notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="px-2 py-2">
                      <div className={cn(
                        "rounded-md p-2 transition-colors",
                        !notification.is_read && "bg-muted/50"
                      )}>
                        <div className="flex justify-between items-start mb-1">
                          <p className={cn(
                            "text-sm",
                            !notification.is_read && "font-medium"
                          )}>
                            {notification.message}
                          </p>
                          {!notification.is_read && (
                            <Badge variant="default" className="ml-2 text-[10px] h-4">New</Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {notification.created_at && 
                            formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </div>
                        <div className="flex justify-end space-x-2">
                          {!notification.is_read && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2 text-xs"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Mark read
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                      {notifications.indexOf(notification) < notifications.length - 1 && (
                        <DropdownMenuSeparator className="my-1" />
                      )}
                    </div>
                  ))}
                </>
              )}
              
              <div className="p-2 border-t mt-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate('/notifications')}
                >
                  View all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center justify-center h-8 w-8 rounded-full overflow-hidden ring-2 ring-hr-silver/30 transition-all hover:ring-hr-blue/30"
                aria-label="User menu"
              >
                <img
                  src={getDefaultAvatar("https://randomuser.me/api/portraits/men/32.jpg", "John Doe")}
                  alt="User profile"
                  className="h-full w-full object-cover"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
