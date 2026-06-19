import React, { useEffect, useState } from 'react';
import { secureApi } from './secureApi.js';
import { LockKeyhole, RefreshCw, ShieldCheck, UserRoundCheck } from 'lucide-react';

export default function SecureWorkspace() {
  const [overview, setOverview] = useState({ jobs: 0, candidates: 0, assessments: 0, role: 'unknown' });
  const [jobs, setJobs] = useState([]);
  const [mode, setMode] = useState('locked');

  async function load() {
    try {
      const [ov, js] = await Promise.all([secureApi.overview(), secureApi.jobs()]);
      setOverview(ov);
      setJobs(js);
      setMode('secure');
    } catch {
      setOverview({ jobs: 0, candidates: 0, assessments: 0, role: 'no session' });
      setJobs([]);
      setMode('locked');
    }
  }
  useEffect(() => { load(); }, []);

  return <section className="page">
    <div className="workspace-hero glass"><div><div className="eyebrow"><LockKeyhole size={16}/> Secure workspace complete</div><h1>Tenant-scoped workspace is now permission checked.</h1><p>This page reads from protected APIs using the active session token and role capability.</p></div><div className={`workspace-status ${mode}`}><ShieldCheck/><b>{mode}</b><span>Role: {overview.role}</span><button className="slot compact" onClick={load}><RefreshCw size={15}/> Refresh</button></div></div>
    <div className="workspace-kpis"><Kpi label="Jobs" value={overview.jobs}/><Kpi label="Talent" value={overview.candidates}/><Kpi label="Assessments" value={overview.assessments}/></div>
    <div className="glass card"><h3>Scoped Jobs</h3>{jobs.length ? jobs.map(row => <div className="workspace-row" key={row.id}><div><b>{row.designation}</b><span>Tenant {row.tenant_id} · {row.status}</span></div><strong>scoped</strong></div>) : <div className="workspace-empty"><span>No scoped jobs visible.</span></div>}</div>
  </section>;
}
function Kpi({ label, value }) { return <div className="glass workspace-kpi"><UserRoundCheck/><b>{value || 0}</b><span>{label}</span></div>; }
