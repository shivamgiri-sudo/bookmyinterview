/**
 * LiveWorkspace — Refactored with Design System Components
 *
 * Key improvements:
 * - Uses KpiCard with loading skeletons
 * - Alert banner for backend status (not bare text)
 * - useToast for create success/error feedback
 * - Tabs for jobs / talent toggle
 * - DataTable with EmptyState
 * - StatusBadge on rows
 * - Field components with validation
 * - PageHero for the banner
 * - All forms now have loading state
 */

import React, { useEffect, useMemo, useState } from 'react';
import { api } from './api.js';
import { BriefcaseBusiness, DatabaseZap, RefreshCw, UserRoundCheck, UsersRound, WandSparkles } from 'lucide-react';
import {
  Alert, Button, Card, DataTable, EmptyState, Field,
  KpiCard, PageHero, StatusBadge, Tabs, useToast,
} from './components/index.js';

const FALLBACK_OV  = { tenants: 0, jobs: 0, candidates: 0, assessments: 0 };
const FALLBACK_JBS = [{ id: 'demo-1', designation: 'Sales Manager', industry: 'BPO', location: 'Dubai', seniority: 'Manager', status: 'demo' }];
const FALLBACK_TLT = [{ id: 'demo-t1', full_name: 'Demo Talent', location: 'Remote', consent_status: 'granted' }];

const JOB_COLS = [
  { key: 'designation', label: 'Role', sortable: true },
  { key: 'industry',    label: 'Industry', sortable: true },
  { key: 'location',    label: 'Location' },
  { key: 'seniority',   label: 'Level' },
  { key: 'status',      label: 'Status', render: (v) => <StatusBadge status={v || 'active'} /> },
];

const TALENT_COLS = [
  { key: 'full_name',       label: 'Name', sortable: true },
  { key: 'location',        label: 'Location' },
  { key: 'consent_status',  label: 'Consent', render: (v) => <StatusBadge status={v || 'unknown'} /> },
];

export default function LiveWorkspace() {
  const { toast, ToastContainer } = useToast();
  const [overview,    setOverview]    = useState(FALLBACK_OV);
  const [jobs,        setJobs]        = useState(FALLBACK_JBS);
  const [talent,      setTalent]      = useState(FALLBACK_TLT);
  const [mode,        setMode]        = useState('demo');
  const [message,     setMessage]     = useState('Demo fallback active until backend is running.');
  const [kpiLoading,  setKpiLoading]  = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState({ tenant: false, job: false, talent: false });
  const [activeTab,   setActiveTab]   = useState('jobs');

  const [tenant,     setTenant]     = useState({ name: 'Acme Global Hiring', region: 'global', plan: 'starter' });
  const [job,        setJob]        = useState({ tenant_id: 1, designation: 'Sales Manager', industry: 'BPO', location: 'Dubai', seniority: 'Manager', budget: 'USD 2500/month' });
  const [talentForm, setTalentForm] = useState({ tenant_id: 1, full_name: 'New Talent', contact: '', location: 'Remote', consent_status: 'granted' });

  async function load() {
    setKpiLoading(true);
    setDataLoading(true);
    try {
      const [ov, js, tl] = await Promise.all([api.overview(), api.jobs(), api.talent()]);
      setOverview(ov); setJobs(js); setTalent(tl);
      setMode('live'); setMessage('Connected to live backend data.');
    } catch {
      setOverview(FALLBACK_OV); setJobs(FALLBACK_JBS); setTalent(FALLBACK_TLT);
      setMode('demo'); setMessage('Backend not reachable. Start FastAPI on port 8000 for live data.');
    } finally {
      setKpiLoading(false);
      setDataLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function submitTenant(e) {
    e.preventDefault();
    setSubmitLoading((s) => ({ ...s, tenant: true }));
    try {
      const created = await api.createTenant(tenant);
      setJob((c) => ({ ...c, tenant_id: created.id }));
      setTalentForm((c) => ({ ...c, tenant_id: created.id }));
      toast(`Tenant "${created.name}" created — ID ${created.id} selected.`, { type: 'success' });
      await load();
    } catch (err) {
      toast(`Tenant creation failed: ${err.message}`, { type: 'error' });
    } finally {
      setSubmitLoading((s) => ({ ...s, tenant: false }));
    }
  }

  async function submitJob(e) {
    e.preventDefault();
    setSubmitLoading((s) => ({ ...s, job: true }));
    try {
      const created = await api.createJob({ ...job, tenant_id: Number(job.tenant_id), requirement: { communication: 'high', client_facing: true, assessment: 'auto' } });
      toast(`Job created — Assessment ID ${created.assessment_id}.`, { type: 'success' });
      await load();
    } catch (err) {
      toast(`Job creation failed: ${err.message}`, { type: 'error' });
    } finally {
      setSubmitLoading((s) => ({ ...s, job: false }));
    }
  }

  async function submitTalent(e) {
    e.preventDefault();
    setSubmitLoading((s) => ({ ...s, talent: true }));
    try {
      const created = await api.createCandidate({ tenant_id: Number(talentForm.tenant_id), full_name: talentForm.full_name, email: talentForm.contact, location: talentForm.location, consent_status: talentForm.consent_status, profile: { skills: ['communication'], experience_years: 3 } });
      toast(`Talent "${created.full_name}" created.`, { type: 'success' });
      await load();
    } catch (err) {
      toast(`Talent creation failed: ${err.message}`, { type: 'error' });
    } finally {
      setSubmitLoading((s) => ({ ...s, talent: false }));
    }
  }

  const kpis = useMemo(() => [
    { icon: <UsersRound />,     label: 'Tenants',     value: overview.tenants    ?? 0, variant: 'default' },
    { icon: <BriefcaseBusiness />, label: 'Jobs',     value: overview.jobs       ?? 0, variant: 'cyan'    },
    { icon: <UserRoundCheck />, label: 'Talent',       value: overview.candidates ?? 0, variant: 'gold'    },
    { icon: <WandSparkles />,   label: 'Assessments', value: overview.assessments ?? 0, variant: 'violet'  },
  ], [overview]);

  const sidePanelContent = (
    <div style={{ border: '1px solid rgba(255,255,255,.12)', borderRadius: 18, padding: '18px 20px', background: 'rgba(255,255,255,.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: mode === 'live' ? '#34D399' : '#F6C453', display: 'inline-block' }} />
        <strong style={{ fontSize: 14, color: '#F8FAFC' }}>{mode === 'live' ? 'Live backend' : 'Demo fallback'}</strong>
      </div>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>{message}</p>
      <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />} onClick={load}>
        Refresh
      </Button>
    </div>
  );

  return (
    <section className="page workspace-page">
      <ToastContainer />

      <PageHero
        eyebrow="Live SaaS workspace"
        eyebrowIcon={<DatabaseZap size={14} />}
        title="Create tenants, jobs, talent, and assessment paths from the UI."
        subtitle="This page connects the premium frontend to the FastAPI data layer. Works in demo mode when the backend is offline and switches to live mode when available."
        sidePanel={sidePanelContent}
        gradient="violet-cyan"
      />

      {mode === 'demo' && (
        <Alert type="warning" title="Demo mode active" dismissible style={{ marginBottom: 20 }}>
          {message}
        </Alert>
      )}

      {/* KPI cards */}
      <div className="workspace-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} loading={kpiLoading} {...kpi} />
        ))}
      </div>

      {/* Create forms */}
      <div className="panel-grid three" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 28 }}>
        <Card variant="glass" header={<h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Create Tenant</h3>}>
          <form onSubmit={submitTenant} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Company name" value={tenant.name} onChange={(v) => setTenant({ ...tenant, name: v })} required />
            <Field label="Region" value={tenant.region} onChange={(v) => setTenant({ ...tenant, region: v })} />
            <Field label="Plan" value={tenant.plan} onChange={(v) => setTenant({ ...tenant, plan: v })} />
            <Button type="submit" variant="primary" full loading={submitLoading.tenant} style={{ marginTop: 4 }}>
              Create tenant
            </Button>
          </form>
        </Card>

        <Card variant="glass" header={<h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Create Job + Assessment</h3>}>
          <form onSubmit={submitJob} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Tenant ID" value={job.tenant_id} onChange={(v) => setJob({ ...job, tenant_id: v })} required />
            <Field label="Designation" value={job.designation} onChange={(v) => setJob({ ...job, designation: v })} required />
            <Field label="Location" value={job.location} onChange={(v) => setJob({ ...job, location: v })} />
            <Button type="submit" variant="primary" full loading={submitLoading.job} style={{ marginTop: 4 }}>
              Create job
            </Button>
          </form>
        </Card>

        <Card variant="glass" header={<h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Create Talent</h3>}>
          <form onSubmit={submitTalent} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Tenant ID" value={talentForm.tenant_id} onChange={(v) => setTalentForm({ ...talentForm, tenant_id: v })} required />
            <Field label="Full name" value={talentForm.full_name} onChange={(v) => setTalentForm({ ...talentForm, full_name: v })} required />
            <Field label="Contact / Email" value={talentForm.contact} onChange={(v) => setTalentForm({ ...talentForm, contact: v })} type="email" />
            <Button type="submit" variant="primary" full loading={submitLoading.talent} style={{ marginTop: 4 }}>
              Create talent
            </Button>
          </form>
        </Card>
      </div>

      {/* Data tables with tabs */}
      <Card variant="glass">
        <Tabs
          variant="underline"
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: 'jobs',   label: 'Live Jobs',   icon: <BriefcaseBusiness size={15} />, badge: jobs.length },
            { id: 'talent', label: 'Live Talent', icon: <UserRoundCheck size={15} />,    badge: talent.length },
          ]}
        />
        {activeTab === 'jobs' && (
          <DataTable
            columns={JOB_COLS}
            rows={jobs}
            loading={dataLoading}
            caption="Live job openings"
            empty={
              <EmptyState
                icon={<BriefcaseBusiness />}
                title="No jobs yet"
                description="Create your first job opening above to see it here."
                size="md"
              />
            }
          />
        )}
        {activeTab === 'talent' && (
          <DataTable
            columns={TALENT_COLS}
            rows={talent}
            rowKey="id"
            loading={dataLoading}
            caption="Live talent records"
            empty={
              <EmptyState
                icon={<UserRoundCheck />}
                title="No talent records yet"
                description="Add talent using the form above."
                size="md"
              />
            }
          />
        )}
      </Card>
    </section>
  );
}
