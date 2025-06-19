
import React from 'react';

interface AuthNavigationProps {
  isSignUp: boolean;
  isForgotPassword: boolean;
  onToggleSignUp: () => void;
  onToggleForgotPassword: () => void;
}

export function AuthNavigation({ 
  isSignUp, 
  isForgotPassword, 
  onToggleSignUp, 
  onToggleForgotPassword 
}: AuthNavigationProps) {
  if (isForgotPassword) {
    return (
      <div className="mt-4 text-center text-sm">
        <button
          type="button"
          onClick={onToggleForgotPassword}
          className="text-blue-600 hover:underline"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2 text-center text-sm">
      <button
        type="button"
        onClick={onToggleSignUp}
        className="text-blue-600 hover:underline"
      >
        {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
      </button>
      <br />
      <button
        type="button"
        onClick={onToggleForgotPassword}
        className="text-blue-600 hover:underline"
      >
        Forgot your password?
      </button>
    </div>
  );
}
