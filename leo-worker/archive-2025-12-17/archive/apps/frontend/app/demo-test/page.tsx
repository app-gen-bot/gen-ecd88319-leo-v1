'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';

export default function DemoTestPage() {
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleDemoLogin = async () => {
    try {
      await login('demo@example.com', 'demo123!');
      console.log('Demo login successful!');
    } catch (error) {
      console.error('Demo login failed:', error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Demo Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <p>Authentication Status: {isAuthenticated ? 'Logged In' : 'Not Logged In'}</p>
          {user && (
            <div className="mt-2">
              <p>User: {user.name}</p>
              <p>Email: {user.email}</p>
              <p>Role: {user.role}</p>
            </div>
          )}
        </div>

        {!isAuthenticated ? (
          <Button onClick={handleDemoLogin}>Test Demo Login</Button>
        ) : (
          <Button onClick={logout} variant="outline">Logout</Button>
        )}
      </div>
    </div>
  );
}