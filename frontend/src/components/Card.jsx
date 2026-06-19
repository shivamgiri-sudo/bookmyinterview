/**
 * Card — Book My Interview Design System
 *
 * Props API:
 *   variant   : 'glass' | 'solid' | 'outline' | 'elevated'  (default: 'glass')
 *   padding   : 'sm' | 'md' | 'lg'                           (default: 'md')
 *   radius    : 'sm' | 'md' | 'lg' | 'xl'                   (default: 'lg')
 *   glow      : 'none' | 'cyan' | 'gold' | 'violet'         (default: 'none')
 *   header    : ReactNode — renders as card header
 *   footer    : ReactNode — renders as card footer
 *   className : string
 *   children  : ReactNode
 *   as        : keyof JSX.IntrinsicElements                  (default: 'div')
 *   role      : aria role string
 *
 * Usage:
 *   <Card variant="glass" glow="cyan" header={<h3>Pipeline</h3>}>
 *     {content}
 *   </Card>
 *
 *   <Card variant="elevated" padding="lg">
 *     <KpiCard ... />
 *   </Card>
 */

import React from 'react';
import './Card.css';

export function Card({
  variant = 'glass',
  padding = 'md',
  radius = 'lg',
  glow = 'none',
  header,
  footer,
  className = '',
  children,
  as: Tag = 'div',
  ...rest
}) {
  const classes = [
    'bmi-card',
    `bmi-card--${variant}`,
    `bmi-card--pad-${padding}`,
    `bmi-card--r-${radius}`,
    glow !== 'none' ? `bmi-card--glow-${glow}` : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Tag className={classes} {...rest}>
      {header && (
        <div className="bmi-card__header">{header}</div>
      )}
      <div className="bmi-card__body">{children}</div>
      {footer && (
        <div className="bmi-card__footer">{footer}</div>
      )}
    </Tag>
  );
}
