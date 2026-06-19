/**
 * Skeleton / Spinner — Book My Interview Design System
 *
 * Components:
 *   Spinner       — circular loading indicator
 *   SkeletonCard  — card-shaped shimmer placeholder
 *   SkeletonRow   — single row shimmer placeholder
 *
 * Spinner Props:
 *   size  : 'sm' | 'md' | 'lg'  (default: 'md')
 *   color : 'cyan' | 'gold' | 'muted'  (default: 'cyan')
 *   label : string — accessible label
 *
 * SkeletonCard Props:
 *   lines     : number — number of text lines to show  (default: 3)
 *   hasHeader : boolean — show wider header line       (default: true)
 *   className : string
 *
 * SkeletonRow Props:
 *   className : string
 *
 * Usage:
 *   <Spinner size="lg" label="Loading candidates..." />
 *   <SkeletonCard lines={4} />
 *   {data ? <DataTable rows={data} /> : Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} />)}
 */

import React from 'react';
import './Skeleton.css';

export function Spinner({ size = 'md', color = 'cyan', label = 'Loading…' }) {
  return (
    <div
      className={`bmi-spinner bmi-spinner--${size} bmi-spinner--${color}`}
      role="status"
      aria-label={label}
    >
      <svg viewBox="0 0 44 44" fill="none" aria-hidden="true">
        <circle cx="22" cy="22" r="18" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.15"/>
        <circle cx="22" cy="22" r="18" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
          strokeDasharray="100" strokeDashoffset="60"/>
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function SkeletonCard({ lines = 3, hasHeader = true, className = '' }) {
  return (
    <div className={`bmi-skeleton-card ${className}`} aria-hidden="true">
      {hasHeader && <div className="bmi-skel bmi-skel--header" />}
      <div className="bmi-skel-lines">
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className="bmi-skel bmi-skel--line"
            style={{ width: `${100 - i * 12}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonRow({ className = '' }) {
  return (
    <div className={`bmi-skeleton-row ${className}`} aria-hidden="true">
      <div className="bmi-skel bmi-skel--avatar" />
      <div className="bmi-skel-lines" style={{ flex: 1 }}>
        <div className="bmi-skel bmi-skel--line" style={{ width: '55%' }} />
        <div className="bmi-skel bmi-skel--line" style={{ width: '35%' }} />
      </div>
      <div className="bmi-skel bmi-skel--badge" />
    </div>
  );
}
