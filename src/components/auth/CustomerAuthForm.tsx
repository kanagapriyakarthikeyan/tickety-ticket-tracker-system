import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerLogin, customerRegister } from '@/api/auth';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

export default function CustomerAuthForm({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const auth = useAuth();
  const setUser = (auth && typeof auth === 'object' && 'setUser' in auth) ? (auth as any).setUser : undefined;
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signin') {
        const res = await customerLogin(form.email, form.password);
        if (res.token) localStorage.setItem('token', res.token);
        if (res.user && setUser) setUser({ fullName: res.user.fullName, email: res.user.email, type: 'customer' });
        toast({ title: 'Login successful', description: 'Welcome, customer!' });
        navigate('/dashboard');
      } else if (mode === 'signup') {
        const res = await customerRegister(form.fullName, form.email, form.password);
        if (res.token) localStorage.setItem('token', res.token);
        if (res.user && setUser) setUser({ fullName: res.user.fullName, email: res.user.email, type: 'customer' });
        toast({ title: 'Account created!', description: 'Welcome, customer!' });
        navigate('/dashboard');
      } else if (mode === 'forgot') {
        setForgotLoading(true);
        try {
          const res = await axios.post('/api/auth/forgot-password', { email: form.email });
          toast({ title: 'Success', description: res.data.message || 'If your email exists, you will receive a reset link.' });
        } catch (err: any) {
          toast({ title: 'Error', description: err.response?.data?.error || 'Failed to send reset email.', variant: 'destructive' });
        } finally {
          setForgotLoading(false);
        }
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-center text-primary mb-2">TicketFlow</h1>
        <p className="text-center text-muted-foreground mb-6">
          {mode === 'signin' && 'Sign in to your customer account'}
          {mode === 'signup' && 'Create your customer account'}
          {mode === 'forgot' && 'Reset your password'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              name="email"
              type="email"
              className="w-full border rounded px-3 py-2"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          {(mode === 'signin' || mode === 'signup') && (
            <div>
              <label className="block mb-1 font-medium">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full border rounded px-3 py-2 pr-10"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  disabled={loading}
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
              <div className="text-xs text-muted-foreground mt-1">Password must be at least 8 characters</div>
            </div>
          )}
          {mode === 'signup' && (
            <div>
              <label className="block mb-1 font-medium">Full Name</label>
              <input
                name="fullName"
                className="w-full border rounded px-3 py-2"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          )}
          {mode === 'signin' && (
            <button type="submit" className="w-full bg-blue-600 text-white rounded py-2 font-semibold" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          )}
          {mode === 'signup' && (
            <button type="submit" className="w-full bg-blue-600 text-white rounded py-2 font-semibold" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          )}
          {mode === 'forgot' && (
            <button type="submit" className="w-full bg-blue-600 text-white rounded py-2 font-semibold" disabled={loading || forgotLoading}>
              {(loading || forgotLoading) ? 'Sending...' : 'Send Reset Link'}
            </button>
          )}
        </form>
        <div className="text-center mt-4 space-y-2">
          {mode === 'signin' && (
            <>
              <span>Don't have an account?{' '}
                <button className="text-blue-600 hover:underline" onClick={() => setMode('signup')} disabled={loading}>Sign up</button>
              </span>
              <br />
              <button className="text-blue-600 hover:underline" onClick={() => setMode('forgot')} disabled={loading}>Forgot your password?</button>
            </>
          )}
          {mode === 'signup' && (
            <>
              <span>Already have an account?{' '}
                <button className="text-blue-600 hover:underline" onClick={() => setMode('signin')} disabled={loading}>Sign in</button>
              </span>
              <br />
              <button className="text-blue-600 hover:underline" onClick={() => setMode('forgot')} disabled={loading}>Forgot your password?</button>
            </>
          )}
          {mode === 'forgot' && (
            <>
              <span>Remembered your password?{' '}
                <button className="text-blue-600 hover:underline" onClick={() => setMode('signin')} disabled={loading}>Sign in</button>
              </span>
            </>
          )}
          <br />
          <button className="text-blue-600 hover:underline text-sm" onClick={onBack} disabled={loading}>
            &larr; Back to user type selection
          </button>
        </div>
      </div>
    </div>
  );
} 