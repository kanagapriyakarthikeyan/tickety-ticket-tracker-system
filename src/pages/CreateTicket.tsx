
import React from 'react';
import { CreateTicketForm } from '@/components/CreateTicketForm';

export default function CreateTicket() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Ticket</h1>
        <p className="text-muted-foreground">Submit a new support request</p>
      </div>
      <CreateTicketForm />
    </div>
  );
}
