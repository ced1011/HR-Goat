import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Triangle, Circle, Square, Hexagon, Database, Layers, Users, Lock } from 'lucide-react';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const { login, isLoading, isAuthenticated } = useAuth();
  
  useEffect(() => {
    console.log('\n[AUTH-UI] Login page mounted');
    
    // Check if already authenticated
    if (isAuthenticated) {
      console.log('[AUTH-UI] User already authenticated, should redirect');
    }
    
    return () => {
      console.log('[AUTH-UI] Login page unmounted');
    };
  }, [isAuthenticated]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    console.log(`[AUTH-UI] Login form field "${name}" changed`);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('\n[AUTH-UI] Login form submitted:', { 
      username: credentials.username,
      passwordLength: credentials.password.length,
      timestamp: new Date().toISOString()
    });
    
    console.log('[AUTH-UI] Calling login function from AuthContext');
    const success = await login(credentials);
    
    console.log(`[AUTH-UI] Login attempt ${success ? 'succeeded' : 'failed'}`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-teal-50 flex flex-col">
      {/* Animated shapes */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-10 left-10 animate-bounce delay-100">
          <Triangle className="h-12 w-12 text-purple-400/50" />
        </div>
        <div className="absolute top-1/4 right-1/3 animate-pulse">
          <Circle className="h-20 w-20 text-pink-300/40" />
        </div>
        <div className="absolute bottom-1/3 left-1/4 animate-bounce delay-200">
          <Square className="h-16 w-16 text-teal-400/30 rotate-12" />
        </div>
        <div className="absolute top-2/3 right-1/4 animate-pulse delay-300">
          <Hexagon className="h-24 w-24 text-blue-300/30" />
        </div>
        <div className="absolute bottom-10 right-10 animate-bounce delay-100">
          <Triangle className="h-12 w-12 text-yellow-400/50 rotate-180" />
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-tr from-violet-500 to-teal-400 p-2 flex items-center justify-center shadow-xl">
              <Database className="h-10 w-10 text-white" />
            </div>
            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              HRGoat
            </h1>
            <div className="mt-3 flex justify-center space-x-2">
              <Users className="h-6 w-6 text-gray-600" />
              <Layers className="h-6 w-6 text-gray-600" />
              <Database className="h-6 w-6 text-gray-600" />
            </div>
            <p className="mt-2 text-center text-sm text-gray-600">
              Streamline your HR operations with our powerful goat-powered platform
            </p>
          </div>
          
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center flex justify-center items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Sign in
              </CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access the portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      placeholder="Enter your username"
                      type="text"
                      autoCapitalize="none"
                      autoComplete="username"
                      autoCorrect="off"
                      value={credentials.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <a href="#" className="text-sm text-primary hover:underline">
                        Forgot password?
                      </a>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      type="password"
                      autoCapitalize="none"
                      autoComplete="current-password"
                      value={credentials.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-gray-500">
                <ul className="mt-1">
                  <li>Don't have an account? Contact your administrator</li>
                </ul>
              </div>
            </CardFooter>
          </Card>
          
          <div className="text-center text-sm text-gray-600">
            <p></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
