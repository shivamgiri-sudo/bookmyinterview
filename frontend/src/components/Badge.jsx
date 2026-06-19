/**
 * Badge / StatusBadge — Book My Interview Design System
 *
 * Badge Props:
 *   variant : 'default' | 'success' | 'warning' | 'danger' | 'info' | 'violet' | 'gold'
 *   size    : 'sm' | 'md'
 *   dot     : boolean — show a live pulse dot
 *   children: ReactNode
 *
 * StatusBadge Props:
 *   status  : string — 'Connected' | 'Not configured' | 'Needs review' | 'Planned' |
 *             'Partner required' | 'Success' | 'Failed' | 'Pending' | ...
 *   size    : 'sm' | 'md'
 *
 * Usage:
 *   <Badge variant="success" dot>Live</Badge>
 *   <Badge variant="warning">Beta</Badge>
 *   <StatusBadge status="Connected" />
 *   <StatusBadge status="Needs review" />
 */

import React from 'react';
import './Badge.css';

export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  className = '',
}) {
  return (
    <span
      className={`bmi-badge bmi-badge--${variant} bmi-badge--${size} ${className}`}
      role="status"
    >
      {dot && <span className="bmi-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

const STATUS_MAP = {
  'Connected': 'success',
  'Success': 'success',
  'Live': 'success',
  'Active': 'success',
  'Granted': 'success',
  'Approved': 'success',
  'Needs review': 'warning',
  'Watch': 'warning',
  'Pending': 'warning',
  'Medium': 'warning',
  'Not configured': 'default',
  'Planned': 'info',
  'Partner required': 'info',
  'Demo': 'info',
  'Failed': 'danger',
  'High': 'danger',
  'Blocked': 'danger',
  'Error': 'danger',
};

export function StatusBadge({ status, size = 'sm', className = '' }) {
  const variant = STATUS_MAP[status] ?? 'default';
  const isLive = variant === 'success';
  return (
    <Badge variant={variant} size={size} dot={isLive} className={className}>
      {status}
    </Badge>
  );
}
