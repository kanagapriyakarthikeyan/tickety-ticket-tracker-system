
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Mail, User } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadedCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
    const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    
    // Add ticket count to each customer
    const customersWithTickets = loadedCustomers.map((customer: any) => ({
      ...customer,
      ticketCount: tickets.filter((ticket: any) => ticket.customerEmail === customer.email).length,
      lastTicket: tickets
        .filter((ticket: any) => ticket.customerEmail === customer.email)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    }));
    
    setCustomers(customersWithTickets);
    setFilteredCustomers(customersWithTickets);
  }, []);

  useEffect(() => {
    const filtered = customers.filter((customer: any) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [customers, searchTerm]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customers</h1>
        <p className="text-muted-foreground">Manage customer information and history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Customers ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {customers.length === 0 
                  ? "No customers found. Customers will appear here when tickets are created." 
                  : "No customers match your search criteria."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredCustomers.map((customer: any) => (
                <div key={customer.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <h3 className="font-semibold">{customer.name}</h3>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Customer since: {new Date(customer.createdAt).toLocaleDateString()}</span>
                        {customer.lastTicket && (
                          <span>Last ticket: {new Date(customer.lastTicket.createdAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">
                        {customer.ticketCount} ticket{customer.ticketCount !== 1 ? 's' : ''}
                      </Badge>
                      <Button variant="outline" size="sm">
                        View History
                      </Button>
                    </div>
                  </div>
                  
                  {customer.lastTicket && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm">
                        <span className="font-medium">Latest ticket:</span> {customer.lastTicket.title}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
