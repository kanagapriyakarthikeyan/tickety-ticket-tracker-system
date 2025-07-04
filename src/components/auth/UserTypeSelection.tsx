import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserCheck } from 'lucide-react';

export function UserTypeSelection({ onSelectCustomer, onSelectAssignee }: { onSelectCustomer: () => void, onSelectAssignee: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">TicketFlow</CardTitle>
          <CardDescription>
            Choose your account type to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={onSelectCustomer}
            className="w-full h-16 flex items-center justify-center gap-3 text-lg"
            variant="outline"
          >
            <Users className="w-6 h-6" />
            Customer Login
          </Button>
          <Button
            onClick={onSelectAssignee}
            className="w-full h-16 flex items-center justify-center gap-3 text-lg"
            variant="outline"
          >
            <UserCheck className="w-6 h-6" />
            Assignee Registration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
