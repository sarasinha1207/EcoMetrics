import React, { useState, useEffect } from 'react';
import { db } from './utils/db';
import { calculateTotalFootprint } from './utils/calculations';
import Card from './components/Card';

// Feature Views
import Calculator from './features/Calculator';
import Dashboard from './features/Dashboard';
import DailyActions from './features/DailyActions';
import AICoach from './features/AICoach';
import LandingPage from './features/LandingPage';

// SVG Icons matching sidebar options (clean custom path SVG builders)
const Icons = {
  globe: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20M12 2a14.5 14.5 0 0 1 0 20M2 12h20" />
    </svg>
  ),
  dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  calculator: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="16" y2="10" />
      <circle cx="8" cy="14" r="1" />
      <circle cx="12" cy="14" r="1" />
      <circle cx="16" cy="14" r="1" />
      <circle cx="8" cy="18" r="1" />
      <circle cx="12" cy="18" r="1" />
      <circle cx="16" cy="18" r="1" />
    </svg>
  ),
  actions: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  insights: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
  profile: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
};

export default function App() {
  const [activeTab, setActiveTab] = useState('landing'); // Default view is landing page
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // XP & Streaks States (gamification elements)
  const [points, setPoints] = useState(50);
  const [level, setLevel] = useState(1);
  const [streakDays, setStreakDays] = useState(0);

  // Carbon calculation profile states
  const [currentCalc, setCurrentCalc] = useState(null);
  const [history, setHistory] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);

  // Daily Habits checklist
  const [dailyActions, setDailyActions] = useState([
    { id: 'bus', text: 'Take the bus instead of car', co2Saved: 1.2, xpGained: 30, completed: false },
    { id: 'walk', text: 'Walk instead of drive (2km)', co2Saved: 0.4, xpGained: 20, completed: false },
    { id: 'leftovers', text: 'Finish all leftovers', co2Saved: 0.8, xpGained: 20, completed: false },
    { id: 'compost', text: 'Compost food waste today', co2Saved: 0.3, xpGained: 15, completed: false },
    { id: 'wash', text: 'Wash clothes in cold water', co2Saved: 0.3, xpGained: 15, completed: false }
  ]);

  // Live global ticker state (ticking up by ~1,166.9 tonnes of CO2 per second)
  const [globalEmissions, setGlobalEmissions] = useState(0);

  // Live Ticker logic
  useEffect(() => {
    // Start of the year timestamp
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();
    
    const updateTicker = () => {
      const elapsedSeconds = (Date.now() - startOfYear) / 1000;
      // 36.8 billion tonnes per year is ~1166.9 tonnes per second
      const currentEmissions = 1450000000 + elapsedSeconds * 1166.9; 
      setGlobalEmissions(currentEmissions);
    };

    updateTicker();
    const interval = setInterval(updateTicker, 100);
    return () => clearInterval(interval);
  }, []);

  // Check auth
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/status');
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
          // Auto route to dashboard if authed
          setActiveTab('dashboard');
        }
      } catch (err) {
        console.error('Auth verification error:', err);
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, []);

  // Fetch IndexedDB history on mount
  useEffect(() => {
    async function loadLocalData() {
      try {
        const histData = await db.getHistory();
        setHistory(histData);
        if (histData.length > 0) {
          setCurrentCalc(histData[0]);
        }
        
        // Load custom XP state
        const savedPoints = await db.getSetting('user_xp_points');
        if (savedPoints !== null) {
          setPoints(Number(savedPoints));
          setLevel(Math.floor(Number(savedPoints) / 100) + 1);
        }
        const savedStreak = await db.getSetting('user_streak_days');
        if (savedStreak !== null) {
          setStreakDays(Number(savedStreak));
        }
      } catch (err) {
        console.error('Local db fetch failed:', err);
      } finally {
        setDbLoading(false);
      }
    }
    loadLocalData();
  }, []);

  const handleSaveCalculation = async (profileData) => {
    const calculated = calculateTotalFootprint(profileData);
    const newRecord = {
      ...calculated,
      id: Date.now().toString(),
      timestamp: Date.now(),
      inputs: profileData
    };

    try {
      await db.saveCalculation(newRecord);
      setCurrentCalc(newRecord);
      const updatedHistory = await db.getHistory();
      setHistory(updatedHistory);
      
      // Update streak and XP on logging calculation
      const nextPoints = points + 50;
      setPoints(nextPoints);
      await db.saveSetting('user_xp_points', nextPoints);
      setLevel(Math.floor(nextPoints / 100) + 1);
      
      const nextStreak = streakDays + 1;
      setStreakDays(nextStreak);
      await db.saveSetting('user_streak_days', nextStreak);

      setActiveTab('dashboard');
    } catch (err) {
      console.error('Calculation logging failed:', err);
    }
  };

  // Toggle habit complete
  const handleToggleAction = async (actionId) => {
    let xpDiff = 0;
    const updated = dailyActions.map(act => {
      if (act.id === actionId) {
        const nextState = !act.completed;
        xpDiff = nextState ? act.xpGained : -act.xpGained;
        return { ...act, completed: nextState };
      }
      return act;
    });

    setDailyActions(updated);
    
    // Add XP
    const nextPoints = Math.max(0, points + xpDiff);
    setPoints(nextPoints);
    setLevel(Math.floor(nextPoints / 100) + 1);
    await db.saveSetting('user_xp_points', nextPoints);
  };

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/auth/google/url');
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Login URL failed:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setActiveTab('landing');
    } catch (err) {
      console.error('Logout request failed:', err);
    }
  };

  // Calculation total daily co2 saved from actions
  const totalCo2SavedToday = dailyActions
    .filter(a => a.completed)
    .reduce((sum, a) => sum + a.co2Saved, 0);

  // If in landing view, render the premium dark SaaS homepage
  if (activeTab === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => setActiveTab('dashboard')}
        onLogin={handleLogin}
      />
    );
  }

  // Otherwise, render full authenticated/dashboard shell
  const sidebarUser = user || {
    name: 'Eco Tracker User',
    email: 'eco.tracker@gmail.com'
  };

  return (
    <>
      {/* Accessibility Skip Link */}
      <a href="#main-dashboard-pane" className="skip-link">Skip to Content</a>

      <div className="app-container">
        {/* Left Sidebar Navigation */}
        <aside className="sidebar" aria-label="Sidebar Navigation">
        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 0.5rem 2rem 0.5rem', fontWeight: 700, fontSize: '1.25rem', color: 'var(--accent-primary)' }}>
            <img src="/ecometrics_logo.png" alt="" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            <span>ECOMETRICS</span>
          </div>

          {/* Nav List */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button 
              className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              aria-current={activeTab === 'dashboard' ? 'page' : undefined}
            >
              {Icons.dashboard()}
              Dashboard
            </button>
            <button 
              className={`nav-link ${activeTab === 'calculator' ? 'active' : ''}`}
              onClick={() => setActiveTab('calculator')}
              aria-current={activeTab === 'calculator' ? 'page' : undefined}
            >
              {Icons.calculator()}
              Carbon Calculator
            </button>
            <button 
              className={`nav-link ${activeTab === 'actions' ? 'active' : ''}`}
              onClick={() => setActiveTab('actions')}
              aria-current={activeTab === 'actions' ? 'page' : undefined}
            >
              {Icons.actions()}
              Daily Actions
            </button>
            <button 
              className={`nav-link ${activeTab === 'coach' ? 'active' : ''}`}
              onClick={() => setActiveTab('coach')}
              aria-current={activeTab === 'coach' ? 'page' : undefined}
            >
              {Icons.insights()}
              AI Insights
            </button>
            <button 
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
              aria-current={activeTab === 'profile' ? 'page' : undefined}
            >
              {Icons.profile()}
              Profile
            </button>
          </nav>
        </div>

        {/* Profile Card Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--accent-primary)', 
              color: '#0a251a',
              fontWeight: 700, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '0.875rem'
            }}>
              {sidebarUser.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {sidebarUser.name}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {sidebarUser.email}
              </span>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', padding: '0.75rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>SEEDLING</span>
              <span style={{ color: 'var(--text-light)' }}>Level {level}</span>
            </div>
            <span style={{ color: 'var(--text-light)' }}>Points: {points}</span>
          </div>

          <button 
            className="nav-link" 
            onClick={user ? handleLogout : () => setActiveTab('landing')} 
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: '#f87171' }}
          >
            ← Sign Out
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="main-content">
        <header className="top-nav">
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>
              {activeTab === 'dashboard' && 'Overview Dashboard'}
              {activeTab === 'calculator' && 'Carbon Footprint Calculator'}
              {activeTab === 'actions' && 'Daily Sustainability Actions'}
              {activeTab === 'coach' && 'AI Sustainability Coach'}
              {activeTab === 'profile' && 'User Settings & Data Management'}
            </h2>
          </div>

          {/* Level Header Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ 
              backgroundColor: 'var(--accent-soft-green)', 
              color: 'var(--accent-dark-green)', 
              padding: '0.4rem 1rem', 
              borderRadius: '20px', 
              fontSize: '0.8rem', 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }} />
              Level {level} ({points} XP)
            </div>
            
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.name}</span>
              </div>
            ) : (
              <button 
                className="btn btn-secondary" 
                onClick={handleLogin}
                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', borderColor: 'var(--accent-primary)' }}
              >
                Sync Google Calendar
              </button>
            )}
          </div>
        </header>

        {/* Content Pane */}
        <main className="content-pane" id="main-dashboard-pane" tabIndex="-1">
          {dbLoading ? (
            <Card style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <p>Syncing local cache database...</p>
            </Card>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard 
                  currentCalc={currentCalc} 
                  history={history} 
                  dailyActions={dailyActions}
                  onToggleAction={handleToggleAction}
                  totalCo2SavedToday={totalCo2SavedToday}
                  level={level}
                  points={points}
                  streakDays={streakDays}
                  onNavigateToCalc={() => setActiveTab('calculator')}
                />
              )}
              {activeTab === 'calculator' && (
                <Calculator 
                  initialInputs={currentCalc?.inputs} 
                  onSave={handleSaveCalculation} 
                />
              )}
              {activeTab === 'actions' && (
                <DailyActions 
                  dailyActions={dailyActions}
                  onToggleAction={handleToggleAction}
                  level={level}
                  points={points}
                  streakDays={streakDays}
                  isAuthenticated={!!user}
                  onAuthenticate={handleLogin}
                />
              )}
              {activeTab === 'coach' && (
                <AICoach 
                  currentCalc={currentCalc} 
                  history={history} 
                />
              )}
              {activeTab === 'profile' && (
                <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <Card>
                    <h3 style={{ marginBottom: '1rem' }}>Local Data Administration</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                      Download a JSON file containing all IndexedDB calculator entries or upload an existing backup file to restore records.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <button 
                        className="btn btn-secondary"
                        onClick={async () => {
                          const dataStr = JSON.stringify({ history }, null, 2);
                          const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                          const link = document.createElement('a');
                          link.setAttribute('href', dataUri);
                          link.setAttribute('download', `ecometrics_backup_${Date.now()}.json`);
                          link.click();
                        }}
                      >
                        Export Database
                      </button>
                      <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                        Import Database
                        <input 
                          type="file" 
                          accept=".json" 
                          style={{ display: 'none' }}
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = async (evt) => {
                              try {
                                const parsed = JSON.parse(evt.target.result);
                                if (parsed && Array.isArray(parsed.history)) {
                                  for (const calc of parsed.history) {
                                    await db.saveCalculation(calc);
                                  }
                                  window.location.reload();
                                }
                              } catch {
                                alert('Failed to parse database file.');
                              }
                            };
                            reader.readAsText(file);
                          }}
                        />
                      </label>
                    </div>
                  </Card>
                  
                  <Card style={{ borderColor: 'var(--accent-danger)' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--accent-danger)' }}>Wipe Application Data</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                      This action will wipe all carbon logs, XP progression settings, and streaking configurations from the local browser storage.
                    </p>
                    <button 
                      className="btn" 
                      style={{ backgroundColor: 'var(--accent-danger)', color: '#ffffff' }}
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete all local carbon logs and XP progress? This cannot be undone.')) {
                          await db.clearAllData();
                          window.location.reload();
                        }
                      }}
                    >
                      Delete All Data
                    </button>
                  </Card>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Pulse Keyframe Animation */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
      `}</style>
      </div>
    </>
  );
}
