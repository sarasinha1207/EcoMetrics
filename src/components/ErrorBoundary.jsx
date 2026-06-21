import React from 'react';

/**
 * React class-based Error Boundary.
 * Catches runtime errors in the component tree and shows a friendly fallback UI.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to protect
 * @param {string} [props.context] - Optional label identifying which section errored
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || 'An unexpected error occurred.' };
  }

  componentDidCatch(error, info) {
    // Log to console in development; in production this would go to an error service
    console.error('[EcoMetrics ErrorBoundary]', error, info);
  }

  handleReset() {
    this.setState({ hasError: false, errorMessage: '' });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            padding: '2.5rem 2rem',
            borderRadius: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid var(--accent-danger)',
            textAlign: 'center',
            maxWidth: '480px',
            margin: '2rem auto',
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-danger)" strokeWidth="2" style={{ marginBottom: '1rem' }} aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h3 style={{ color: 'var(--accent-danger)', marginBottom: '0.5rem', fontSize: '1rem' }}>
            Something went wrong
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {this.props.context
              ? `An error occurred in the ${this.props.context} section.`
              : 'An unexpected error occurred.'}
          </p>
          <button
            className="btn btn-primary"
            onClick={this.handleReset}
            aria-label="Retry the failed section"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
