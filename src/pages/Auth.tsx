import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserTypeSelection } from '@/components/auth/UserTypeSelection';
import CustomerAuthForm from '@/components/auth/CustomerAuthForm';

export default function Auth() {
  const [showCustomerAuth, setShowCustomerAuth] = useState(false);
  const navigate = useNavigate();

  if (showCustomerAuth) {
    return <CustomerAuthForm onBack={() => setShowCustomerAuth(false)} />;
  }

  return (
    <UserTypeSelection
      onSelectCustomer={() => setShowCustomerAuth(true)}
      onSelectAssignee={() => navigate('/assignee-register')}
    />
  );
}
