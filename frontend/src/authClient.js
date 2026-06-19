const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const KEY = 'bmi_session';

async function post(path, payload, token) {
  const response = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

async function get(path, token) {
  const response = await fetch(`${BASE}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export const authClient = {
  save: (session) => localStorage.setItem(KEY, JSON.stringify(session)),
  load: () => {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; }
  },
  clear: () => localStorage.removeItem(KEY),
  register: (payload) => post('/api/auth/register', payload),
  login: (payload) => post('/api/auth/login', payload),
  refresh: (refreshToken) => post('/api/auth/refresh', { refresh_token: refreshToken }),
  logout: (session) => post('/api/auth/logout', { refresh_token: session?.refresh_token || null }, session?.access_token),
  me: (token) => get('/api/auth/me', token),
  permission: (token, permission) => post('/api/auth/permission', { permission }, token),
  roles: () => get('/api/auth/roles'),
};
