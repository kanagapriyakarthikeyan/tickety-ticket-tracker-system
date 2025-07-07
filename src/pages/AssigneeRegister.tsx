import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { assigneeRegister } from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function AssigneeRegister() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    contactNumber: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const auth = useAuth();
  const setUser = (auth && typeof auth === 'object' && 'setUser' in auth) ? (auth as any).setUser : undefined;
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await assigneeRegister(
        formData.fullName,
        formData.email,
        formData.password,
        formData.contactNumber,
        formData.address
      );
      if (res.token) localStorage.setItem('token', res.token);
      if (res.user && setUser) setUser({ fullName: res.user.fullName, email: res.user.email, type: 'assignee' });
      toast({ title: 'Registration successful', description: 'Welcome, assignee!' });
      navigate('/assignee/tickets');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Assignee Registration</CardTitle>
          <CardDescription>Register as an assignee to handle support tickets</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <Input
              name="contactNumber"
              placeholder="Contact Number"
              value={formData.contactNumber}
              onChange={handleChange}
              disabled={loading}
            />
            <Textarea
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              disabled={loading}
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white rounded py-2 font-semibold"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
            <button
              type="button"
              className="w-full mt-2 bg-blue-600 text-white rounded py-2 font-semibold hover:bg-blue-700 transition"
              onClick={() => navigate('/assignee-login')}
              disabled={loading}
            >
              Switch to Login
            </button>
            <button
              type="button"
              className="w-full mt-2 text-blue-600 hover:underline text-sm"
              onClick={() => navigate('/auth')}
              disabled={loading}
            >
              &larr; Back to user type selection
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 