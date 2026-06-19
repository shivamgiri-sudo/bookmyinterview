import React from 'react';
import { BadgeCheck, CheckCircle2, LayoutTemplate, MailCheck, Sparkles } from 'lucide-react';

const templates = [
  { name: 'Assessment Invite', audience: 'Talent', layout: 'Branded card with CTA', tone: 'Clear and reassuring' },
  { name: 'Shortlist Report', audience: 'Client', layout: 'Executive summary with table', tone: 'Evidence-led' },
  { name: 'Review Required', audience: 'Internal', layout: 'Priority alert card', tone: 'Precise and action-focused' },
  { name: 'Slot Confirmation', audience: 'Talent / Client', layout: 'Calendar card', tone: 'Calm and professional' },
  { name: 'Provider Approval', audience: 'Superadmin', layout: 'Cost guard card', tone: 'Controlled and financial' },
];

const qualityChecks = ['Strong subject', 'Preview text', 'Single CTA', 'Professional tone', 'Audit context', 'Mobile-friendly layout'];

export default function TemplateStudio() {
  return <section className="page template-page">
    <div className="template-hero glass">
      <div><div className="eyebrow"><MailCheck size={16}/> Premium template studio</div><h1>Every communication should look enterprise-grade.</h1><p>Manage branded templates for assessments, shortlists, review alerts, slot confirmations, and provider approvals with clear layout standards.</p></div>
      <div className="template-hero-card"><Sparkles/><b>5</b><span>template families ready</span></div>
    </div>
    <div className="template-grid">{templates.map(t => <div className="glass card template-card" key={t.name}><LayoutTemplate/><h3>{t.name}</h3><p>{t.audience}</p><span>{t.layout}</span><em>{t.tone}</em><button className="slot compact">Preview</button></div>)}</div>
    <div className="glass card"><h3><BadgeCheck/> Quality Standard</h3><div className="quality-grid">{qualityChecks.map(item => <div key={item}><CheckCircle2/>{item}</div>)}</div></div>
  </section>;
}
