
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await resetPassword(formData.email);
        if (error) {
          toast({
            title: "Error",
            description: error.message,
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
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Account created",
            description: "Check your email to verify your account"
          });
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
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
              />
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
                />
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
