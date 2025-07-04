import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/api/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Assignee {
  id: string;
  name: string;
  email: string;
  contact_number?: string | null;
  address?: string | null;
  created_at?: string;
}

export default function Assignees() {
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignees();
  }, []);

  const fetchAssignees = async () => {
    try {
      // Use the backend API endpoint for assignees
      const data = await apiRequest('/assignees');
      setAssignees(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch assignees from the server",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="w-full px-0 pt-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">Assignees</h1>
            <p className="text-muted-foreground">List of support ticket assignees</p>
          </div>
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-black dark:text-white">Assignee List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-40 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="w-full px-0 pt-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Assignees</h1>
          <p className="text-muted-foreground">List of support ticket assignees</p>
        </div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-black dark:text-white">Assignee List</CardTitle>
          </CardHeader>
          <CardContent>
            {assignees.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No assignees found in the database.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {assignees.map(a => (
                  <div key={a.id} className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 w-full max-w-xs mx-auto border border-gray-200 hover:shadow-lg transition">
                    <h2 className="text-lg font-bold mb-1 text-gray-900">{a.name}</h2>
                    <div className="text-sm break-all"><span className="font-semibold">Email:</span> {a.email}</div>
                    <div className="text-sm"><span className="font-semibold">Contact:</span> {a.contact_number || '-'}</div>
                    <div className="text-sm break-all"><span className="font-semibold">Address:</span> {a.address || '-'}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      <span className="font-medium">Created:</span> {a.created_at ? new Date(a.created_at).toLocaleString() : '-'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
