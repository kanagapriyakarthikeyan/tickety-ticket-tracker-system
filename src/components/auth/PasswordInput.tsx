
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { validatePassword } from '@/utils/authValidation';

interface PasswordInputProps {
  password: string;
  onChange: (password: string) => void;
  disabled?: boolean;
  showValidation?: boolean;
}

export function PasswordInput({ password, onChange, disabled, showValidation = true }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isValid = validatePassword(password);
  
  return (
    <div className="space-y-2">
      <Label htmlFor="password">Password</Label>
      <div className="relative">
        <Input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => onChange(e.target.value)}
          required
          disabled={disabled}
          placeholder="Enter your password"
          minLength={8}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {showValidation && (
        <p className="text-sm text-gray-500">Password must be at least 8 characters</p>
      )}
    </div>
  );
}
