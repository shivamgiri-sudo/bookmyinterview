import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import LandingPage from './LandingPage.jsx';
import LiveWorkspace from './LiveWorkspace.jsx';
import IntakeLive from './IntakeLive.jsx';
import ClientPortalLive from './ClientPortalLive.jsx';
import InsightsCenter from './InsightsCenter.jsx';
import TemplateStudio from './TemplateStudio.jsx';
import SuperadminIntegrationVault from './SuperadminIntegrationVault.jsx';
import GlobalCommandCenter from './GlobalCommandCenter.jsx';
import CostControlCenter from './CostControlCenter.jsx';
import HumanReviewQueue from './HumanReviewQueue.jsx';
import ComplianceControlRoom from './ComplianceControlRoom.jsx';
import EventTimeline from './EventTimeline.jsx';
import BillingSubscription from './BillingSubscription.jsx';

const navItems = [['/', 'Home'], ['/workspace', 'Workspace'], ['/client', 'Client'], ['/intake', 'Intake'], ['/insights', 'Insights'], ['/templates', 'Templates'], ['/global', 'Global'], ['/cost', 'Cost'], ['/review', 'Review'], ['/compliance-room', 'Compliance'], ['/events', 'Events'], ['/billing', 'Billing'], ['/superadmin', 'Superadmin']];

export default function RouterShell() {
  const [path, setPath] = useState(window.location.pathname || '/');
  const go = (next) => { window.history.pushState({}, '', next); setPath(next); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  window.onpopstate = () => setPath(window.location.pathname || '/');
  const Page = {
    '/': LandingPage,
    '/workspace': LiveWorkspace,
    '/client': ClientPortalLive,
    '/intake': IntakeLive,
    '/insights': InsightsCenter,
    '/templates': TemplateStudio,
    '/global': GlobalCommandCenter,
    '/cost': CostControlCenter,
    '/review': HumanReviewQueue,
    '/compliance-room': ComplianceControlRoom,
    '/events': EventTimeline,
    '/billing': BillingSubscription,
    '/superadmin': SuperadminIntegrationVault,
  }[path] || LandingPage;
  return <div className="app"><div className="ambient ambient-a"/><div className="ambient ambient-b"/><div className="grid-bg"/><header className="topbar"><button className="brand" onClick={() => go('/')}><span className="brand-mark"><Sparkles size={18}/></span><span><b>BOOK MY INTERVIEW</b><small>AI Hiring OS</small></span></button><nav>{navItems.map(([href,label]) => <button key={href} onClick={() => go(href)} className={path===href?'active':''}>{label}</button>)}</nav><button className="primary small" onClick={() => go('/workspace')}>Workspace <ArrowRight size={15}/></button></header><main><Page go={go}/></main></div>;
}
