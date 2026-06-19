/**
 * EmptyState — Book My Interview Design System
 *
 * Renders a beautiful empty state with icon, title, description, and optional CTA.
 *
 * Props API:
 *   icon        : ReactNode  — icon to display (default: inbox icon)
 *   title       : string     — main heading
 *   description : string     — supporting text (optional)
 *   action      : ReactNode  — CTA button or link (optional)
 *   size        : 'sm' | 'md' | 'lg'  (default: 'md')
 *   className   : string
 *
 * Usage:
 *   <EmptyState
 *     icon={<BriefcaseBusiness />}
 *     title="No jobs yet"
 *     description="Create your first job opening to start sourcing candidates."
 *     action={<Button onClick={() => go('/intake')}>Create job</Button>}
 *   />
 *
 *   <EmptyState size="sm" title="No events" description="Filters returned no results." />
 */

import React from 'react';
import './EmptyState.css';

const DEFAULT_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 7h18M3 12h18M3 17h9"/>
    <circle cx="19" cy="17" r="3"/>
    <path d="M19 15v2l1 1"/>
  </svg>
);

export function EmptyState({
  icon,
  title,
  description,
  action,
  size = 'md',
  className = '',
}) {
  return (
    <div
      className={`bmi-empty bmi-empty--${size} ${className}`}
      role="status"
      aria-label={title}
    >
      <div className="bmi-empty__icon" aria-hidden="true">
        {icon ?? DEFAULT_ICON}
      </div>
      <p className="bmi-empty__title">{title}</p>
      {description && (
        <p className="bmi-empty__desc">{description}</p>
      )}
      {action && (
        <div className="bmi-empty__action">{action}</div>
      )}
    </div>
  );
}
