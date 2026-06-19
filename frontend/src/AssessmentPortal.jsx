import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Video, VideoOff, Play, Square, CheckCircle2,
  ArrowRight, Brain, BarChart3, MessageSquare, Sparkles,
  Clock, AlertCircle, RefreshCw, ChevronRight, Award,
} from 'lucide-react';

/* ═══ SCORING ENGINE ═══ */
const METRICS = [
  { key:'communication', label:'Communication', weight:.20, color:'#38BDF8',
    keywords:['clearly','explain','communicate','articulate','present','describe','convey'] },
  { key:'technical', label:'Technical Depth', weight:.20, color:'#A78BFA',
    keywords:['implement','architecture','system','database','api','scale','deploy','code','algorithm','optimize'] },
  { key:'problem_solving', label:'Problem Solving', weight:.15, color:'#34D399',
    keywords:['solve','approach','analyze','debug','root cause','investigate','strategy','solution'] },
  { key:'leadership', label:'Leadership', weight:.15, color:'#FCD34D',
    keywords:['team','lead','manage','mentor','delegate','decision','stakeholder','collaborate'] },
  { key:'confidence', label:'Confidence', weight:.10, color:'#F472B6',
    keywords:['confident','sure','definitely','absolutely','believe','certain','experience'] },
  { key:'structure', label:'Structured Thinking', weight:.10, color:'#FB923C',
    keywords:['first','second','step','process','framework','methodology','prioritize','plan'] },
  { key:'domain', label:'Domain Knowledge', weight:.10, color:'#60A5FA',
    keywords:['industry','compliance','regulation','market','customer','business','revenue','kpi'] },
];

function scoreTranscript(text) {
  if (!text || text.length < 20) return METRICS.map(m => ({ ...m, score:0 }));
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
  return METRICS.map(m => {
    let hits = 0;
    m.keywords.forEach(kw => { const re = new RegExp(kw, 'gi'); const matches = lower.match(re); if (matches) hits += matches.length; });
    const density = Math.min(hits / Math.max(words / 40, 1), 1);
    const lengthBonus = Math.min(words / 80, 1) * 0.3;
    const structureBonus = m.key === 'structure' ? Math.min(sentences / 4, 1) * 0.2 : 0;
    const raw = Math.min((density * 0.5 + lengthBonus + structureBonus + Math.random() * 0.15) * 100, 98);
    return { ...m, score: Math.max(Math.round(raw), words > 10 ? 25 : 0) };
  });
}

function getFinalScore(scores) {
  return Math.round(scores.reduce((sum, s) => sum + s.score * s.weight, 0) / scores.reduce((sum, s) => sum + s.weight, 0));
}

function getRecommendation(score) {
  if (score >= 80) return { label:'Strong Hire', color:'#34D399', bg:'rgba(52,211,153,.12)' };
  if (score >= 60) return { label:'Recommended', color:'#38BDF8', bg:'rgba(56,189,248,.12)' };
  if (score >= 40) return { label:'Needs Review', color:'#FCD34D', bg:'rgba(252,211,77,.12)' };
  return { label:'Below Threshold', color:'#FB7185', bg:'rgba(251,113,133,.12)' };
}

/* ═══ QUESTIONS ═══ */
const QUESTION_BANKS = {
  general: [
    'Tell us about yourself and your professional background.',
    'Describe a challenging project you led and the outcome.',
    'How do you approach problem-solving when facing an unfamiliar situation?',
    'What is your leadership style and how do you motivate teams?',
    'Where do you see yourself contributing in the next 2-3 years?',
  ],
  technical: [
    'Walk us through a system you designed from scratch.',
    'How would you handle a production outage affecting thousands of users?',
    'Explain a complex technical concept to a non-technical stakeholder.',
    'Describe your approach to code reviews and maintaining code quality.',
    'How do you decide between building vs buying a solution?',
  ],
  voice: [
    'How would you handle an angry customer calling about a billing issue?',
    'Describe a time you turned a dissatisfied customer into a loyal one.',
    'How do you manage multiple calls during peak hours?',
    'What metrics do you track to measure customer satisfaction?',
    'Role-play: A customer wants to cancel their subscription. Respond.',
  ],
};

/* ═══ COMPONENTS ═══ */
function ScoreRing({ score, size = 120, stroke = 8, color }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, offset = c - (score / 100) * c;
  return (
    <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={stroke} />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" initial={{ strokeDashoffset:c }} animate={{ strokeDashoffset:offset }}
        transition={{ duration:1.2, ease:[.22,1,.36,1] }} strokeDasharray={c} />
      <text x={size/2} y={size/2} textAnchor="middle" dy=".35em" fill="#fff"
        style={{ fontSize:size*.28, fontWeight:900, fontFamily:'var(--f-display)', transform:'rotate(90deg)', transformOrigin:'center' }}>
        {score}
      </text>
    </svg>
  );
}

function MetricBar({ metric, delay }) {
  return (
    <motion.div initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
      transition={{ delay, duration:.35 }} style={{ marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ fontSize:12, fontWeight:600, color:'var(--text2)' }}>{metric.label}</span>
        <span style={{ fontSize:12, fontWeight:800, color:metric.color }}>{metric.score}%</span>
      </div>
      <div style={{ height:6, borderRadius:99, background:'rgba(255,255,255,.06)', overflow:'hidden' }}>
        <motion.div initial={{ width:0 }} animate={{ width:`${metric.score}%` }}
          transition={{ delay:delay+.2, duration:.8, ease:[.22,1,.36,1] }}
          style={{ height:'100%', borderRadius:99, background:metric.color }} />
      </div>
    </motion.div>
  );
}

/* ═══ MAIN ═══ */
export default function AssessmentPortal({ go }) {
  const [phase, setPhase] = useState('setup'); // setup | recording | analysis
  const [assessType, setAssessType] = useState('general');
  const [questionIdx, setQuestionIdx] = useState(0);
  const [mode, setMode] = useState('audio'); // audio | video
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [allTranscripts, setAllTranscripts] = useState([]);
  const [scores, setScores] = useState([]);
  const [stream, setStream] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const mediaRef = useRef(null);
  const recorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const timerRef = useRef(null);

  const questions = QUESTION_BANKS[assessType] || QUESTION_BANKS.general;

  // Start media
  const startMedia = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: true, video: mode === 'video',
      });
      setStream(s);
      if (videoRef.current && mode === 'video') videoRef.current.srcObject = s;
    } catch (e) {
      console.error('Media access denied:', e);
    }
  }, [mode]);

  const stopMedia = useCallback(() => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
  }, [stream]);

  // Speech recognition
  const startRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setTranscript('[Speech recognition not supported in this browser. Please use Chrome.]'); return; }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    let finalText = '';
    recognition.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript + ' ';
        else interim = e.results[i][0].transcript;
      }
      setTranscript(finalText + interim);
    };
    recognition.onerror = () => {};
    recognition.start();
    recognitionRef.current = recognition;
  }, []);

  // Recording controls
  const startRecording = async () => {
    await startMedia();
    setTranscript('');
    setElapsed(0);
    setIsRecording(true);
    startRecognition();
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    recognitionRef.current?.stop();
    clearInterval(timerRef.current);
    stopMedia();
  };

  const submitAnswer = () => {
    stopRecording();
    const entry = { question: questions[questionIdx], answer: transcript, mode, questionIdx };
    setAllTranscripts(prev => [...prev, entry]);
    if (questionIdx < questions.length - 1) {
      setQuestionIdx(i => i + 1);
      setTranscript('');
    } else {
      // All done — score
      const allText = [...allTranscripts.map(t => t.answer), transcript].join(' ');
      setScores(scoreTranscript(allText));
      setPhase('analysis');
    }
  };

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  useEffect(() => { return () => { stopMedia(); clearInterval(timerRef.current); }; }, []);

  /* ═══ RENDER ═══ */
  return (
    <section className="page" style={{ maxWidth:1000, margin:'0 auto', padding:'32px 0 80px' }}>
      <AnimatePresence mode="wait">
        {/* ── SETUP ── */}
        {phase === 'setup' && (
          <motion.div key="setup" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <div className="pill" style={{ marginBottom:12 }}><Brain size={13}/> AI Assessment Portal</div>
            <h1 style={{ fontFamily:'var(--f-display)', fontSize:'clamp(32px,4vw,48px)', fontWeight:900, letterSpacing:'-2px', lineHeight:.95, margin:'0 0 12px',
              background:'linear-gradient(180deg,#fff,#BAD5FF 55%,#A78BFA)', WebkitBackgroundClip:'text', backgroundClip:'text', color:'transparent' }}>
              Record. Transcribe. Analyze.
            </h1>
            <p style={{ color:'var(--muted)', fontSize:15, lineHeight:1.7, maxWidth:520, marginBottom:32 }}>
              Answer interview questions via audio or video. Your responses are transcribed in real-time and scored across 7 professional metrics.
            </p>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
              {/* Mode */}
              <div className="glass" style={{ borderRadius:20, padding:22 }}>
                <h3 style={{ fontFamily:'var(--f-display)', fontSize:15, fontWeight:800, marginBottom:14 }}>Recording Mode</h3>
                <div style={{ display:'flex', gap:10 }}>
                  {[['audio','Audio Only',Mic,'#38BDF8'],['video','Audio + Video',Video,'#A78BFA']].map(([m,l,Icon,c]) => (
                    <button key={m} onClick={() => setMode(m)} style={{
                      flex:1, padding:'14px 12px', borderRadius:14, cursor:'pointer', border:`1px solid ${mode===m?c+'55':'rgba(255,255,255,.1)'}`,
                      background: mode===m ? c+'18' : 'rgba(255,255,255,.04)', color: mode===m ? c : 'var(--muted)',
                      font:'inherit', fontSize:13, fontWeight:700, display:'flex', flexDirection:'column', alignItems:'center', gap:8, transition:'all .2s',
                    }}>
                      <Icon size={20}/> {l}
                    </button>
                  ))}
                </div>
              </div>
              {/* Type */}
              <div className="glass" style={{ borderRadius:20, padding:22 }}>
                <h3 style={{ fontFamily:'var(--f-display)', fontSize:15, fontWeight:800, marginBottom:14 }}>Question Bank</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {[['general','General Interview'],['technical','Technical Deep-Dive'],['voice','Voice / BPO']].map(([t,l]) => (
                    <button key={t} onClick={() => setAssessType(t)} style={{
                      padding:'10px 14px', borderRadius:10, cursor:'pointer', textAlign:'left',
                      border:`1px solid ${assessType===t?'rgba(0,122,255,.3)':'rgba(255,255,255,.08)'}`,
                      background: assessType===t ? 'rgba(0,122,255,.1)' : 'transparent',
                      color: assessType===t ? '#60A5FA' : 'var(--muted)', font:'inherit', fontSize:13, fontWeight:600, transition:'all .2s',
                    }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button className="btn-primary" onClick={() => setPhase('recording')} style={{ padding:'14px 28px', fontSize:15 }}>
              Start Assessment <ArrowRight size={16}/>
            </button>
          </motion.div>
        )}

        {/* ── RECORDING ── */}
        {phase === 'recording' && (
          <motion.div key="rec" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            {/* Progress */}
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
              {questions.map((_, i) => (
                <React.Fragment key={i}>
                  <div style={{
                    width:30, height:30, borderRadius:8, display:'grid', placeItems:'center', fontSize:12, fontWeight:800,
                    background: i < questionIdx ? 'rgba(52,211,153,.2)' : i === questionIdx ? 'rgba(0,122,255,.2)' : 'rgba(255,255,255,.06)',
                    color: i < questionIdx ? '#34D399' : i === questionIdx ? '#60A5FA' : 'var(--muted)',
                    border: `1px solid ${i === questionIdx ? 'rgba(0,122,255,.3)' : 'transparent'}`,
                  }}>
                    {i < questionIdx ? <CheckCircle2 size={14}/> : i + 1}
                  </div>
                  {i < questions.length - 1 && <div style={{ flex:1, height:2, background: i < questionIdx ? 'rgba(52,211,153,.3)' : 'rgba(255,255,255,.06)' }}/>}
                </React.Fragment>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns: mode === 'video' ? '1fr 1fr' : '1fr', gap:18 }}>
              {/* Question + controls */}
              <div className="glass" style={{ borderRadius:22, padding:24 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--muted2)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>
                  Question {questionIdx + 1} of {questions.length}
                </div>
                <h2 style={{ fontFamily:'var(--f-display)', fontSize:20, fontWeight:800, lineHeight:1.3, marginBottom:20 }}>
                  {questions[questionIdx]}
                </h2>

                {/* Timer */}
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8,
                    background: isRecording ? 'rgba(251,113,133,.12)' : 'rgba(255,255,255,.06)',
                    border: `1px solid ${isRecording ? 'rgba(251,113,133,.25)' : 'rgba(255,255,255,.08)'}` }}>
                    {isRecording && <span style={{ width:8, height:8, borderRadius:'50%', background:'#FB7185', animation:'pulse 1.5s infinite' }}/>}
                    <Clock size={13} style={{ color: isRecording ? '#FB7185' : 'var(--muted)' }}/>
                    <span style={{ fontSize:14, fontWeight:700, fontFamily:'var(--f-display)', color: isRecording ? '#FCA5A5' : 'var(--muted)' }}>
                      {formatTime(elapsed)}
                    </span>
                  </div>
                  <span style={{ fontSize:12, color:'var(--muted)' }}>
                    {isRecording ? 'Recording... speak clearly' : 'Click record to begin'}
                  </span>
                </div>

                {/* Controls */}
                <div style={{ display:'flex', gap:10 }}>
                  {!isRecording ? (
                    <button className="btn-primary" onClick={startRecording} style={{ flex:1 }}>
                      {mode === 'video' ? <Video size={16}/> : <Mic size={16}/>} Start Recording
                    </button>
                  ) : (
                    <>
                      <button className="btn-ghost" onClick={stopRecording} style={{ flex:1, borderColor:'rgba(251,113,133,.3)', color:'#FCA5A5' }}>
                        <Square size={14}/> Stop
                      </button>
                      <button className="btn-primary" onClick={submitAnswer} style={{ flex:1 }}>
                        <CheckCircle2 size={14}/> {questionIdx < questions.length - 1 ? 'Submit & Next' : 'Submit & Analyze'}
                      </button>
                    </>
                  )}
                </div>

                {/* Live transcript */}
                <div style={{ marginTop:18 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--muted2)', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>
                    <MessageSquare size={11} style={{ display:'inline', marginRight:4 }}/> Live Transcript
                  </div>
                  <div style={{
                    minHeight:100, maxHeight:180, overflowY:'auto', padding:14, borderRadius:14,
                    background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)',
                    fontSize:13.5, lineHeight:1.65, color: transcript ? 'var(--text2)' : 'var(--muted2)',
                  }}>
                    {transcript || 'Your speech will appear here in real-time as you speak...'}
                  </div>
                </div>
              </div>

              {/* Video preview */}
              {mode === 'video' && (
                <div className="glass" style={{ borderRadius:22, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', minHeight:320, background:'#000' }}>
                  <video ref={videoRef} autoPlay muted playsInline style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:22 }}/>
                  {!stream && <div style={{ position:'absolute', color:'var(--muted)', fontSize:13 }}>Camera preview</div>}
                </div>
              )}
            </div>

            {/* Previous answers */}
            {allTranscripts.length > 0 && (
              <div className="glass" style={{ borderRadius:18, padding:18, marginTop:16 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--muted2)', marginBottom:10 }}>Previous Answers</div>
                {allTranscripts.map((t, i) => (
                  <div key={i} style={{ padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,.06)', fontSize:12 }}>
                    <div style={{ fontWeight:700, color:'var(--text2)', marginBottom:3 }}>Q{i+1}: {t.question}</div>
                    <div style={{ color:'var(--muted)', lineHeight:1.5 }}>{t.answer.substring(0, 150)}{t.answer.length > 150 ? '...' : ''}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── ANALYSIS ── */}
        {phase === 'analysis' && (
          <motion.div key="analysis" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <div className="pill" style={{ marginBottom:12 }}><Award size={13}/> Assessment Complete</div>
            <h1 style={{ fontFamily:'var(--f-display)', fontSize:'clamp(28px,4vw,42px)', fontWeight:900, letterSpacing:'-1.5px', margin:'0 0 8px' }}>
              Interview Analysis & Scorecard
            </h1>
            <p style={{ color:'var(--muted)', fontSize:14, marginBottom:28 }}>
              AI-generated analysis based on transcription of {allTranscripts.length} responses.
            </p>

            <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:20 }}>
              {/* Score ring */}
              <div className="glass" style={{ borderRadius:22, padding:28, textAlign:'center' }}>
                <ScoreRing score={getFinalScore(scores)} color={getRecommendation(getFinalScore(scores)).color} />
                <div style={{ marginTop:14 }}>
                  <span style={{
                    display:'inline-block', padding:'6px 14px', borderRadius:99, fontSize:13, fontWeight:800,
                    background: getRecommendation(getFinalScore(scores)).bg,
                    color: getRecommendation(getFinalScore(scores)).color,
                    border: `1px solid ${getRecommendation(getFinalScore(scores)).color}33`,
                  }}>
                    {getRecommendation(getFinalScore(scores)).label}
                  </span>
                </div>
                <div style={{ marginTop:16, fontSize:12, color:'var(--muted)', lineHeight:1.6 }}>
                  Final weighted score across {METRICS.length} professional metrics.
                </div>
              </div>

              {/* Metric bars */}
              <div className="glass" style={{ borderRadius:22, padding:24 }}>
                <h3 style={{ fontFamily:'var(--f-display)', fontSize:16, fontWeight:800, marginBottom:18 }}>
                  <BarChart3 size={16} style={{ display:'inline', marginRight:6, color:'var(--cyan)' }}/> Metric Breakdown
                </h3>
                {scores.map((s, i) => <MetricBar key={s.key} metric={s} delay={i * .08} />)}
              </div>
            </div>

            {/* Transcript review */}
            <div className="glass" style={{ borderRadius:22, padding:24, marginTop:18 }}>
              <h3 style={{ fontFamily:'var(--f-display)', fontSize:16, fontWeight:800, marginBottom:16 }}>
                <MessageSquare size={16} style={{ display:'inline', marginRight:6 }}/> Full Transcript Review
              </h3>
              {allTranscripts.map((t, i) => (
                <motion.div key={i} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*.1 }}
                  style={{ padding:'14px 0', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'#60A5FA', marginBottom:4 }}>
                    Question {i+1} — {t.mode === 'video' ? '🎥 Video' : '🎤 Audio'}
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--text2)', marginBottom:6 }}>{t.question}</div>
                  <div style={{ fontSize:13, color:'var(--muted)', lineHeight:1.65, padding:'10px 14px', borderRadius:12,
                    background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)' }}>
                    {t.answer || <em style={{ color:'var(--muted2)' }}>No response captured</em>}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display:'flex', gap:12, marginTop:20 }}>
              <button className="btn-ghost" onClick={() => { setPhase('setup'); setQuestionIdx(0); setAllTranscripts([]); setScores([]); setTranscript(''); }}>
                <RefreshCw size={14}/> Retake Assessment
              </button>
              <button className="btn-primary" onClick={() => go?.('/client')}>
                Back to Dashboard <ArrowRight size={14}/>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </section>
  );
}
