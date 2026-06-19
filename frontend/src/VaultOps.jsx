import React, { useEffect, useState } from 'react';
import { liveApi } from './liveApi.js';
import { LockKeyhole, RefreshCw, ShieldCheck } from 'lucide-react';

export default function VaultOps() {
  const [costs, setCosts] = useState([]);
  const [mode, setMode] = useState('demo');
  async function load() { try { const data = await liveApi.costs(); setCosts(data.all_providers || []); setMode('live'); } catch { setCosts([]); setMode('demo'); } }
  useEffect(() => { load(); }, []);
  return <section className="page"><div className="workspace-hero glass"><div><div className="eyebrow"><LockKeyhole size={16}/> Vault ops audit complete</div><h1>Provider cost and configuration controls are visible.</h1><p>This page reads cost-governed provider configuration when backend is available.</p></div><div className={`workspace-status ${mode}`}><ShieldCheck/><b>{mode}</b><span>Vault ops status</span><button className="slot compact" onClick={load}><RefreshCw size={15}/> Refresh</button></div></div><div className="glass card"><h3>Provider Controls</h3>{(costs.length ? costs : [{name:'Self-hosted MCP',cost_model:'free'}, {name:'PostgreSQL',cost_model:'free'}, {name:'OpenAI',cost_model:'paid'}]).map(item => <div className="workspace-row" key={item.name}><div><b>{item.name}</b><span>{item.cost_model}</span></div><strong>{item.free_default ? 'free' : 'approval'}</strong></div>)}</div></section>;
}
