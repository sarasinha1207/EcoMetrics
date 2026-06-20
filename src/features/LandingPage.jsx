import React, { useState, useEffect } from 'react';
import { EMISSION_FACTORS } from '../utils/calculations';

// Reusable SVG icons for features grid and nav items
const Icons = {
  globe: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20M12 2a14.5 14.5 0 0 1 0 20M2 12h20" />
    </svg>
  ),
  calculator: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="16" y2="10" />
      <circle cx="8" cy="14" r="1" /><circle cx="12" cy="14" r="1" /><circle cx="16" cy="14" r="1" />
      <circle cx="8" cy="18" r="1" /><circle cx="12" cy="18" r="1" /><circle cx="16" cy="18" r="1" />
    </svg>
  ),
  coach: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
    </svg>
  ),
  simulator: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  roadmap: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18l6-6-6-6" />
      <path d="M3 12h12" />
    </svg>
  ),
  calendar: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="16" y2="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  analytics: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  explorer: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M16.2 7.8l-2 5.6-5.6 2 2-5.6 5.6-2z" />
    </svg>
  ),
  check: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
};

export default function LandingPage({ onGetStarted, onLogin }) {
  // Live global emissions counter
  const [globalEmissions, setGlobalEmissions] = useState(0);

  // Landing simulator states (reductions)
  const [reduceDriving, setReduceDriving] = useState(120); // Weekly km reduced
  const [reduceElec, setReduceElec] = useState(150); // Monthly kWh reduced
  const [thermostatOffset, setThermostatOffset] = useState(4); // Degrees offset

  useEffect(() => {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();
    const updateTicker = () => {
      const elapsedSeconds = (Date.now() - startOfYear) / 1000;
      const currentEmissions = 1450000000 + elapsedSeconds * 1166.9; // 1,166.9 tonnes/second
      setGlobalEmissions(currentEmissions);
    };
    updateTicker();
    const interval = setInterval(updateTicker, 100);
    return () => clearInterval(interval);
  }, []);

  // Compute simulated results on the fly
  const savedDrivingCo2 = (reduceDriving * EMISSION_FACTORS.transport.gasolineVehicle * 52) / 1000;
  const savedElecCo2 = (reduceElec * EMISSION_FACTORS.housing.electricityKwh * 12) / 1000;
  const savedGasCo2 = (thermostatOffset * 10 * EMISSION_FACTORS.housing.naturalGasTherm * 12) / 1000;
  
  const co2ReducedSim = parseFloat((savedDrivingCo2 + savedElecCo2 + savedGasCo2).toFixed(1));
  const costSavingsSim = Math.round((reduceDriving * 0.15 * 52) + (reduceElec * 0.16 * 12) + (thermostatOffset * 1.50 * 10 * 12));

  // Clamping score metric: baseline is 38, goes up to 100
  const simulatedScore = Math.min(100, 38 + Math.round(co2ReducedSim * 8.5));

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="dark-landing">
      
      {/* 1. Navigation Bar */}
      <header className="dark-nav">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.25rem', color: '#10b981' }}>
            <img src="/ecometrics_logo.png" alt="" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            <span>ECOMETRICS</span>
          </div>

          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <button className="landing-nav-link" onClick={() => scrollToSection('feature-grid')}>Features</button>
            <button className="landing-nav-link" onClick={() => scrollToSection('how-it-works')}>How It Works</button>
            <button className="landing-nav-link" onClick={() => scrollToSection('dashboard-preview')}>Dashboard Preview</button>
            <button className="landing-nav-link" onClick={onLogin}>Sign In</button>
            <button className="btn dark-btn-primary" onClick={onGetStarted}>Get Started</button>
          </nav>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="container dark-hero" style={{ padding: '5rem 1.5rem' }}>
        <div className="landing-grid-2">
          
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.5rem' }}>
            <span style={{ 
              alignSelf: 'flex-start',
              backgroundColor: 'rgba(16,185,129,0.1)', 
              color: '#10b981', 
              padding: '0.4rem 0.8rem', 
              borderRadius: '20px', 
              fontSize: '0.75rem', 
              fontWeight: 700 
            }}>
              ENTERPRISE-GRADE CARBON INTELLIGENCE
            </span>
            <h1 style={{ fontSize: '3.25rem', lineHeight: '1.1', color: '#ffffff' }}>
              Turn Climate Insights Into Carbon Reductions
            </h1>
            <p className="dark-text-muted" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
              EcoMetrics is a modern carbon intelligence platform for individuals. Log carbon profiles, analyze emission drivers using Gemini AI, and schedule recurring calendar slot changes.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button className="btn dark-btn-primary" style={{ padding: '0.9rem 1.8rem' }} onClick={onGetStarted}>
                Get Started Free →
              </button>
              <button className="btn dark-btn-secondary" style={{ padding: '0.9rem 1.8rem' }} onClick={() => scrollToSection('simulator-preview')}>
                Explore Simulator
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', fontSize: '0.8rem', color: '#64748b' }}>
              <span>✓ Powered by Gemini AI</span>
              <span>✓ Google Calendar Synced</span>
              <span>✓ Under 186KB Bundle</span>
            </div>
          </div>

          {/* Hero Ticking Counter visual */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="dark-card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>
                GLOBAL EMISSIONS THIS YEAR (TONNES)
              </span>
              <p style={{ 
                fontSize: '2.25rem', 
                fontWeight: 700, 
                color: '#ffffff', 
                margin: '0.75rem 0',
                fontFamily: 'monospace'
              }}>
                {Math.round(globalEmissions).toLocaleString()}
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.35rem 0.8rem', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '2rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                Ticking up by ~1,100 tons every second
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="dark-card-inner">
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>YOUR TARGET</span>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>2.0 T/yr</p>
                </div>
                <div className="dark-card-inner">
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>GLOBAL AVG</span>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ef4444' }}>4.7 T/yr</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Carbon Impact Simulator Preview */}
      <section id="simulator-preview" className="landing-section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            <h2 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>Carbon Impact Simulator</h2>
            <p className="dark-text-muted">Simulate carbon savings, monetary offsets, and environmental rating improvements by adjusting habits before you start.</p>
          </div>

          <div className="simulator-dashboard">
            
            {/* Left Column (60%): Habit Adjustment Panel */}
            <div className="dark-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>Adjust Simulated Habits</h3>
              
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  <label htmlFor="sim-drive-reduction" style={{ color: '#cbd5e1' }}>Reduce Weekly Driving (km)</label>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>-{reduceDriving} km</span>
                </div>
                <input 
                  type="range" id="sim-drive-reduction" min="0" max="500" step="10" className="form-control"
                  style={{ accentColor: '#10b981', padding: '0.25rem 0', border: 'none', background: 'none' }}
                  value={reduceDriving} onChange={(e) => setReduceDriving(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  <label htmlFor="sim-elec-reduction" style={{ color: '#cbd5e1' }}>Reduce Electricity (kWh/month)</label>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>-{reduceElec} kWh</span>
                </div>
                <input 
                  type="range" id="sim-elec-reduction" min="0" max="400" step="10" className="form-control"
                  style={{ accentColor: '#10b981', padding: '0.25rem 0', border: 'none', background: 'none' }}
                  value={reduceElec} onChange={(e) => setReduceElec(Number(e.target.value))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  <label htmlFor="sim-temp-offset" style={{ color: '#cbd5e1' }}>Thermostat Offset (degrees)</label>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>+{thermostatOffset} °F</span>
                </div>
                <input 
                  type="range" id="sim-temp-offset" min="0" max="8" step="1" className="form-control"
                  style={{ accentColor: '#10b981', padding: '0.25rem 0', border: 'none', background: 'none' }}
                  value={thermostatOffset} onChange={(e) => setThermostatOffset(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Right Column (40%): 2x2 KPI Analytics Grid */}
            <div className="simulator-right-grid">
              
              {/* Card 1: CO2 Reduction */}
              <div className="dark-card" style={{ borderLeft: '4px solid #10b981', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>CO2 REDUCTION</span>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', margin: '0.25rem 0' }}>
                  {co2ReducedSim} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8' }}>t/yr</span>
                </p>
                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Reduced from baseline index</span>
              </div>

              {/* Card 2: Cost Savings */}
              <div className="dark-card" style={{ borderLeft: '4px solid #10b981', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>COST SAVINGS</span>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981', margin: '0.25rem 0' }}>
                  ${costSavingsSim.toLocaleString()} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8' }}>/ yr</span>
                </p>
                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Resource cost offsets</span>
              </div>

              {/* Card 3: Eco Score */}
              <div className="dark-card" style={{ borderLeft: '4px solid #3b82f6', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>ECO SCORE</span>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6', margin: '0.25rem 0' }}>
                  {simulatedScore} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8' }}>/ 100</span>
                </p>
                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Projected behavior index</span>
              </div>

              {/* Card 4: Sustainability Rating */}
              <div className="dark-card" style={{ borderLeft: '4px solid #3b82f6', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>RATING TIER</span>
                <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: '0.25rem 0', textTransform: 'uppercase' }}>
                  {simulatedScore >= 80 ? 'Optimized' : simulatedScore >= 55 ? 'Developing' : 'Seedling'}
                </p>
                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Active profile tier</span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section id="how-it-works" className="landing-section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3.5rem auto' }}>
            <h2 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>How It Works</h2>
            <p className="dark-text-muted">A systematic approach to lifestyle carbon reduction.</p>
          </div>

          <div className="landing-grid-3">
            <div className="dark-card" style={{ textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontWeight: 700, color: '#10b981' }}>1</div>
              <h3 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>Assess</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Log your weekly transport distances, home energy bills, and dietary inputs in the multi-category carbon calculator.</p>
            </div>
            <div className="dark-card" style={{ textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontWeight: 700, color: '#10b981' }}>2</div>
              <h3 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>Analyze</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>The Gemini Carbon Coach reviews your profiles, extracting emission drivers and estimating local financial offsets.</p>
            </div>
            <div className="dark-card" style={{ textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontWeight: 700, color: '#10b981' }}>3</div>
              <h3 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>Improve</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Schedule recurring carbon-reducing habits directly to your Google Calendar to build long-term sustainability routines.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AI Carbon Coach Showcase */}
      <section className="landing-section">
        <div className="container">
          <div className="landing-grid-2">
            
            {/* Mock chat console */}
            <div className="dark-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>AI COACH CONSOLE</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Gemini Active</span>
              </div>
              
              <div className="dark-card-inner">
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>USER PROMPT</span>
                <p style={{ fontSize: '0.85rem', color: '#ffffff', marginTop: '0.25rem' }}>
                  Draft a carbon reduction plan for high transport emissions.
                </p>
              </div>

              <div className="dark-card-inner" style={{ backgroundColor: 'rgba(16, 185, 129, 0.02)' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>GEMINI RESPONSE</span>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <p style={{ fontWeight: 600, color: '#ffffff' }}>### Footprint Assessment</p>
                  <p>Your transport accounts for 62% of emissions. Focus on driving offsets.</p>
                  <p style={{ fontWeight: 600, color: '#ffffff' }}>### Action Plan</p>
                  <p>1. Commute via bus on Tuesdays/Thursdays. Savings: -$400/yr, -1.2t CO2.</p>
                  <p>2. Transit challenge: schedule a Google Calendar habit sequence.</p>
                </div>
              </div>
            </div>

            {/* AI value pitch */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.5rem' }}>
              <h2 style={{ color: '#ffffff' }}>Personalized Insights with Gemini</h2>
              <p className="dark-text-muted">
                Receive contextual carbon analytics. Our integration uses Gemini to analyze your local log trends, producing structured lifestyle roadmaps with estimated financial and CO2 savings.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {Icons.check()}
                  <span>Contextual carbon driver analysis</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {Icons.check()}
                  <span>Twin simulation showing cost savings</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {Icons.check()}
                  <span>Automatic calendar sync recommendation</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Feature Grid */}
      <section id="feature-grid" className="landing-section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3.5rem auto' }}>
            <h2 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>Core Capabilities</h2>
            <p className="dark-text-muted">An integrated suite designed for measurable behavior changes.</p>
          </div>

          <div className="landing-grid-4">
            <div className="dark-card">
              <div style={{ color: '#10b981', marginBottom: '0.75rem' }}>{Icons.calculator()}</div>
              <h3 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '0.4rem' }}>Carbon Calculator</h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Interactive multi-category wizard using standard EPA emissions factors.</p>
            </div>
            <div className="dark-card">
              <div style={{ color: '#10b981', marginBottom: '0.75rem' }}>{Icons.coach()}</div>
              <h3 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '0.4rem' }}>Gemini AI Coach</h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Dynamic sustainability analysis generated from carbon log history.</p>
            </div>
            <div className="dark-card">
              <div style={{ color: '#10b981', marginBottom: '0.75rem' }}>{Icons.simulator()}</div>
              <h3 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '0.4rem' }}>Impact Simulator</h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Real-time adjustments to check projected CO2 and financial savings.</p>
            </div>
            <div className="dark-card">
              <div style={{ color: '#10b981', marginBottom: '0.75rem' }}>{Icons.roadmap()}</div>
              <h3 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '0.4rem' }}>Roadmap Builder</h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tailored schedules for transitioning into low-carbon habits.</p>
            </div>
            <div className="dark-card">
              <div style={{ color: '#10b981', marginBottom: '0.75rem' }}>{Icons.calendar()}</div>
              <h3 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '0.4rem' }}>Calendar Integration</h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sync challenges directly to Google Calendar as recurring slots.</p>
            </div>
            <div className="dark-card">
              <div style={{ color: '#10b981', marginBottom: '0.75rem' }}>{Icons.analytics()}</div>
              <h3 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '0.4rem' }}>Progress Analytics</h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Historical SVG trend line plotting footprint records over time.</p>
            </div>
            <div className="dark-card">
              <div style={{ color: '#10b981', marginBottom: '0.75rem' }}>{Icons.explorer()}</div>
              <h3 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '0.4rem' }}>Emission Explorer</h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Benchmark comparisons with global averages and regional figures.</p>
            </div>
            <div className="dark-card">
              <div style={{ color: '#10b981', marginBottom: '0.75rem' }}>{Icons.globe()}</div>
              <h3 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '0.4rem' }}>Local Portability</h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Zero-Knowledge IndexedDB storage with full JSON export options.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Sustainability Score Section */}
      <section className="landing-section">
        <div className="container">
          <div className="landing-grid-2">
            
            {/* Score Preview Widget */}
            <div className="dark-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-around' }}>
              {/* Radial gauge */}
              <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                <svg width="100%" height="100%" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray="78, 100"
                  />
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>78</span>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>ECOSCORE</span>
                </div>
              </div>

              {/* Breakdown progress bars */}
              <div style={{ flex: 1, minWidth: '160px', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
                    <span>Transit</span>
                    <span>2.4t</span>
                  </div>
                  <div className="category-progress" style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="category-progress-fill" style={{ width: '45%', backgroundColor: 'var(--accent-teal)' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
                    <span>Home Energy</span>
                    <span>1.1t</span>
                  </div>
                  <div className="category-progress" style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="category-progress-fill" style={{ width: '22%', backgroundColor: 'var(--accent-sky)' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
                    <span>Diet</span>
                    <span>1.3t</span>
                  </div>
                  <div className="category-progress" style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="category-progress-fill" style={{ width: '25%', backgroundColor: 'var(--accent-emerald)' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Pitch Text */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.25rem' }}>
              <h2 style={{ color: '#ffffff' }}>Gamified EcoScore System</h2>
              <p className="dark-text-muted">
                Track your rating on a clean 1-100 index. As you reduce consumption and check off daily actions, watch your score increment and advance levels.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 8. Challenge System Preview */}
      <section className="landing-section">
        <div className="container">
          <div className="landing-grid-2">
            
            {/* Text details */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.25rem' }}>
              <h2 style={{ color: '#ffffff' }}>Google Calendar Habit Sync</h2>
              <p className="dark-text-muted">
                Ditch basic notifications. EcoMetrics synchronizes recurring habit reminders (e.g. meatless preparation or transit days) directly to your calendar slots, reinforcing behavior changes.
              </p>
            </div>

            {/* Challenge preview cards */}
            <div className="dark-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>Active challenges</span>
                <span style={{ fontSize: '0.75rem', color: '#10b981' }}>Calendar Connected</span>
              </div>

              <div className="dark-card-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#ffffff' }}>Plant-Based Commits</p>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Mondays, Wednesdays  •  4 Weeks</span>
                </div>
                <button className="btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem', backgroundColor: 'rgba(255,255,255,0.08)', color: '#ffffff' }} disabled>
                  Synced
                </button>
              </div>

              <div className="dark-card-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#ffffff' }}>Public Transit Shift</p>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tuesdays, Thursdays  •  8 Weeks</span>
                </div>
                <button className="btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem', backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }} disabled>
                  Syncing...
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. Progress Tracking Section */}
      <section id="dashboard-preview" className="landing-section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3.5rem auto' }}>
            <h2 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>Visual Progress Tracking</h2>
            <p className="dark-text-muted">Plot your carbon footprint reduction path over time against sustainability targets.</p>
          </div>

          <div className="landing-grid-2">
            
            {/* SVG line chart mockup */}
            <div className="dark-card" style={{ display: 'flex', flexDirection: 'column', height: '260px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '1rem', display: 'block' }}>DAILY EMISSIONS TREND (KG CO2e)</span>
              <div style={{ flex: 1, position: 'relative' }}>
                <svg viewBox="0 0 500 150" width="100%" height="100%" style={{ overflow: 'visible' }}>
                  {/* Grid lines */}
                  <line x1="40" y1="20" x2="460" y2="20" stroke="rgba(255,255,255,0.03)" />
                  <line x1="40" y1="75" x2="460" y2="75" stroke="rgba(255,255,255,0.03)" />
                  <line x1="40" y1="130" x2="460" y2="130" stroke="rgba(255,255,255,0.03)" />
                  
                  {/* Target benchmark red dashed line */}
                  <line x1="40" y1="120" x2="460" y2="120" stroke="#ef4444" strokeDasharray="3 3" />
                  
                  {/* Trend line path */}
                  <path d="M 40 30 L 110 50 L 180 40 L 250 85 L 320 65 L 390 110 L 460 95" fill="none" stroke="#10b981" strokeWidth="2.5" />
                  
                  {/* Points */}
                  <circle cx="460" cy="95" r="4" fill="#0d121f" stroke="#10b981" strokeWidth="2.5" />
                </svg>
              </div>
            </div>

            {/* Goals details */}
            <div style={{ display: 'flex', flexDirection: 'column', justifySelf: 'center', justifyContent: 'center', gap: '1rem', width: '100%', maxWidth: '440px' }}>
              <div className="dark-card-inner" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <div>
                  <h4 style={{ color: '#ffffff', fontSize: '0.9rem' }}>Sustainable target alignment</h4>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Reductions slope downwards towards the &lt;2.0 T/yr limit.</p>
                </div>
              </div>
              
              <div className="dark-card-inner" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                <div>
                  <h4 style={{ color: '#ffffff', fontSize: '0.9rem' }}>Streaking and habit triggers</h4>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Logs history track streak counts to lock habits.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 10. Global Awareness Section */}
      <section className="landing-section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            <h2 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>Global Benchmark Comparisons</h2>
            <p className="dark-text-muted">Compare local averages with global sustainability metrics.</p>
          </div>

          <div className="landing-grid-3">
            <div className="dark-card">
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ef4444' }}>USA AVERAGE</span>
              <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', margin: '0.25rem 0' }}>16.0 T/yr</p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>High consumption energy reliance, heavy personal vehicle usage averages.</p>
            </div>
            <div className="dark-card">
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ef4444' }}>GLOBAL AVERAGE</span>
              <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', margin: '0.25rem 0' }}>4.7 T/yr</p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Current baseline per capita across developed and developing regions.</p>
            </div>
            <div className="dark-card">
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981' }}>SAFE TARGET</span>
              <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10b981', margin: '0.25rem 0' }}>&lt; 2.0 T/yr</p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Required individual ceiling to limit global temperature rises to 2°C by 2050.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Final CTA Section */}
      <section className="landing-section" style={{ backgroundColor: 'rgba(16, 185, 129, 0.02)', textAlign: 'center' }}>
        <div className="container" style={{ padding: '3.5rem 1.5rem' }}>
          <h2 style={{ fontSize: '2.25rem', color: '#ffffff', marginBottom: '1rem' }}>
            Ready to transition to a low-carbon lifestyle?
          </h2>
          <p className="dark-text-muted" style={{ maxWidth: '500px', margin: '0 auto 2rem auto', fontSize: '1rem' }}>
            Get started today. Log your footprint and let our AI-powered engine plan your sustainability goals.
          </p>
          <button className="btn dark-btn-primary" style={{ padding: '1rem 2.2rem', fontSize: '1rem' }} onClick={onGetStarted}>
            Get Started Now
          </button>
        </div>
      </section>

      {/* 12. SaaS Footer */}
      <footer style={{ backgroundColor: '#05070d', borderTop: '1px solid rgba(255, 255, 255, 0.05)', padding: '4rem 0 2rem 0' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem' }}>
            {/* Logo description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.15rem', color: '#10b981' }}>
                <img src="/ecometrics_logo.png" alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                <span>ECOMETRICS</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.6' }}>
                Enterprise-grade personal carbon footprint analytics engine. Zero-knowledge local database configurations.
              </p>
            </div>

            {/* Links Column 1 */}
            <div>
              <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', letterSpacing: '0.05em' }}>PLATFORM</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
                <button className="landing-nav-link" onClick={() => scrollToSection('feature-grid')}>Features</button>
                <button className="landing-nav-link" onClick={() => scrollToSection('how-it-works')}>How It Works</button>
                <button className="landing-nav-link" onClick={() => scrollToSection('dashboard-preview')}>Dashboard Preview</button>
              </div>
            </div>

            {/* Links Column 2 */}
            <div>
              <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', letterSpacing: '0.05em' }}>METHODOLOGY</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                <span>IPCC standard factors</span>
                <span>EPA GHG hub</span>
                <span>Google GenAI SDK</span>
              </div>
            </div>

            {/* Status indicators */}
            <div>
              <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', letterSpacing: '0.05em' }}>DEPLOYMENT</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  Cloud Run Active
                </span>
                <span>SSL Secure</span>
              </div>
            </div>

          </div>

          {/* Sub-footer copyright */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.03)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
            <span>© {new Date().getFullYear()} EcoMetrics. All rights reserved.</span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
