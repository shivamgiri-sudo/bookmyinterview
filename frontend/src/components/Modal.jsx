/**
 * Modal — Book My Interview Design System
 *
 * Accessible modal dialog with focus trap, backdrop, and animations.
 *
 * Props API:
 *   open        : boolean — controls visibility
 *   onClose     : function — called on backdrop click or Escape
 *   title       : string — dialog title (used for aria-labelledby)
 *   description : string — dialog description (optional, used for aria-describedby)
 *   size        : 'sm' | 'md' | 'lg' | 'xl'  (default: 'md')
 *   children    : ReactNode — modal body content
 *   footer      : ReactNode — modal footer content (optional)
 *   closable    : boolean — show close button  (default: true)
 *
 * Usage:
 *   const [open, setOpen] = useState(false);
 *
 *   <Button onClick={() => setOpen(true)}>Open modal</Button>
 *   <Modal
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     title="Configure Credentials"
 *     size="lg"
 *     footer={<Button variant="primary">Save encrypted credential</Button>}
 *   >
 *     <SecretField label="API Key" />
 *   </Modal>
 */

import React, { useEffect, useRef } from 'react';
import './Modal.css';

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  closable = true,
}) {
  const dialogRef = useRef(null);
  const titleId = `bmi-modal-title-${title?.replace(/\s+/g, '-').toLowerCase()}`;
  const descId = `bmi-modal-desc-${title?.replace(/\s+/g, '-').toLowerCase()}`;

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape' && closable) onClose?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, closable, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Focus first interactive element on open
  useEffect(() => {
    if (open) {
      const el = dialogRef.current?.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      el?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="bmi-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget && closable) onClose?.(); }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`bmi-modal bmi-modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
      >
        {/* Header */}
        <div className="bmi-modal__header">
          {title && <h2 className="bmi-modal__title" id={titleId}>{title}</h2>}
          {description && <p className="bmi-modal__desc" id={descId}>{description}</p>}
          {closable && (
            <button
              className="bmi-modal__close"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
              </svg>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="bmi-modal__body">{children}</div>

        {/* Footer */}
        {footer && <div className="bmi-modal__footer">{footer}</div>}
      </div>
    </div>
  );
}
