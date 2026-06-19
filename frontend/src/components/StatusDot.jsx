/**
 * StatusDot — Book My Interview Design System
 *
 * A simple live indicator dot, used inline next to status text.
 *
 * Props API:
 *   status  : 'active' | 'idle' | 'error' | 'warning' | 'offline'  (default: 'active')
 *   pulse   : boolean — animate with pulse                           (default: true for active)
 *   size    : 'sm' | 'md' | 'lg'                                    (default: 'md')
 *   label   : string — accessible label
 *
 * Usage:
 *   <StatusDot status="active" /> Live
 *   <StatusDot status="error" pulse={false} /> Offline
 */

import React from 'react';
import './StatusDot.css';

const COLOR = {
  active:  '#34D399',
  idle:    '#F6C453',
  warning: '#F6C453',
  error:   '#FB7185',
  offline: '#475569',
};

export function StatusDot({
  status = 'active',
  pulse,
  size = 'md',
  label,
}) {
  const shouldPulse = pulse ?? status === 'active';
  const color = COLOR[status] ?? COLOR.offline;

  return (
    <span
      className={[
        'bmi-status-dot',
        `bmi-status-dot--${size}`,
        shouldPulse ? 'bmi-status-dot--pulse' : '',
      ].filter(Boolean).join(' ')}
      style={{ '--dot-color': color }}
      role="img"
      aria-label={label ?? `Status: ${status}`}
    />
  );
}
