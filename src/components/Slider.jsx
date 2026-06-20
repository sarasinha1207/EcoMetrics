import React from 'react';

/**
 * Reusable accessible range slider component.
 * Integrates native HTML range inputs with paired labels and current value readouts.
 */
export function Slider({
  id,
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  valueDisplay = (val) => val,
  className = '',
  ...props
}) {
  return (
    <div className={`form-group ${className}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
        <label htmlFor={id} style={{ marginBottom: 0 }}>
          {label}
        </label>
        <span 
          aria-live="polite" 
          style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-teal)' }}
        >
          {valueDisplay(value)}
        </span>
      </div>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="form-control"
        style={{
          padding: '0.25rem 0',
          cursor: 'pointer',
          accentColor: 'var(--accent-teal)',
          background: 'none',
          border: 'none'
        }}
        {...props}
      />
    </div>
  );
}
export default Slider;
