import { apiRequest } from './client';

// Customer
export function customerLogin(email: string, password: string) {
  return apiRequest('/customer/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
export function customerRegister(fullName: string, email: string, password: string, contactNumber: string) {
  return apiRequest('/customer/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, password, contactNumber }),
  });
}

// Assignee
export function assigneeLogin(email: string, password: string) {
  return apiRequest('/assignee/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
export function assigneeRegister(fullName: string, email: string, password: string, contactNumber: string, address: string) {
  return apiRequest('/assignee/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, password, contactNumber, address }),
  });
} 