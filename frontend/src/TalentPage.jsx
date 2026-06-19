import React, { useState } from 'react';
import { secureApi } from './secureApi.js';
import { ArrowRight, CheckCircle2, ShieldCheck, UserRoundCheck } from 'lucide-react';

export default function TalentPage() {
  const [form, setForm] = useState({ tenant_id: 1, full_name: 'New Talent', contact: '', location: 'Remote', consent_status: 'granted' });
  const [status, setStatus] = useState('Ready.');
  async function submit(event) {
    event.preventDefault();
    try {
      const created = await secureApi.createTalent({ tenant_id: Number(form.tenant_id), full_name: form.full_name, contact: form.contact, location: form.location, consent_status: form.consent_status, profile: { source: 'secure_talent_page' } });
      setStatus(`Secure record ${created.candidate_id}.`);
    } catch { setStatus('Secure mode unavailable. Check login/session or backend.'); }
  }
  return <section className="page"><div className="workspace-hero glass"><div><div className="eyebrow"><UserRoundCheck size={16}/> Secure talent complete</div><h1>Create tenant-scoped talent records with consent-first workflow.</h1><p>This page now uses protected workspace APIs for profile creation and consent status.</p></div><div className="workspace-status"><ShieldCheck/><b>Status</b><span>{status}</span></div></div><div className="panel-grid two"><form className="glass card workspace-form" onSubmit={submit}><h3>Talent Profile</h3><Field label="Tenant ID" value={form.tenant_id} onChange={(v)=>setForm({...form, tenant_id:v})}/><Field label="Full name" value={form.full_name} onChange={(v)=>setForm({...form, full_name:v})}/><Field label="Contact ID" value={form.contact} onChange={(v)=>setForm({...form, contact:v})}/><Field label="Location" value={form.location} onChange={(v)=>setForm({...form, location:v})}/><Field label="Consent" value={form.consent_status} onChange={(v)=>setForm({...form, consent_status:v})}/><button className="primary full">Create Secure Talent <ArrowRight size={16}/></button></form><div className="glass card"><h3>Journey</h3>{['Consent', 'Profile', 'Invite', 'Scorecard', 'Booking'].map(item => <div className="insight-rule" key={item}><CheckCircle2/><div><b>{item}</b><span>Workflow checkpoint</span></div></div>)}</div></div></section>;
}
function Field({ label, value, onChange }) { return <><label>{label}</label><input value={value} onChange={(event)=>onChange(event.target.value)}/></>; }
