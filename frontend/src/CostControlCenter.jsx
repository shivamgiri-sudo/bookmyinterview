import React from 'react';
import { CheckCircle2, Cloud, CreditCard, Database, DollarSign, Gauge, LockKeyhole, Server, ShieldCheck, Sparkles, WalletCards, Zap } from 'lucide-react';

const freeStack = [
  ['Self-hosted MCP', 'Free protocol/server', 'Infra only'],
  ['PostgreSQL', 'Free local/self-host', 'Managed optional'],
  ['pgvector', 'Free open-source', 'MVP matching'],
  ['Qdrant local', 'Free self-host', 'Cloud optional'],
  ['MinIO/local storage', 'Free self-host', 'S3 later'],
];

const paidStack = [
  ['OpenAI / Claude', 'Usage paid', 'Cap at $25 first'],
  ['Apify', 'Free tier then paid', 'Hard actor budget'],
  ['Figma Dev Mode', 'Plan dependent', 'Design team only'],
  ['WhatsApp Business', 'Usage paid', 'Email fallback'],
  ['Resume Parser', 'Vendor paid', 'Manual parsing fallback'],
  ['Stripe / Razorpay', 'Transaction fee', 'Enable at billing launch'],
];

const budgetRules = [
  ['LLM Cap', '$25 / month', 25],
  ['Web Data Cap', '$10 / month', 10],
  ['Communication Cap', '$15 / month', 15],
  ['Storage Cap', '$10 / month', 10],
];

export default function CostControlCenter() {
  return <section className="page cost-page">
    <div className="cost-hero glass">
      <div>
        <div className="eyebrow"><WalletCards size={16}/> Free-first global operating model</div>
        <h1>Control provider costs before scale burns cash.</h1>
        <p>BOOK MY INTERVIEW should launch with free/self-hosted defaults wherever possible. Paid MCP-backed providers are disabled until Superadmin approves budget, cap, use case, and fallback.</p>
      </div>
      <div className="cost-summary-card">
        <span>Default MVP Budget</span>
        <b>$100</b>
        <small>Monthly platform cap before paid pilot approval</small>
        <div className="scorebar"><span style={{width:'62%'}}/></div>
      </div>
    </div>

    <div className="panel-grid two">
      <div className="glass card">
        <h3><Server/> Free / Self-host First Stack</h3>
        <div className="cost-list">{freeStack.map(([name, model, note]) => <CostRow key={name} icon={<CheckCircle2/>} name={name} model={model} note={note} mode="free"/>)}</div>
      </div>
      <div className="glass card">
        <h3><CreditCard/> Paid or Plan-dependent Stack</h3>
        <div className="cost-list">{paidStack.map(([name, model, note]) => <CostRow key={name} icon={<LockKeyhole/>} name={name} model={model} note={note} mode="paid"/>)}</div>
      </div>
    </div>

    <div className="glass card cost-governance">
      <div className="launch-head">
        <div><h3><ShieldCheck/> Cost Governance Rules</h3><p className="muted">No provider should silently create expenses. Paid tools need approval, budget cap, monitoring, fallback, and kill switch.</p></div>
        <button className="primary">Approve Provider <Sparkles size={17}/></button>
      </div>
      <div className="budget-grid">
        {budgetRules.map(([label, value, width]) => <div className="budget-card" key={label}><Gauge/><b>{label}</b><span>{value}</span><div className="scorebar"><span style={{width:`${width*3}%`}}/></div></div>)}
      </div>
    </div>

    <div className="panel-grid three">
      <Principle icon={<Database/>} title="Default to open-source" text="Postgres, pgvector, local MCP, local storage, and mock providers keep early development cost-controlled."/>
      <Principle icon={<Cloud/>} title="Upgrade by ROI" text="Enable OpenAI, Apify, WhatsApp, Figma, cloud storage, or paid parsers only when the workflow proves business value."/>
      <Principle icon={<Zap/>} title="Kill expensive paths" text="Every paid provider needs usage alerts, monthly cap, tenant attribution, and automatic disable when budget is crossed."/>
    </div>
  </section>;
}

function CostRow({ icon, name, model, note, mode }) {
  return <div className={`cost-row ${mode}`}>{icon}<div><b>{name}</b><span>{model}</span></div><em>{note}</em></div>;
}

function Principle({ icon, title, text }) {
  return <div className="glass card founder-card cost-principle">{icon}<h3>{title}</h3><p>{text}</p></div>;
}
