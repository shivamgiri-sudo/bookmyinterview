/**
 * InsightsCenter — Refactored with Design System Components
 *
 * Improvements:
 * - PageHero for banner
 * - Card with glow per score range
 * - ScoreBar animated
 * - Badge for assessment checks
 * - SectionHeader
 * - Tabs for role categories
 * - EmptyState (if no cards match filter)
 */

import React, { useState } from 'react';
import { BadgeCheck, Brain, CheckCircle2, FileSearch, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge, Card, EmptyState, PageHero, ScoreBar, SectionHeader, Tabs } from './components/index.js';

const ALL_CARDS = [
  { title: 'Voice Roles',       score: 78, focus: 'Clarity, listening, pace, empathy',                          checks: ['Audio L5', 'Call simulation', 'Grammar'],    category: 'voice'    },
  { title: 'Sales Roles',       score: 82, focus: 'Pitch, objection handling, pipeline ownership',             checks: ['Sales case', 'Pitch video', 'Negotiation'],  category: 'sales'    },
  { title: 'HR Roles',          score: 76, focus: 'Judgment, confidentiality, employee sensitivity',           checks: ['HR case', 'Trait check', 'Scenario'],        category: 'hr'       },
  { title: 'Operations Roles',  score: 80, focus: 'SLA, RCA, governance, ownership',                          checks: ['SLA case', 'RCA simulation', 'Video'],        category: 'ops'      },
  { title: 'Technical Roles',   score: 74, focus: 'Correctness, debugging, explanation, maintainability',      checks: ['Coding', 'Debugging', 'Code review'],        category: 'tech'     },
  { title: 'Leadership Roles',  score: 84, focus: 'Strategy, scale, governance, crisis decisions',             checks: ['Executive case', 'Panel review', 'Video'],   category: 'leadership'},
];

const TABS = [
  { id: 'all',        label: 'All Roles' },
  { id: 'voice',      label: 'Voice' },
  { id: 'sales',      label: 'Sales' },
  { id: 'hr',         label: 'HR' },
  { id: 'ops',        label: 'Operations' },
  { id: 'tech',       label: 'Technical' },
  { id: 'leadership', label: 'Leadership' },
];

const INSIGHT_RULES = [
  { icon: <BadgeCheck />,   label: 'Role lens',       desc: 'Each role family is evaluated through a unique intelligence lens.' },
  { icon: <BadgeCheck />,   label: 'Evidence quality', desc: 'Only validated, bias-checked evidence is used in scorecards.' },
  { icon: <BadgeCheck />,   label: 'Review control',   desc: 'Human review threshold is configurable per role and client.' },
  { icon: <BadgeCheck />,   label: 'Client summary',   desc: 'Configured for enterprise-grade reporting and explainability.' },
];

const DECISION_CONTROLS = [
  { icon: <CheckCircle2 />, label: 'Role-fit summary',         desc: 'Included in platform workflow.' },
  { icon: <CheckCircle2 />, label: 'Evidence trail',            desc: 'Included in platform workflow.' },
  { icon: <CheckCircle2 />, label: 'Reviewer notes',            desc: 'Included in platform workflow.' },
  { icon: <CheckCircle2 />, label: 'Client interview focus',    desc: 'Included in platform workflow.' },
  { icon: <CheckCircle2 />, label: 'Override reason',           desc: 'Included in platform workflow.' },
];

function scoreGlow(score) {
  if (score >= 82) return 'green';
  if (score >= 77) return 'gold';
  return 'none';
}

export default function InsightsCenter() {
  const [activeTab, setActiveTab] = useState('all');

  const filtered = activeTab === 'all'
    ? ALL_CARDS
    : ALL_CARDS.filter((c) => c.category === activeTab);

  const sidePanelContent = (
    <div style={{ border: '1px solid rgba(167,139,250,.18)', borderRadius: 20, padding: '18px 20px', background: 'rgba(167,139,250,.06)' }}>
      <Sparkles size={24} style={{ color: '#A78BFA', marginBottom: 10 }} />
      <strong style={{ display: 'block', fontSize: 32, fontWeight: 800, color: '#F8FAFC', letterSpacing: -1 }}>7</strong>
      <span style={{ fontSize: 13, color: '#64748B' }}>intelligence packs live</span>
    </div>
  );

  return (
    <section className="page insight-page">
      <PageHero
        eyebrow="Critical intelligence"
        eyebrowIcon={<Brain size={14} />}
        title="Turn assessment data into role-specific business insight."
        subtitle="Every role family needs a different evaluation lens, report summary, and review focus. This command center makes those insights visible."
        sidePanel={sidePanelContent}
        gradient="gold-violet"
      />

      <Tabs
        variant="pills"
        tabs={TABS.map((t) => ({ ...t, badge: t.id === 'all' ? ALL_CARDS.length : ALL_CARDS.filter(c => c.category === t.id).length }))}
        activeTab={activeTab}
        onChange={setActiveTab}
        style={{ marginBottom: 24 }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Brain />}
          title="No role insights for this category"
          description="Select a different role category to see insights."
          size="lg"
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 28 }}>
          {filtered.map((card) => (
            <Card key={card.title} variant="glass" glow={scoreGlow(card.score)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <strong style={{ fontSize: 16, color: '#F8FAFC', fontWeight: 800 }}>{card.title}</strong>
                <span style={{ fontSize: 24, fontWeight: 800, color: '#67E8F9', letterSpacing: -1, fontVariantNumeric: 'tabular-nums' }}>{card.score}%</span>
              </div>
              <ScoreBar value={card.score} showValue={false} height={6} style={{ marginBottom: 12 }} />
              <p style={{ margin: '12px 0 14px', fontSize: 13, color: '#94A3B8', lineHeight: 1.55 }}>{card.focus}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {card.checks.map((a) => (
                  <Badge key={a} variant="info" size="sm">{a}</Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
        <Card variant="glass" glow="cyan" header={<SectionHeader icon={<FileSearch />} title="Insight Rules" size="sm" />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {INSIGHT_RULES.map((item) => (
              <div key={item.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ color: '#67E8F9', marginTop: 2, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <strong style={{ display: 'block', fontSize: 14, color: '#F8FAFC' }}>{item.label}</strong>
                  <span style={{ fontSize: 13, color: '#64748B' }}>{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="glass" glow="violet" header={<SectionHeader icon={<ShieldCheck />} title="Decision Controls" size="sm" />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {DECISION_CONTROLS.map((item) => (
              <div key={item.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ color: '#34D399', marginTop: 2, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <strong style={{ display: 'block', fontSize: 14, color: '#F8FAFC' }}>{item.label}</strong>
                  <span style={{ fontSize: 13, color: '#64748B' }}>{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
