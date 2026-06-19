/**
 * Alert — Book My Interview Design System
 *
 * Inline alert banners for contextual feedback.
 *
 * Props API:
 *   type      : 'info' | 'success' | 'warning' | 'error'  (default: 'info')
 *   title     : string — bold heading (optional)
 *   children  : ReactNode — alert message
 *   dismissible: boolean — show X to close               (default: false)
 *   onDismiss : function — called when dismissed
 *   className : string
 *
 * Usage:
 *   <Alert type="warning" title="Demo mode active">
 *     Backend not reachable. Start FastAPI on port 8000 for live data.
 *   </Alert>
 *
 *   <Alert type="error">Failed to save credentials. Please try again.</Alert>
 *   <Alert type="success" title="Tenant created" dismissible onDismiss={clear}>ID 12 selected.</Alert>
 */

import React, { useState } from 'react';
import './Alert.css';

const ICONS = {
  info: (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 4a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H10z"/>
    </svg>
  ),
  success: (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
    </svg>
  ),
  error: (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
    </svg>
  ),
};

export function Alert({
  type = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className = '',
}) {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  const handleDismiss = () => {
    setHidden(true);
    onDismiss?.();
  };

  return (
    <div
      className={`bmi-alert bmi-alert--${type} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <span className="bmi-alert__icon">{ICONS[type]}</span>
      <div className="bmi-alert__content">
        {title && <strong className="bmi-alert__title">{title}</strong>}
        <span className="bmi-alert__message">{children}</span>
      </div>
      {dismissible && (
        <button
          className="bmi-alert__close"
          onClick={handleDismiss}
          aria-label="Dismiss alert"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
          </svg>
        </button>
      )}
    </div>
  );
}
