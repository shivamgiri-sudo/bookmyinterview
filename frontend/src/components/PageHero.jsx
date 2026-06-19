/**
 * PageHero — Book My Interview Design System
 *
 * A premium full-width hero banner for internal pages (non-landing-page views).
 *
 * Props API:
 *   eyebrow     : string — small label above title (e.g. "Live SaaS workspace")
 *   eyebrowIcon : ReactNode — icon before eyebrow text
 *   title       : string | ReactNode — main headline
 *   subtitle    : string — supporting paragraph
 *   actions     : ReactNode — buttons on the left/center
 *   sidePanel   : ReactNode — content on the right side (status card, KPI, etc.)
 *   gradient    : 'cyan-gold' | 'gold-violet' | 'violet-cyan'  (default: 'cyan-gold')
 *   className   : string
 *
 * Usage:
 *   <PageHero
 *     eyebrow="Live SaaS workspace"
 *     eyebrowIcon={<DatabaseZap size={16} />}
 *     title="Create tenants, jobs, talent, and assessment paths."
 *     subtitle="Works in demo mode when backend is offline."
 *     actions={<Button onClick={load}>Refresh</Button>}
 *     sidePanel={<StatusCard mode={mode} message={message} />}
 *   />
 */

import React from 'react';
import './PageHero.css';

const GRADIENTS = {
  'cyan-gold':    'radial-gradient(circle at 70% 20%, rgba(103,232,249,.18), transparent 40%), radial-gradient(circle at 15% 80%, rgba(246,196,83,.14), transparent 40%)',
  'gold-violet':  'radial-gradient(circle at 70% 20%, rgba(246,196,83,.18), transparent 40%), radial-gradient(circle at 15% 80%, rgba(167,139,250,.14), transparent 40%)',
  'violet-cyan':  'radial-gradient(circle at 70% 20%, rgba(167,139,250,.18), transparent 40%), radial-gradient(circle at 15% 80%, rgba(103,232,249,.14), transparent 40%)',
};

export function PageHero({
  eyebrow,
  eyebrowIcon,
  title,
  subtitle,
  actions,
  sidePanel,
  gradient = 'cyan-gold',
  className = '',
}) {
  return (
    <div
      className={`bmi-page-hero glass ${className}`}
      style={{ '--hero-gradient': GRADIENTS[gradient] }}
    >
      <div className="bmi-page-hero__bg" aria-hidden="true" />
      <div className="bmi-page-hero__main">
        {eyebrow && (
          <div className="bmi-page-hero__eyebrow">
            {eyebrowIcon && <span aria-hidden="true">{eyebrowIcon}</span>}
            {eyebrow}
          </div>
        )}
        {title && (
          typeof title === 'string'
            ? <h1 className="bmi-page-hero__title">{title}</h1>
            : <div className="bmi-page-hero__title">{title}</div>
        )}
        {subtitle && (
          <p className="bmi-page-hero__subtitle">{subtitle}</p>
        )}
        {actions && (
          <div className="bmi-page-hero__actions">{actions}</div>
        )}
      </div>
      {sidePanel && (
        <div className="bmi-page-hero__side">{sidePanel}</div>
      )}
    </div>
  );
}
