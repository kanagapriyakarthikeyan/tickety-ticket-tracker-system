
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface FullNameInputProps {
  fullName: string;
  onChange: (fullName: string) => void;
  disabled?: boolean;
}

export function FullNameInput({ fullName, onChange, disabled }: FullNameInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="fullName">Full Name</Label>
      <Input
        id="fullName"
        name="fullName"
        type="text"
        value={fullName}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Enter your full name"
      />
    </div>
  );
}
