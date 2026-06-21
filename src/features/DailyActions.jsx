import React, { useMemo } from 'react';
import Card from '../components/Card';
import CalendarSync from './CalendarSync';
import { ACHIEVEMENT_BADGES } from '../utils/achievements';
import { getRank } from '../utils/ranks';

/**
 * Icon library for daily action types and UI chrome.
 * All SVGs use aria-hidden; parent buttons carry the accessible label.
 */
const ActionIcons = {
  bus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent-blue)' }} aria-hidden="true" focusable="false">
      <rect x="2" y="4" width="20" height="12" rx="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  ),
  walk: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent-blue)' }} aria-hidden="true" focusable="false">
      <circle cx="12" cy="5" r="2" />
      <path d="M12 22V12l-3-3M15 9l3 3M9 9l-2 7" />
    </svg>
  ),
  food: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" focusable="false">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" />
    </svg>
  ),
  compost: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#b45309' }} aria-hidden="true" focusable="false">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4 1 8a7 7 0 0 1-9 10z" />
    </svg>
  ),
  wash: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent-teal)' }} aria-hidden="true" focusable="false">
      <path d="M3 12h1m16 0h1M12 3v1m0 16v1M5.6 5.6l.7.7m11.4-.7-.7.7M5.6 18.4l.7-.7m11.4.7-.7-.7" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
  check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" aria-hidden="true" focusable="false">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  lock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-light)' }} aria-hidden="true" focusable="false">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  flame: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent-orange)' }} aria-hidden="true" focusable="false">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  ),
};

/** Icon map for badge types */
const BadgeIcon = ({ icon, unlocked }) => {
  const color = unlocked ? 'var(--accent-primary)' : 'var(--text-light)';
  const icons = {
    seedling: <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4 1 8a7 7 0 0 1-9 10z" />,
    flame:    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
    shield:   <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    bus:      <><rect x="2" y="4" width="20" height="12" rx="2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
    leaf:     <><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4 1 8a7 7 0 0 1-9 10z" /><path d="M19 2L10 11" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
  };
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" aria-hidden="true" focusable="false">
      {icons[icon] || icons.seedling}
    </svg>
  );
};

const WEEKDAYS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/**
 * DailyActions feature panel.
 * Displays the daily habit checklist, weekly challenge, calendar sync,
 * eco rank progress, streak heatmap, and real unlockable achievement badges.
 *
 * @param {Object} props
 * @param {Array}   props.dailyActions    - List of daily habit items
 * @param {Function} props.onToggleAction - Called with action id when toggled
 * @param {number}  props.level           - Current user level
 * @param {number}  props.points          - Total XP points
 * @param {number}  props.streakDays      - Current streak in days
 * @param {boolean} props.isAuthenticated - Whether user is signed in (for calendar)
 * @param {Function} props.onAuthenticate - Triggers Google OAuth flow
 * @param {Set<string>} props.unlockedBadges - Set of unlocked badge IDs
 * @param {Function} props.onCalendarSynced - Called when calendar challenge is synced
 */
export default function DailyActions({
  dailyActions,
  onToggleAction,
  level,
  points,
  streakDays,
  isAuthenticated,
  onAuthenticate,
  unlockedBadges = new Set(),
  onCalendarSynced,
}) {
  const totalCompleted = dailyActions.filter(a => a.completed).length;

  const getActionIcon = (id) => {
    const map = { bus: ActionIcons.bus, walk: ActionIcons.walk, leftovers: ActionIcons.food, compost: ActionIcons.compost, wash: ActionIcons.wash };
    return (map[id] ?? ActionIcons.bus)();
  };

  // XP progress within current level
  const basePoints = (level - 1) * 100;
  const currentLevelProgress = points - basePoints;
  const percentToNextLevel = Math.min(100, Math.max(0, (currentLevelProgress / 100) * 100));

  // Rank tier
  const rank = useMemo(() => getRank(level), [level]);

  // Current weekday for heatmap highlighting
  const currentDayIndex = new Date().getDay();
  const mappedDayIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;

  return (
    <div className="dashboard-grid">

      {/* ── Left Column ── */}
      <div className="col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Daily Actions Checklist */}
        <Card
          tag="section"
          className="soft-card"
          ariaLabel="Daily sustainability actions"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--accent-dark-green)', fontWeight: 700, letterSpacing: '0.05em' }}>
                Daily Actions
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Earn points and reduce emissions with daily eco-habits</span>
            </div>

            <div
              aria-live="polite"
              aria-label={`${totalCompleted} of 5 actions completed`}
              style={{ backgroundColor: 'var(--accent-soft-orange)', color: 'var(--accent-orange)', padding: '0.3rem 0.8rem', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 700 }}
            >
              {totalCompleted}/5 Done
            </div>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            role="list"
            aria-label="Habit checklist"
          >
            {dailyActions.map(act => (
              <li
                key={act.id}
                className="soft-card-inner"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: act.completed ? 'var(--accent-soft-green)' : 'var(--bg-main)',
                  transition: 'background-color 0.2s',
                  padding: '0.9rem 1.25rem',
                  borderRadius: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', flexShrink: 0 }}
                    aria-hidden="true"
                  >
                    {getActionIcon(act.id)}
                  </div>
                  <div>
                    <p id={`action-label-${act.id}`} style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', margin: 0 }}>{act.text}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      -{act.co2Saved} kg CO2  •  +{act.xpGained} XP
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onToggleAction(act.id)}
                  aria-pressed={act.completed}
                  aria-label={act.completed ? `Mark ${act.text} as incomplete` : `Complete action: ${act.text}`}
                  style={{
                    backgroundColor: act.completed ? 'var(--accent-primary)' : 'rgba(0,0,0,0.05)',
                    color: act.completed ? '#ffffff' : 'var(--text-main)',
                    border: 'none',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {act.completed ? 'Completed' : 'Complete'}
                </button>
              </li>
            ))}
          </ul>
        </Card>

        {/* Weekly Challenge Banner */}
        <Card
          tag="section"
          className="soft-card"
          ariaLabel="Weekly challenge"
          style={{ backgroundColor: 'var(--accent-soft-green)', borderColor: 'rgba(16,185,129,0.1)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h2 style={{ color: 'var(--accent-dark-green)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', flexShrink: 0 }} aria-hidden="true" />
              Weekly Challenge
            </h2>
            <span style={{ backgroundColor: 'var(--accent-soft-orange)', color: 'var(--accent-orange)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>
              100 XP Bonus
            </span>
          </div>
          <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Commute Carbon-Free
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            Participate in collective eco challenges this week by using mass transit options.
          </p>
        </Card>

        {/* Embedded Calendar Challenge Sync */}
        <CalendarSync
          isAuthenticated={isAuthenticated}
          onAuthenticate={onAuthenticate}
          onSynced={onCalendarSynced}
        />

      </div>

      {/* ── Right Column ── */}
      <div className="col-span-1" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Eco Rank Card */}
        <Card tag="section" className="soft-card" ariaLabel="Eco rank and XP progress">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--accent-dark-green)', fontWeight: 700, letterSpacing: '0.05em' }}>
              Eco Rank
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>LEVEL {level}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h3 style={{ color: rank.color, fontSize: '1.05rem', marginBottom: '0.25rem', fontWeight: 700 }}>{rank.name.toUpperCase()}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{points} XP total</span>
            </div>

            <div>
              <div
                className="category-progress"
                style={{ height: '10px' }}
                role="progressbar"
                aria-valuenow={percentToNextLevel}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`XP progress to level ${level + 1}`}
              >
                <div
                  className="category-progress-fill"
                  style={{ width: `${percentToNextLevel}%`, backgroundColor: rank.color }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.4rem', fontWeight: 600 }}>
                <span>{points % 100} XP this level</span>
                <span>{100 - (points % 100)} XP to Level {level + 1}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Active Streak Card */}
        <Card tag="section" className="soft-card" ariaLabel="Active streak tracker">
          <h2 style={{ textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--accent-dark-green)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            Active Streak
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'block' }}>
            Log daily footprint entries to maintain your streak
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--accent-soft-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {ActionIcons.flame()}
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>CURRENT STREAK</span>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{streakDays} Days</p>
            </div>
          </div>

          {/* Weekly Heatmap */}
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>WEEKLY HEATMAP</span>
            <div style={{ display: 'flex', justifyContent: 'space-between' }} role="list" aria-label="Weekly activity heatmap">
              {WEEKDAYS_SHORT.map((day, idx) => {
                const isCurrent = idx === mappedDayIndex;
                const isLogged  = isCurrent && totalCompleted > 0;
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }} role="listitem" aria-label={`${day}: ${isLogged ? 'logged' : isCurrent ? 'today' : 'no entry'}`}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 600 }}>{day}</span>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: isLogged ? 'var(--accent-primary)' : 'rgba(0,0,0,0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: isCurrent && !isLogged ? '1.5px solid var(--accent-primary)' : 'none',
                    }}>
                      {isLogged && ActionIcons.check()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Achievement Badges Card — real unlockable badges */}
        <Card tag="section" className="soft-card" ariaLabel="Achievement badges">
          <h2 style={{ textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--accent-dark-green)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            Achievements
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem', display: 'block' }}>
            Milestones unlocked through carbon saving habits
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {ACHIEVEMENT_BADGES.map(badge => {
              const unlocked = unlockedBadges.has(badge.id);
              return (
                <div
                  key={badge.id}
                  title={unlocked ? badge.description : `Locked: ${badge.description}`}
                  aria-label={`${badge.title}: ${unlocked ? 'Unlocked — ' + badge.description : 'Locked'}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.6rem 0.25rem',
                    borderRadius: '10px',
                    backgroundColor: unlocked ? 'var(--accent-soft-green)' : 'rgba(0,0,0,0.025)',
                    border: unlocked ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent',
                    opacity: unlocked ? 1 : 0.5,
                    transition: 'all 0.2s',
                    cursor: 'default',
                  }}
                >
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: unlocked ? 'var(--accent-soft-green)' : 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {unlocked ? <BadgeIcon icon={badge.icon} unlocked /> : ActionIcons.lock()}
                  </div>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: unlocked ? 'var(--accent-dark-green)' : 'var(--text-light)', textAlign: 'center', lineHeight: 1.2 }}>
                    {badge.title}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

      </div>
    </div>
  );
}
