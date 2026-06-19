import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { secureApi } from './secureApi.js';
import {
  ArrowRight, ArrowLeft, Bot, CheckCircle2, FileUp, Loader2,
  MessageSquare, Mic, Send, Sparkles, Upload, X, Zap,
  BriefcaseBusiness, MapPin, DollarSign, Award, FileText, Users, Clock,
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Choose Method', icon: Sparkles },
  { id: 2, label: 'Build JD', icon: MessageSquare },
  { id: 3, label: 'Review & Generate', icon: Zap },
];

const SENIORITY = ['Junior','Mid-Level','Senior','Lead','Manager','Director','VP','C-Suite'];
const INDUSTRIES = ['BPO / Voice','Sales','HR','Operations','Finance','IT','Leadership','Customer Success','Engineering','Data / Analytics'];

const BOT_QUESTIONS = [
  { key:'designation', q:'What is the job title or designation you are hiring for?', placeholder:'e.g. Sales Manager' },
  { key:'industry', q:'Which industry or department does this role belong to?', placeholder:'e.g. BPO / Voice' },
  { key:'location', q:'What is the job location?', placeholder:'e.g. Dubai, UAE' },
  { key:'seniority', q:'What seniority level is required?', placeholder:'e.g. Senior, Manager' },
  { key:'budget', q:'What is the salary range or budget?', placeholder:'e.g. USD 2,500/month' },
  { key:'skills', q:'What are the must-have skills? (comma separated)', placeholder:'e.g. Communication, Excel, Sales Pitch' },
  { key:'dealbreakers', q:'Any deal-breakers or constraints?', placeholder:'e.g. Must have valid visa, no night shifts' },
  { key:'notes', q:'Any additional notes or client preferences?', placeholder:'Optional notes...' },
];

const FALLBACK_PATH = [
  { step:'Resume Screening', desc:'AI-powered resume match and gap analysis' },
  { step:'Role Skill Test', desc:'Technical and domain-specific evaluation' },
  { step:'Scenario Judgment', desc:'Situational and behavioral assessment' },
  { step:'Audio Level 3', desc:'Communication fluency and listening' },
  { step:'Video Interview', desc:'Async video with structured prompts' },
  { step:'Human Review', desc:'Final expert panel and compliance check' },
];

function Field({ label, icon: Icon, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700, color:'var(--text2)', marginBottom:7 }}>
        {Icon && <Icon size={13} style={{ color:'var(--muted)' }} />} {label}
      </label>
      {children}
    </div>
  );
}

export default function IntakeLive() {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState(null); // 'bot' | 'upload' | 'manual'
  const [form, setForm] = useState({ designation:'', industry:'BPO / Voice', location:'', seniority:'Senior', budget:'', tenant_id:1, skills:'', dealbreakers:'', notes:'' });
  const [path, setPath] = useState(null);
  const [status, setStatus] = useState('Ready');
  const [loading, setLoading] = useState(false);

  // Bot state
  const [botStep, setBotStep] = useState(0);
  const [botMessages, setBotMessages] = useState([]);
  const [botInput, setBotInput] = useState('');
  const chatRef = useRef(null);

  // Upload state
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Bot logic
  function startBot() {
    setMode('bot');
    setStep(2);
    setBotStep(0);
    setBotMessages([
      { from:'bot', text:"Hi! I'm your AI hiring assistant. I'll ask a few questions to build a complete Job Description for you. Let's start!" },
      { from:'bot', text: BOT_QUESTIONS[0].q },
    ]);
  }

  function sendBotMessage() {
    if (!botInput.trim()) return;
    const answer = botInput.trim();
    const currentQ = BOT_QUESTIONS[botStep];

    setBotMessages(m => [...m, { from:'user', text: answer }]);
    set(currentQ.key, answer);
    setBotInput('');

    const nextStep = botStep + 1;
    if (nextStep < BOT_QUESTIONS.length) {
      setBotStep(nextStep);
      setTimeout(() => {
        setBotMessages(m => [...m, { from:'bot', text: `Got it! ${BOT_QUESTIONS[nextStep].q}` }]);
      }, 400);
    } else {
      setTimeout(() => {
        setBotMessages(m => [...m, { from:'bot', text:"Perfect! I've captured all the details. Let me generate your JD and assessment path now. Click 'Review & Generate' to proceed." }]);
        setStep(3);
      }, 500);
    }
  }

  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior:'smooth' }); }, [botMessages]);

  // Upload logic
  function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadStatus('parsing');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      // Simple parsing: extract key fields from JD text
      const lines = text.split('\n').filter(l => l.trim());
      const find = (keywords) => {
        for (const line of lines) {
          for (const kw of keywords) {
            if (line.toLowerCase().includes(kw.toLowerCase())) {
              const val = line.replace(/^.*?[:–-]\s*/, '').trim();
              if (val && val.length > 2) return val;
            }
          }
        }
        return '';
      };
      set('designation', find(['title','designation','position','role']) || lines[0]?.substring(0,60) || '');
      set('location', find(['location','city','region','country']));
      set('industry', find(['industry','department','domain','sector']) || 'BPO / Voice');
      set('seniority', find(['seniority','level','experience']) || 'Senior');
      set('budget', find(['salary','budget','compensation','ctc','package']));
      set('skills', find(['skills','requirements','qualifications','must-have']));
      set('notes', lines.slice(0, 5).join(' ').substring(0, 200));
      setUploadStatus('done');
      setTimeout(() => setStep(3), 800);
    };
    reader.readAsText(file);
  }

  // Generate
  async function generate() {
    setLoading(true);
    try {
      const created = await secureApi.createJob({
        ...form, tenant_id: Number(form.tenant_id),
        requirement: { source: mode || 'manual', skills: form.skills, dealbreakers: form.dealbreakers },
      });
      const raw = created?.assessment_path?.assessment_path || created?.assessment_path?.steps || null;
      setPath(Array.isArray(raw) ? raw.map((s, i) => typeof s === 'string' ? { step: s, desc: `Step ${i+1}` } : s) : FALLBACK_PATH);
      setStatus('Generated');
    } catch {
      setPath(FALLBACK_PATH);
      setStatus('Demo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page" style={{ maxWidth: 960, margin:'0 auto', padding:'40px 0 80px' }}>
      {/* Hero */}
      <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4 }} style={{ marginBottom:32 }}>
        <div className="pill" style={{ marginBottom:12 }}><Sparkles size={13} /> Smart Intake — AI Assessment Path Generator</div>
        <h1 style={{ fontFamily:'var(--f-display)', fontSize:'clamp(34px,5vw,54px)', fontWeight:900, letterSpacing:'-2px', lineHeight:.95, margin:'0 0 12px', background:'linear-gradient(180deg,#fff,#BAD5FF 55%,#A78BFA)', WebkitBackgroundClip:'text', backgroundClip:'text', color:'transparent' }}>
          Create a hiring request.
        </h1>
        <p style={{ color:'var(--muted)', fontSize:16, lineHeight:1.7, maxWidth:540 }}>
          Use our AI bot, upload an existing JD, or fill the form manually.
        </p>
      </motion.div>

      {/* Step indicator */}
      <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:32 }}>
        {STEPS.map((s, i) => {
          const done = step > s.id, active = step === s.id, Icon = s.icon;
          return (
            <React.Fragment key={s.id}>
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:12,
                background: active ? 'rgba(0,122,255,.12)' : done ? 'rgba(52,211,153,.1)' : 'rgba(255,255,255,.04)',
                border: `1px solid ${active ? 'rgba(0,122,255,.3)' : done ? 'rgba(52,211,153,.25)' : 'rgba(255,255,255,.08)'}`,
                cursor: done ? 'pointer' : 'default' }} onClick={() => done && setStep(s.id)}>
                <div style={{ width:26, height:26, borderRadius:7, display:'grid', placeItems:'center',
                  background: active ? 'rgba(0,122,255,.2)' : done ? 'rgba(52,211,153,.2)' : 'rgba(255,255,255,.06)',
                  color: active ? '#60A5FA' : done ? '#34D399' : 'var(--muted)' }}>
                  {done ? <CheckCircle2 size={14} /> : <Icon size={13} />}
                </div>
                <span style={{ fontSize:12, fontWeight:700, color: active ? '#60A5FA' : done ? '#34D399' : 'var(--muted2)' }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ flex:1, height:1, background: done ? 'rgba(52,211,153,.3)' : 'rgba(255,255,255,.06)', margin:'0 8px' }} />}
            </React.Fragment>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* ═══ STEP 1: Choose Method ═══ */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }} transition={{ duration:.3 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
              {/* AI Bot */}
              <motion.button whileHover={{ y:-6 }} onClick={startBot} className="glass" style={{ borderRadius:22, padding:28, textAlign:'left', cursor:'pointer', border:'1px solid rgba(0,122,255,.2)', background:'rgba(0,122,255,.06)' }}>
                <div style={{ width:48, height:48, borderRadius:14, background:'rgba(0,122,255,.15)', display:'grid', placeItems:'center', color:'#60A5FA', marginBottom:16 }}>
                  <Bot size={22} />
                </div>
                <h3 style={{ fontFamily:'var(--f-display)', fontSize:18, fontWeight:800, margin:'0 0 8px' }}>AI Bot Interview</h3>
                <p style={{ color:'var(--muted)', fontSize:13, lineHeight:1.6, margin:0 }}>
                  Chat with our AI assistant. It will ask questions and build a complete JD for you automatically.
                </p>
                <div style={{ marginTop:14, display:'flex', alignItems:'center', gap:6, color:'#60A5FA', fontSize:13, fontWeight:700 }}>
                  Start conversation <ArrowRight size={14} />
                </div>
              </motion.button>

              {/* Upload JD */}
              <motion.button whileHover={{ y:-6 }} onClick={() => { setMode('upload'); setStep(2); }} className="glass" style={{ borderRadius:22, padding:28, textAlign:'left', cursor:'pointer', border:'1px solid rgba(52,211,153,.2)', background:'rgba(52,211,153,.06)' }}>
                <div style={{ width:48, height:48, borderRadius:14, background:'rgba(52,211,153,.15)', display:'grid', placeItems:'center', color:'#34D399', marginBottom:16 }}>
                  <Upload size={22} />
                </div>
                <h3 style={{ fontFamily:'var(--f-display)', fontSize:18, fontWeight:800, margin:'0 0 8px' }}>Upload Existing JD</h3>
                <p style={{ color:'var(--muted)', fontSize:13, lineHeight:1.6, margin:0 }}>
                  Upload a JD file (.txt, .pdf) and we'll parse it into structured fields for review.
                </p>
                <div style={{ marginTop:14, display:'flex', alignItems:'center', gap:6, color:'#34D399', fontSize:13, fontWeight:700 }}>
                  Upload file <ArrowRight size={14} />
                </div>
              </motion.button>

              {/* Manual */}
              <motion.button whileHover={{ y:-6 }} onClick={() => { setMode('manual'); setStep(2); }} className="glass" style={{ borderRadius:22, padding:28, textAlign:'left', cursor:'pointer', border:'1px solid rgba(167,139,250,.2)', background:'rgba(167,139,250,.06)' }}>
                <div style={{ width:48, height:48, borderRadius:14, background:'rgba(167,139,250,.15)', display:'grid', placeItems:'center', color:'#A78BFA', marginBottom:16 }}>
                  <FileText size={22} />
                </div>
                <h3 style={{ fontFamily:'var(--f-display)', fontSize:18, fontWeight:800, margin:'0 0 8px' }}>Manual Form</h3>
                <p style={{ color:'var(--muted)', fontSize:13, lineHeight:1.6, margin:0 }}>
                  Fill in the hiring details yourself using our structured form wizard.
                </p>
                <div style={{ marginTop:14, display:'flex', alignItems:'center', gap:6, color:'#A78BFA', fontSize:13, fontWeight:700 }}>
                  Fill form <ArrowRight size={14} />
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ═══ STEP 2: Build JD ═══ */}
        {step === 2 && mode === 'bot' && (
          <motion.div key="s2bot" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }} transition={{ duration:.3 }}>
            <div className="glass" style={{ borderRadius:24, overflow:'hidden', display:'flex', flexDirection:'column', height:480 }}>
              {/* Chat header */}
              <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:9, background:'rgba(0,122,255,.15)', display:'grid', placeItems:'center', color:'#60A5FA' }}>
                  <Bot size={16} />
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700 }}>AI Hiring Assistant</div>
                  <div style={{ fontSize:11, color:'var(--muted)' }}>Step {botStep + 1} of {BOT_QUESTIONS.length}</div>
                </div>
                <div style={{ flex:1 }} />
                <div style={{ width:120, height:4, borderRadius:99, background:'rgba(255,255,255,.08)', overflow:'hidden' }}>
                  <div style={{ width:`${((botStep + 1) / BOT_QUESTIONS.length) * 100}%`, height:'100%', background:'linear-gradient(90deg,#007AFF,#34C759)', borderRadius:99, transition:'width .3s' }} />
                </div>
              </div>

              {/* Messages */}
              <div ref={chatRef} style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:10 }}>
                {botMessages.map((m, i) => (
                  <motion.div key={i} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:.25 }}
                    style={{ maxWidth:'80%', alignSelf: m.from === 'user' ? 'flex-end' : 'flex-start',
                      padding:'10px 14px', borderRadius: m.from === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: m.from === 'user' ? 'rgba(0,122,255,.2)' : 'rgba(255,255,255,.06)',
                      border: `1px solid ${m.from === 'user' ? 'rgba(0,122,255,.3)' : 'rgba(255,255,255,.08)'}`,
                      color: m.from === 'user' ? '#BAE6FD' : 'var(--text2)', fontSize:13.5, lineHeight:1.55 }}>
                    {m.text}
                  </motion.div>
                ))}
              </div>

              {/* Input */}
              <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,.07)', display:'flex', gap:8 }}>
                <input
                  value={botInput}
                  onChange={e => setBotInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendBotMessage()}
                  placeholder={BOT_QUESTIONS[botStep]?.placeholder || 'Type your answer...'}
                  style={{ flex:1, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, padding:'10px 14px', color:'var(--text)', font:'inherit', fontSize:14, outline:0 }}
                  autoFocus
                />
                <button onClick={sendBotMessage} className="btn-primary sm" style={{ borderRadius:10 }}>
                  <Send size={14} />
                </button>
              </div>
            </div>
            <div style={{ marginTop:12, display:'flex', gap:10 }}>
              <button className="btn-ghost" onClick={() => { setStep(1); setMode(null); }}><ArrowLeft size={14} /> Back</button>
              {botStep >= BOT_QUESTIONS.length - 1 && <button className="btn-primary" onClick={() => setStep(3)}>Review & Generate <ArrowRight size={14} /></button>}
            </div>
          </motion.div>
        )}

        {step === 2 && mode === 'upload' && (
          <motion.div key="s2up" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }} transition={{ duration:.3 }}>
            <div className="glass" style={{ borderRadius:24, padding:36, textAlign:'center' }}>
              <Upload size={40} style={{ color:'#34D399', marginBottom:16 }} />
              <h3 style={{ fontFamily:'var(--f-display)', fontSize:20, fontWeight:800, marginBottom:8 }}>Upload Job Description</h3>
              <p style={{ color:'var(--muted)', fontSize:14, marginBottom:24 }}>Upload a .txt or .csv file with the JD content. We'll extract role details automatically.</p>
              <input ref={fileRef} type="file" accept=".txt,.csv,.md" onChange={handleUpload} style={{ display:'none' }} />
              <button className="btn-primary" onClick={() => fileRef.current?.click()} disabled={uploadStatus === 'parsing'}>
                {uploadStatus === 'parsing' ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }} /> Parsing...</> :
                 uploadStatus === 'done' ? <><CheckCircle2 size={16} /> Parsed! Reviewing...</> :
                 <><FileUp size={16} /> Choose File</>}
              </button>
              {uploadStatus === 'done' && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ marginTop:20, textAlign:'left', padding:16, borderRadius:14, background:'rgba(52,211,153,.08)', border:'1px solid rgba(52,211,153,.2)' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#34D399', marginBottom:8 }}>Extracted Fields:</div>
                  {[['Title', form.designation],['Industry', form.industry],['Location', form.location],['Skills', form.skills]].map(([k,v]) => v && (
                    <div key={k} style={{ fontSize:12, color:'var(--text2)', padding:'3px 0' }}><strong>{k}:</strong> {v}</div>
                  ))}
                </motion.div>
              )}
            </div>
            <div style={{ marginTop:12 }}>
              <button className="btn-ghost" onClick={() => { setStep(1); setMode(null); }}><ArrowLeft size={14} /> Back</button>
            </div>
          </motion.div>
        )}

        {step === 2 && mode === 'manual' && (
          <motion.div key="s2man" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }} transition={{ duration:.3 }}
            className="glass" style={{ borderRadius:24, padding:28 }}>
            <h3 style={{ fontFamily:'var(--f-display)', fontSize:18, fontWeight:800, marginBottom:20 }}>Role & Requirements</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <Field label="Job Title" icon={BriefcaseBusiness}><input value={form.designation} onChange={e => set('designation', e.target.value)} placeholder="e.g. Sales Manager" /></Field>
              <Field label="Industry" icon={Sparkles}><select value={form.industry} onChange={e => set('industry', e.target.value)}>{INDUSTRIES.map(o => <option key={o}>{o}</option>)}</select></Field>
              <Field label="Location" icon={MapPin}><input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Dubai, UAE" /></Field>
              <Field label="Seniority" icon={Award}><select value={form.seniority} onChange={e => set('seniority', e.target.value)}>{SENIORITY.map(o => <option key={o}>{o}</option>)}</select></Field>
              <Field label="Budget" icon={DollarSign}><input value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="e.g. USD 2,500/month" /></Field>
              <Field label="Tenant ID" icon={Users}><input type="number" value={form.tenant_id} onChange={e => set('tenant_id', e.target.value)} /></Field>
            </div>
            <Field label="Must-Have Skills" icon={FileText}><textarea value={form.skills} onChange={e => set('skills', e.target.value)} placeholder="Communication, Excel..." style={{ minHeight:70 }} /></Field>
            <Field label="Deal-Breakers" icon={Clock}><input value={form.dealbreakers} onChange={e => set('dealbreakers', e.target.value)} placeholder="No night shifts..." /></Field>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
              <button className="btn-ghost" onClick={() => { setStep(1); setMode(null); }}><ArrowLeft size={14} /> Back</button>
              <button className="btn-primary" onClick={() => setStep(3)}>Review & Generate <ArrowRight size={14} /></button>
            </div>
          </motion.div>
        )}

        {/* ═══ STEP 3: Review ═══ */}
        {step === 3 && (
          <motion.div key="s3" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }} transition={{ duration:.3 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
              <div className="glass" style={{ borderRadius:22, padding:22 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                  <h3 style={{ fontFamily:'var(--f-display)', fontSize:16, fontWeight:800, margin:0 }}>Job Summary</h3>
                  <span style={{ padding:'3px 9px', borderRadius:99, fontSize:11, fontWeight:700, background:'rgba(0,122,255,.12)', border:'1px solid rgba(0,122,255,.25)', color:'#60A5FA' }}>
                    via {mode || 'manual'}
                  </span>
                </div>
                {[['Role',form.designation],['Industry',form.industry],['Location',form.location],['Seniority',form.seniority],['Budget',form.budget],['Skills',form.skills]].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,.06)', fontSize:13 }}>
                    <span style={{ color:'var(--muted)' }}>{k}</span>
                    <strong>{v || '—'}</strong>
                  </div>
                ))}
                <div style={{ marginTop:14, display:'flex', gap:10 }}>
                  <button className="btn-ghost" style={{ flex:1 }} onClick={() => setStep(mode === 'bot' ? 1 : 2)}><ArrowLeft size={14} /> Edit</button>
                  <button className="btn-primary" style={{ flex:1 }} onClick={generate} disabled={loading}>
                    {loading ? <Loader2 size={15} style={{ animation:'spin 1s linear infinite' }} /> : <Zap size={15} />}
                    {loading ? 'Generating…' : 'Generate Path'}
                  </button>
                </div>
              </div>

              <div className="glass" style={{ borderRadius:22, padding:22 }}>
                <h3 style={{ fontFamily:'var(--f-display)', fontSize:16, fontWeight:800, marginBottom:16 }}>Assessment Path</h3>
                {path ? path.map((s, i) => (
                  <motion.div key={s.step} initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*.06 }}
                    style={{ display:'grid', gridTemplateColumns:'26px 1fr', gap:10, alignItems:'start', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
                    <div style={{ width:26, height:26, borderRadius:8, background:'rgba(52,211,153,.14)', display:'grid', placeItems:'center', color:'#34D399', fontSize:11, fontWeight:900 }}>{i+1}</div>
                    <div><div style={{ fontWeight:700, fontSize:13 }}>{s.step}</div><div style={{ color:'var(--muted)', fontSize:12, marginTop:2 }}>{s.desc}</div></div>
                  </motion.div>
                )) : <p style={{ color:'var(--muted)', fontSize:13 }}>Click "Generate Path" to create the assessment path.</p>}
                {path && (
                  <button className="btn-primary" style={{ width:'100%', marginTop:14 }} onClick={() => { setPath(null); setStep(1); setMode(null); setBotMessages([]); setBotStep(0); }}>
                    New Intake <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </section>
  );
}
