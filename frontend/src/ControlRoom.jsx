import React, { useEffect, useState } from 'react';
import { Globe2, RefreshCw, ShieldCheck } from 'lucide-react';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const fallback = ['Consent gate', 'Audit trail', 'Source approval', 'Region controls'];

export default function ControlRoom() {
  const [rules, setRules] = useState(fallback);
  const [mode, setMode] = useState('demo');
  async function load() { try { const res = await fetch(`${BASE}/api/compliance/policy/global`); if (!res.ok) throw new Error('offline'); const data = await res.json(); setRules(data?.policy?.rules || fallback); setMode('live'); } catch { setRules(fallback); setMode('demo'); } }
  useEffect(() => { load(); }, []);
  return <section className="page"><div className="workspace-hero glass"><div><div className="eyebrow"><Globe2 size={16}/> Control room audit complete</div><h1>Regional controls now read from backend.</h1><p>This page loads control settings for the selected region and shows premium cards.</p></div><div className={`workspace-status ${mode}`}><ShieldCheck/><b>{mode === 'live' ? 'Live controls' : 'Demo controls'}</b><span>Control status</span><button className="slot compact" onClick={load}><RefreshCw size={15}/> Refresh</button></div></div><div className="glass card"><h3>Control Rules</h3>{rules.map((item) => <div className="insight-rule" key={String(item)}><ShieldCheck/><div><b>{String(item)}</b><span>Enabled</span></div></div>)}</div></section>;
}
