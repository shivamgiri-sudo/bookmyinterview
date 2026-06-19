/**
 * ComplianceControlRoom — Refactored with Design System Components
 *
 * Improvements:
 * - PageHero
 * - ScoreBar (animated) for policy pass rates
 * - StatusBadge for region status
 * - Badge for control types
 * - Card with glow
 * - KpiCard for summary
 * - Decision cards using Badge + StatusDot
 */

import React from 'react';
import { BadgeCheck, FileCheck2, Globe2, LockKeyhole, Scale, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Badge, Card, KpiCard, PageHero, ScoreBar, SectionHeader, StatusBadge, StatusDot } from './components/index.js';

const policies = [
  { region: 'Global', status: 'Active',  rule: 'Consent + audit + no protected attribute scoring', pass: 97 },
  { region: 'EU',     status: 'Strict',  rule: 'GDPR export/delete + retention controls',          pass: 94 },
  { region: 'US',     status: 'Watch',   rule: 'Adverse action + human review required',           pass: 92 },
  { region: 'India',  status: 'Active',  rule: 'DPDP notice + candidate consent',                  pass: 96 },
  { region: 'UAE',    status: 'Watch',   rule: 'Cross-border data review',                         pass: 91 },
];

const controls = [
  { title: 'Protected Attribute Shield', desc: 'Blocks scoring on age, gender, religion, caste, disability, health, pregnancy, marital status', type: 'critical' },
  { title: 'Consent Gate',               desc: 'Candidate consent required before assessment and enrichment',                                     type: 'required' },
  { title: 'Source Approval',            desc: 'Web/public data requires approved source, run log, and compliance reason',                        type: 'required' },
  { title: 'Human Review',               desc: 'Candidate rejection and senior-role finalization need reviewer sign-off',                         type: 'required' },
  { title: 'Audit Trail',                desc: 'Every AI/MCP/provider action is logged with actor, tenant, and risk level',                      type: 'standard' },
  { title: 'Data Residency',             desc: 'Region selection controls retention and storage requirements',                                    type: 'standard' },
];

const decisions = [
  { label: 'Candidate Consent',         value: 'Granted',               status: 'active'  },
  { label: 'Source Approval',           value: 'Approved internal',     status: 'active'  },
  { label: 'Protected Attribute Risk',  value: 'None detected',         status: 'active'  },
  { label: 'Human Review',             value: 'Required for rejection', status: 'warning' },
  { label: 'Final Decision',           value: 'Allow with audit',       status: 'active'  },
];

const CONTROL_BADGE = { critical: 'danger', required: 'warning', standard: 'info' };

export default function ComplianceControlRoom() {
  const avgPass = Math.round(policies.reduce((s, p) => s + p.pass, 0) / policies.length);

  const sidePanelContent = (
    <div style={{ border: '1px solid rgba(52,211,153,.2)', borderRadius: 20, padding: '18px 20px', background: 'rgba(52,211,153,.06)' }}>
      <ShieldCheck size={24} style={{ color: '#34D399', marginBottom: 10 }} />
      <strong style={{ display: 'block', fontSize: 40, fontWeight: 800, color: '#F8FAFC', letterSpacing: -2 }}>{avgPass}%</strong>
      <span style={{ fontSize: 13, color: '#64748B' }}>avg. policy pass rate</span>
      <div style={{ marginTop: 12 }}>
        <ScoreBar value={avgPass} showValue={false} height={6} color="green" />
      </div>
    </div>
  );

  return (
    <section className="page ops-page">
      <PageHero
        eyebrow="Global compliance command"
        eyebrowIcon={<Scale size={14} />}
        title="Make trust visible before enterprise buyers ask for it."
        subtitle="Every market has different risk. This control room makes consent, source approval, human review, retention, and protected-attribute safeguards visible to operations and enterprise clients."
        sidePanel={sidePanelContent}
        gradient="cyan-gold"
      />

      {/* KPI summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <KpiCard label="Policy Pass Rate"     value="97.2%" sub="global average"    variant="green"   trend={1.4}  />
        <KpiCard label="Consent Coverage"     value="100%"  sub="all candidates"    variant="cyan"                />
        <KpiCard label="Active Regions"       value="5"     sub="compliant zones"   variant="default"            />
        <KpiCard label="Review SLA Met"       value="98.3%" sub="last 30 days"      variant="gold"    trend={2.1} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, marginBottom: 22 }}>
        {/* Regional policy map */}
        <Card variant="glass" glow="cyan" header={<SectionHeader icon={<Globe2 />} title="Regional Policy Map" size="sm" />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {policies.map((policy) => (
              <div key={policy.region}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <strong style={{ fontSize: 14, color: '#F8FAFC', marginRight: 8 }}>{policy.region}</strong>
                    <StatusBadge status={policy.status} size="sm" />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#67E8F9', fontVariantNumeric: 'tabular-nums' }}>{policy.pass}%</span>
                </div>
                <ScoreBar value={policy.pass} showValue={false} height={5} />
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#475569' }}>{policy.rule}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Live risk controls */}
        <Card variant="glass" glow="violet" header={<SectionHeader icon={<ShieldAlert />} title="Live Risk Controls" size="sm" />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {controls.map(({ title, desc, type }) => (
              <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <BadgeCheck size={18} style={{ color: '#34D399', flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <strong style={{ fontSize: 13, color: '#F8FAFC' }}>{title}</strong>
                    <Badge variant={CONTROL_BADGE[type]} size="sm">{type}</Badge>
                  </div>
                  <span style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Policy decision preview */}
      <Card variant="glass" glow="gold" header={<SectionHeader icon={<FileCheck2 />} title="Policy Decision Preview" subtitle="Live evaluation result for the most recent compliance check." size="sm" />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
          {decisions.map(({ label, value, status }) => (
            <div
              key={label}
              style={{
                border: `1px solid ${status === 'active' ? 'rgba(52,211,153,.2)' : 'rgba(246,196,83,.2)'}`,
                background: status === 'active' ? 'rgba(52,211,153,.05)' : 'rgba(246,196,83,.05)',
                borderRadius: 16,
                padding: '16px 14px',
                textAlign: 'center',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                <StatusDot status={status === 'active' ? 'active' : 'warning'} size="lg" />
              </div>
              <LockKeyhole size={18} style={{ color: status === 'active' ? '#34D399' : '#F6C453', marginBottom: 8 }} />
              <span style={{ display: 'block', fontSize: 11, color: '#64748B', marginBottom: 4 }}>{label}</span>
              <strong style={{ display: 'block', fontSize: 13, color: '#F8FAFC' }}>{value}</strong>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
