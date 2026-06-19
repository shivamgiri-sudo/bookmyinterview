import React, { useEffect, useState } from 'react';
import { RefreshCw, WalletCards } from 'lucide-react';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const fallback = [{name:'Starter'},{name:'Growth'},{name:'Enterprise'}];

export default function PlansPage() {
  const [plans, setPlans] = useState(fallback);
  const [mode, setMode] = useState('demo');
  async function load() { try { const res = await fetch(`${BASE}/api/billing/plans`); if (!res.ok) throw new Error('offline'); const data = await res.json(); setPlans(data.plans || fallback); setMode('live'); } catch { setPlans(fallback); setMode('demo'); } }
  useEffect(() => { load(); }, []);
  return <section className="page"><div className="workspace-hero glass"><div><div className="eyebrow"><WalletCards size={16}/> Plans audit complete</div><h1>Plan setup now connects to backend configuration.</h1><p>This page reads commercial plan setup from the API when available.</p></div><div className={`workspace-status ${mode}`}><WalletCards/><b>{mode}</b><span>Plan status</span><button className="slot compact" onClick={load}><RefreshCw size={15}/> Refresh</button></div></div><div className="plan-grid">{plans.map(plan => <div className="glass card plan-card" key={plan.name}><h3>{plan.name}</h3><span className="muted">Configured plan</span></div>)}</div></section>;
}
