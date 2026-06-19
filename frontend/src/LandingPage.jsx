/**
 * LandingPage v2 — Elite UI
 * Architect: scroll reveal hooks, 3D card interactions, orbit animation
 * Engineer: full implementation
 * Optimizer: CSS custom property mouse-tracking, hardware acceleration
 */
import React, { useEffect, useRef } from 'react';
import {
  ArrowRight, AudioLines, BadgeCheck, Brain, BriefcaseBusiness,
  CheckCircle2, ClipboardCheck, Code2, DatabaseZap, Globe2,
  LockKeyhole, MessageSquareText, PlayCircle, ShieldCheck,
  Sparkles, UserRoundCheck, WandSparkles, Zap,
} from 'lucide-react';
import './landing.css';

/* ─── Data ─── */
const categories = [
  'BPO / Voice','Sales','HR','Operations',
  'Finance','IT','Leadership','Customer Success','Training','Data / MIS',
];

const features = [
  {
    icon: <MessageSquareText />, label: 'Smart Intake',
    sub: 'Turn client requirements into complete hiring intelligence',
    bullets: ['Role-specific follow-up questions','Missing requirement detection','JD + scorecard generation','Client override with audit trail'],
    color: 'cyan',
  },
  {
    icon: <ClipboardCheck />, label: 'Assessments',
    sub: 'Auto-select the right test path for every role',
    bullets: ['Resume, skill, scenario, trait, audio and video','Level 3 / Level 5 voice assessment','Role-wise passing benchmarks','Human review for sensitive decisions'],
    color: 'violet',
  },
  {
    icon: <UserRoundCheck />, label: 'Interview-Ready',
    sub: 'Send only qualified candidates to clients',
    bullets: ['Explainable candidate scorecards','Salary, notice and location fit','Interview slot booking','Client-ready reports'],
    color: 'gold',
  },
  {
    icon: <ShieldCheck />, label: 'Trust & Compliance',
    sub: 'Enterprise controls built into every workflow',
    bullets: ['Consent and audit logs','Protected-attribute safeguards','Web-data source approval','Cost guard and provider controls'],
    color: 'green',
  },
];

const skills = ['Communication','Excel','Sales Pitch','HR Judgment','SLA Handling','Finance Accuracy','Python','Customer Empathy','Leadership','Compliance'];

const useCases = [
  ['Voice Hiring',      'Audio Level 5, listening, fluency, grammar and confidence checks'],
  ['Manager Hiring',   'Scenario, video, leadership maturity and decision quality'],
  ['Bulk Hiring',      'Resume screening, auto-scorecards and interview slot automation'],
  ['Executive Hiring', 'Strategic simulation, video and mandatory human review'],
  ['Internal Mobility','Upskill, benchmark and identify ready-now talent'],
  ['Staffing Platforms','White-label assessment and client-ready reports'],
];

const metrics = [
  { value: '500+', label: 'Role types supported' },
  { value: 'Dynamic', label: 'Assessment paths' },
  { value: '5', label: 'MCP intelligence engines' },
  { value: '100%', label: 'Audit-ready decisions' },
];

/* ─── Hooks ─── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useMagneticButton() {
  useEffect(() => {
    const handler = (e) => {
      const btn = e.target.closest('.btn-primary,.btn-ghost');
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      btn.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    document.addEventListener('mousemove', handler);
    return () => document.removeEventListener('mousemove', handler);
  }, []);
}

function useScrolledTopbar() {
  useEffect(() => {
    const bar = document.querySelector('.topbar');
    const fn = () => bar?.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
}

/* ─── Sub-components ─── */
function FeatureCard({ feature, delay }) {
  const iconColors = { cyan: 'var(--cyan)', violet: 'var(--violet)', gold: 'var(--gold)', green: 'var(--green)' };
  const borderColors = { cyan: 'rgba(56,189,248,.22)', violet: 'rgba(167,139,250,.22)', gold: 'rgba(252,211,77,.22)', green: 'rgba(52,211,153,.22)' };

  return (
    <div
      className={`glass lp-feature shimmer reveal d${delay}`}
      style={{ '--icon-color': iconColors[feature.color], '--border-glow': borderColors[feature.color] }}
    >
      <div className="feature-icon" style={{ background: `${iconColors[feature.color]}18`, borderColor: borderColors[feature.color], color: iconColors[feature.color] }}>
        {feature.icon}
      </div>
      <h3>{feature.label}</h3>
      <p>{feature.sub}</p>
      {feature.bullets.map((b) => (
        <div className="feature-bullet" key={b}>
          <CheckCircle2 size={15} />
          {b}
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ─── */
export default function LandingPage({ go }) {
  useScrollReveal();
  useMagneticButton();
  useScrolledTopbar();

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="lp-hero">
        <div className="lp-eyebrow">
          <Sparkles size={15} />
          AI hiring operating system for global employers
        </div>

        <h1>Screen, assess, and book<br />interview-ready talent.</h1>

        <p>
          BOOK MY INTERVIEW converts client hiring needs into JD intelligence, dynamic assessments,
          explainable scorecards, audio/video evaluation, compliance controls, and interview booking —
          all in one premium platform.
        </p>

        <div className="lp-actions">
          <button className="btn-primary" onClick={() => go('/intake')}>
            Start smart intake <ArrowRight size={18} />
          </button>
          <button className="btn-ghost" onClick={() => go('/insights')}>
            See intelligence <PlayCircle size={18} />
          </button>
        </div>

        <div className="lp-category-cloud">
          {categories.map((c) => <span key={c}>{c}</span>)}
        </div>

        {/* 3D Product Stage */}
        <div className="lp-product-stage glass">
          {/* Left: assessment path */}
          <div className="mini-window float" style={{ animationDelay: '0s' }}>
            <div className="window-top"><i /><i /><i /></div>
            <h3>Assessment Path Generated</h3>
            {['Resume Screening','Role Skill Test','Scenario Judgment','Audio Level 3','Video Interview','Human Review'].map((item, i) => (
              <div className="stage-row" key={item}>
                <b>{i + 1}</b>
                <span>{item}</span>
                <CheckCircle2 size={15} />
              </div>
            ))}
          </div>

          {/* Center: orbit */}
          <div className="candidate-orbit">
            <div className="orbit-core">
              <Brain />
              <b>86%</b>
              <span>Strong Match</span>
            </div>
            {['JD','Trait','Audio','Video','Fit'].map((x, i) => (
              <em className={`o${i}`} key={x}>{x}</em>
            ))}
          </div>

          {/* Right: scorecard */}
          <div className="report-card float" style={{ animationDelay: '.8s' }}>
            <h3>Client Scorecard</h3>
            {[['Skill', '82'], ['Communication', '91'], ['Trait Fit', '88'], ['Compliance', '✓ Pass']].map(([label, val]) => (
              <div className="metric-line" key={label}>
                <span>{label}</span>
                <b>{val}</b>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 14, background: 'rgba(52,211,153,.1)', border: '1px solid rgba(52,211,153,.2)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--green)', fontWeight: 700 }}>
              <BadgeCheck size={16} /> Interview ready
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRUST STRIP ═══ */}
      <section className="lp-trust reveal">
        <span>Built for staffing firms, BPOs, enterprise HR teams, and global hiring marketplaces</span>
        <div className="trust-grid">
          {metrics.map((m) => (
            <div className="trust-card shimmer" key={m.label}>
              <b>{m.value}</b>
              <span>{m.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="lp-section">
        <div className="lp-section-head reveal">
          <h2>One platform for the full hiring evaluation journey.</h2>
          <p>From intake to interview booking — assessment quality, compliance, and explainability built in from day one.</p>
        </div>
        <div className="lp-feature-grid">
          {features.map((f, i) => <FeatureCard key={f.label} feature={f} delay={i + 1} />)}
        </div>
      </section>

      <div className="glow-line" />

      {/* ═══ SKILL SHOWCASE ═══ */}
      <section className="split-showcase">
        <div>
          <div className="lp-section-head compact reveal">
            <h2>Evaluate technical, communication, operational, and leadership skills.</h2>
            <p>Our product expands assessment-quality to BPO, HR, sales, operations, finance, IT, and leadership hiring — with role-specific lenses, explainable decisions, and compliance controls.</p>
          </div>
          <div className="skill-cloud reveal d2">
            {skills.map((s) => <span key={s}>{s}</span>)}
          </div>
        </div>
        <div className="glass challenge-preview reveal d3">
          <h3 style={{ margin: '0 0 18px', fontFamily: 'var(--f-display)', fontSize: 16, fontWeight: 800, color: 'var(--text2)' }}>Role Library Preview</h3>
          {useCases.map(([title, text]) => (
            <div className="challenge-row" key={title}>
              <Code2 size={18} style={{ color: 'var(--cyan)' }} />
              <div>
                <b>{title}</b>
                <span>{text}</span>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--muted2)' }} />
            </div>
          ))}
        </div>
      </section>

      {/* ═══ PROOF CARDS ═══ */}
      <section className="lp-section">
        <div className="proof-section">
          {[
            { icon: <ShieldCheck />, title: 'Compliance-first by design', body: 'Consent, regional policy, protected-attribute controls, source approval, human review and audit logs are built into the platform foundation.' },
            { icon: <DatabaseZap />, title: 'Integrates with your stack', body: 'ATS, calendar, email, WhatsApp, payment, Apify, Figma, GitHub, vector database and enterprise MCPs controlled from Superadmin Vault.' },
            { icon: <WandSparkles />, title: 'AI with cost guardrails', body: 'Free/local defaults first. Paid providers remain disabled until Superadmin approves budgets, caps, provider and fallback.' },
          ].map((p, i) => (
            <div key={p.title} className={`glass proof-card shimmer reveal d${i + 1}`}>
              {p.icon}
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="lp-final-cta glass reveal">
        <div>
          <h2>Ready to turn hiring requests into qualified interviews?</h2>
          <p>Launch a smart intake, generate the assessment path, score candidates, and book interviews with audit-ready confidence.</p>
        </div>
        <div className="lp-actions">
          <button className="btn-primary" onClick={() => go('/intake')}>
            Create hiring request <ArrowRight size={18} />
          </button>
          <button className="btn-ghost" onClick={() => go('/vault')}>
            Open Integration Vault <LockKeyhole size={18} />
          </button>
        </div>
      </section>
    </>
  );
}
