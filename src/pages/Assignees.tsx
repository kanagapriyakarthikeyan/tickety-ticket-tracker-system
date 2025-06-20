
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Assignee {
  id: string;
  name: string;
  email: string;
  contact_number: string | null;
  address: string | null;
  created_at: string;
}

export default function Assignees() {
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact_number: '',
    address: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignees();
  }, []);

  const fetchAssignees = async () => {
    try {
      const { data, error } = await supabase
        .from('assignees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch assignees",
          variant: "destructive"
        });
      } else {
        setAssignees(data || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('assignees')
          .update({
            name: formData.name,
            email: formData.email,
            contact_number: formData.contact_number,
            address: formData.address
          })
          .eq('id', editingId);

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Success",
            description: "Assignee updated successfully!"
          });
          setEditingId(null);
          setFormData({ name: '', email: '', contact_number: '', address: '' });
          fetchAssignees();
        }
      } else {
        const { error } = await supabase
          .from('assignees')
          .insert([
            {
              name: formData.name,
              email: formData.email,
              contact_number: formData.contact_number,
              address: formData.address
            }
          ]);

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Success",
            description: "Assignee added successfully!"
          });
          setFormData({ name: '', email: '', contact_number: '', address: '' });
          fetchAssignees();
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (assignee: Assignee) => {
    setEditingId(assignee.id);
    setFormData({
      name: assignee.name,
      email: assignee.email,
      contact_number: assignee.contact_number || '',
      address: assignee.address || ''
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this assignee?')) {
      try {
        const { error } = await supabase
          .from('assignees')
          .delete()
          .eq('id', id);

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Success",
            description: "Assignee deleted successfully!"
          });
          fetchAssignees();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive"
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assignees</h1>
        <p className="text-muted-foreground">Manage support ticket assignees</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Assignee' : 'Add New Assignee'}</CardTitle>
          <CardDescription>
            {editingId ? 'Update assignee information' : 'Add a new support ticket assignee'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_number">Contact Number</Label>
              <Input
                id="contact_number"
                placeholder="Phone number"
                value={formData.contact_number}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_number: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Full address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit">
                {editingId ? 'Update Assignee' : 'Add Assignee'}
              </Button>
              {editingId && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ name: '', email: '', contact_number: '', address: '' });
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Assignees</CardTitle>
          <CardDescription>List of all registered assignees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignees.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No assignees found</p>
            ) : (
              assignees.map((assignee) => (
                <div key={assignee.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{assignee.name}</h3>
                      <p className="text-sm text-muted-foreground">{assignee.email}</p>
                      {assignee.contact_number && (
                        <p className="text-sm text-muted-foreground">Phone: {assignee.contact_number}</p>
                      )}
                      {assignee.address && (
                        <p className="text-sm text-muted-foreground">Address: {assignee.address}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(assignee)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(assignee.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
