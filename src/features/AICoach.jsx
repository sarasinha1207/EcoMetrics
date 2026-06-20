import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import LoadingState from '../components/LoadingState';

export default function AICoach({ currentCalc, history }) {
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cached advice from sessionStorage to prevent unnecessary repeated Gemini API calls (Efficiency)
  useEffect(() => {
    const cachedAdvice = sessionStorage.getItem('eco_coach_advice');
    if (cachedAdvice) {
      setAdvice(cachedAdvice);
    }
  }, []);

  const fetchAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentCalculation: currentCalc,
          history: history.slice(0, 10) // Send last 10 records for history trends
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch insights');
      }

      setAdvice(data.advice);
      sessionStorage.setItem('eco_coach_advice', data.advice);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ marginBottom: '0.5rem' }}>Personalized Carbon Coach</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Leverage Gemini generative insights to analyze your carbon log patterns, spot high-impact categories, and get custom reduction roadmaps.
        </p>
      </div>

      {loading ? (
        <LoadingState message="Gemini AI Carbon Coach is compiling your sustainability report..." />
      ) : advice ? (
        <Card tag="article" ariaLabel="AI Carbon Coach Report">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'var(--accent-teal)' }}>AI Sustainability Assessment</h3>
            <button 
              className="btn btn-secondary" 
              onClick={fetchAdvice}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
            >
              Re-evaluate Report
            </button>
          </div>
          
          <div 
            className="ai-markdown-content"
            style={{ 
              fontSize: '1rem', 
              lineHeight: '1.6', 
              color: 'var(--text-primary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {/* Split response by markdown headings to format clean React components (Security: avoiding raw dangerouslySetInnerHTML) */}
            {advice.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={index} style={{ color: 'var(--accent-teal)', marginTop: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem' }}>
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                const listItems = paragraph.split('\n').filter(Boolean);
                return (
                  <ul key={index} style={{ paddingLeft: '1.5rem', listStyleType: 'square' }}>
                    {listItems.map((li, liIdx) => (
                      <li key={liIdx} style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                        {li.replace(/^[\-\*]\s+/, '')}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={index} style={{ color: 'var(--text-secondary)' }}>
                  {paragraph}
                </p>
              );
            })}
          </div>
        </Card>
      ) : (
        <Card style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Ready to generate your AI-powered footprint evaluation?
          </p>
          <button 
            className="btn btn-primary" 
            onClick={fetchAdvice}
            disabled={!currentCalc}
          >
            Generate AI Insights Report
          </button>
          {!currentCalc && (
            <p style={{ color: 'var(--accent-danger)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              Please complete at least one carbon calculation to request advice.
            </p>
          )}
        </Card>
      )}

      {error && (
        <div 
          aria-live="assertive"
          style={{ 
            padding: '1rem', 
            borderRadius: '8px', 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid var(--accent-danger)',
            color: 'var(--accent-danger)',
            fontSize: '0.875rem',
            textAlign: 'center'
          }}
        >
          <p style={{ fontWeight: 600, color: 'var(--accent-danger)' }}>Insight Retrieval Failed</p>
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
      )}
    </div>
  );
}
