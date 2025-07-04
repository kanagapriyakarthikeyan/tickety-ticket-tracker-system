const API_URL = 'http://localhost:4000/api';

export async function apiRequest(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) throw new Error((await res.json()).error || 'API error');
  return res.json();
}

export function getAssigneeTickets() {
  return apiRequest('/assignee/tickets');
}
export function createTicket(data: any) {
  return apiRequest('/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
export function resolveTicket(ticketId: string) {
  return apiRequest(`/tickets/${ticketId}/resolve`, {
    method: 'PATCH',
  });
}
export function getTicketComments(ticketId: string) {
  return apiRequest(`/tickets/${ticketId}/comments`);
}
export function addTicketComment(ticketId: string, content: string) {
  return apiRequest(`/tickets/${ticketId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}
export async function getTicketAttachments(ticketId: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/tickets/${ticketId}/attachments`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch attachments');
  return res.json();
}
export async function getCommentAttachments(commentId: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/comments/${commentId}/attachments`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch comment attachments');
  return res.json();
} 