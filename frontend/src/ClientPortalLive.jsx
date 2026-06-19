/**
 * ClientPortalLive — Premium enterprise dashboard
 * Animated KPI cards, data tables, status indicators, count-up numbers
 */
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { secureApi } from './secureApi.js';
import {
  BriefcaseBusiness, CalendarCheck, RefreshCw, Sparkles,
  TrendingUp, Users, Activity, ArrowUpRight, Clock,
  CheckCircle2, AlertCircle, MoreHorizontal, ExternalLink,
} from 'lucide-react';

/* ─── Count-up hook ─── */
function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0);
  const frame = useRef(null);
  useEffect(() => {
    if (!target) return;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * ease));
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);
  return val;
}

/* ─── KPI Card ─── */
function KpiCard({ icon:Icon, label, value, sub, color, delay }) {
  const count = useCountUp(typeof value === 'number' ? value : 0);
  return (
    <motion.div
      initial={{ opacity:0, y:20 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay, duration:.45, ease:[.22,1,.36,1] }}
      whileHover={{ y:-6, transition:{ duration:.25 } }}
      className="glass"
      style={{ borderRadius:22, padding:22, cursor:'default', position:'relative', overflow:'hidden' }}
    >
      <div style={{ position:'absolute', top:-20, right:-20, width:100, height:100, borderRadius:'50%', background:`${color}12`, pointerEvents:'none' }}/>
      <div style={{ width:42, height:42, borderRadius:13, background:`${color}18`, border:`1px solid ${color}33`, display:'grid', placeItems:'center', color, marginBottom:14 }}>
        <Icon size={18}/>
      </div>
      <div style={{ fontFamily:'var(--f-display)', fontSize:34, fontWeight:900, letterSpacing:'-1.5px', lineHeight:1 }}>
        {typeof value === 'number' ? count : value}
      </div>
      <div style={{ color:'var(--muted)', fontSize:13, marginTop:6 }}>{label}</div>
      {sub && <div style={{ fontSize:12, color, marginTop:4, fontWeight:600 }}>{sub}</div>}
    </motion.div>
  );
}

/* ─── Status pill ─── */
function StatusPill({ status }) {
  const cfg = {
    active:   { bg:'rgba(52,211,153,.12)', color:'#34D399', border:'rgba(52,211,153,.25)', label:'Active' },
    pending:  { bg:'rgba(252,211,77,.12)', color:'#FCD34D', border:'rgba(252,211,77,.25)', label:'Pending' },
    unknown:  { bg:'rgba(255,255,255,.07)', color:'var(--muted)', border:'rgba(255,255,255,.12)', label:'Unknown' },
    granted:  { bg:'rgba(52,211,153,.12)', color:'#34D399', border:'rgba(52,211,153,.25)', label:'Consented' },
  };
  const s = cfg[status] || cfg.unknown;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:99, fontSize:11, fontWeight:700, background:s.bg, border:`1px solid ${s.border}`, color:s.color }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:s.color }}/>
      {s.label}
    </span>
  );
}

/* ─── Empty state ─── */
function Empty({ icon:Icon, text }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 20px', color:'var(--muted)', gap:10 }}>
      <Icon size={32} style={{ opacity:.3 }}/>
      <p style={{ fontSize:13, margin:0 }}>{text}</p>
    </div>
  );
}

/* ─── Table row ─── */
function TRow({ cells, delay }) {
  return (
    <motion.tr
      initial={{ opacity:0, x:-8 }}
      animate={{ opacity:1, x:0 }}
      transition={{ delay, duration:.3, ease:[.22,1,.36,1] }}
      style={{ borderBottom:'1px solid rgba(255,255,255,.06)' }}
    >
      {cells.map((c,i)=>(
        <td key={i} style={{ padding:'13px 14px', fontSize:13, color: i===0 ? 'var(--text)' : 'var(--muted)', fontWeight: i===0 ? 600 : 400 }}>
          {c}
        </td>
      ))}
    </motion.tr>
  );
}

/* ─── Main ─── */
export default function ClientPortalLive() {
  const [overview, setOverview] = useState({ jobs:0, candidates:0, assessments:0, role:'—' });
  const [jobs,     setJobs]     = useState([]);
  const [talent,   setTalent]   = useState([]);
  const [mode,     setMode]     = useState('loading');

  async function load() {
    setMode('loading');
    try {
      const [ov, js, tl] = await Promise.all([secureApi.overview(), secureApi.jobs(), secureApi.talent()]);
      setOverview(ov); setJobs(js); setTalent(tl); setMode('live');
    } catch {
      setOverview({ jobs:3, candidates:12, assessments:7, role:'demo' });
      setJobs([
        { id:1, designation:'Sales Manager', location:'Dubai', status:'active', created_at:'2026-06-01' },
        { id:2, designation:'HR Business Partner', location:'Mumbai', status:'pending', created_at:'2026-06-10' },
        { id:3, designation:'Voice Process Lead', location:'Hyderabad', status:'active', created_at:'2026-06-15' },
      ]);
      setTalent([
        { id:1, full_name:'Priya Mehta', location:'Dubai', consent_status:'granted' },
        { id:2, full_name:'Rahul Shah', location:'Mumbai', consent_status:'pending' },
      ]);
      setMode('demo');
    }
  }

  useEffect(() => { load(); }, []);

  const kpis = [
    { icon:BriefcaseBusiness, label:'Active Jobs',    value:overview.jobs,       color:'#38BDF8', sub:'Tenant-scoped' },
    { icon:Users,             label:'Talent Pool',    value:overview.candidates, color:'#A78BFA', sub:'Candidates tracked' },
    { icon:CalendarCheck,     label:'Assessments',    value:overview.assessments,color:'#34D399', sub:'Paths generated' },
    { icon:Sparkles,          label:'Access Role',    value:overview.role,       color:'#FCD34D', sub:'RBAC session' },
  ];

  return (
    <section className="page" style={{ padding:'40px 0 80px' }}>
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity:0, y:20 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:.45, ease:[.22,1,.36,1] }}
        style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:32, flexWrap:'wrap', gap:16 }}
      >
        <div>
          <div className="pill" style={{ marginBottom:12 }}>
            <Activity size={13}/>
            {mode === 'live' ? 'Live Data — Secure Workspace' : mode === 'demo' ? 'Demo Mode — Backend offline' : 'Loading…'}
          </div>
          <h1 style={{ fontFamily:'var(--f-display)', fontSize:'clamp(32px,4vw,50px)', fontWeight:900, letterSpacing:'-2px', lineHeight:.95, margin:'0 0 12px',
            background:'linear-gradient(180deg,#fff,#BAD5FF 55%,#A78BFA)', WebkitBackgroundClip:'text', backgroundClip:'text', color:'transparent' }}>
            Client Command Center
          </h1>
          <p style={{ color:'var(--muted)', fontSize:16, maxWidth:540 }}>
            Tenant-scoped jobs, talent pipeline, and assessment visibility — powered by secure workspace APIs.
          </p>
        </div>
        <motion.button
          className="btn-ghost"
          onClick={load}
          whileTap={{ scale:.95 }}
        >
          <RefreshCw size={15} style={mode==='loading'?{ animation:'spin 1s linear infinite' }:{}}/>
          Refresh
        </motion.button>
      </motion.div>

      {/* ── KPI Grid ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
        {kpis.map((k,i) => <KpiCard key={k.label} {...k} delay={i*0.08}/>)}
      </div>

      {/* ── Data panels ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Jobs table */}
        <motion.div
          className="glass"
          initial={{ opacity:0, y:16 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay:.3, duration:.45, ease:[.22,1,.36,1] }}
          style={{ borderRadius:22, overflow:'hidden' }}
        >
          <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontFamily:'var(--f-display)', fontSize:15, fontWeight:800 }}>Scoped Jobs</div>
            <BriefcaseBusiness size={16} style={{ color:'var(--cyan)' }}/>
          </div>
          {jobs.length ? (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(255,255,255,.06)' }}>
                  {['Position','Location','Status'].map(h=>(
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:'var(--muted2)', textTransform:'uppercase', letterSpacing:'1px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map((j,i)=>(
                  <TRow key={j.id} delay={i*.06} cells={[
                    j.designation,
                    j.location || 'Remote',
                    <StatusPill key="s" status={j.status}/>,
                  ]}/>
                ))}
              </tbody>
            </table>
          ) : (
            <Empty icon={BriefcaseBusiness} text="No scoped jobs yet"/>
          )}
        </motion.div>

        {/* Talent table */}
        <motion.div
          className="glass"
          initial={{ opacity:0, y:16 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay:.38, duration:.45, ease:[.22,1,.36,1] }}
          style={{ borderRadius:22, overflow:'hidden' }}
        >
          <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontFamily:'var(--f-display)', fontSize:15, fontWeight:800 }}>Talent Pool</div>
            <Users size={16} style={{ color:'var(--violet)' }}/>
          </div>
          {talent.length ? (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(255,255,255,.06)' }}>
                  {['Name','Location','Consent'].map(h=>(
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:'var(--muted2)', textTransform:'uppercase', letterSpacing:'1px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {talent.map((t,i)=>(
                  <TRow key={t.id} delay={i*.06} cells={[
                    t.full_name,
                    t.location || 'Remote',
                    <StatusPill key="s" status={t.consent_status}/>,
                  ]}/>
                ))}
              </tbody>
            </table>
          ) : (
            <Empty icon={Users} text="No talent records yet"/>
          )}
        </motion.div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </section>
  );
}
