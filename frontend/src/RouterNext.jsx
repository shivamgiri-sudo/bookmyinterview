/**
 * RouterNext v3 — Premium enterprise shell
 * Fixed: consistent topbar, organized nav groups, Framer Motion page transitions
 */
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, BarChart3, BriefcaseBusiness, ChevronDown,
  ClipboardList, DollarSign, FileText, Globe2, Home,
  LayoutDashboard, LockKeyhole, LogOut, MonitorDot,
  Settings, ShieldCheck, Sparkles, Users, UserCircle2,
  Zap, Database, Activity
} from 'lucide-react';
import { authClient } from './authClient.js';
import AuthPage from './AuthPage.jsx';
import AccountOps from './AccountOps.jsx';
import OpsMonitor from './OpsMonitor.jsx';
import LandingPage from './LandingPage.jsx';
import WorkspaceSecureSuite from './WorkspaceSecureSuite.jsx';
import SecureWorkspace from './SecureWorkspace.jsx';
import IntakeLive from './IntakeLive.jsx';
import ClientPortalLive from './ClientPortalLive.jsx';
import EnginePage from './EnginePage.jsx';
import TalentPage from './TalentPage.jsx';
import InsightsCenter from './InsightsCenter.jsx';
import TemplateStudio from './TemplateStudio.jsx';
import LiveHub from './LiveHub.jsx';
import VaultOps from './VaultOps.jsx';
import ControlRoom from './ControlRoom.jsx';
import PlansPage from './PlansPage.jsx';
import CostControlCenter from './CostControlCenter.jsx';
import MasterStudio from './MasterStudio.jsx';
import ReportStudio from './ReportStudio.jsx';
import FlowStudio from './FlowStudio.jsx';
import StatusBoard from './StatusBoard.jsx';
import AssessmentPortal from './AssessmentPortal.jsx';
import InterviewScheduler from './InterviewScheduler.jsx';

/* ─── Nav groups ─── */
const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { path: '/', label: 'Home', icon: Home },
      { path: '/client', label: 'Client Portal', icon: LayoutDashboard },
      { path: '/insights', label: 'Insights', icon: BarChart3 },
    ],
  },
  {
    label: 'Hiring',
    items: [
      { path: '/intake', label: 'Intake', icon: ClipboardList },
      { path: '/assess', label: 'Assessment', icon: Activity },
      { path: '/workspace', label: 'Workspace', icon: BriefcaseBusiness },
      { path: '/talent', label: 'Talent', icon: Users },
      { path: '/engine', label: 'Engine', icon: Zap },
      { path: '/flow', label: 'Flow', icon: Activity },
      { path: '/schedule', label: 'Schedule', icon: ClipboardList },
    ],
  },
  {
    label: 'Admin',
    items: [
      { path: '/monitor', label: 'Monitor', icon: MonitorDot },
      { path: '/hub', label: 'Hub', icon: Globe2 },
      { path: '/vault', label: 'Vault', icon: Database },
      { path: '/controls', label: 'Controls', icon: ShieldCheck },
      { path: '/master', label: 'Master', icon: Settings },
    ],
  },
  {
    label: 'Reports',
    items: [
      { path: '/report', label: 'Report', icon: FileText },
      { path: '/templates', label: 'Templates', icon: ClipboardList },
      { path: '/status', label: 'Status', icon: Activity },
      { path: '/plans', label: 'Plans', icon: DollarSign },
      { path: '/cost', label: 'Cost', icon: DollarSign },
    ],
  },
];

/* Flat nav for auth check */
const ALL_PATHS = NAV_GROUPS.flatMap(g => g.items.map(i => i.path));

const PUBLIC  = new Set(['/', '/login', '/account']);
const ACCESS  = {
  superadmin:    ['*'],
  platform_admin:['/monitor','/secure','/workspace','/client','/intake','/engine','/talent','/insights','/templates','/master','/report','/flow','/status','/hub','/vault','/controls','/plans','/cost'],
  client_admin:  ['/secure','/workspace','/client','/intake','/engine','/talent','/insights','/report','/flow','/plans'],
  hiring_manager:['/client','/engine','/talent','/insights','/report','/flow'],
  candidate:     ['/talent','/flow'],
  auditor:       ['/monitor','/insights','/report','/status','/hub','/controls'],
};

const ROLE_STYLE = {
  superadmin:    { bg:'rgba(252,211,77,.15)', color:'#FCD34D', border:'rgba(252,211,77,.3)' },
  platform_admin:{ bg:'rgba(56,189,248,.15)', color:'#38BDF8', border:'rgba(56,189,248,.3)' },
  client_admin:  { bg:'rgba(52,211,153,.15)', color:'#34D399', border:'rgba(52,211,153,.3)' },
  hiring_manager:{ bg:'rgba(167,139,250,.15)',color:'#A78BFA', border:'rgba(167,139,250,.3)' },
  candidate:     { bg:'rgba(244,114,182,.15)',color:'#F472B6', border:'rgba(244,114,182,.3)' },
  auditor:       { bg:'rgba(251,146,60,.15)', color:'#FB923C', border:'rgba(251,146,60,.3)'  },
};

const ROUTES = {
  '/': LandingPage, '/login': AuthPage, '/account': AccountOps,
  '/monitor': OpsMonitor, '/secure': SecureWorkspace, '/workspace': WorkspaceSecureSuite,
  '/client': ClientPortalLive, '/intake': IntakeLive, '/engine': EnginePage,
  '/talent': TalentPage, '/insights': InsightsCenter, '/templates': TemplateStudio,
  '/master': MasterStudio, '/report': ReportStudio, '/flow': FlowStudio,
  '/status': StatusBoard, '/hub': LiveHub, '/vault': VaultOps,
  '/controls': ControlRoom, '/plans': PlansPage, '/cost': CostControlCenter,
  '/assess': AssessmentPortal,
  '/schedule': InterviewScheduler,
};

const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [.22,1,.36,1] } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

/* ─── Dropdown nav item ─── */
function NavGroup({ group, path, go }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isActive = group.items.some(i => i.path === path);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button
        className={`nav-group-btn${isActive ? ' active' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        {group.label}
        <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition:'transform .2s' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="nav-dropdown"
            initial={{ opacity:0, y:-8, scale:.97 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:-8, scale:.97 }}
            transition={{ duration:.18, ease:[.22,1,.36,1] }}
          >
            <div className="nav-dropdown-label">{group.label}</div>
            {group.items.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  className={`nav-dropdown-item${path === item.path ? ' active' : ''}`}
                  onClick={() => { go(item.path); setOpen(false); }}
                >
                  <Icon size={15} />
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RouterNext() {
  const [path, setPath]       = useState(window.location.pathname || '/');
  const [session, setSession] = useState(authClient.load());
  const [scrolled, setScrolled] = useState(false);

  const go = (next) => {
    window.history.pushState({}, '', next);
    setPath(next);
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  useEffect(() => {
    const pop = () => setPath(window.location.pathname || '/');
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn, { passive:true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const Page    = ROUTES[path] || LandingPage;
  const role    = session?.user?.role;
  const allowed = PUBLIC.has(path) || ACCESS[role]?.includes('*') || ACCESS[role]?.includes(path);
  const logout  = async () => {
    try { await authClient.logout(session); } catch {}
    authClient.clear(); setSession(null); go('/login');
  };

  const rs = ROLE_STYLE[role] || {};

  const content = !PUBLIC.has(path) && !session
    ? <AuthPage onSession={setSession} />
    : !allowed
      ? <AccessDenied role={role} go={go} />
      : <Page go={go} onSession={setSession} />;

  return (
    <div className="app">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <div className="ambient ambient-c" />
      <div className="grid-bg" />

      {/* ══ TOPBAR ══ */}
      <header className={`topbar${scrolled ? ' scrolled' : ''}`}>
        {/* Brand */}
        <button className="brand" onClick={() => go('/')} aria-label="Home">
          <img src="/logo.png" alt="Mas" className="brand-logo" />
          <span className="brand-text">
            <b>Book My Interview</b>
            <small>Mas Callnet · AI Hiring OS</small>
          </span>
        </button>

        {/* Grouped dropdown nav */}
        <nav aria-label="Main navigation" className="topbar-nav">
          {/* Direct links */}
          <button
            className={`nav-group-btn${path === '/' ? ' active' : ''}`}
            onClick={() => go('/')}
          >
            Home
          </button>
          <button
            className={`nav-group-btn${path === '/client' ? ' active' : ''}`}
            onClick={() => go('/client')}
          >
            Dashboard
          </button>

          {/* Dropdown groups */}
          {NAV_GROUPS.slice(1).map(g => (
            <NavGroup key={g.label} group={g} path={path} go={go} />
          ))}

          {/* Auth pages */}
          <button
            className={`nav-group-btn${path === '/account' ? ' active' : ''}`}
            onClick={() => go('/account')}
          >
            Account
          </button>
        </nav>

        {/* Auth zone */}
        <div className="topbar-auth">
          {session ? (
            <>
              <span
                className="role-badge"
                style={{ background: rs.bg, color: rs.color, borderColor: rs.border }}
              >
                <UserCircle2 size={12} />
                {role?.replace('_',' ')}
              </span>
              <button
                className="btn-icon"
                onClick={logout}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <button className="btn-ghost sm" onClick={() => go('/login')}>
                Sign in
              </button>
              <button className="btn-primary sm" onClick={() => go('/account')}>
                Register <ArrowRight size={14} />
              </button>
            </>
          )}
        </div>
      </header>

      {/* ══ PAGE CONTENT ══ */}
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={path}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {content}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ─── Access Denied ─── */
function AccessDenied({ role, go }) {
  return (
    <section className="page">
      <motion.div
        initial={{ opacity:0, scale:.96 }}
        animate={{ opacity:1, scale:1 }}
        transition={{ duration:.4, ease:[.22,1,.36,1] }}
        style={{
          maxWidth:520, margin:'100px auto', textAlign:'center',
          padding:'48px 36px', borderRadius:32, position:'relative', overflow:'hidden',
        }}
        className="glass"
      >
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 50% 0%,rgba(251,113,133,.12),transparent 60%)', pointerEvents:'none' }} />
        <LockKeyhole size={44} style={{ color:'var(--danger)', marginBottom:20 }} />
        <h2 style={{ fontFamily:'var(--f-display)', fontSize:28, fontWeight:800, marginBottom:10 }}>
          Access Restricted
        </h2>
        <p style={{ color:'var(--muted)', lineHeight:1.7, marginBottom:28 }}>
          Role <strong style={{ color:'var(--text)' }}>{role || 'guest'}</strong> cannot access this page.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <button className="btn-primary" onClick={() => go('/workspace')}>Workspace</button>
          <button className="btn-ghost"   onClick={() => go('/')}>Home</button>
        </div>
      </motion.div>
    </section>
  );
}
