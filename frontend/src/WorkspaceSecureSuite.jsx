import React, { useEffect, useState } from 'react';
import { secureApi } from './secureApi.js';
import { ArrowRight, BriefcaseBusiness, RefreshCw, ShieldCheck, UserRoundCheck } from 'lucide-react';

export default function WorkspaceSecureSuite() {
  const [overview, setOverview] = useState({ jobs: 0, candidates: 0, assessments: 0, role: 'guest' });
  const [jobs, setJobs] = useState([]);
  const [talent, setTalent] = useState([]);
  const [job, setJob] = useState({ tenant_id: 1, designation: 'Sales Manager', industry: 'BPO', location: 'Dubai', seniority: 'Manager' });
  const [person, setPerson] = useState({ tenant_id: 1, full_name: 'New Talent', contact: '', location: 'Remote', consent_status: 'granted' });
  const [mode, setMode] = useState('locked');
  const [message, setMessage] = useState('Secure session required.');

  async function load() {
    try {
      const [ov, js, tl] = await Promise.all([secureApi.overview(), secureApi.jobs(), secureApi.talent()]);
      setOverview(ov); setJobs(js); setTalent(tl); setMode('secure'); setMessage('Secure workspace connected.');
    } catch { setMode('locked'); setMessage('Login/session required or backend unavailable.'); }
  }
  useEffect(() => { load(); }, []);
  async function submitJob(event) { event.preventDefault(); try { const created = await secureApi.createJob({ ...job, tenant_id: Number(job.tenant_id), requirement: { source: 'workspace_secure' } }); setMessage(`Secure job ${created.job_id} created.`); await load(); } catch { setMessage('Secure job creation failed.'); } }
  async function submitTalent(event) { event.preventDefault(); try { const created = await secureApi.createTalent({ ...person, tenant_id: Number(person.tenant_id), profile: { source: 'workspace_secure' } }); setMessage(`Secure talent ${created.candidate_id} created.`); await load(); } catch { setMessage('Secure talent creation failed.'); } }

  return <section className="page"><div className="workspace-hero glass"><div><div className="eyebrow"><ShieldCheck size={16}/> Secure workspace migration complete</div><h1>Create and read tenant-scoped records from protected APIs.</h1><p>Workspace now uses session-token secure APIs for job, talent, and assessment visibility.</p></div><div className={`workspace-status ${mode}`}><ShieldCheck/><b>{mode}</b><span>{message}</span><button className="slot compact" onClick={load}><RefreshCw size={15}/> Refresh</button></div></div><div className="workspace-kpis"><Kpi label="Jobs" value={overview.jobs}/><Kpi label="Talent" value={overview.candidates}/><Kpi label="Assessments" value={overview.assessments}/><Kpi label="Role" value={overview.role}/></div><div className="panel-grid two"><form className="glass card workspace-form" onSubmit={submitJob}><h3>Create Secure Job</h3><Field label="Tenant ID" value={job.tenant_id} onChange={(v)=>setJob({...job, tenant_id:v})}/><Field label="Designation" value={job.designation} onChange={(v)=>setJob({...job, designation:v})}/><Field label="Location" value={job.location} onChange={(v)=>setJob({...job, location:v})}/><button className="primary full">Create Job <ArrowRight size={16}/></button></form><form className="glass card workspace-form" onSubmit={submitTalent}><h3>Create Secure Talent</h3><Field label="Tenant ID" value={person.tenant_id} onChange={(v)=>setPerson({...person, tenant_id:v})}/><Field label="Full name" value={person.full_name} onChange={(v)=>setPerson({...person, full_name:v})}/><Field label="Contact" value={person.contact} onChange={(v)=>setPerson({...person, contact:v})}/><button className="primary full">Create Talent <ArrowRight size={16}/></button></form></div><div className="panel-grid two"><List title="Scoped Jobs" rows={jobs} field="designation"/><List title="Scoped Talent" rows={talent} field="full_name"/></div></section>;
}
function Field({ label, value, onChange }) { return <><label>{label}</label><input value={value} onChange={(event)=>onChange(event.target.value)}/></>; }
function Kpi({ label, value }) { return <div className="glass workspace-kpi"><BriefcaseBusiness/><b>{value || 0}</b><span>{label}</span></div>; }
function List({ title, rows, field }) { return <div className="glass card"><h3>{title}</h3>{rows.length ? rows.map(row => <div className="workspace-row" key={row.id}><div><b>{row[field]}</b><span>Tenant {row.tenant_id}</span></div><strong>scoped</strong></div>) : <div className="workspace-empty"><UserRoundCheck/><span>No scoped records yet.</span></div>}</div>; }
