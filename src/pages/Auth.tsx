import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const { user, signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  if (user) {
    return <Navigate to="/" replace />;
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic email validation
    if (!validateEmail(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    // Password validation for sign up
    if ((isSignUp || !isForgotPassword) && formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      if (isForgotPassword) {
        const { error } = await resetPassword(formData.email);
        if (error) {
          console.error('Reset password error:', error);
          toast({
            title: "Error",
            description: error.message || "Failed to send reset email",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Password reset sent",
            description: "Check your email for the password reset link"
          });
          setIsForgotPassword(false);
        }
      } else if (isSignUp) {
        console.log('Attempting sign up with:', { email: formData.email, fullName: formData.fullName });
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          console.error('Sign up error:', error);
          toast({
            title: "Sign up failed",
            description: error.message || "Failed to create account",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Account created",
            description: "Check your email to verify your account"
          });
        }
      } else {
        console.log('Attempting sign in with:', { email: formData.email });
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          console.error('Sign in error:', error);
          toast({
            title: "Sign in failed",
            description: error.message || "Invalid email or password",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email"
                className={!validateEmail(formData.email) && formData.email ? 'border-red-500' : ''}
              />
              {!validateEmail(formData.email) && formData.email && (
                <p className="text-sm text-red-500">Please enter a valid email address</p>
              )}
            </div>
            
            {!isForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your password"
                  minLength={6}
                />
                <p className="text-sm text-gray-500">Password must be at least 6 characters</p>
              </div>
            )}

            {isSignUp && !isForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Loading...' : 
                isForgotPassword ? 'Send Reset Link' :
                isSignUp ? 'Sign Up' : 'Sign In'
              }
            </Button>
          </form>

          <div className="mt-4 space-y-2 text-center text-sm">
            {!isForgotPassword && (
              <>
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-blue-600 hover:underline"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
                <br />
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-blue-600 hover:underline"
                >
                  Forgot your password?
                </button>
              </>
            )}
            
            {isForgotPassword && (
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="text-blue-600 hover:underline"
              >
                Back to sign in
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
