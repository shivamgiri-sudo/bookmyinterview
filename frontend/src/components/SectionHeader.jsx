/**
 * SectionHeader — Book My Interview Design System
 *
 * Consistent section/page heading with optional icon, subtitle, and action slot.
 *
 * Props API:
 *   icon     : ReactNode — leading icon in a colored circle
 *   title    : string
 *   subtitle : string   — supporting description (optional)
 *   action   : ReactNode — button/badge on the right (optional)
 *   size     : 'sm' | 'md' | 'lg'  (default: 'md')
 *   className: string
 *
 * Usage:
 *   <SectionHeader
 *     icon={<Globe2 />}
 *     title="Global Command Center"
 *     subtitle="Operate hiring intelligence across countries and compliance zones."
 *     action={<Button variant="ghost" size="sm">Refresh</Button>}
 *   />
 */

import React from 'react';
import './SectionHeader.css';

export function SectionHeader({ icon, title, subtitle, action, size = 'md', className = '' }) {
  return (
    <div className={`bmi-section-header bmi-section-header--${size} ${className}`}>
      <div className="bmi-section-header__left">
        {icon && (
          <div className="bmi-section-header__icon" aria-hidden="true">{icon}</div>
        )}
        <div className="bmi-section-header__text">
          <h2 className="bmi-section-header__title">{title}</h2>
          {subtitle && (
            <p className="bmi-section-header__subtitle">{subtitle}</p>
          )}
        </div>
      </div>
      {action && (
        <div className="bmi-section-header__action">{action}</div>
      )}
    </div>
  );
}
