
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { validateForm } from '@/utils/authValidation';
import { EmailInput } from './EmailInput';
import { PasswordInput } from './PasswordInput';
import { FullNameInput } from './FullNameInput';

interface AuthFormProps {
  isSignUp: boolean;
  isForgotPassword: boolean;
  onSuccess?: () => void;
}

export function AuthForm({ isSignUp, isForgotPassword, onSuccess }: AuthFormProps) {
  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
          onSuccess?.();
        }
      } else {
        // Validate form
        const errors = validateForm(formData.email, formData.password, isSignUp, formData.fullName);
        if (errors.length > 0) {
          toast({
            title: "Validation Error",
            description: errors[0],
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        if (isSignUp) {
          console.log('Attempting sign up with:', { email: formData.email, fullName: formData.fullName });
          const { error } = await signUp(formData.email, formData.password, formData.fullName);
          if (error) {
            console.error('Sign up error:', error);
            if (error.message?.includes('User already registered')) {
              toast({
                title: "Account already exists",
                description: "An account with this email already exists. Please sign in instead.",
                variant: "destructive"
              });
            } else {
              toast({
                title: "Sign up failed",
                description: error.message || "Failed to create account",
                variant: "destructive"
              });
            }
          } else {
            toast({
              title: "Account created!",
              description: "Please check your email and click the confirmation link to complete your registration."
            });
            // Clear form and switch to sign in
            setFormData({ email: formData.email, password: '', fullName: '' });
            onSuccess?.();
          }
        } else {
          console.log('Attempting sign in with:', { email: formData.email });
          const { error } = await signIn(formData.email, formData.password);
          if (error) {
            console.error('Sign in error:', error);
            if (error.message?.includes('Email not confirmed')) {
              toast({
                title: "Email not verified",
                description: "Please check your email and click the confirmation link before signing in.",
                variant: "destructive"
              });
            } else if (error.message?.includes('Invalid login credentials')) {
              toast({
                title: "Invalid credentials",
                description: "Please check your email and password. If you signed up recently, make sure to verify your email first.",
                variant: "destructive"
              });
            } else {
              toast({
                title: "Sign in failed",
                description: error.message || "Invalid email or password",
                variant: "destructive"
              });
            }
          } else {
            // Success is handled by auth state change in AuthContext
            console.log('Sign in successful - redirect will be handled automatically');
          }
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

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <EmailInput
        email={formData.email}
        onChange={(value) => updateFormData('email', value)}
        disabled={loading}
      />
      
      {!isForgotPassword && (
        <PasswordInput
          password={formData.password}
          onChange={(value) => updateFormData('password', value)}
          disabled={loading}
        />
      )}

      {isSignUp && !isForgotPassword && (
        <FullNameInput
          fullName={formData.fullName}
          onChange={(value) => updateFormData('fullName', value)}
          disabled={loading}
        />
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Loading...' : 
          isForgotPassword ? 'Send Reset Link' :
          isSignUp ? 'Sign Up' : 'Sign In'
        }
      </Button>
    </form>
  );
}
