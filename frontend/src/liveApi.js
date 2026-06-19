const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function get(path) {
  const response = await fetch(`${BASE}${path}`);
  if (!response.ok) throw new Error(String(response.status));
  return response.json();
}

async function post(path, payload) {
  const response = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(String(response.status));
  return response.json();
}

export const liveApi = {
  reviews: () => get('/api/review/queue'),
  events: () => get('/api/platform/events'),
  eventSummary: () => get('/api/platform/events/summary'),
  policy: (region = 'global') => get(`/api/compliance/policy/${region}`),
  plans: () => get('/api/billing/plans'),
  estimate: (payload) => post('/api/billing/estimate', payload),
  costs: () => get('/api/cost/providers'),
  providers: () => get('/api/providers/readiness'),
  protection: () => get('/api/protected-config/options'),
};
