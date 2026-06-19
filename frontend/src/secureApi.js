import { authClient } from './authClient.js';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function headers() {
  const session = authClient.load();
  return { 'Content-Type': 'application/json', ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) };
}

async function get(path) {
  const response = await fetch(`${BASE}${path}`, { headers: headers() });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

async function post(path, payload) {
  const response = await fetch(`${BASE}${path}`, { method: 'POST', headers: headers(), body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export const secureApi = {
  overview: () => get('/api/secure/workspace/overview'),
  jobs: () => get('/api/secure/workspace/jobs'),
  talent: () => get('/api/secure/workspace/talent'),
  assessments: () => get('/api/secure/workspace/assessments'),
  createJob: (payload) => post('/api/secure/workspace/jobs', payload),
  createTalent: (payload) => post('/api/secure/workspace/talent', payload),
};
