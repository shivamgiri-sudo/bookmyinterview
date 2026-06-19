import React from 'react';
import { Activity, AlertCircle, Bot, CheckCircle2, Clock3, DatabaseZap, ShieldCheck, UserCheck, WalletCards } from 'lucide-react';

const events = [
  { time: '18:42', type: 'MCP Run', title: 'JD Intelligence generated assessment path', actor: 'system', risk: 'low', icon: Bot },
  { time: '18:37', type: 'Review', title: 'Candidate rejection moved to human review', actor: 'platform_admin', risk: 'high', icon: UserCheck },
  { time: '18:29', type: 'Compliance', title: 'EU policy check blocked missing consent', actor: 'compliance_mcp', risk: 'critical', icon: ShieldCheck },
  { time: '18:21', type: 'Cost', title: 'OpenAI provider held for Superadmin approval', actor: 'cost_guard', risk: 'medium', icon: WalletCards },
  { time: '18:06', type: 'Data', title: 'New tenant created in UAE region', actor: 'platform_admin', risk: 'low', icon: DatabaseZap },
];

const health = [
  ['Logged Actions', '99.1%', 'Every sensitive workflow should be traceable'],
  ['Critical Risk', '3', 'Needs founder/compliance review'],
  ['SLA Breach', '0', 'No overdue reviewer queues'],
  ['Provider Holds', '4', 'Paid providers waiting approval'],
];

export default function EventTimeline() {
  return <section className="page ops-page">
    <div className="ops-hero glass event-hero">
      <div>
        <div className="eyebrow"><Activity size={16}/> Audit and platform event stream</div>
        <h1>Know who did what, when, why, and under which policy.</h1>
        <p>Enterprise buyers will ask for transparency. This timeline gives platform teams an operational view across MCP calls, policy decisions, provider holds, reviews, candidate changes, and integration events.</p>
      </div>
      <div className="ops-hero-card"><CheckCircle2/><b>99.1%</b><span>actions logged</span></div>
    </div>

    <div className="ops-kpi-grid">{health.map(([label,value,sub]) => <Kpi key={label} label={label} value={value} sub={sub}/>)}</div>

    <div className="glass card timeline-card">
      <div className="launch-head"><div><h3><Clock3/> Live Timeline</h3><p className="muted">Filter later by tenant, actor, entity, risk, region, and MCP server.</p></div><button className="primary">Export Audit Pack</button></div>
      <div className="timeline-list">{events.map((event, index) => {
        const Icon = event.icon;
        return <div className="timeline-item" key={event.title}>
          <div className="timeline-line"><span>{event.time}</span><i/></div>
          <div className="timeline-icon"><Icon/></div>
          <div className="timeline-body"><b>{event.title}</b><span>{event.type} · actor: {event.actor}</span></div>
          <strong className={`pill ${event.risk}`}>{event.risk}</strong>
        </div>})}</div>
    </div>
  </section>;
}

function Kpi({ label, value, sub }) { return <div className="glass ops-kpi"><AlertCircle/><b>{value}</b><span>{label}</span><small>{sub}</small></div>; }
