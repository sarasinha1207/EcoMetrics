import React, { useState } from 'react';
import Card from '../components/Card';

const CHALLENGES = [
  {
    id: 'meatless',
    title: 'Plant-Based Commits',
    description: 'Substitute meat for plant-based meals to reduce agriculture lifecycle emissions. Focuses on shifting dietary carbon profile.',
    defaultDays: ['Monday', 'Wednesday'],
  },
  {
    id: 'transit',
    title: 'Public Transit Shift',
    description: 'Use buses or trains instead of personal single-occupant gasoline vehicles for commute cycles.',
    defaultDays: ['Tuesday', 'Thursday'],
  },
  {
    id: 'offgrid',
    title: 'Off-Grid Detoxing',
    description: 'Switch off major appliances, routers, and screens for 1 hour to reduce grid draw and residential standby energy.',
    defaultDays: ['Monday', 'Friday'],
  }
];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function CalendarSync({ isAuthenticated, onAuthenticate }) {
  const [selectedChallenge, setSelectedChallenge] = useState(CHALLENGES[0]);
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [selectedDays, setSelectedDays] = useState(CHALLENGES[0].defaultDays);
  
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [syncError, setSyncError] = useState(null);

  const handleChallengeChange = (challenge) => {
    setSelectedChallenge(challenge);
    setSelectedDays(challenge.defaultDays);
    setSyncResult(null);
    setSyncError(null);
  };

  const handleDayToggle = (day) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };

  const handleSync = async () => {
    if (selectedDays.length === 0) {
      setSyncError('Please select at least one day of the week.');
      return;
    }
    
    setSyncing(true);
    setSyncResult(null);
    setSyncError(null);

    try {
      const res = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeTitle: selectedChallenge.title,
          description: selectedChallenge.description,
          days: selectedDays,
          durationWeeks
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sync calendar event');
      }

      setSyncResult(data);
    } catch (err) {
      console.error(err);
      setSyncError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="dashboard-grid">
      {/* Selector Column */}
      <div className="col-span-1" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Google Calendar Challenges</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Schedule recurring structured sustainability challenges directly to your primary calendar to build lasting, low-carbon habits.
        </p>

        {CHALLENGES.map(ch => (
          <button
            key={ch.id}
            onClick={() => handleChallengeChange(ch)}
            className="glass-card"
            style={{
              textAlign: 'left',
              width: '100%',
              cursor: 'pointer',
              border: selectedChallenge.id === ch.id ? '2px solid var(--accent-teal)' : '1px solid var(--border-light)',
              backgroundColor: selectedChallenge.id === ch.id ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
              transition: 'border 0.2s',
              padding: '1.25rem'
            }}
          >
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: selectedChallenge.id === ch.id ? 'var(--accent-teal)' : 'var(--text-primary)' }}>
              {ch.title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{ch.description}</p>
          </button>
        ))}
      </div>

      {/* Sync Action Column */}
      <div className="col-span-2">
        <Card tag="article" ariaLabel="Challenge details and calendar sync actions">
          <h3 style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            Configure: {selectedChallenge.title}
          </h3>

          {!isAuthenticated ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <p style={{ marginBottom: '1.5rem' }}>
                You must connect your Google Calendar account to schedule habit events.
              </p>
              <button className="btn btn-primary" onClick={onAuthenticate}>
                Connect Google Account
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Day selection */}
              <div>
                <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Commit Days
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {WEEKDAYS.map(day => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          border: isSelected ? '1px solid var(--accent-teal)' : '1px solid var(--border-light)',
                          backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
                          color: isSelected ? 'var(--accent-teal)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontWeight: 500,
                          fontSize: '0.875rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration weeks */}
              <div className="form-group">
                <label htmlFor="duration-select">Challenge Duration</label>
                <select
                  id="duration-select"
                  className="form-control"
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(Number(e.target.value))}
                >
                  <option value={2}>2 Weeks (Short test)</option>
                  <option value={4}>4 Weeks (Standard habit building)</option>
                  <option value={8}>8 Weeks (Extended routine)</option>
                  <option value={12}>12 Weeks (Permanent lifestyle shift)</option>
                </select>
              </div>

              {/* Sync Trigger button */}
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  {syncing ? 'Syncing to Google Calendar...' : 'Schedule Challenge on Google Calendar'}
                </button>
              </div>

              {/* Result display */}
              {syncResult && (
                <div 
                  aria-live="polite"
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                    border: '1px solid var(--accent-emerald)',
                    color: 'var(--accent-emerald)',
                    fontSize: '0.875rem'
                  }}
                >
                  <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--accent-emerald)' }}>
                    Sync Successful
                  </p>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Recurring slots have been populated. Track your calendar reminders!
                  </p>
                  {syncResult.htmlLink && (
                    <a 
                      href={syncResult.htmlLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ color: 'var(--accent-teal)', textDecoration: 'underline', fontWeight: 600 }}
                    >
                      Open in Google Calendar
                    </a>
                  )}
                </div>
              )}

              {syncError && (
                <div 
                  aria-live="assertive"
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                    border: '1px solid var(--accent-danger)',
                    color: 'var(--accent-danger)',
                    fontSize: '0.875rem'
                  }}
                >
                  <p style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--accent-danger)' }}>
                    Sync Error
                  </p>
                  <p style={{ color: 'var(--text-secondary)' }}>{syncError}</p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
