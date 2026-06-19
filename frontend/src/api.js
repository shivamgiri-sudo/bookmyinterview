const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return response.json();
}

export const api = {
  overview: () => request('/api/workspace/overview'),
  jobs: () => request('/api/workspace/jobs'),
  talent: () => request('/api/workspace/talent'),
  assessments: () => request('/api/workspace/assessments'),
  createTenant: (payload) => request('/api/data/tenants', { method: 'POST', body: JSON.stringify(payload) }),
  createJob: (payload) => request('/api/data/jobs', { method: 'POST', body: JSON.stringify(payload) }),
  createCandidate: (payload) => request('/api/data/candidates', { method: 'POST', body: JSON.stringify(payload) }),
};
