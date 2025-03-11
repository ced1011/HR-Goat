import React, { useEffect, useState } from 'react';
import { getProfile, logout } from '../lib/api-services/user-service';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, Mail, Shield } from 'lucide-react';

const ProfilePage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Error Loading Profile</h1>
        <p className="text-gray-500 mb-4">Unable to load profile information.</p>
        <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="/placeholder-avatar.jpg" alt={profile.username} />
                <AvatarFallback>{profile.username?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <CardTitle>{profile.username}</CardTitle>
              <CardDescription>{profile.role}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{profile.username}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="capitalize">{profile.role}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="destructive" className="w-full" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Username</h3>
                <p className="text-muted-foreground">{profile.username}</p>
              </div>
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-muted-foreground">{profile.email}</p>
              </div>
              <div>
                <h3 className="font-medium">Role</h3>
                <p className="text-muted-foreground capitalize">{profile.role}</p>
              </div>
              <div>
                <h3 className="font-medium">Last Login</h3>
                <p className="text-muted-foreground">{profile.last_login || 'Not available'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 