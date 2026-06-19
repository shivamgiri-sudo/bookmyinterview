/**
 * ScoreBar — Book My Interview Design System
 *
 * Animated progress bar for scores, benchmarks, and metrics.
 *
 * Props API:
 *   value      : number 0–100 — the filled percentage
 *   label      : string — visible label on the left
 *   showValue  : boolean — show numeric value on the right  (default: true)
 *   color      : 'auto' | 'cyan' | 'gold' | 'green' | 'violet' | 'danger'
 *                'auto' chooses cyan < 60, gold 60–79, green ≥ 80      (default: 'auto')
 *   height     : number — bar height in px                             (default: 8)
 *   animated   : boolean — slide in on mount                          (default: true)
 *   className  : string
 *
 * Usage:
 *   <ScoreBar label="Resume Match" value={86} />
 *   <ScoreBar label="Compliance" value={97} color="green" height={12} />
 *   <ScoreBar label="Risk" value={32} color="danger" showValue={false} />
 */

import React, { useEffect, useRef, useState } from 'react';
import './ScoreBar.css';

const COLOR_MAP = {
  cyan:   { track: 'rgba(103,232,249,.12)',  fill: 'linear-gradient(90deg, #67E8F9, #A78BFA)' },
  gold:   { track: 'rgba(246,196,83,.12)',   fill: 'linear-gradient(90deg, #F6C453, #67E8F9)' },
  green:  { track: 'rgba(52,211,153,.12)',   fill: 'linear-gradient(90deg, #34D399, #67E8F9)' },
  violet: { track: 'rgba(167,139,250,.12)',  fill: 'linear-gradient(90deg, #A78BFA, #67E8F9)' },
  danger: { track: 'rgba(251,113,133,.12)',  fill: 'linear-gradient(90deg, #FB7185, #F6C453)' },
};

function resolveColor(color, value) {
  if (color !== 'auto') return color;
  if (value < 60) return 'danger';
  if (value < 80) return 'gold';
  return 'green';
}

export function ScoreBar({
  value = 0,
  label,
  showValue = true,
  color = 'auto',
  height = 8,
  animated = true,
  className = '',
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const resolved = resolveColor(color, clamped);
  const { track, fill } = COLOR_MAP[resolved] ?? COLOR_MAP.cyan;

  const [displayed, setDisplayed] = useState(animated ? 0 : clamped);
  const mounted = useRef(false);

  useEffect(() => {
    if (!animated) { setDisplayed(clamped); return; }
    const timer = setTimeout(() => setDisplayed(clamped), 60);
    mounted.current = true;
    return () => clearTimeout(timer);
  }, [clamped, animated]);

  return (
    <div className={`bmi-scorebar ${className}`}>
      {(label || showValue) && (
        <div className="bmi-scorebar__meta">
          {label && <span className="bmi-scorebar__label">{label}</span>}
          {showValue && (
            <span className="bmi-scorebar__value" aria-label={`${clamped}%`}>{clamped}%</span>
          )}
        </div>
      )}
      <div
        className="bmi-scorebar__track"
        style={{ height, background: track, borderRadius: height }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ? `${label}: ${clamped}%` : `${clamped}%`}
      >
        <div
          className="bmi-scorebar__fill"
          style={{
            width: `${displayed}%`,
            height,
            background: fill,
            borderRadius: height,
            transition: animated ? 'width 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
          }}
        />
      </div>
    </div>
  );
}
