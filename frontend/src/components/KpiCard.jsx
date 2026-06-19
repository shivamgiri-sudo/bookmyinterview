/**
 * KpiCard — Book My Interview Design System
 *
 * A premium metric display card for dashboards.
 *
 * Props API:
 *   icon      : ReactNode — leading icon
 *   label     : string   — metric label
 *   value     : string | number — main metric value
 *   sub       : string   — secondary context (optional)
 *   trend     : number   — percentage trend, positive = up, negative = down (optional)
 *   trendLabel: string   — e.g. "vs last month"
 *   loading   : boolean  — shows skeleton
 *   variant   : 'default' | 'cyan' | 'gold' | 'violet' | 'green'
 *   className : string
 *
 * Usage:
 *   <KpiCard icon={<UsersRound />} label="Active Tenants" value="42" sub="5 regions" trend={12.4} />
 *   <KpiCard icon={<ShieldCheck />} label="Policy Pass Rate" value="97.2%" loading={isLoading} />
 */

import React from 'react';
import './KpiCard.css';

const TREND_ICONS = {
  up: (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 10l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  down: (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

export function KpiCard({
  icon,
  label,
  value,
  sub,
  trend,
  trendLabel = 'vs last month',
  loading = false,
  variant = 'default',
  className = '',
}) {
  const hasTrend = trend !== undefined && trend !== null;
  const trendDir = trend >= 0 ? 'up' : 'down';
  const trendAbs = Math.abs(trend ?? 0).toFixed(1);

  if (loading) {
    return (
      <div className={`bmi-kpi bmi-kpi--${variant} bmi-kpi--loading ${className}`} aria-busy="true" aria-label="Loading metric">
        <div className="bmi-kpi__icon-wrap bmi-skeleton-box" style={{ width: 44, height: 44 }} />
        <div className="bmi-kpi__content">
          <div className="bmi-skeleton-box" style={{ width: '40%', height: 12, marginBottom: 12 }} />
          <div className="bmi-skeleton-box" style={{ width: '65%', height: 34 }} />
        </div>
      </div>
    );
  }

  return (
    <div className={`bmi-kpi bmi-kpi--${variant} ${className}`}>
      {icon && (
        <div className="bmi-kpi__icon-wrap" aria-hidden="true">{icon}</div>
      )}
      <div className="bmi-kpi__content">
        <span className="bmi-kpi__label">{label}</span>
        <strong className="bmi-kpi__value">{value}</strong>
        {(sub || hasTrend) && (
          <div className="bmi-kpi__meta">
            {hasTrend && (
              <span className={`bmi-kpi__trend bmi-kpi__trend--${trendDir}`} aria-label={`${trendDir === 'up' ? 'Up' : 'Down'} ${trendAbs}% ${trendLabel}`}>
                {TREND_ICONS[trendDir]}
                {trendAbs}%
              </span>
            )}
            {sub && <span className="bmi-kpi__sub">{sub}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
