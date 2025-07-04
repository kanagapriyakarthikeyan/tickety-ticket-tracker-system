const API_URL = 'http://localhost:4000/api';

export async function apiRequest(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    let errorMessage = '';
    if (data && (data.error || data.message)) {
      errorMessage = data.error || data.message;
    } else {
      try {
        errorMessage = await res.text();
      } catch {
        errorMessage = 'API error';
      }
    }
    throw new Error(errorMessage || 'API error');
  }

  return data;
} 