import React, { useState } from 'react';
import { accountClient } from './accountClient.js';
import { ArrowRight, CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react';

export default function AccountOps() {
  const [email, setEmail] = useState('');
  const [challenge, setChallenge] = useState('');
  const [status, setStatus] = useState('Ready.');
  async function startA() { try { const res = await accountClient.recoveryStart(email); setChallenge(res.challenge || ''); setStatus('Challenge created.'); } catch { setStatus('Action failed.'); } }
  async function startB() { try { const res = await accountClient.verifyStart(email); setChallenge(res.challenge || ''); setStatus('Verification challenge created.'); } catch { setStatus('Action failed.'); } }
  async function finishB() { try { await accountClient.verifyComplete(challenge); setStatus('Verification complete.'); } catch { setStatus('Completion failed.'); } }
  return <section className="page"><div className="workspace-hero glass"><div><div className="eyebrow"><KeyRound size={16}/> Account operations complete</div><h1>Account lifecycle contracts are ready.</h1><p>This screen exercises account challenge and verification contracts for the MVP.</p></div><div className="workspace-status"><ShieldCheck/><b>Status</b><span>{status}</span></div></div><div className="panel-grid two"><div className="glass card workspace-form"><h3>Account Challenge</h3><label>Account ID</label><input value={email} onChange={(e)=>setEmail(e.target.value)}/><label>Challenge</label><input value={challenge} onChange={(e)=>setChallenge(e.target.value)}/><button className="primary full" onClick={startA}>Start challenge <ArrowRight size={16}/></button></div><div className="glass card"><h3>Verification</h3>{['Create challenge', 'Route through approved channel', 'Complete challenge', 'Record status'].map(item => <div className="insight-rule" key={item}><CheckCircle2/><div><b>{item}</b><span>Lifecycle checkpoint</span></div></div>)}<button className="primary full" onClick={startB}>Start verification</button><button className="slot compact" onClick={finishB}>Complete verification</button></div></div></section>;
}
