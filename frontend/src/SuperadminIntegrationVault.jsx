/**
 * SuperadminIntegrationVault — Refactored with Design System Components
 *
 * Improvements:
 * - Modal for credential configuration (instead of inline expand)
 * - StatusBadge for provider status
 * - useToast for test/save feedback
 * - SecretField from design system
 * - Alert for security warning
 * - Card with glow for groups
 * - PageHero
 * - KpiCard for summary metrics
 */

import React, { useState } from 'react';
import {
  CalendarCheck, CheckCircle2, DatabaseZap, Github,
  KeyRound, Mail, MonitorPlay, PlugZap, ShieldCheck,
  Sparkles, UploadCloud, WandSparkles,
} from 'lucide-react';
import {
  Alert, Badge, Button, Card, KpiCard, Modal,
  PageHero, ScoreBar, SecretField, SectionHeader, StatusBadge, useToast,
} from './components/index.js';

const integrationGroups = [
  {
    group: 'AI & Intelligence', icon: Sparkles,
    providers: [
      { name: 'OpenAI',  type: 'LLM + Realtime Voice',     status: 'Connected',      fields: ['API Key','Model','Organization ID'] },
      { name: 'Claude',  type: 'Reasoning / Evaluation',   status: 'Not configured', fields: ['API Key','Default Model'] },
      { name: 'Gemini',  type: 'Backup LLM',               status: 'Not configured', fields: ['API Key','Project ID'] },
    ],
  },
  {
    group: 'Resume, Candidate Data & Web Data', icon: UploadCloud,
    providers: [
      { name: 'Affinda / RChilli',  type: 'Resume Parser',            status: 'Not configured', fields: ['Client ID','Client Secret','Region'] },
      { name: 'Apify',              type: 'Compliant web-data Actors', status: 'Planned',        fields: ['API Token','Actor ID','Dataset ID','Webhook Secret','Proxy Group'] },
      { name: 'Vector Database',    type: 'Candidate Matching',        status: 'Connected',      fields: ['Endpoint','API Key','Index Name'] },
      { name: 'Object Storage',     type: 'Resume, Audio, Video',      status: 'Needs review',   fields: ['Access Key','Secret Key','Bucket','Region'] },
    ],
  },
  {
    group: 'Audio, Video & Interview', icon: MonitorPlay,
    providers: [
      { name: 'Deepgram / Whisper',          type: 'Speech to Text',         status: 'Not configured', fields: ['API Key','Language Model'] },
      { name: 'Video Storage',               type: 'Candidate Video',         status: 'Needs review',   fields: ['Storage Provider','Bucket','Signed URL Secret'] },
      { name: 'Zoom / Google Meet / Teams',  type: 'Meeting Links',           status: 'Not configured', fields: ['Client ID','Client Secret','Redirect URL'] },
    ],
  },
  {
    group: 'Communication & Billing', icon: Mail,
    providers: [
      { name: 'SendGrid / SES',       type: 'Email',                 status: 'Connected',      fields: ['API Key','Sender Email','Webhook Secret'] },
      { name: 'WhatsApp Business',    type: 'Candidate Reminders',   status: 'Not configured', fields: ['Access Token','Phone Number ID','Template Namespace'] },
      { name: 'Razorpay / Stripe',    type: 'Payments',              status: 'Not configured', fields: ['Key ID','Secret','Webhook Secret'] },
    ],
  },
  {
    group: 'Enterprise Product MCPs', icon: Sparkles,
    providers: [
      { name: 'JD Intelligence MCP',        type: 'JD generation and gap detection',       status: 'Connected', fields: ['Endpoint','Tenant Policy','Approval Rule'] },
      { name: 'Assessment Intelligence MCP', type: 'Audio/video/skill path orchestration', status: 'Connected', fields: ['Endpoint','Human Review Threshold','Scoring Version'] },
      { name: 'Candidate Matching MCP',      type: 'Candidate-job fit, rank, explanation', status: 'Connected', fields: ['Endpoint','Vector Index','Decision Policy'] },
      { name: 'Trait Question MCP',          type: 'Auto-generate and approve questions',  status: 'Connected', fields: ['Endpoint','Question Version','Approval Workflow'] },
      { name: 'Compliance MCP',              type: 'Consent, audit, source policy',        status: 'Connected', fields: ['Endpoint','Policy Version','Audit Sink'] },
    ],
  },
  {
    group: 'MCP & Developer Workflow', icon: PlugZap,
    providers: [
      { name: 'Figma MCP',   type: 'Design Tokens + Components',  status: 'Planned',    fields: ['Figma Token','Team ID','File ID'] },
      { name: 'Cursor MCP',  type: 'Developer Context',           status: 'Planned',    fields: ['Workspace ID','Context Path'] },
      { name: 'Apify MCP',   type: 'Actors available to AI',      status: 'Planned',    fields: ['Apify Token','Allowed Actors','Dataset Access Policy'] },
      { name: 'GitHub MCP',  type: 'Repo + PR Automation',        status: 'Connected',  fields: ['Installation ID','Repository','Branch'] },
    ],
  },
  {
    group: 'ATS & HR Systems', icon: DatabaseZap,
    providers: [
      { name: 'LinkedIn / Naukri',        type: 'Official job-board connectors', status: 'Partner required', fields: ['API Key','Employer ID','Posting Account'] },
      { name: 'Greenhouse / Lever',       type: 'ATS Sync',                      status: 'Not configured',   fields: ['API Key','Webhook Secret'] },
      { name: 'Zoho / Darwinbox / Keka',  type: 'HRMS Sync',                     status: 'Not configured',   fields: ['Base URL','Client ID','Client Secret'] },
    ],
  },
];

const auditRows = [
  ['Today 18:53',     'Enterprise MCPs', 'JD, Assessment, Matching, Trait, Compliance MCPs registered', 'System',        'Success'],
  ['Today 18:42',     'OpenAI',          'Credential rotated',                                          'Superadmin',    'Success'],
  ['Today 18:21',     'Apify',           'Connector added for controlled web data',                     'Superadmin',    'Planned'],
  ['Today 17:58',     'SendGrid',        'Connection tested',                                           'Superadmin',    'Success'],
  ['Yesterday 21:12', 'Object Storage',  'Policy review required',                                      'Security System','Needs review'],
  ['Yesterday 16:40', 'Figma MCP',       'Draft connector created',                                     'Product Admin', 'Planned'],
];

const securityRules = [
  'Only Superadmin can create or rotate global provider credentials.',
  'Client-level override credentials should be allowed only where contract requires it.',
  'Saved credentials must be encrypted and displayed only as masked values.',
  'Every save, delete, rotate, and test action must create an audit log.',
  'Production and sandbox keys must be separated by environment.',
  'Apify jobs must be approved, logged, rate-limited, and compliant with source terms.',
  'Enterprise MCPs must be deny-by-default and controlled by Compliance MCP.',
];

function ProviderCard({ provider, onConfigure }) {
  return (
    <div style={{
      border: '1px solid rgba(255,255,255,.08)',
      borderRadius: 16,
      padding: '14px 16px',
      background: 'rgba(255,255,255,.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div>
          <strong style={{ display: 'block', fontSize: 14, color: '#F8FAFC', fontWeight: 700 }}>{provider.name}</strong>
          <span style={{ fontSize: 12, color: '#64748B' }}>{provider.type}</span>
        </div>
        <StatusBadge status={provider.status} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button
          variant="ghost"
          size="sm"
          icon={<KeyRound size={14} />}
          onClick={() => onConfigure(provider)}
        >
          Configure
        </Button>
        <Button variant="neutral" size="sm" icon={<CheckCircle2 size={14} />}>
          Test
        </Button>
      </div>
    </div>
  );
}

export default function SuperadminIntegrationVault() {
  const { toast, ToastContainer } = useToast();
  const [configModal, setConfigModal] = useState(null); // provider object or null

  const connected   = integrationGroups.flatMap(g => g.providers).filter(p => p.status === 'Connected').length;
  const needsAction = integrationGroups.flatMap(g => g.providers).filter(p => p.status === 'Needs review').length;
  const total       = integrationGroups.flatMap(g => g.providers).length;

  const readinessPct = Math.round((connected / total) * 100);

  function handleSave(e) {
    e.preventDefault();
    toast(`Credentials saved for ${configModal?.name} — encrypted at rest.`, { type: 'success' });
    setConfigModal(null);
  }

  function handleTest() {
    toast(`Testing connection to ${configModal?.name}…`, { type: 'info' });
    setTimeout(() => toast(`${configModal?.name} connection test passed.`, { type: 'success' }), 1800);
  }

  return (
    <section className="page">
      <ToastContainer />

      <PageHero
        eyebrow="Superadmin-only secure area"
        eyebrowIcon={<ShieldCheck size={14} />}
        title="Integration Vault"
        subtitle="Configure and monitor every external facility used by BOOK MY INTERVIEW: AI, enterprise MCPs, resume parsing, web data, audio/video, calendar, communication, payments, ATS, and storage."
        gradient="violet-cyan"
        sidePanel={
          <div style={{ border: '1px solid rgba(255,255,255,.12)', borderRadius: 20, padding: '18px 20px', background: 'rgba(255,255,255,.05)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ScoreBar label="Vault readiness" value={readinessPct} height={8} color="cyan" />
            <div style={{ display: 'flex', gap: 16 }}>
              <div><strong style={{ display: 'block', fontSize: 22, color: '#F8FAFC' }}>{total}</strong><span style={{ fontSize: 12, color: '#64748B' }}>Facilities</span></div>
              <div><strong style={{ display: 'block', fontSize: 22, color: '#34D399' }}>{connected}</strong><span style={{ fontSize: 12, color: '#64748B' }}>Connected</span></div>
              <div><strong style={{ display: 'block', fontSize: 22, color: '#F6C453' }}>{needsAction}</strong><span style={{ fontSize: 12, color: '#64748B' }}>Needs action</span></div>
            </div>
          </div>
        }
      />

      {/* Security strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { icon: <ShieldCheck />,   label: 'Secret masking',   sub: 'Never reveal saved keys' },
          { icon: <KeyRound />,      label: 'KMS/Vault ready',  sub: 'Encrypt before DB save' },
          { icon: <CalendarCheck />, label: 'Test connection',  sub: 'Validate before activation' },
          { icon: <Github />,        label: 'Audit trail',      sub: 'Every change logged' },
        ].map(({ icon, label, sub }) => (
          <KpiCard key={label} icon={icon} label={sub} value={label} variant="violet" />
        ))}
      </div>

      {/* Integration groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 28 }}>
        {integrationGroups.map((group) => {
          const Icon = group.icon;
          return (
            <Card key={group.group} variant="glass" header={
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 0 4px' }}>
                <span style={{ color: '#67E8F9' }}><Icon size={20} /></span>
                <div>
                  <strong style={{ display: 'block', fontSize: 16, fontWeight: 800, color: '#F8FAFC' }}>{group.group}</strong>
                  <span style={{ fontSize: 12, color: '#64748B' }}>Provider credentials, status, and connection checks</span>
                </div>
              </div>
            }>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {group.providers.map((provider) => (
                  <ProviderCard
                    key={provider.name}
                    provider={provider}
                    onConfigure={setConfigModal}
                  />
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
        {/* Security rules */}
        <Card variant="glass" glow="violet" header={<SectionHeader icon={<ShieldCheck />} title="Security Rules" size="sm" />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {securityRules.map((rule) => (
              <div key={rule} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: '#94A3B8', lineHeight: 1.5 }}>
                <CheckCircle2 size={16} style={{ color: '#34D399', flexShrink: 0, marginTop: 2 }} />
                {rule}
              </div>
            ))}
          </div>
        </Card>

        {/* Audit log */}
        <Card variant="glass" glow="gold" header={<SectionHeader icon={<WandSparkles />} title="Integration Audit" size="sm" />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {auditRows.map((row) => (
              <div key={row.join('-')} style={{ display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: 10, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                <span style={{ fontSize: 11, color: '#475569' }}>{row[0]}</span>
                <div>
                  <strong style={{ display: 'block', fontSize: 13, color: '#F8FAFC' }}>{row[1]}</strong>
                  <span style={{ fontSize: 12, color: '#64748B' }}>{row[2]}</span>
                </div>
                <StatusBadge status={row[4]} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Credential modal */}
      <Modal
        open={!!configModal}
        onClose={() => setConfigModal(null)}
        title={`Configure: ${configModal?.name}`}
        description={configModal?.type}
        size="md"
        footer={
          <div style={{ display: 'flex', gap: 10, width: '100%', flexWrap: 'wrap' }}>
            <Button variant="ghost" size="sm" onClick={handleTest}>Test connection</Button>
            <Button variant="primary" size="sm" onClick={handleSave} full>Save encrypted credential</Button>
          </div>
        }
      >
        {configModal && (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Alert type="warning" title="Security reminder">
              Production credentials must be encrypted using KMS/Vault and never exposed after save.
              {configModal.name.includes('Apify') && ' Use only approved Actors and consented data sources.'}
            </Alert>
            {configModal.fields.map((field) => (
              <SecretField key={field} label={field} />
            ))}
          </form>
        )}
      </Modal>
    </section>
  );
}
