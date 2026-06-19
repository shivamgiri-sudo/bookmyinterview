const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function post(path, payload) {
  const response = await fetch(`${BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export const accountClient = {
  recoveryStart: (email) => post('/api/account/recovery/start', { email }),
  recoveryComplete: (challenge, newPassword) => post('/api/account/recovery/complete', { challenge, new_password: newPassword }),
  verifyStart: (email) => post('/api/account/verify/start', { email }),
  verifyComplete: (challenge) => post('/api/account/verify/complete', { challenge }),
};
