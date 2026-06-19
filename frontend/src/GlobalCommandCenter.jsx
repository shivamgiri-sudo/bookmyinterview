/**
 * GlobalCommandCenter — Refactored with Design System Components
 *
 * Improvements:
 * - SectionHeader replaces bare section-title
 * - KpiCard with variant colors and trend indicators
 * - ScoreBar (animated) for region readiness
 * - StatusBadge for risk level
 * - Card with glow effects
 * - PageHero for the banner
 */

import React from 'react';
import {
  BarChart3, CheckCircle2, Globe2, Landmark, Layers3,
  LockKeyhole, Radar, ShieldCheck, Sparkles, TrendingUp, UsersRound, Zap,
} from 'lucide-react';
import { Card, KpiCard, PageHero, ScoreBar, SectionHeader, StatusBadge } from './components/index.js';

const regions = [
  { name: 'India',          code: 'IN', readiness: 86, policy: 'DPDP Ready',           revenue: '$18K MRR', risk: 'Low' },
  { name: 'UAE',            code: 'AE', readiness: 78, policy: 'Cross-border review',   revenue: '$9K MRR',  risk: 'Medium' },
  { name: 'United Kingdom', code: 'UK', readiness: 74, policy: 'UK GDPR',               revenue: '$12K MRR', risk: 'Medium' },
  { name: 'United States',  code: 'US', readiness: 71, policy: 'Adverse action review', revenue: '$21K MRR', risk: 'Watch' },
  { name: 'European Union', code: 'EU', readiness: 67, policy: 'GDPR strict',           revenue: '$8K MRR',  risk: 'High control' },
];

const enterpriseSignals = [
  ['Pipeline health',         '1,248 assessed candidates',      88],
  ['Compliance confidence',   '97.2% actions passed policy',    97],
  ['Human review SLA',        '4h 12m median resolution',       82],
  ['Interview conversion',    '31% qualified-to-interview',     76],
];

const launchGates = [
  ['Regional policy engine',   'Live for global, EU, US, India, UAE'],
  ['Audit visibility',         'Event stream and risk summary available'],
  ['Consent workflow',         'Candidate consent update + policy check'],
  ['Billing foundation',       'Starter, Growth, Enterprise plan logic'],
  ['MCP intelligence layer',   'JD, Assessment, Matching, Trait, Compliance MCPs'],
  ['Human review queue',       'Review API ready for mount and dashboard'],
];

export default function GlobalCommandCenter() {
  const sidePanelContent = (
    <div style={{ border: '1px solid rgba(255,255,255,.12)', borderRadius: 20, padding: '20px 22px', background: 'rgba(255,255,255,.05)' }}>
      <span style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 4 }}>Global Readiness</span>
      <strong style={{ display: 'block', fontSize: 52, fontWeight: 800, letterSpacing: -3, color: '#F8FAFC', lineHeight: 1 }}>82%</strong>
      <div style={{ marginTop: 10, marginBottom: 8 }}>
        <ScoreBar value={82} showValue={false} height={6} color="cyan" />
      </div>
      <small style={{ color: '#475569', fontSize: 12 }}>Next unlock: enterprise SSO + production KMS</small>
    </div>
  );

  return (
    <section className="page global-page">
      <PageHero
        eyebrow="Global enterprise command center"
        eyebrowIcon={<Globe2 size={14} />}
        title="Operate hiring intelligence across countries, compliance zones, and enterprise clients."
        subtitle="BOOK MY INTERVIEW is being built as a global hiring intelligence layer: regional compliance, explainable AI, human review, premium experience, and enterprise-grade integrations from day one."
        sidePanel={sidePanelContent}
        gradient="cyan-gold"
      />

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <KpiCard icon={<UsersRound />}  label="Active Tenants"    value="42"    sub="5 regions"     variant="default" trend={8.2}  />
        <KpiCard icon={<Radar />}       label="AI MCP Runs"       value="18.4K" sub="99.1% logged"  variant="cyan"    trend={22.1} />
        <KpiCard icon={<ShieldCheck />} label="Policy Pass Rate"  value="97.2%" sub="2.8% review"   variant="green"   trend={1.4}  />
        <KpiCard icon={<TrendingUp />}  label="Projected ARR"     value="$816K" sub="pilot model"   variant="gold"    trend={34.6} />
      </div>

      <div className="panel-grid two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, marginBottom: 22 }}>
        {/* Regional readiness */}
        <Card variant="glass" glow="cyan" header={
          <SectionHeader icon={<Globe2 />} title="Regional Launch Readiness" size="sm" />
        }>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {regions.map((region) => (
              <div key={region.code} style={{ display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, rgba(103,232,249,.22), rgba(246,196,83,.15))', display: 'grid', placeItems: 'center', fontWeight: 900, color: '#E0F2FE', fontSize: 12 }}>
                  {region.code}
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: 14, color: '#F8FAFC' }}>{region.name}</strong>
                  <span style={{ fontSize: 12, color: '#64748B' }}>{region.policy} · {region.revenue}</span>
                  <div style={{ marginTop: 8 }}>
                    <ScoreBar value={region.readiness} showValue={false} height={5} />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <StatusBadge status={region.risk} />
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{region.readiness}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Enterprise signals */}
        <Card variant="glass" glow="gold" header={
          <SectionHeader icon={<BarChart3 />} title="Enterprise Operating Signals" size="sm" />
        }>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {enterpriseSignals.map(([label, sub, value]) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: 14, color: '#F8FAFC' }}>{label}</strong>
                    <span style={{ fontSize: 12, color: '#64748B' }}>{sub}</span>
                  </div>
                  <strong style={{ fontSize: 20, color: '#F6C453', fontVariantNumeric: 'tabular-nums' }}>{value}%</strong>
                </div>
                <ScoreBar value={value} showValue={false} height={6} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Launch gates */}
      <Card variant="glass" style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap' }}>
          <div>
            <SectionHeader icon={<Landmark />} title="Global Launch Gates" subtitle="Every gate must be green before moving from MVP to paid enterprise pilots." size="sm" />
          </div>
          <button className="primary" style={{ flexShrink: 0 }}>Open Founder Review <Sparkles size={17} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {launchGates.map(([title, desc]) => (
            <div key={title} style={{ border: '1px solid rgba(52,211,153,.18)', background: 'rgba(52,211,153,.05)', borderRadius: 18, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <CheckCircle2 size={20} style={{ color: '#34D399' }} />
              <strong style={{ display: 'block', fontSize: 14, color: '#F8FAFC' }}>{title}</strong>
              <span style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>{desc}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Moat / Trust / Scale */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
        {[
          { icon: <Layers3 />,    title: 'Moat',  text: 'The proprietary hiring intelligence graph: roles, traits, outcomes, interviews, client preferences, and compliance decisions.' },
          { icon: <LockKeyhole />,title: 'Trust', text: 'No black-box rejection. Every sensitive action needs auditability, source clarity, and human review controls.' },
          { icon: <Zap />,        title: 'Scale', text: 'MCP gateway, integration vault, vector matching, and regional policy engine prepare the product for global enterprise scale.' },
        ].map(({ icon, title, text }) => (
          <Card key={title} variant="glass" glow="violet">
            <div style={{ color: '#67E8F9', marginBottom: 14 }}>{icon}</div>
            <h3 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 800 }}>{title}</h3>
            <p style={{ margin: 0, color: '#64748B', lineHeight: 1.7, fontSize: 14 }}>{text}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
