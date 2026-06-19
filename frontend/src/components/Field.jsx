/**
 * Field / SecretField / SelectField — Book My Interview Design System
 *
 * Form input components with label, validation state, and accessible error messages.
 *
 * Field Props:
 *   label       : string — visible label
 *   value       : string | number
 *   onChange    : (value: string) => void
 *   placeholder : string
 *   error       : string — error message, triggers error styling
 *   helper      : string — helper text below field
 *   required    : boolean
 *   disabled    : boolean
 *   type        : input type  (default: 'text')
 *   id          : string — auto-generated from label if not provided
 *   className   : string
 *
 * SecretField Props: same as Field, always renders password type with show/hide toggle
 *   label       : string
 *   error       : string
 *
 * SelectField Props:
 *   label       : string
 *   value       : string
 *   onChange    : (value: string) => void
 *   options     : string[] | { value: string; label: string }[]
 *   error       : string
 *   placeholder : string
 *   disabled    : boolean
 *
 * Usage:
 *   <Field label="Company name" value={name} onChange={setName} required />
 *   <Field label="API Key" error="Invalid key format" value={key} onChange={setKey} />
 *   <SecretField label="API Secret" error={error} />
 *   <SelectField label="Region" value={region} onChange={setRegion} options={['IN','AE','UK','US']} />
 */

import React, { useId, useState } from 'react';
import './Field.css';

export function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  helper,
  required = false,
  disabled = false,
  type = 'text',
  id: idProp,
  className = '',
  ...rest
}) {
  const uid = useId();
  const id = idProp ?? uid;
  const errorId = error ? `${id}-error` : undefined;
  const helperId = helper ? `${id}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`bmi-field ${error ? 'bmi-field--error' : ''} ${disabled ? 'bmi-field--disabled' : ''} ${className}`}>
      <label className="bmi-field__label" htmlFor={id}>
        {label}
        {required && <span className="bmi-field__required" aria-label="required">*</span>}
      </label>
      <input
        id={id}
        type={type}
        className="bmi-field__input"
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        {...rest}
      />
      {error && (
        <span className="bmi-field__error" id={errorId} role="alert">{error}</span>
      )}
      {helper && !error && (
        <span className="bmi-field__helper" id={helperId}>{helper}</span>
      )}
    </div>
  );
}

export function SecretField({ label, error, className = '', ...rest }) {
  const [show, setShow] = useState(false);
  const uid = useId();

  return (
    <div className={`bmi-field ${error ? 'bmi-field--error' : ''} ${className}`}>
      <label className="bmi-field__label" htmlFor={uid}>{label}</label>
      <div className="bmi-field__secret-wrap">
        <input
          id={uid}
          type={show ? 'text' : 'password'}
          className="bmi-field__input bmi-field__input--secret"
          placeholder={label.match(/url|endpoint|base/i) ? 'https://…' : 'Paste credential…'}
          aria-invalid={!!error}
          {...rest}
        />
        <button
          type="button"
          className="bmi-field__secret-toggle"
          onClick={() => setShow(!show)}
          aria-label={show ? 'Hide value' : 'Show value'}
        >
          {show ? (
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"/>
              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          )}
        </button>
      </div>
      {error && <span className="bmi-field__error" role="alert">{error}</span>}
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options = [],
  error,
  placeholder,
  disabled = false,
  className = '',
}) {
  const uid = useId();
  const normalised = options.map((o) =>
    typeof o === 'string' ? { value: o, label: o } : o
  );

  return (
    <div className={`bmi-field ${error ? 'bmi-field--error' : ''} ${disabled ? 'bmi-field--disabled' : ''} ${className}`}>
      <label className="bmi-field__label" htmlFor={uid}>{label}</label>
      <div className="bmi-field__select-wrap">
        <select
          id={uid}
          className="bmi-field__input bmi-field__input--select"
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          aria-invalid={!!error}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {normalised.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="bmi-field__select-arrow" aria-hidden="true">
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 6l4 4 4-4"/>
          </svg>
        </span>
      </div>
      {error && <span className="bmi-field__error" role="alert">{error}</span>}
    </div>
  );
}
