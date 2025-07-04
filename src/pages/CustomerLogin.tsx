import React, { useState } from 'react';
import CustomerAuthForm from '@/components/auth/CustomerAuthForm';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CustomerLogin: React.FC = () => {
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg('');
    setForgotError('');
    setForgotLoading(true);
    try {
      const res = await axios.post('/api/auth/forgot-password', { email: forgotEmail });
      setForgotMsg(res.data.message || 'If your email exists, you will receive a reset link.');
    } catch (err: any) {
      setForgotError(err.response?.data?.error || 'Failed to send reset email.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div>
      <CustomerAuthForm onBack={() => {}} />
      {!showForgot && (
        <div style={{ marginTop: 16 }}>
          <button type="button" style={{ color: '#007bff', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => setShowForgot(true)}>
            Forgot Password?
          </button>
        </div>
      )}
      {showForgot && (
        <div style={{ marginTop: 24, maxWidth: 350 }}>
          <h3>Forgot Password</h3>
          <form onSubmit={handleForgotSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              style={{ width: '100%', padding: 8, marginBottom: 8 }}
              required
            />
            <button type="submit" disabled={forgotLoading} style={{ width: '100%', padding: 8 }}>
              {forgotLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          {forgotMsg && <div style={{ color: 'green', marginTop: 8 }}>{forgotMsg}</div>}
          {forgotError && <div style={{ color: 'red', marginTop: 8 }}>{forgotError}</div>}
          <button type="button" style={{ marginTop: 8 }} onClick={() => setShowForgot(false)}>
            Back to Login
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerLogin; 