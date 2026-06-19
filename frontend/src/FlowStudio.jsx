import React from 'react';
import { CalendarCheck, CheckCircle2, Sparkles, Workflow } from 'lucide-react';

const steps = ['Select layout', 'Attach path', 'Confirm status', 'Schedule window', 'Route through channel'];

export default function FlowStudio() {
  return <section className="page"><div className="workspace-hero glass"><div><div className="eyebrow"><Workflow size={16}/> Flow studio complete</div><h1>Assessment flow prepared.</h1><p>Prepare structured journeys for role checks, scheduling, and follow-up.</p></div><div className="workspace-status"><Sparkles/><b>Ready</b><span>Flow status</span></div></div><div className="panel-grid two"><div className="glass card"><h3>Flow Steps</h3>{steps.map(item => <div className="insight-rule" key={item}><CheckCircle2/><div><b>{item}</b><span>Workflow checkpoint</span></div></div>)}</div><div className="glass card"><h3>Schedule Setup</h3>{['Window selection', 'Reminder setup', 'Calendar handoff', 'Status tracking'].map(item => <div className="insight-rule" key={item}><CalendarCheck/><div><b>{item}</b><span>Ready for integration</span></div></div>)}</div></div></section>;
}
