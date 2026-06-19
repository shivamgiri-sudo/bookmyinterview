import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authClient } from './authClient.js';
import {
  ArrowRight, ShieldCheck, Sparkles, UserRoundCheck,
  Lock, Mail, User, Building2, Globe2,
  AlertCircle, CheckCircle2, Eye, EyeOff,
} from 'lucide-react';
import './auth.css';

const ROLES = [
  { id:'superadmin',    label:'Superadmin',     color:'#FCD34D' },
  { id:'platform_admin',label:'Platform Admin',  color:'#38BDF8' },
  { id:'client_admin',  label:'Client Admin',    color:'#34D399' },
  { id:'hiring_manager',label:'Hiring Manager',  color:'#A78BFA' },
  { id:'candidate',     label:'Candidate',       color:'#F472B6' },
  { id:'auditor',       label:'Auditor',         color:'#FB923C' },
];

const ROLE_ACCESS = {
  superadmin:    'Full system access — all modules, vault, compliance',
  platform_admin:'Tenant mgmt, workspace, integrations, ops monitor',
  client_admin:  'Job creation, talent, assessments, reports',
  hiring_manager:'Candidate review, interviews, insights',
  candidate:     'Assessment flow, interview booking, profile',
  auditor:       'Audit logs, compliance reports, status board',
};

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const item    = {
  initial:  { opacity:0, y:12 },
  animate:  { opacity:1, y:0, transition:{ duration:.4, ease:[.22,1,.36,1] } },
};

export default function AuthPage({ onSession }) {
  const [mode,    setMode]    = useState('login');
  const [form,    setForm]    = useState({
    email:'', password:'', full_name:'', role:'client_admin', tenant_name:'My Company', tenant_region:'global',
  });
  const [status,  setStatus]  = useState({ type:'info', msg:'Sign in or create an account to get started.' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setStatus({ type:'error', msg:'Email and password are required.' });
      return;
    }
    setLoading(true);
    try {
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : form;
      const session = mode === 'login'
        ? await authClient.login(payload)
        : await authClient.register(payload);
      authClient.save(session);
      setStatus({ type:'success', msg:'Authenticated. Loading workspace…' });
      onSession(session);
    } catch {
      setStatus({ type:'error', msg:'Authentication failed. Check credentials or backend status.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      {/* ── LEFT VISUAL PANEL ── */}
      <motion.div
        className="auth-visual"
        initial={{ opacity:0, x:-24 }}
        animate={{ opacity:1, x:0 }}
        transition={{ duration:.55, ease:[.22,1,.36,1] }}
      >
        {/* Brand */}
        <div className="auth-visual-brand">
          <div className="auth-visual-mark">BMI</div>
          <div>
            <span>Book My Interview</span>
            <small>AI Hiring Operating System</small>
          </div>
        </div>

        {/* Headline */}
        <div className="auth-visual-headline">
          <motion.h1
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay:.15, duration:.6, ease:[.22,1,.36,1] }}
          >
            Hire smarter.<br />Move faster.<br />Decide confidently.
          </motion.h1>
          <motion.p
            initial={{ opacity:0 }}
            animate={{ opacity:1 }}
            transition={{ delay:.3, duration:.5 }}
          >
            AI-powered intake, dynamic assessments, explainable scorecards,
            compliance controls — all in one enterprise hiring platform.
          </motion.p>

          {/* Role chips */}
          <motion.div
            className="auth-role-grid"
            style={{ marginTop: 28 }}
            variants={stagger} initial="initial" animate="animate"
          >
            {ROLES.map(r => (
              <motion.div key={r.id} variants={item} className="auth-role-chip">
                <span style={{ width:7, height:7, borderRadius:'50%', background:r.color, flexShrink:0 }} />
                {r.label}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Stats */}
        <div className="auth-stats">
          {[['500+','Role types'],['5','AI engines'],['100%','Audit coverage'],['Global','Multi-region']].map(([v,l])=>(
            <div className="auth-stat" key={l}>
              <b>{v}</b><span>{l}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── RIGHT FORM PANEL ── */}
      <motion.div
        className="auth-form-panel"
        initial={{ opacity:0, x:24 }}
        animate={{ opacity:1, x:0 }}
        transition={{ duration:.55, ease:[.22,1,.36,1] }}
      >
        <div className="auth-form-head">
          <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p>{mode === 'login' ? 'Sign in to your workspace.' : 'Register a new account and tenant.'}</p>
        </div>

        {/* Mode toggle */}
        <div className="auth-mode-toggle">
          <button className={`auth-mode-btn${mode==='login'?' active':''}`} onClick={()=>setMode('login')}>
            Sign In
          </button>
          <button className={`auth-mode-btn${mode==='register'?' active':''}`} onClick={()=>setMode('register')}>
            Register
          </button>
        </div>

        {/* Status */}
        <AnimatePresence mode="wait">
          <motion.div
            key={status.msg}
            className={`auth-status ${status.type}`}
            initial={{ opacity:0, height:0 }}
            animate={{ opacity:1, height:'auto' }}
            exit={{ opacity:0, height:0 }}
            transition={{ duration:.22 }}
          >
            {status.type === 'error'   && <AlertCircle  size={15} />}
            {status.type === 'success' && <CheckCircle2 size={15} />}
            {status.type === 'info'    && <Sparkles     size={15} />}
            {status.msg}
          </motion.div>
        </AnimatePresence>

        <form onSubmit={submit}>
          {/* Email */}
          <div className="auth-field">
            <label>Email address</label>
            <div style={{ position:'relative' }}>
              <Mail size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--muted2)', pointerEvents:'none' }} />
              <input
                type="email" placeholder="you@company.com"
                value={form.email} onChange={e=>set('email',e.target.value)}
                style={{ paddingLeft:36 }}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label>Password</label>
            <div style={{ position:'relative' }}>
              <Lock size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--muted2)', pointerEvents:'none' }} />
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password} onChange={e=>set('password',e.target.value)}
                style={{ paddingLeft:36, paddingRight:40 }}
                autoComplete={mode==='login'?'current-password':'new-password'}
              />
              <button
                type="button"
                onClick={()=>setShowPwd(s=>!s)}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'transparent', border:0, color:'var(--muted2)', cursor:'pointer', padding:2 }}
                aria-label={showPwd?'Hide password':'Show password'}
              >
                {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>

          {/* Register-only fields */}
          <AnimatePresence>
            {mode === 'register' && (
              <motion.div
                initial={{ opacity:0, height:0 }}
                animate={{ opacity:1, height:'auto' }}
                exit={{ opacity:0, height:0 }}
                transition={{ duration:.3, ease:[.22,1,.36,1] }}
              >
                <div className="auth-field">
                  <label>Full name</label>
                  <div style={{ position:'relative' }}>
                    <User size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--muted2)', pointerEvents:'none' }} />
                    <input
                      placeholder="Your full name"
                      value={form.full_name} onChange={e=>set('full_name',e.target.value)}
                      style={{ paddingLeft:36 }}
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label>Role</label>
                  <div className="role-selector">
                    {ROLES.map(r=>(
                      <button
                        key={r.id} type="button"
                        className={`role-option${form.role===r.id?' selected':''}`}
                        onClick={()=>set('role',r.id)}
                        style={form.role===r.id?{ borderColor:`${r.color}66`, background:`${r.color}18`, color:r.color }:{}}
                      >
                        <span style={{ width:6,height:6,borderRadius:'50%',background:r.color,flexShrink:0 }}/>
                        {r.label}
                      </button>
                    ))}
                  </div>
                  {form.role && (
                    <p style={{ fontSize:12, color:'var(--muted)', marginTop:6, lineHeight:1.5 }}>
                      {ROLE_ACCESS[form.role]}
                    </p>
                  )}
                </div>

                <div className="auth-field">
                  <label>Company / Tenant name</label>
                  <div style={{ position:'relative' }}>
                    <Building2 size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--muted2)', pointerEvents:'none' }} />
                    <input
                      placeholder="Your company name"
                      value={form.tenant_name} onChange={e=>set('tenant_name',e.target.value)}
                      style={{ paddingLeft:36 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            className="auth-submit"
            disabled={loading}
            whileTap={{ scale:.98 }}
          >
            {loading ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:'spin 1s linear infinite' }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            ) : (
              <>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </form>

        <div className="auth-switch">
          {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
          <button onClick={()=>{ setMode(m=>m==='login'?'register':'login'); setStatus({type:'info',msg:'Switch mode.'}); }}>
            {mode === 'login' ? 'Register now' : 'Sign in'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
