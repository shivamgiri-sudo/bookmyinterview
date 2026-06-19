/**
 * Button — Book My Interview Design System
 *
 * Props API:
 *   variant   : 'primary' | 'ghost' | 'danger' | 'success' | 'neutral'  (default: 'primary')
 *   size      : 'sm' | 'md' | 'lg'                                        (default: 'md')
 *   loading   : boolean — shows spinner, disables click                   (default: false)
 *   disabled  : boolean                                                    (default: false)
 *   icon      : ReactNode — leading icon                                  (default: null)
 *   iconRight : ReactNode — trailing icon                                 (default: null)
 *   full      : boolean — 100% width                                      (default: false)
 *   onClick   : function
 *   type      : 'button' | 'submit' | 'reset'                            (default: 'button')
 *   children  : ReactNode
 *   className : string — extra class names
 *   ariaLabel : string — accessible label when no visible text
 *
 * Usage:
 *   <Button variant="primary" size="lg" icon={<ArrowRight />} onClick={handleClick}>
 *     Start smart intake
 *   </Button>
 *   <Button variant="ghost" loading={isSubmitting}>Save draft</Button>
 *   <Button variant="danger" size="sm">Delete</Button>
 */

import React from 'react';
import './Button.css';

const ICONS = {
  spinner: (
    <svg className="btn-spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round"/>
    </svg>
  ),
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  iconRight = null,
  full = false,
  onClick,
  type = 'button',
  children,
  className = '',
  ariaLabel,
  ...rest
}) {
  const isDisabled = disabled || loading;
  const classes = [
    'bmi-btn',
    `bmi-btn--${variant}`,
    `bmi-btn--${size}`,
    full ? 'bmi-btn--full' : '',
    loading ? 'bmi-btn--loading' : '',
    isDisabled ? 'bmi-btn--disabled' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={loading}
      {...rest}
    >
      {loading && ICONS.spinner}
      {!loading && icon && <span className="btn-icon btn-icon--left" aria-hidden="true">{icon}</span>}
      {children && <span className="btn-text">{children}</span>}
      {!loading && iconRight && <span className="btn-icon btn-icon--right" aria-hidden="true">{iconRight}</span>}
    </button>
  );
}
