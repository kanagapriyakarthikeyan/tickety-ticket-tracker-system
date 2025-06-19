
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthForm } from '@/components/auth/AuthForm';
import { AuthNavigation } from '@/components/auth/AuthNavigation';

export default function Auth() {
  const { user } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleToggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setIsForgotPassword(false);
  };

  const handleToggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
    setIsSignUp(false);
  };

  const handleFormSuccess = () => {
    if (isSignUp) {
      setIsSignUp(false);
    }
    if (isForgotPassword) {
      setIsForgotPassword(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">TicketFlow</CardTitle>
          <CardDescription>
            {isForgotPassword 
              ? 'Reset your password' 
              : isSignUp 
                ? 'Create your account' 
                : 'Sign in to your account'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm
            isSignUp={isSignUp}
            isForgotPassword={isForgotPassword}
            onSuccess={handleFormSuccess}
          />
          
          <AuthNavigation
            isSignUp={isSignUp}
            isForgotPassword={isForgotPassword}
            onToggleSignUp={handleToggleSignUp}
            onToggleForgotPassword={handleToggleForgotPassword}
          />
        </CardContent>
      </Card>
    </div>
  );
}
