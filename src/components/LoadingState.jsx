import React from 'react';

/**
 * Accessible loading indicator with SVG spinner.
 * The @keyframes animation is in index.css to avoid inline style injection.
 * @param {Object} props
 * @param {string} [props.message] - Descriptive loading message for screen readers
 * @param {string} [props.className] - Additional CSS classes
 */
export function LoadingState({ message = 'Loading carbon data...', className = '' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className={`glass-card ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        textAlign: 'center',
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="eco-spinner"
        aria-hidden="true"
        focusable="false"
      >
        <title>Loading</title>
        <circle
          cx="12" cy="12" r="10"
          fill="none"
          stroke="var(--accent-teal)"
          strokeWidth="3"
          strokeDasharray="32"
          opacity="0.25"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          fill="none"
          stroke="var(--accent-teal)"
          strokeWidth="3"
        />
      </svg>
      <p style={{ color: 'var(--text-secondary)', fontWeight: 500, marginTop: '1rem' }}>{message}</p>
    </div>
  );
}
export default LoadingState;
