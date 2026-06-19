import React, { useEffect, useState } from 'react';
import { secureApi } from './secureApi.js';
import { Brain, CheckCircle2, ClipboardCheck, RefreshCw, Sparkles } from 'lucide-react';

const packs = [['Voice Pack', 'Audio and scenario path', 78], ['Sales Pack', 'Case and pitch path', 82], ['HR Pack', 'Judgment and trait path', 76], ['Ops Pack', 'SLA and RCA path', 80], ['Tech Pack', 'Coding and review path', 74], ['Leadership Pack', 'Executive path', 84]];

export default function EnginePage() {
  const [rows, setRows] = useState([]);
  const [mode, setMode] = useState('locked');
  async function load() { try { const data = await secureApi.assessments(); setRows(data); setMode('secure'); } catch { setRows([]); setMode('locked'); } }
  useEffect(() => { load(); }, []);
  return <section className="page">
    <div className="workspace-hero glass"><div><div className="eyebrow"><ClipboardCheck size={16}/> Secure engine complete</div><h1>Generated evaluation paths are now visible from scoped records.</h1><p>The engine reads generated path records through protected workspace APIs.</p></div><div className={`workspace-status ${mode}`}><Sparkles/><b>{mode === 'secure' ? 'Scoped records' : 'Locked'}</b><span>Engine status</span><button className="slot compact" onClick={load}><RefreshCw size={15}/> Refresh</button></div></div>
    <div className="matrix">{packs.map(([title, plan, score]) => <div className="matrix-card glass" key={title}><div className="tag">Role Pack</div><h3>{title}</h3><div className="checkline"><Brain/> {plan}</div><div className="scorebar"><span style={{width:`${score}%`}}/></div><small>Benchmark {score}%</small></div>)}</div>
    <div className="glass card"><h3>Scoped Records</h3>{rows.length ? rows.map(row => <div className="workspace-row" key={row.id}><div><b>Record #{row.id}</b><span>Job #{row.job_id} · {row.status}</span></div><strong>view</strong></div>) : <div className="workspace-empty"><CheckCircle2/><span>No scoped records yet. Create a job from Intake first.</span></div>}</div>
  </section>;
}
