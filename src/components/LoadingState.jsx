import React from 'react';

/**
 * Accessible loading indicator.
 * Provides a clean visual SVG spinner and ARIA announcement support for screen readers.
 */
export function LoadingState({ message = 'Loading carbon data...', className = '' }) {
  return (
    <div 
      role="status" 
      aria-live="polite"
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
        style={{
          animation: 'spin 1s linear infinite',
          color: 'var(--accent-teal)',
          marginBottom: '1rem'
        }}
      >
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeDasharray="32"
          opacity="0.3"
        />
        <path 
          d="M12 2a10 10 0 0 1 10 10" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3"
        />
      </svg>
      <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{message}</p>
      
      {/* Keyframe animation for spinning */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
export default LoadingState;
