import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight, AudioLines, Bot, Brain, BriefcaseBusiness, CalendarCheck, CheckCircle2,
  ChevronRight, ClipboardCheck, DatabaseZap, Gauge, LayoutDashboard,
  LockKeyhole, MessageSquareText, MonitorPlay, PlayCircle, ShieldCheck, Sparkles,
  UserRoundCheck, Video, WandSparkles, Workflow, Globe2, WalletCards
} from 'lucide-react';
import LandingPage from './LandingPage.jsx';
import LiveWorkspace from './LiveWorkspace.jsx';
import InsightsCenter from './InsightsCenter.jsx';
import TemplateStudio from './TemplateStudio.jsx';
import SuperadminIntegrationVault from './SuperadminIntegrationVault.jsx';
import GlobalCommandCenter from './GlobalCommandCenter.jsx';
import CostControlCenter from './CostControlCenter.jsx';
import HumanReviewQueue from './HumanReviewQueue.jsx';
import ComplianceControlRoom from './ComplianceControlRoom.jsx';
import EventTimeline from './EventTimeline.jsx';
import BillingSubscription from './BillingSubscription.jsx';
import './style.css';
import './landing.css';
import './workspace.css';
import './insights.css';
import './integration.css';
import './global.css';
import './cost.css';
import './ops.css';

const navItems = [
  ['/', 'Home'], ['/workspace', 'Live Workspace'], ['/insights', 'Insights'], ['/templates', 'Templates'], ['/global', 'Global HQ'], ['/cost', 'Cost Control'], ['/review', 'Review Queue'],
  ['/compliance-room', 'Compliance'], ['/events', 'Events'], ['/billing', 'Billing'], ['/client', 'Client Portal'],
  ['/intake', 'Smart Intake'], ['/assessment', 'Assessment Engine'], ['/candidate', 'Candidate'], ['/admin', 'Admin'],
  ['/superadmin', 'Superadmin']
];

const roleMatrix = [
  { role: 'International Voice Process', profile: 'High Voice', resume: true, skill: 'English + Listening', scenario: true, audio: 'Level 5', video: 'No', pass: 78 },
  { role: 'HR Manager', profile: 'Managerial', resume: true, skill: 'HR Case', scenario: true, audio: 'Level 3', video: 'Optional', pass: 75 },
  { role: 'Sales Manager', profile: 'Client Facing', resume: true, skill: 'Sales Case', scenario: true, audio: 'Pitch', video: 'Yes', pass: 78 },
  { role: 'Operations Manager', profile: 'Leadership', resume: true, skill: 'SLA Case', scenario: true, audio: 'Level 3', video: 'Yes', pass: 76 },
  { role: 'Software Developer', profile: 'Technical', resume: true, skill: 'Coding', scenario: false, audio: 'No', video: 'Optional', pass: 72 },
  { role: 'VP / CXO', profile: 'Executive', resume: true, skill: 'Strategy Case', scenario: true, audio: 'Executive', video: 'Yes', pass: 82 },
];

const candidates = [
  { name: 'Ananya Rao', role: 'HR Manager', score: 86, stage: 'Interview Ready', audio: 81, video: 84, trait: 88, risk: 'Low' },
  { name: 'Rahul Mehta', role: 'Sales Manager', score: 82, stage: 'Slot Booked', audio: 89, video: 78, trait: 80, risk: 'Low' },
  { name: 'Farhan Ali', role: 'Voice Support', score: 79, stage: 'Audio Passed', audio: 91, video: null, trait: 76, risk: 'Medium' },
  { name: 'Meera Shah', role: 'Operations Manager', score: 74, stage: 'Human Review', audio: 72, video: 75, trait: 71, risk: 'Watch' },
];

const intakeQuestions = [
  'What exact business outcome should this role deliver in the first 90 days?',
  'Which skills are must-have versus trainable?',
  'What communication level is required: internal, client-facing, voice-heavy, or leadership?',
  'Should this role require audio, video, both, or resume + skill only?',
  'What are the deal breakers: salary, notice period, industry, shift, location, tools?',
  'Who will interview, which slots are available, and should candidates book digital or physical slots?'
];

function useRoute() {
  const [path, setPath] = useState(window.location.pathname || '/');
  const go = (next) => { window.history.pushState({}, '', next); setPath(next); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  window.onpopstate = () => setPath(window.location.pathname || '/');
  return [path, go];
}

function App() {
  const [path, go] = useRoute();
  const Page = {
    '/': LandingPage,
    '/workspace': LiveWorkspace,
    '/insights': InsightsCenter,
    '/templates': TemplateStudio,
    '/global': GlobalCommandCenter,
    '/cost': CostControlCenter,
    '/review': HumanReviewQueue,
    '/compliance-room': ComplianceControlRoom,
    '/events': EventTimeline,
    '/billing': BillingSubscription,
    '/client': ClientPortal,
    '/intake': SmartIntake,
    '/assessment': AssessmentEngine,
    '/candidate': CandidatePortal,
    '/admin': AdminConsole,
    '/superadmin': SuperadminIntegrationVault,
  }[path] || LandingPage;
  return <div className="app"><Shell go={go} path={path}><Page go={go}/></Shell></div>;
}

function Shell({ children, go, path }) {
  return <>
    <div className="ambient ambient-a"/><div className="ambient ambient-b"/><div className="grid-bg"/>
    <header className="topbar">
      <button className="brand" onClick={() => go('/')}>
        <span className="brand-mark"><Sparkles size={18}/></span>
        <span><b>BOOK MY INTERVIEW</b><small>AI Hiring OS</small></span>
      </button>
      <nav>{navItems.map(([href,label]) => <button key={href} onClick={() => go(href)} className={path===href?'active':''}>{label}</button>)}</nav>
      <button className="primary small" onClick={() => go('/workspace')}>Open Workspace <ArrowRight size={15}/></button>
    </header>
    <main>{children}</main>
  </>;
}

function Overview({ go }) {
  return <>
    <section className="hero">
      <div className="eyebrow"><WandSparkles size={16}/> Premium AI recruitment intelligence platform</div>
      <h1>Convert every hiring need into an assessed, interview-ready candidate pipeline.</h1>
      <p className="hero-sub">BOOK MY INTERVIEW is not another HR website. It is a full hiring operating system that captures client intent, creates intelligent JDs, decides the right assessment path, evaluates resumes, traits, audio, video, and books interviews only for qualified candidates.</p>
      <div className="actions"><button className="primary" onClick={() => go('/intake')}>Launch Smart Intake <ArrowRight size={18}/></button><button className="ghost" onClick={() => go('/global')}>Open Global HQ <Globe2 size={18}/></button><button className="ghost" onClick={() => go('/cost')}>Control Cost <WalletCards size={18}/></button><button className="ghost" onClick={() => go('/assessment')}>View Assessment Engine <PlayCircle size={18}/></button></div>
      <div className="hero-panel glass">
        <Metric label="Candidate Fit Accuracy" value="92%"/><Metric label="Time to Shortlist" value="-68%"/><Metric label="Assessment Paths" value="Dynamic"/><Metric label="Explainable Score" value="100%"/>
      </div>
    </section>
    <section className="section">
      <SectionTitle icon={<Workflow/>} title="End-to-end operating flow" subtitle="From company intake to interview slot booking."/>
      <div className="flow-row">{['Client Intake','JD Intelligence','Assessment Path','Candidate Match','Audio / Video','Interview Slot','Client Report'].map((x,i)=><FlowStep key={x} n={i+1} title={x}/>)}</div>
    </section>
    <section className="section split">
      <div><SectionTitle icon={<Brain/>} title="The real moat: assessment orchestration" subtitle="The profile decides whether resume-only, audio, video, both, or technical/case-study assessment is required."/><p className="muted big">Each role is classified by communication dependency, leadership dependency, technical dependency, client-facing intensity, risk/compliance requirement, and seniority. The client can accept or override the recommended path.</p></div>
      <AssessmentCard role="Sales Manager" comm={91} lead={72} tech={35}/>
    </section>
  </>;
}

function ClientPortal() {
  return <section className="page"><SectionTitle icon={<LayoutDashboard/>} title="Client Hiring Command Center" subtitle="Every JD, candidate, score, interview, and decision visible in one premium dashboard."/>
    <DashboardGrid />
    <div className="panel-grid two"><Pipeline /><CandidateTable /></div>
  </section>;
}

function SmartIntake() {
  const [role, setRole] = useState('HR Manager');
  const questions = useMemo(() => intakeQuestions.map((q,i)=> i===3 ? `For ${role}, should the assessment include audio, video, both, or skill-only?` : q), [role]);
  return <section className="page"><SectionTitle icon={<MessageSquareText/>} title="Smart Intake & JD Intelligence" subtitle="Dynamic role-specific questionnaire that finds missing client requirements before sourcing starts."/>
    <div className="panel-grid two"><div className="glass card"><h3>Client Request</h3><label>Designation</label><select value={role} onChange={e=>setRole(e.target.value)}><option>HR Manager</option><option>Sales Manager</option><option>Operations Manager</option><option>International Voice Process</option><option>Software Developer</option><option>VP Operations</option></select><label>Company requirement</label><textarea defaultValue={`We need a ${role} for Noida. Budget 8-12 LPA. Need strong communication and quick joining.`}/><button className="primary full">Generate JD + Assessment Path <Sparkles size={17}/></button></div><div className="glass card"><h3>AI Follow-up Questions</h3>{questions.map((q,i)=><div className="question" key={q}><span>{String(i+1).padStart(2,'0')}</span>{q}</div>)}</div></div>
    <div className="glass card"><h3>Generated Output Preview</h3><div className="output-grid"><MiniBlock title="JD Sections" items={['Role summary','KPIs','Must-have skills','Trait matrix','Interview process']}/><MiniBlock title="Missing Gaps" items={['Reporting manager','Voice requirement','Interview slots','Deal breakers','Notice period']}/><MiniBlock title="Assessment Plan" items={['Resume screening','Skill test','Scenario','Audio Level 3','Optional video']}/></div></div>
  </section>;
}

function AssessmentEngine() {
  return <section className="page"><SectionTitle icon={<ClipboardCheck/>} title="Dynamic Assessment Engine" subtitle="Configurable, role-wise, explainable, and not hardcoded."/>
    <div className="matrix">{roleMatrix.map(r => <div className="matrix-card glass" key={r.role}><div className="tag">{r.profile}</div><h3>{r.role}</h3><div className="checkline"><CheckCircle2/> Resume: {r.resume?'Required':'No'}</div><div className="checkline"><Gauge/> Skill: {r.skill}</div><div className="checkline"><AudioLines/> Audio: {r.audio}</div><div className="checkline"><Video/> Video: {r.video}</div><div className="scorebar"><span style={{width:`${r.pass}%`}}/></div><small>Passing Benchmark {r.pass}%</small></div>)}</div>
    <div className="panel-grid two"><AudioPanel/><VideoPanel/></div>
    <div className="glass card"><h3>Auto Trait Question Generator + Validation</h3><div className="trait-grid">{['Empathy','Ownership','Persuasion','Integrity','Decision Making','Confidentiality'].map(t=><TraitPill key={t} trait={t}/>)}</div><p className="muted">Generated questions are validated for role relevance, bias risk, clarity, duplicacy, scoring feasibility, and compliance before approval.</p></div>
  </section>;
}

function CandidatePortal() {
  return <section className="page"><SectionTitle icon={<UserRoundCheck/>} title="Candidate Assessment & Interview Booking" subtitle="A guided journey from resume upload to qualified interview slot."/>
    <div className="candidate-journey">{['Upload Resume','Profile Parsed','Assessment Path','Audio/Video','Scorecard','Book Slot'].map((x,i)=><FlowStep key={x} n={i+1} title={x}/>)}</div><div className="panel-grid two"><CandidateReport/><SlotBooking/></div>
  </section>;
}

function AdminConsole() {
  return <section className="page"><SectionTitle icon={<DatabaseZap/>} title="Admin Control Tower" subtitle="Configure matrix, question bank, MCP integrations, scoring, compliance, and tenant rules."/>
    <div className="admin-grid">{[[Brain,'Role Taxonomy','Role family, level, industry, aliases'], [ClipboardCheck,'Assessment Rules','Audio/video/technical path rules'], [WandSparkles,'Trait Question Bank','Auto-generate, validate, approve'], [ShieldCheck,'Compliance','Consent, audit logs, bias controls'], [Bot,'MCP Servers','Figma, Cursor, ATS, calendar, comms'], [LockKeyhole,'Access Control','Tenant isolation and RBAC']].map(([Icon,t,s])=><div className="glass card admin-card" key={t}><Icon/><h3>{t}</h3><p>{s}</p></div>)}</div><McpPanel/>
  </section>;
}

function SectionTitle({ icon, title, subtitle }) { return <div className="section-title"><span>{icon}</span><div><h2>{title}</h2><p>{subtitle}</p></div></div>; }
function Metric({label,value}) { return <div className="metric"><b>{value}</b><span>{label}</span></div>; }
function FlowStep({n,title}) { return <div className="flow-step glass"><b>{n}</b><span>{title}</span><ChevronRight size={16}/></div>; }
function AssessmentCard({role, comm, lead, tech}) { return <div className="glass card assessment-card"><div className="tag">AI Recommended</div><h3>{role}</h3><Dependency label="Communication" value={comm}/><Dependency label="Leadership" value={lead}/><Dependency label="Technical" value={tech}/><div className="path"><span>Resume</span><span>Sales Case</span><span>Audio Pitch</span><span>Video</span></div></div>; }
function Dependency({label,value}) { return <div className="dep"><div><span>{label}</span><b>{value}</b></div><div className="scorebar"><span style={{width:`${value}%`}}/></div></div>; }
function DashboardGrid(){return <div className="dashboard-grid"><MetricCard icon={<BriefcaseBusiness/>} value="18" label="Active JDs"/><MetricCard icon={<UserRoundCheck/>} value="246" label="Candidates sourced"/><MetricCard icon={<ClipboardCheck/>} value="71" label="Qualified"/><MetricCard icon={<CalendarCheck/>} value="29" label="Interviews booked"/></div>}
function MetricCard({icon,value,label}){return <div className="glass metric-card">{icon}<b>{value}</b><span>{label}</span></div>}
function Pipeline(){return <div className="glass card"><h3>JD Pipeline</h3>{['Intake','JD Approved','Candidates Matched','Assessment Completed','Interview Scheduled','Selected'].map((s,i)=><Dependency key={s} label={s} value={[100,88,72,51,31,12][i]}/>)}</div>}
function CandidateTable(){return <div className="glass card"><h3>Top Candidates</h3>{candidates.map(c=><div className="row" key={c.name}><div><b>{c.name}</b><span>{c.role} · {c.stage}</span></div><strong>{c.score}%</strong></div>)}</div>}
function MiniBlock({title,items}){return <div className="mini"><h4>{title}</h4>{items.map(x=><span key={x}>{x}</span>)}</div>}
function AudioPanel(){return <div className="glass card"><h3><AudioLines/> Audio Interview</h3><p className="muted">Level 3 for moderate communication roles. Level 5 for voice-heavy roles.</p><MiniBlock title="Measured" items={['Grammar','Fluency','Pronunciation','Listening','Vocabulary','Pace','Confidence','Role suitability']}/></div>}
function VideoPanel(){return <div className="glass card"><h3><MonitorPlay/> Video Interview</h3><p className="muted">Used for manager, sales, trainer, leadership and client-facing roles.</p><MiniBlock title="Measured" items={['Answer structure','Clarity','Confidence','Leadership maturity','Situation handling','Role understanding']}/></div>}
function TraitPill({trait}){return <div className="trait"><Brain size={16}/><b>{trait}</b><span>Validated</span></div>}
function CandidateReport(){return <div className="glass card"><h3>Candidate Scorecard</h3>{[['Resume Match',86],['Skill Test',81],['Audio Score',89],['Video Score',78],['Trait Score',84],['Salary/Notice Fit',92]].map(([l,v])=><Dependency key={l} label={l} value={v}/>)}</div>}
function SlotBooking(){return <div className="glass card"><h3>Book Interview Slot</h3>{['Today 4:30 PM · Google Meet','Tomorrow 11:00 AM · Physical','Tomorrow 5:00 PM · Teams'].map(x=><button className="slot" key={x}><CalendarCheck size={17}/>{x}</button>)}<button className="primary full">Confirm Slot</button></div>}
function McpPanel(){return <div className="glass card"><h3>MCP-ready Design & Integration Workflow</h3><div className="output-grid"><MiniBlock title="Design MCP" items={['Figma tokens','Component specs','Prototype map','Asset naming']}/><MiniBlock title="Developer MCP" items={['Cursor prompts','Codegen rules','PR checklist','Design-to-code sync']}/><MiniBlock title="Business MCP" items={['ATS','Calendar','Email/WhatsApp','Assessment vendors']}/></div></div>}

createRoot(document.getElementById('root')).render(<App/>);
