import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';

export default function Profile() {
  const auth = useAuth();
  const userType = auth?.user?.type;
  const [form, setForm] = useState({ fullName: '', email: '', password: '', contactNumber: '', address: '' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userType === 'assignee') {
      apiRequest('/assignee/me')
        .then((data) => {
          setForm({
            fullName: data.fullName || '',
            email: data.email || '',
            password: '',
            contactNumber: data.contactNumber || '',
            address: data.address || '',
          });
        })
        .catch(() => {
          toast({ title: 'Error', description: 'Failed to load profile', variant: 'destructive' });
        });
    } else {
      apiRequest('/customer/me')
        .then((data) => {
          setForm({ fullName: data.fullName || '', email: data.email || '', password: '', contactNumber: '', address: '' });
        })
        .catch(() => {
          toast({ title: 'Error', description: 'Failed to load profile', variant: 'destructive' });
        });
    }
  }, [userType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (userType === 'assignee') {
        await apiRequest('/assignee/update', {
          method: 'PATCH',
          body: JSON.stringify({
            fullName: form.fullName,
            email: form.email,
            password: form.password,
            contactNumber: form.contactNumber,
            address: form.address,
          }),
        });
      } else {
        await apiRequest('/customer/update', {
          method: 'PATCH',
          body: JSON.stringify({ fullName: form.fullName, email: form.email, password: form.password }),
        });
      }
      toast({ title: 'Profile updated', description: 'Your profile has been updated successfully.' });
      setForm((prev) => ({ ...prev, password: '' }));
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Full Name</label>
              <Input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <Input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            {userType === 'assignee' && (
              <>
                <div>
                  <label className="block mb-1 font-medium">Contact Number</label>
                  <Input
                    name="contactNumber"
                    value={form.contactNumber}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Address</label>
                  <Input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </>
            )}
            <div>
              <label className="block mb-1 font-medium">New Password</label>
              <Input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
                minLength={8}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 