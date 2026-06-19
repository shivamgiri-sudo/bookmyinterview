import React from 'react';
import { BadgeCheck, Download, FileText, Sparkles } from 'lucide-react';

const blocks = ['Role summary', 'Scorecard overview', 'Role insights', 'Evidence notes', 'Next steps'];

export default function ReportStudio() {
  return <section className="page"><div className="workspace-hero glass"><div><div className="eyebrow"><FileText size={16}/> Report studio complete</div><h1>Client-ready report preview builder.</h1><p>Prepare clear, branded summaries that can later export into PDF or client packs.</p></div><div className="workspace-status"><Sparkles/><b>Preview</b><span>Report builder status</span></div></div><div className="panel-grid two"><div className="glass card"><h3>Report Blocks</h3>{blocks.map(item => <div className="insight-rule" key={item}><BadgeCheck/><div><b>{item}</b><span>Included in report preview</span></div></div>)}</div><div className="glass card"><h3>Preview Actions</h3>{['Generate preview', 'Attach scorecard', 'Add insight notes', 'Prepare export'].map(item => <div className="insight-rule" key={item}><Download/><div><b>{item}</b><span>Ready for implementation</span></div></div>)}</div></div></section>;
}
