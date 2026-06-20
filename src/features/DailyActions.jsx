import React, { useState } from 'react';
import Card from '../components/Card';
import CalendarSync from './CalendarSync';

const ActionIcons = {
  bus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent-blue)' }}>
      <rect x="2" y="4" width="20" height="12" rx="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  ),
  walk: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent-blue)' }}>
      <path d="M18 22H6M12 2v20M12 2a4 4 0 1 0 0 8 4 4 0 1 0 0-8z" />
    </svg>
  ),
  food: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent-primary)' }}>
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  compost: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#b45309' }}>
      <path d="M12 22v-6M12 12V2M4 9h16" />
    </svg>
  ),
  wash: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent-teal)' }}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
  check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  lock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-light)' }}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
};

const WEEKDAYS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function DailyActions({
  dailyActions,
  onToggleAction,
  level,
  points,
  streakDays,
  isAuthenticated,
  onAuthenticate
}) {
  const totalCompleted = dailyActions.filter(a => a.completed).length;

  const getActionIcon = (id) => {
    switch (id) {
      case 'bus': return ActionIcons.bus();
      case 'walk': return ActionIcons.walk();
      case 'leftovers': return ActionIcons.food();
      case 'compost': return ActionIcons.compost();
      case 'wash': return ActionIcons.wash();
      default: return ActionIcons.bus();
    }
  };

  // Next level progress computation
  const basePoints = (level - 1) * 100;
  const currentLevelProgress = points - basePoints;
  const percentToNextLevel = Math.min(100, Math.max(0, (currentLevelProgress / 100) * 100));

  // Heatmap check
  const currentDayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  const mappedDayIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1; // Map Sunday to index 6

  return (
    <div className="dashboard-grid">
      
      {/* Left Column: Daily Habits checklist & Weekly challenge banner */}
      <div className="col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Daily Actions Checklist */}
        <Card className="soft-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--accent-dark-green)', fontWeight: 700, letterSpacing: '0.05em' }}>
                Daily Actions
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Earn points and reduce emissions with daily eco-habits</span>
            </div>
            
            <div style={{ 
              backgroundColor: 'var(--accent-soft-orange)', 
              color: 'var(--accent-orange)', 
              padding: '0.3rem 0.8rem', 
              borderRadius: '15px', 
              fontSize: '0.75rem', 
              fontWeight: 700 
            }}>
              ⭐ {totalCompleted}/5 Done
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {dailyActions.map(act => (
              <div 
                key={act.id} 
                className="soft-card-inner" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  backgroundColor: act.completed ? 'var(--accent-soft-green)' : 'var(--bg-main)',
                  transition: 'background-color 0.2s',
                  padding: '0.9rem 1.25rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '50%', 
                    backgroundColor: '#ffffff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    {getActionIcon(act.id)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{act.text}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      -{act.co2Saved} KG CO2  •  +{act.xpGained} XP
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onToggleAction(act.id)}
                  style={{
                    backgroundColor: act.completed ? 'var(--accent-primary)' : 'rgba(0,0,0,0.04)',
                    color: act.completed ? '#ffffff' : 'var(--text-main)',
                    border: 'none',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {act.completed ? 'Completed' : 'Complete'}
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly Challenge Banner */}
        <Card className="soft-card" style={{ backgroundColor: 'var(--accent-soft-green)', borderColor: 'rgba(16,185,129,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ color: 'var(--accent-dark-green)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }} />
              WEEKLY CHALLENGE
            </h3>
            <span style={{ 
              backgroundColor: 'var(--accent-soft-orange)', 
              color: 'var(--accent-orange)', 
              padding: '0.2rem 0.6rem', 
              borderRadius: '12px', 
              fontSize: '0.7rem', 
              fontWeight: 700 
            }}>
              🏆 100 XP Bonus
            </span>
          </div>
          <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Commute Carbon-Free
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Participate in collective eco challenges this week by using mass transit options.
          </p>
        </Card>

        {/* Embedded Calendar Challenge Sync */}
        <CalendarSync isAuthenticated={isAuthenticated} onAuthenticate={onAuthenticate} />

      </div>

      {/* Right Column: Eco Rank progress, Active Streak heatmap, Achievement badges */}
      <div className="col-span-1" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Eco Rank Card */}
        <Card className="soft-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--accent-dark-green)', fontWeight: 700, letterSpacing: '0.05em' }}>
              Eco Rank
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>LEVEL {level}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h4 style={{ color: 'var(--accent-primary)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>SEEDLING</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{points} XP total</span>
            </div>

            <div>
              <div className="category-progress" style={{ height: '10px' }}>
                <div 
                  className="category-progress-fill" 
                  style={{ 
                    width: `${percentToNextLevel}%`, 
                    backgroundColor: 'var(--accent-primary)' 
                  }} 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.4rem', fontWeight: 600 }}>
                <span>{points % 100} XP total</span>
                <span>{(100 - (points % 100))} XP to Level {level + 1}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Active Streak Calendar Heatmap Card */}
        <Card className="soft-card">
          <h3 style={{ textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--accent-dark-green)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            Active Streak
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'block' }}>
            Log daily footprint entries to maintain your streak
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--accent-soft-orange)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              {ActionIcons.compost()}
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>CURRENT STREAK</span>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{streakDays} Days</p>
            </div>
          </div>

          {/* Weekly Heatmap layout */}
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              WEEKLY HEATMAP
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {WEEKDAYS_SHORT.map((day, idx) => {
                // If it is current day and user completed action, show green check
                const isCurrent = idx === mappedDayIndex;
                const isLogged = isCurrent && totalCompleted > 0;
                
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 600 }}>{day}</span>
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      backgroundColor: isLogged ? 'var(--accent-primary)' : 'rgba(0,0,0,0.04)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: isCurrent && !isLogged ? '1.5px solid var(--accent-primary)' : 'none'
                    }}>
                      {isLogged && ActionIcons.check()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Achievement Badges Card */}
        <Card className="soft-card">
          <h3 style={{ textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--accent-dark-green)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            Achievement Badges
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem', display: 'block' }}>
            Milestones unlocked through carbon saving habits
          </span>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-around' }}>
            {[1, 2, 3, 4].map(idx => (
              <div 
                key={idx}
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(0,0,0,0.03)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
                title="Locked Badge"
              >
                {ActionIcons.lock()}
              </div>
            ))}
          </div>
        </Card>

      </div>

    </div>
  );
}
