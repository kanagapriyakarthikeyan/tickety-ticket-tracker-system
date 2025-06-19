
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { validateEmail } from '@/utils/authValidation';

interface EmailInputProps {
  email: string;
  onChange: (email: string) => void;
  disabled?: boolean;
}

export function EmailInput({ email, onChange, disabled }: EmailInputProps) {
  const isValid = validateEmail(email);
  
  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        name="email"
        type="email"
        value={email}
        onChange={(e) => onChange(e.target.value)}
        required
        disabled={disabled}
        placeholder="Enter your email"
        className={!isValid && email ? 'border-red-500' : ''}
      />
      {!isValid && email && (
        <p className="text-sm text-red-500">Please enter a valid email address</p>
      )}
    </div>
  );
}
