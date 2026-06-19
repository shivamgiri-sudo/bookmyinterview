import React, { useEffect, useState } from 'react';
import { secureApi } from './secureApi.js';
import { Globe2, RefreshCw, Sparkles } from 'lucide-react';

export default function LiveHub() {
  const [overview, setOverview] = useState({ jobs: 0, candidates: 0, assessments: 0, role: 'guest' });
  const [mode, setMode] = useState('locked');
  async function load() { try { const data = await secureApi.overview(); setOverview(data); setMode('secure'); } catch { setMode('locked'); } }
  useEffect(() => { load(); }, []);
  return <section className="page"><div className="workspace-hero glass"><div><div className="eyebrow"><Globe2 size={16}/> Secure hub complete</div><h1>Hub now reads scoped workspace summary.</h1><p>This page connects operating view to secure workspace counters.</p></div><div className={`workspace-status ${mode}`}><Sparkles/><b>{mode}</b><span>Hub data status</span><button className="slot compact" onClick={load}><RefreshCw size={15}/> Refresh</button></div></div><div className="workspace-kpis">{Object.entries(overview).map(([key,value]) => <div className="glass workspace-kpi" key={key}><Globe2/><b>{value || 0}</b><span>{key}</span></div>)}</div></section>;
}
