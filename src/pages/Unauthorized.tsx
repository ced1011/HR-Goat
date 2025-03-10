
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 mb-6">
        <Shield className="h-10 w-10 text-red-600" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight">Access Denied</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        You don't have permission to access this page.
      </p>
      <div className="mt-8 flex gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
        <Button
          onClick={() => navigate('/dashboard')}
          className="gap-2"
        >
          Go to Dashboard
        </Button>
        <Button
          variant="destructive"
          onClick={logout}
          className="gap-2"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
