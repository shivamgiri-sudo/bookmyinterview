import React from 'react';
import { BadgeIndianRupee, CheckCircle2, CreditCard, Gem, Globe2, Landmark, ReceiptText, Sparkles, WalletCards } from 'lucide-react';

const plans = [
  { name: 'Starter', price: '$99', tag: 'Early SMB', jobs: '10 jobs', assessments: '250 assessments', features: ['Client portal', 'Smart intake', 'Basic scoring', 'Email support'] },
  { name: 'Growth', price: '$399', tag: 'Scaling teams', jobs: '50 jobs', assessments: '2,000 assessments', features: ['Audio/video', 'Candidate matching', 'Calendar', 'WhatsApp/email reminders'] },
  { name: 'Enterprise', price: 'Custom', tag: 'Global clients', jobs: 'Unlimited', assessments: 'Custom', features: ['SSO', 'ATS/HRMS', 'Data residency', 'Custom MCPs', 'Compliance pack'] },
];

const invoices = [
  ['INV-2026-044', 'Growth Plan', '$399', 'Paid'],
  ['INV-2026-045', 'Assessment overage', '$72', 'Pending'],
  ['INV-2026-046', 'WhatsApp usage', '$14', 'Held'],
];

export default function BillingSubscription() {
  return <section className="page ops-page">
    <div className="ops-hero glass billing-hero">
      <div>
        <div className="eyebrow"><WalletCards size={16}/> Global monetization layer</div>
        <h1>Convert product value into predictable revenue without surprise costs.</h1>
        <p>Billing needs to support global subscriptions, usage-based assessment pricing, success fees, multi-currency, enterprise plans, provider pass-through, and invoice-level auditability.</p>
      </div>
      <div className="ops-hero-card"><ReceiptText/><b>$816K</b><span>projected pilot ARR</span></div>
    </div>

    <div className="plan-grid">{plans.map(plan => <div className="glass card plan-card" key={plan.name}>
      <div className="plan-tag"><Gem size={15}/>{plan.tag}</div>
      <h3>{plan.name}</h3>
      <b className="plan-price">{plan.price}</b>
      <span className="muted">{plan.jobs} · {plan.assessments}</span>
      <div className="plan-features">{plan.features.map(feature => <div key={feature}><CheckCircle2/>{feature}</div>)}</div>
      <button className="primary full">Configure {plan.name}</button>
    </div>)}</div>

    <div className="panel-grid two">
      <div className="glass card">
        <h3><Globe2/> Currency and Region Controls</h3>
        <div className="currency-grid">
          {['USD','EUR','GBP','INR','AED','SGD'].map(currency => <div className="currency-card" key={currency}><Landmark/><b>{currency}</b><span>Ready</span></div>)}
        </div>
      </div>
      <div className="glass card">
        <h3><CreditCard/> Invoice Timeline</h3>
        {invoices.map(([id,type,amount,status]) => <div className="invoice-row" key={id}><div><b>{id}</b><span>{type}</span></div><strong>{amount}</strong><em>{status}</em></div>)}
      </div>
    </div>
  </section>;
}
