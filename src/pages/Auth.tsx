
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthForm } from '@/components/auth/AuthForm';
import { AuthNavigation } from '@/components/auth/AuthNavigation';
import { UserTypeSelection } from '@/components/auth/UserTypeSelection';

export default function Auth() {
  const { user, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(true);
  const [userType, setUserType] = useState<'customer' | 'assignee' | null>(null);

  // Handle URL parameters for email confirmation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    
    if (accessToken && refreshToken) {
      console.log('Email verification tokens found in URL');
      // The auth state change listener will handle the redirect
    }
  }, []);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect if user is already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSelectCustomer = () => {
    setUserType('customer');
    setShowUserTypeSelection(false);
  };

  const handleSelectAssignee = () => {
    window.location.href = '/assignee-registration';
  };

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

  const handleBackToSelection = () => {
    setShowUserTypeSelection(true);
    setUserType(null);
    setIsSignUp(false);
    setIsForgotPassword(false);
  };

  if (showUserTypeSelection) {
    return (
      <UserTypeSelection
        onSelectCustomer={handleSelectCustomer}
        onSelectAssignee={handleSelectAssignee}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">TicketFlow</CardTitle>
          <CardDescription>
            {isForgotPassword 
              ? 'Reset your password' 
              : isSignUp 
                ? 'Create your customer account' 
                : 'Sign in to your customer account'
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

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleBackToSelection}
              className="text-sm text-blue-600 hover:underline"
            >
              ← Back to user type selection
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
