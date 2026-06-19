import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Video, Clock, User, Mail, ArrowRight, CheckCircle2,
  Plus, RefreshCw, ExternalLink, Trash2, ChevronLeft, ChevronRight,
  MapPin, LinkIcon, Sparkles, AlertCircle,
} from 'lucide-react';

/* ═══ Google Calendar + Meet helpers ═══ */
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const DISCOVERY = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

let gapiLoaded = false;
let gisLoaded = false;
let tokenClient = null;

function loadGapi() {
  return new Promise((resolve) => {
    if (gapiLoaded) return resolve();
    const s = document.createElement('script');
    s.src = 'https://apis.google.com/js/api.js';
    s.onload = () => { window.gapi.load('client', async () => {
      await window.gapi.client.init({ discoveryDocs: [DISCOVERY] });
      gapiLoaded = true; resolve();
    }); };
    document.head.appendChild(s);
  });
}

function loadGis(clientId) {
  return new Promise((resolve) => {
    if (gisLoaded) return resolve();
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.onload = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId, scope: SCOPES, callback: () => {},
      });
      gisLoaded = true; resolve();
    };
    document.head.appendChild(s);
  });
}

function requestToken() {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject(new Error('GIS not loaded'));
    tokenClient.callback = (resp) => resp.error ? reject(resp) : resolve(resp);
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

async function createCalendarEvent({ title, description, startISO, endISO, attendees }) {
  const event = {
    summary: title,
    description,
    start: { dateTime: startISO, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    end: { dateTime: endISO, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    attendees: attendees.map(e => ({ email: e })),
    conferenceData: {
      createRequest: { requestId: `bmi-${Date.now()}`, conferenceSolutionKey: { type: 'hangoutsMeet' } },
    },
    reminders: { useDefault: false, overrides: [{ method: 'email', minutes: 30 }, { method: 'popup', minutes: 10 }] },
  };
  const resp = await window.gapi.client.calendar.events.insert({
    calendarId: 'primary', resource: event, conferenceDataVersion: 1, sendUpdates: 'all',
  });
  return resp.result;
}

/* ═══ Demo data ═══ */
const DEMO_INTERVIEWS = [
  { id:1, title:'Sales Manager — Round 1', candidate:'Priya Mehta', candidateEmail:'priya@example.com',
    client:'Hiring Manager', clientEmail:'hm@mascallnet.com', date:'2026-06-20', time:'10:00',
    duration:45, status:'confirmed', meetLink:'https://meet.google.com/abc-defg-hij' },
  { id:2, title:'Voice Process Lead — Final', candidate:'Rahul Shah', candidateEmail:'rahul@example.com',
    client:'VP Operations', clientEmail:'vpops@mascallnet.com', date:'2026-06-21', time:'14:30',
    duration:60, status:'pending', meetLink:null },
];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

/* ═══ Mini Calendar ═══ */
function MiniCalendar({ selected, onSelect }) {
  const [viewDate, setViewDate] = useState(new Date());
  const year = viewDate.getFullYear(), month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <button onClick={() => setViewDate(new Date(year, month-1))} style={{ background:'transparent', border:0, color:'var(--muted)', cursor:'pointer', padding:4 }}>
          <ChevronLeft size={16}/>
        </button>
        <span style={{ fontSize:14, fontWeight:700 }}>{MONTHS[month]} {year}</span>
        <button onClick={() => setViewDate(new Date(year, month+1))} style={{ background:'transparent', border:0, color:'var(--muted)', cursor:'pointer', padding:4 }}>
          <ChevronRight size={16}/>
        </button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, textAlign:'center' }}>
        {DAYS.map(d => <div key={d} style={{ fontSize:10, fontWeight:700, color:'var(--muted2)', padding:4 }}>{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`}/>;
          const iso = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          const isToday = iso === today;
          const isSel = iso === selected;
          return (
            <button key={i} onClick={() => onSelect(iso)} style={{
              width:32, height:32, borderRadius:8, border: isSel ? '1px solid rgba(0,122,255,.4)' : '1px solid transparent',
              background: isSel ? 'rgba(0,122,255,.18)' : isToday ? 'rgba(255,255,255,.08)' : 'transparent',
              color: isSel ? '#60A5FA' : isToday ? '#fff' : 'var(--text2)',
              cursor:'pointer', font:'inherit', fontSize:13, fontWeight: isSel || isToday ? 700 : 400,
              transition:'all .15s',
            }}>
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══ Status pill ═══ */
function StatusPill({ status }) {
  const cfg = {
    confirmed: { bg:'rgba(52,211,153,.12)', color:'#34D399', border:'rgba(52,211,153,.25)', label:'Confirmed' },
    pending:   { bg:'rgba(252,211,77,.12)',  color:'#FCD34D', border:'rgba(252,211,77,.25)',  label:'Pending' },
    cancelled: { bg:'rgba(251,113,133,.12)', color:'#FB7185', border:'rgba(251,113,133,.25)', label:'Cancelled' },
  };
  const s = cfg[status] || cfg.pending;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:99, fontSize:11, fontWeight:700,
      background:s.bg, border:`1px solid ${s.border}`, color:s.color }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:s.color }}/> {s.label}
    </span>
  );
}

/* ═══ MAIN ═══ */
export default function InterviewScheduler({ go }) {
  const [interviews, setInterviews] = useState(DEMO_INTERVIEWS);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [googleAuth, setGoogleAuth] = useState(false);
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState({
    title: '', candidate: '', candidateEmail: '', client: '', clientEmail: '',
    date: '', time: '10:00', duration: 45,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const dayInterviews = interviews.filter(iv => iv.date === selectedDate);

  // Google auth
  async function connectGoogle() {
    try {
      const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!CLIENT_ID) {
        setStatus({ type:'info', msg:'Set VITE_GOOGLE_CLIENT_ID in .env to enable Google Calendar. Using demo mode.' });
        setGoogleAuth(true); return;
      }
      await loadGapi();
      await loadGis(CLIENT_ID);
      await requestToken();
      setGoogleAuth(true);
      setStatus({ type:'success', msg:'Google Calendar connected!' });
    } catch {
      setGoogleAuth(true);
      setStatus({ type:'info', msg:'Demo mode — Google credentials not configured.' });
    }
  }

  // Create interview
  async function scheduleInterview(e) {
    e.preventDefault();
    if (!form.title || !form.candidateEmail || !form.date || !form.time) {
      setStatus({ type:'error', msg:'Fill all required fields.' }); return;
    }
    setCreating(true);
    const startISO = `${form.date}T${form.time}:00`;
    const endDate = new Date(new Date(startISO).getTime() + form.duration * 60000);
    const endISO = endDate.toISOString();

    let meetLink = null;
    try {
      if (gapiLoaded && window.gapi?.client?.calendar) {
        const event = await createCalendarEvent({
          title: `[BMI] ${form.title}`,
          description: `Interview scheduled via Book My Interview\nCandidate: ${form.candidate}\nClient: ${form.client}`,
          startISO, endISO,
          attendees: [form.candidateEmail, form.clientEmail].filter(Boolean),
        });
        meetLink = event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || null;
        setStatus({ type:'success', msg:`Event created! Meet link: ${meetLink || 'pending'}` });
      } else {
        meetLink = `https://meet.google.com/bmi-${Date.now().toString(36)}`;
        setStatus({ type:'success', msg:`Interview scheduled (demo). Meet: ${meetLink}` });
      }
    } catch {
      meetLink = `https://meet.google.com/bmi-${Date.now().toString(36)}`;
      setStatus({ type:'info', msg:'Created in demo mode.' });
    }

    const newInterview = {
      id: Date.now(), title: form.title, candidate: form.candidate,
      candidateEmail: form.candidateEmail, client: form.client,
      clientEmail: form.clientEmail, date: form.date, time: form.time,
      duration: form.duration, status: 'confirmed', meetLink,
    };
    setInterviews(prev => [...prev, newInterview]);
    setShowForm(false);
    setForm({ title:'', candidate:'', candidateEmail:'', client:'', clientEmail:'', date:selectedDate, time:'10:00', duration:45 });
    setCreating(false);
  }

  useEffect(() => { setForm(f => ({ ...f, date: selectedDate })); }, [selectedDate]);

  return (
    <section className="page" style={{ maxWidth:1100, margin:'0 auto', padding:'32px 0 80px' }}>
      {/* Hero */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:28 }}>
        <div className="pill" style={{ marginBottom:12 }}><Calendar size={13}/> Interview Scheduler</div>
        <h1 style={{ fontFamily:'var(--f-display)', fontSize:'clamp(30px,4vw,46px)', fontWeight:900, letterSpacing:'-2px', lineHeight:.95, margin:'0 0 10px',
          background:'linear-gradient(180deg,#fff,#BAD5FF 55%,#A78BFA)', WebkitBackgroundClip:'text', backgroundClip:'text', color:'transparent' }}>
          Schedule with Google Meet.
        </h1>
        <p style={{ color:'var(--muted)', fontSize:15, maxWidth:520 }}>
          Book interview slots, auto-create Google Calendar events with Meet links, and notify candidates & clients.
        </p>
      </motion.div>

      {/* Google connect bar */}
      {!googleAuth && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="glass"
          style={{ borderRadius:16, padding:'14px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:12, border:'1px solid rgba(0,122,255,.2)' }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'rgba(0,122,255,.15)', display:'grid', placeItems:'center', color:'#60A5FA' }}>
            <Video size={18}/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:700 }}>Connect Google Calendar</div>
            <div style={{ fontSize:12, color:'var(--muted)' }}>Enable auto-creation of Google Meet links and calendar invites.</div>
          </div>
          <button className="btn-primary sm" onClick={connectGoogle}>Connect Google <ArrowRight size={14}/></button>
        </motion.div>
      )}

      {/* Status */}
      <AnimatePresence>
        {status && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
            style={{ marginBottom:16, padding:'10px 14px', borderRadius:10, fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:8,
              background: status.type==='error'?'rgba(251,113,133,.1)':status.type==='success'?'rgba(52,211,153,.1)':'rgba(56,189,248,.08)',
              border: `1px solid ${status.type==='error'?'rgba(251,113,133,.25)':status.type==='success'?'rgba(52,211,153,.25)':'rgba(56,189,248,.2)'}`,
              color: status.type==='error'?'#FCA5A5':status.type==='success'?'#A7F3D0':'#BAE6FD',
            }}>
            {status.type==='error'?<AlertCircle size={14}/>:status.type==='success'?<CheckCircle2 size={14}/>:<Sparkles size={14}/>}
            {status.msg}
            <button onClick={() => setStatus(null)} style={{ marginLeft:'auto', background:'transparent', border:0, color:'inherit', cursor:'pointer', fontSize:16 }}>×</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:20 }}>
        {/* Left — Calendar + actions */}
        <div>
          <div className="glass" style={{ borderRadius:20, padding:18, marginBottom:14 }}>
            <MiniCalendar selected={selectedDate} onSelect={setSelectedDate}/>
          </div>
          <button className="btn-primary" style={{ width:'100%' }} onClick={() => { setShowForm(true); if (!googleAuth) connectGoogle(); }}>
            <Plus size={15}/> New Interview
          </button>
          {googleAuth && (
            <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#34D399', fontWeight:600 }}>
              <CheckCircle2 size={12}/> Google Calendar {gapiLoaded ? 'connected' : '(demo mode)'}
            </div>
          )}
        </div>

        {/* Right — Interviews list + form */}
        <div>
          {/* Day header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <h2 style={{ fontFamily:'var(--f-display)', fontSize:18, fontWeight:800, margin:0 }}>
              {new Date(selectedDate + 'T00:00').toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
            </h2>
            <span style={{ fontSize:12, color:'var(--muted)', fontWeight:600 }}>{dayInterviews.length} interview{dayInterviews.length!==1?'s':''}</span>
          </div>

          {/* Interview cards */}
          {dayInterviews.length ? dayInterviews.map((iv, i) => (
            <motion.div key={iv.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.06 }}
              className="glass" style={{ borderRadius:18, padding:18, marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                <div>
                  <h3 style={{ fontFamily:'var(--f-display)', fontSize:15, fontWeight:800, margin:'0 0 4px' }}>{iv.title}</h3>
                  <div style={{ display:'flex', alignItems:'center', gap:12, fontSize:12, color:'var(--muted)' }}>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><Clock size={11}/> {iv.time} · {iv.duration}min</span>
                    <StatusPill status={iv.status}/>
                  </div>
                </div>
                {iv.meetLink && (
                  <a href={iv.meetLink} target="_blank" rel="noopener noreferrer" className="btn-primary sm"
                    style={{ textDecoration:'none', fontSize:12 }}>
                    <Video size={13}/> Join Meet
                  </a>
                )}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div style={{ padding:'10px 12px', borderRadius:10, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.06)' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'var(--muted2)', textTransform:'uppercase', marginBottom:4 }}>Candidate</div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{iv.candidate}</div>
                  <div style={{ fontSize:11, color:'var(--muted)' }}>{iv.candidateEmail}</div>
                </div>
                <div style={{ padding:'10px 12px', borderRadius:10, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.06)' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'var(--muted2)', textTransform:'uppercase', marginBottom:4 }}>Interviewer</div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{iv.client}</div>
                  <div style={{ fontSize:11, color:'var(--muted)' }}>{iv.clientEmail}</div>
                </div>
              </div>
              {iv.meetLink && (
                <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--muted)' }}>
                  <LinkIcon size={11}/> {iv.meetLink}
                </div>
              )}
            </motion.div>
          )) : (
            <div className="glass" style={{ borderRadius:18, padding:32, textAlign:'center' }}>
              <Calendar size={32} style={{ color:'var(--muted)', opacity:.3, marginBottom:10 }}/>
              <p style={{ color:'var(--muted)', fontSize:13, margin:0 }}>No interviews on this date.</p>
            </div>
          )}

          {/* New interview form */}
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                className="glass" style={{ borderRadius:20, padding:22, marginTop:8 }}>
                <h3 style={{ fontFamily:'var(--f-display)', fontSize:16, fontWeight:800, marginBottom:16 }}>Schedule New Interview</h3>
                <form onSubmit={scheduleInterview}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:'var(--muted2)', display:'block', marginBottom:5 }}>Interview Title *</label>
                      <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Sales Manager — Round 1"
                        style={{ width:'100%', background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, padding:'10px 12px', color:'var(--text)', font:'inherit', fontSize:13, outline:0 }}/>
                    </div>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:'var(--muted2)', display:'block', marginBottom:5 }}>Date *</label>
                      <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                        style={{ width:'100%', background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, padding:'10px 12px', color:'var(--text)', font:'inherit', fontSize:13, outline:0, colorScheme:'dark' }}/>
                    </div>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:'var(--muted2)', display:'block', marginBottom:5 }}>Candidate Name *</label>
                      <input value={form.candidate} onChange={e => set('candidate', e.target.value)} placeholder="Candidate name"
                        style={{ width:'100%', background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, padding:'10px 12px', color:'var(--text)', font:'inherit', fontSize:13, outline:0 }}/>
                    </div>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:'var(--muted2)', display:'block', marginBottom:5 }}>Candidate Email *</label>
                      <input type="email" value={form.candidateEmail} onChange={e => set('candidateEmail', e.target.value)} placeholder="candidate@email.com"
                        style={{ width:'100%', background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, padding:'10px 12px', color:'var(--text)', font:'inherit', fontSize:13, outline:0 }}/>
                    </div>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:'var(--muted2)', display:'block', marginBottom:5 }}>Interviewer Name</label>
                      <input value={form.client} onChange={e => set('client', e.target.value)} placeholder="Hiring manager name"
                        style={{ width:'100%', background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, padding:'10px 12px', color:'var(--text)', font:'inherit', fontSize:13, outline:0 }}/>
                    </div>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:'var(--muted2)', display:'block', marginBottom:5 }}>Interviewer Email</label>
                      <input type="email" value={form.clientEmail} onChange={e => set('clientEmail', e.target.value)} placeholder="interviewer@company.com"
                        style={{ width:'100%', background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, padding:'10px 12px', color:'var(--text)', font:'inherit', fontSize:13, outline:0 }}/>
                    </div>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:'var(--muted2)', display:'block', marginBottom:5 }}>Time *</label>
                      <input type="time" value={form.time} onChange={e => set('time', e.target.value)}
                        style={{ width:'100%', background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, padding:'10px 12px', color:'var(--text)', font:'inherit', fontSize:13, outline:0, colorScheme:'dark' }}/>
                    </div>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:'var(--muted2)', display:'block', marginBottom:5 }}>Duration (min)</label>
                      <select value={form.duration} onChange={e => set('duration', +e.target.value)}
                        style={{ width:'100%', background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, padding:'10px 12px', color:'var(--text)', font:'inherit', fontSize:13, outline:0 }}>
                        {[15,30,45,60,90].map(d => <option key={d} value={d}>{d} minutes</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:10, marginTop:16 }}>
                    <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={creating}>
                      {creating ? <RefreshCw size={14} style={{ animation:'spin 1s linear infinite' }}/> : <Video size={14}/>}
                      {creating ? 'Creating...' : 'Schedule with Google Meet'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </section>
  );
}
