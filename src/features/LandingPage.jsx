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
  // Scenario simulation: 'bau', 'mitigation', 'netzero'
  const [scenario, setScenario] = useState('bau');

  // Compute stats on load to prevent flash of zero
  const getInitialClimateStats = () => {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();
    const elapsedSeconds = (Date.now() - startOfYear) / 1000;
    return {
      emissions: 1450000000 + elapsedSeconds * 1166.9,
      melt: elapsedSeconds * 10400,
      loss: elapsedSeconds * 3170,
      budget: 250000000000 - elapsedSeconds * 1166.9
    };
  };

  const [initialStats] = useState(getInitialClimateStats);
  const [globalEmissions, setGlobalEmissions] = useState(initialStats.emissions);
  const [glacierMelt, setGlacierMelt] = useState(initialStats.melt);
  const [forestLoss, setForestLoss] = useState(initialStats.loss);
  const [carbonBudget, setCarbonBudget] = useState(initialStats.budget);

  // Landing simulator states (reductions)
  const [reduceDriving, setReduceDriving] = useState(120); // Weekly km reduced
  const [reduceElec, setReduceElec] = useState(150); // Monthly kWh reduced
  const [thermostatOffset, setThermostatOffset] = useState(4); // Degrees offset

  useEffect(() => {
    const rates = {
      bau: { co2: 1166.9, ice: 10400, forest: 3170 },
      mitigation: { co2: 620.5, ice: 5500, forest: 1600 },
      netzero: { co2: 240.2, ice: 2100, forest: 700 }
    };

    const currentRates = rates[scenario];
    let lastTime = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = (now - lastTime) / 1000;
      lastTime = now;

      setGlobalEmissions(prev => prev + deltaSeconds * currentRates.co2);
      setGlacierMelt(prev => prev + deltaSeconds * currentRates.ice);
      setForestLoss(prev => prev + deltaSeconds * currentRates.forest);
      setCarbonBudget(prev => prev - deltaSeconds * currentRates.co2);
    }, 100);

    return () => clearInterval(interval);
  }, [scenario]);

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
            <button className="btn dark-btn-primary" onClick={onGetStarted}>Get Started</button>
          </nav>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="container dark-hero" style={{ padding: '6rem 1.5rem' }}>
        <div className="hero-grid">
          
          <div className="hero-content">
            <div className="hero-badge">
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', animation: 'pulse 1.5s infinite' }} />
              ENTERPRISE-GRADE CARBON INTELLIGENCE
            </div>
            
            <h1 style={{ 
              fontSize: '3.5rem', 
              lineHeight: '1.1', 
              color: '#ffffff', 
              fontWeight: 800,
              letterSpacing: '-0.03em'
            }}>
              Turn Climate Insights <br />
              <span style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Into Carbon Reductions</span>
            </h1>
            
            <p className="dark-text-muted" style={{ fontSize: '1.15rem', lineHeight: '1.65', color: '#94a3b8' }}>
              EcoMetrics is a professional personal carbon intelligence platform. Plan sustainability goals, simulate habit offsets live, and analyze footprint drivers using Gemini AI—all saved locally with zero-knowledge privacy.
            </p>
            
            <div className="hero-buttons">
              <button 
                className="btn dark-btn-primary" 
                style={{ 
                  padding: '1rem 2rem', 
                  fontSize: '0.95rem', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.25)',
                  transition: 'all 0.2s'
                }} 
                onClick={onGetStarted}
              >
                Get Started Free →
              </button>
              <button 
                className="btn dark-btn-secondary" 
                style={{ 
                  padding: '1rem 2rem', 
                  fontSize: '0.95rem', 
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.2s'
                }} 
                onClick={() => scrollToSection('simulator-preview')}
              >
                Explore Simulator
              </button>
            </div>
          </div>

          {/* Right Side: Generated Image Hero Visual */}
          <div className="hero-visual">
            <div className="hero-image-glow" />
            <img 
              src="/ecometrics_hero.png" 
              alt="SaaS Sustainability Dashboard illustration showing carbon progress charts, wind turbines, and eco metrics" 
              className="hero-image"
            />
          </div>
        </div>

        {/* Global Emissions Counter Telemetry Dashboard */}
        <div className="telemetry-container">
          <div className="telemetry-header">
            <div className="telemetry-title-block">
              <span className="telemetry-pulse-dot" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', letterSpacing: '0.1em' }}>
                PLANETARY HEALTH PULSE • LIVE TELEMETRY
              </span>
            </div>
            
            {/* Scenario Selector */}
            <div className="scenario-tabs">
              <button 
                className={`scenario-tab ${scenario === 'bau' ? 'active' : ''}`}
                onClick={() => setScenario('bau')}
              >
                Business As Usual
              </button>
              <button 
                className={`scenario-tab ${scenario === 'mitigation' ? 'active' : ''}`}
                onClick={() => setScenario('mitigation')}
              >
                Active Mitigation
              </button>
              <button 
                className={`scenario-tab ${scenario === 'netzero' ? 'active' : ''}`}
                onClick={() => setScenario('netzero')}
              >
                Net Zero Target
              </button>
            </div>
          </div>

          <div className="telemetry-grid">
            {/* Column 1: Live Carbon Metrics */}
            <div className="telemetry-col">
              {/* Metric 1: Global CO2 Emissions */}
              <div className="telemetry-card">
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>
                  GLOBAL CO2 EMISSIONS THIS YEAR (TONNES)
                </span>
                <p className="telemetry-number">
                  {Math.round(globalEmissions).toLocaleString()}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    color: scenario === 'bau' ? '#ef4444' : scenario === 'mitigation' ? '#f59e0b' : '#10b981'
                  }}>
                    {scenario === 'bau' 
                      ? '+1,166.9 tonnes of CO2 per second' 
                      : scenario === 'mitigation' 
                        ? '+620.5 tonnes of CO2 per second' 
                        : '+240.2 tonnes of CO2 per second'}
                  </span>
                </div>
                <p className="telemetry-analogy">
                  Equivalent to emissions from {scenario === 'bau' ? '253 million' : scenario === 'mitigation' ? '135 million' : '52 million'} cars driven for a year.
                </p>
              </div>

              {/* Metric 2: Remaining Carbon Budget */}
              <div className="telemetry-card">
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>
                  REMAINING 1.5°C CARBON BUDGET (TONNES)
                </span>
                <p className="telemetry-number" style={{ color: '#06b6d4' }}>
                  {Math.round(carbonBudget).toLocaleString()}
                </p>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill cyan" 
                    style={{ width: `${Math.max(0, Math.min(100, (carbonBudget / 250000000000) * 100))}%` }} 
                  />
                </div>
                <p className="telemetry-analogy" style={{ borderLeftColor: 'rgba(6, 182, 212, 0.3)' }}>
                  At current pace, the 1.5°C threshold budget will be depleted in ~6.5 years (2032).
                </p>
              </div>
            </div>

            {/* Column 2: Live Ecological Indicators */}
            <div className="telemetry-col">
              {/* Metric 3: Glacier Ice Melt */}
              <div className="telemetry-card">
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>
                  GLACIER ICE MELTED THIS YEAR (TONNES)
                </span>
                <p className="telemetry-number" style={{ fontSize: '2.25rem' }}>
                  {Math.round(glacierMelt).toLocaleString()}
                </p>
                <p className="telemetry-analogy">
                  Melt speed: {scenario === 'bau' ? '10,400' : scenario === 'mitigation' ? '5,500' : '2,100'} tonnes/sec (~4 Olympic pools/sec under BAU).
                </p>
              </div>

              {/* Metric 4: Deforestation canopy lost */}
              <div className="telemetry-card">
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>
                  FOREST CANOPY LOST THIS YEAR (SQ. METERS)
                </span>
                <p className="telemetry-number" style={{ fontSize: '2.25rem' }}>
                  {Math.round(forestLoss).toLocaleString()}
                </p>
                <p className="telemetry-analogy">
                  Loss speed: {scenario === 'bau' ? '3,170' : scenario === 'mitigation' ? '1,600' : '700'} m²/sec (~10 football fields/min under BAU).
                </p>
              </div>

              {/* Benchmarks Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                paddingTop: '1.5rem',
                marginTop: '0.5rem'
              }}>
                <div className="dark-card-inner" style={{ padding: '0.75rem 1rem' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>SAFE CEILING</span>
                  <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', marginTop: '0.15rem' }}>2.0 Tonnes/yr</p>
                </div>
                <div className="dark-card-inner" style={{ padding: '0.75rem 1rem' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>GLOBAL AVERAGE</span>
                  <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444', marginTop: '0.15rem' }}>4.7 Tonnes/yr</p>
                </div>
              </div>
            </div>
          </div>

          <div className="telemetry-footer">
            <span>Data Models: IPCC Sixth Assessment Report (AR6) & NOAA Climate Portal</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="telemetry-pulse-dot" style={{ width: '6px', height: '6px' }} />
              <span>Simulated Real-Time Feed</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Carbon Impact Simulator Preview */}
      <section id="simulator-preview" className="landing-section" style={{ padding: '6rem 1.5rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 4rem auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>HABIT MODELING</span>
            <h2 style={{ fontSize: '2.5rem', color: '#ffffff', fontWeight: 800, letterSpacing: '-0.02em' }}>Carbon Impact Simulator</h2>
            <p className="dark-text-muted" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>Simulate carbon savings, monetary offsets, and environmental rating improvements by adjusting habits before you start.</p>
          </div>

          <div className="simulator-dashboard" style={{ gap: '2rem' }}>
            
            {/* Left Column (60%): Habit Adjustment Panel */}
            <div className="dark-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2.5rem', background: '#0d1527' }}>
              <h3 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 700 }}>Adjust Simulated Habits</h3>
              
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#cbd5e1' }}>
                  <label htmlFor="sim-drive-reduction" style={{ color: '#94a3b8', fontWeight: 500 }}>Reduce Weekly Driving (km)</label>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>-{reduceDriving} km</span>
                </div>
                <input 
                  type="range" id="sim-drive-reduction" min="0" max="500" step="10" className="form-control"
                  style={{ accentColor: '#10b981', padding: '0.25rem 0', border: 'none', background: 'none', cursor: 'pointer' }}
                  value={reduceDriving} onChange={(e) => setReduceDriving(Number(e.target.value))}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#cbd5e1' }}>
                  <label htmlFor="sim-elec-reduction" style={{ color: '#94a3b8', fontWeight: 500 }}>Reduce Electricity (kWh/month)</label>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>-{reduceElec} kWh</span>
                </div>
                <input 
                  type="range" id="sim-elec-reduction" min="0" max="400" step="10" className="form-control"
                  style={{ accentColor: '#10b981', padding: '0.25rem 0', border: 'none', background: 'none', cursor: 'pointer' }}
                  value={reduceElec} onChange={(e) => setReduceElec(Number(e.target.value))}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#cbd5e1' }}>
                  <label htmlFor="sim-temp-offset" style={{ color: '#94a3b8', fontWeight: 500 }}>Thermostat Offset (degrees)</label>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>+{thermostatOffset} °F</span>
                </div>
                <input 
                  type="range" id="sim-temp-offset" min="0" max="8" step="1" className="form-control"
                  style={{ accentColor: '#10b981', padding: '0.25rem 0', border: 'none', background: 'none', cursor: 'pointer' }}
                  value={thermostatOffset} onChange={(e) => setThermostatOffset(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Right Column (40%): 2x2 KPI Analytics Grid */}
            <div className="simulator-right-grid" style={{ gap: '1rem' }}>
              
              {/* Card 1: CO2 Reduction */}
              <div className="dark-card" style={{ borderLeft: '4px solid #10b981', background: '#0d1527', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem', borderRadius: '16px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>CO2 REDUCTION</span>
                <p style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', margin: '0.25rem 0' }}>
                  {co2ReducedSim} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#94a3b8' }}>t/yr</span>
                </p>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Reduced from baseline index</span>
              </div>

              {/* Card 2: Cost Savings */}
              <div className="dark-card" style={{ borderLeft: '4px solid #10b981', background: '#0d1527', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem', borderRadius: '16px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>COST SAVINGS</span>
                <p style={{ fontSize: '1.85rem', fontWeight: 800, color: '#10b981', margin: '0.25rem 0' }}>
                  ${costSavingsSim.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#94a3b8' }}>/ yr</span>
                </p>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Resource cost offsets</span>
              </div>

              {/* Card 3: Eco Score */}
              <div className="dark-card" style={{ borderLeft: '4px solid #06b6d4', background: '#0d1527', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem', borderRadius: '16px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>ECO SCORE</span>
                <p style={{ fontSize: '1.85rem', fontWeight: 800, color: '#06b6d4', margin: '0.25rem 0' }}>
                  {simulatedScore} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#94a3b8' }}>/ 100</span>
                </p>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Projected behavior index</span>
              </div>

              {/* Card 4: Sustainability Rating */}
              <div className="dark-card" style={{ borderLeft: '4px solid #06b6d4', background: '#0d1527', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem', borderRadius: '16px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>RATING TIER</span>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0.25rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {simulatedScore >= 80 ? 'Optimized' : simulatedScore >= 55 ? 'Developing' : 'Seedling'}
                </p>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Active profile tier</span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section id="how-it-works" className="landing-section" style={{ padding: '6rem 1.5rem', background: 'linear-gradient(180deg, #070a13 0%, #0c1122 100%)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 4rem auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>HABIT METHODOLOGY</span>
            <h2 style={{ fontSize: '2.5rem', color: '#ffffff', fontWeight: 800, letterSpacing: '-0.02em' }}>How It Works</h2>
            <p className="dark-text-muted" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>A systematic approach to lifestyle carbon reduction.</p>
          </div>

          <div className="landing-grid-3" style={{ gap: '2rem' }}>
            <div className="dark-card" style={{ textAlign: 'center', background: '#0d1527', padding: '2.5rem', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontWeight: 800, color: '#10b981', fontSize: '1.1rem' }}>1</div>
              <h3 style={{ color: '#ffffff', marginBottom: '0.75rem', fontSize: '1.25rem' }}>Assess</h3>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6' }}>Log your weekly transport distances, home energy bills, and dietary inputs in the multi-category carbon calculator.</p>
            </div>
            <div className="dark-card" style={{ textAlign: 'center', background: '#0d1527', padding: '2.5rem', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontWeight: 800, color: '#06b6d4', fontSize: '1.1rem' }}>2</div>
              <h3 style={{ color: '#ffffff', marginBottom: '0.75rem', fontSize: '1.25rem' }}>Analyze</h3>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6' }}>The Gemini Carbon Coach reviews your profiles, extracting emission drivers and estimating local financial offsets.</p>
            </div>
            <div className="dark-card" style={{ textAlign: 'center', background: '#0d1527', padding: '2.5rem', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontWeight: 800, color: '#6366f1', fontSize: '1.1rem' }}>3</div>
              <h3 style={{ color: '#ffffff', marginBottom: '0.75rem', fontSize: '1.25rem' }}>Improve</h3>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6' }}>Schedule recurring carbon-reducing habits directly to your local calendar dashboard to build long-term sustainability routines.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AI Carbon Coach Showcase */}
      <section className="landing-section" style={{ padding: '6rem 1.5rem' }}>
        <div className="container">
          <div className="landing-grid-2" style={{ alignItems: 'center', gap: '4rem' }}>
            
            {/* Mock chat console */}
            <div className="dark-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1px solid rgba(16, 185, 129, 0.15)', padding: '2rem', background: '#0d1527' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', letterSpacing: '0.05em' }}>AI COACH CONSOLE</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Gemini Active</span>
              </div>
              
              <div className="dark-card-inner" style={{ background: '#080d1a', border: '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, letterSpacing: '0.05em' }}>USER REQUEST</span>
                <p style={{ fontSize: '0.9rem', color: '#ffffff', marginTop: '0.35rem', fontWeight: 500 }}>
                  Draft a carbon reduction plan for high transport emissions.
                </p>
              </div>

              <div className="dark-card-inner" style={{ background: '#080d1a', border: '1px solid rgba(16, 185, 129, 0.05)' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>GEMINI RESPONSE</span>
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', lineHeight: '1.6' }}>
                  <p style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>### Footprint Assessment</p>
                  <p>Your transport accounts for 62% of emissions. Focus on driving offsets.</p>
                  <p style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>### Action Plan</p>
                  <p>1. Commute via bus on Tuesdays/Thursdays. Savings: -$400/yr, -1.2t CO2.</p>
                  <p>2. Transit challenge: schedule a Google Calendar habit sequence.</p>
                </div>
              </div>
            </div>

            {/* Right Side: AI Illustration & Value pitch */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ 
                  position: 'absolute', 
                  width: '280px', 
                  height: '280px', 
                  background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)',
                  filter: 'blur(30px)',
                  zIndex: 0
                }} />
                <img 
                  src="/ecometrics_ai.png" 
                  alt="AI neural network analyzing environmental data nodes" 
                  style={{ 
                    width: '100%', 
                    maxWidth: '400px', 
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                    zIndex: 1
                  }} 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontSize: '2.25rem', color: '#ffffff', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  Personalized Insights with Gemini
                </h2>
                <p className="dark-text-muted" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                  Receive contextual carbon analytics. Our integration uses Gemini to analyze your local log trends, producing structured lifestyle roadmaps with estimated financial and CO2 savings.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem', color: '#cbd5e1', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {Icons.check()}
                    <span>Contextual carbon driver analysis</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {Icons.check()}
                    <span>Twin simulation showing cost savings</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {Icons.check()}
                    <span>Automatic calendar sync recommendation</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Feature Grid */}
      <section id="feature-grid" className="landing-section" style={{ padding: '6rem 1.5rem', background: 'linear-gradient(180deg, #070a13 0%, #0d1527 100%)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 4rem auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>CAPABILITIES</span>
            <h2 style={{ fontSize: '2.5rem', color: '#ffffff', fontWeight: 800, letterSpacing: '-0.02em' }}>Core Capabilities</h2>
            <p className="dark-text-muted" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>An integrated suite designed for measurable behavior changes.</p>
          </div>

          <div className="landing-grid-4" style={{ gap: '1.5rem' }}>
            <div className="dark-card" style={{ background: '#0a0f1d', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '16px', padding: '1.75rem' }}>
              <div style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>{Icons.calculator()}</div>
              <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Carbon Calculator</h3>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>Interactive multi-category wizard using standard EPA emissions factors.</p>
            </div>
            <div className="dark-card" style={{ background: '#0a0f1d', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '16px', padding: '1.75rem' }}>
              <div style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>{Icons.coach()}</div>
              <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Gemini AI Coach</h3>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>Dynamic sustainability analysis generated from carbon log history.</p>
            </div>
            <div className="dark-card" style={{ background: '#0a0f1d', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '16px', padding: '1.75rem' }}>
              <div style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>{Icons.simulator()}</div>
              <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Impact Simulator</h3>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>Real-time adjustments to check projected CO2 and financial savings.</p>
            </div>
            <div className="dark-card" style={{ background: '#0a0f1d', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '16px', padding: '1.75rem' }}>
              <div style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>{Icons.roadmap()}</div>
              <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Roadmap Builder</h3>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>Tailored schedules for transitioning into low-carbon habits.</p>
            </div>
            <div className="dark-card" style={{ background: '#0a0f1d', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '16px', padding: '1.75rem' }}>
              <div style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>{Icons.calendar()}</div>
              <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Calendar Integration</h3>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>Sync challenges directly to Google Calendar as recurring slots.</p>
            </div>
            <div className="dark-card" style={{ background: '#0a0f1d', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '16px', padding: '1.75rem' }}>
              <div style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>{Icons.analytics()}</div>
              <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Progress Analytics</h3>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>Historical SVG trend line plotting footprint records over time.</p>
            </div>
            <div className="dark-card" style={{ background: '#0a0f1d', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '16px', padding: '1.75rem' }}>
              <div style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>{Icons.explorer()}</div>
              <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Emission Explorer</h3>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>Emission averages compared against global metrics.</p>
            </div>
            <div className="dark-card" style={{ background: '#0a0f1d', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '16px', padding: '1.75rem' }}>
              <div style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>{Icons.globe()}</div>
              <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Local Portability</h3>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>Zero-Knowledge IndexedDB storage with full JSON export options.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Sustainability Score Section */}
      <section className="landing-section" style={{ padding: '6rem 1.5rem' }}>
        <div className="container">
          <div className="landing-grid-2" style={{ alignItems: 'center', gap: '4rem' }}>
            
            {/* Score Preview Widget */}
            <div className="dark-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'center', justifyContent: 'center', padding: '2.5rem', background: '#0d1527', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px' }}>
              {/* Radial gauge */}
              <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                <svg width="100%" height="100%" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="3.5"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="url(#ecoScoreGradient)"
                    strokeWidth="3.5"
                    strokeDasharray="78, 100"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="ecoScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>78</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>ECOSCORE</span>
                </div>
              </div>

              {/* Breakdown progress bars */}
              <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem', fontWeight: 500 }}>
                    <span>Transit</span>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>2.4t</span>
                  </div>
                  <div className="category-progress" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="category-progress-fill" style={{ width: '45%', backgroundColor: 'var(--accent-teal)' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem', fontWeight: 500 }}>
                    <span>Home Energy</span>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>1.1t</span>
                  </div>
                  <div className="category-progress" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="category-progress-fill" style={{ width: '22%', backgroundColor: 'var(--accent-sky)' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem', fontWeight: 500 }}>
                    <span>Diet</span>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>1.3t</span>
                  </div>
                  <div className="category-progress" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="category-progress-fill" style={{ width: '25%', backgroundColor: 'var(--accent-emerald)' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Pitch Text */}
            <div style={{ display: 'flex', flexDirection: 'column', justifySelf: 'start', gap: '1.25rem', maxWidth: '500px' }}>
              <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>GAMIFICATION</span>
              <h2 style={{ fontSize: '2.25rem', color: '#ffffff', fontWeight: 800, letterSpacing: '-0.02em' }}>Gamified EcoScore System</h2>
              <p className="dark-text-muted" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                Track your rating on a clean 1-100 index. As you reduce consumption and check off daily actions, watch your score increment and advance levels.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 8. Challenge System Preview */}
      <section className="landing-section" style={{ padding: '6rem 1.5rem', background: 'linear-gradient(180deg, #070a13 0%, #0c1122 100%)' }}>
        <div className="container">
          <div className="landing-grid-2" style={{ alignItems: 'center', gap: '4rem' }}>
            
            {/* Text details */}
            <div style={{ display: 'flex', flexDirection: 'column', justifySelf: 'start', gap: '1.25rem', maxWidth: '500px' }}>
              <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>HABIT REMINDERS</span>
              <h2 style={{ fontSize: '2.25rem', color: '#ffffff', fontWeight: 800, letterSpacing: '-0.02em' }}>Habit Reminders & Scheduling</h2>
              <p className="dark-text-muted" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                Ditch basic notifications. EcoMetrics lets you set recurring reminders (e.g. meatless preparation or transit days) directly on your local calendar dashboard, reinforcing behavior changes.
              </p>
            </div>

            {/* Challenge preview cards */}
            <div className="dark-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2.5rem', background: '#0d1527', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>Active Challenges</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  Dashboard Connected
                </div>
              </div>

              <div className="dark-card-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: '#080d1a', borderRadius: '16px' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>Plant-Based Commits</p>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Mondays, Wednesdays  •  4 Weeks</span>
                </div>
                <button className="btn" style={{ padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.06)', color: '#ffffff', fontWeight: 600 }} disabled>
                  Scheduled
                </button>
              </div>

              <div className="dark-card-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: '#080d1a', borderRadius: '16px' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>Public Transit Shift</p>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Tuesdays, Thursdays  •  8 Weeks</span>
                </div>
                <button className="btn" style={{ padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.75rem', backgroundColor: 'rgba(16,185,129,0.12)', color: '#10b981', fontWeight: 600 }} disabled>
                  Active
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. Progress Tracking Section */}
      <section id="dashboard-preview" className="landing-section" style={{ padding: '6rem 1.5rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 4rem auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>ANALYTICS</span>
            <h2 style={{ fontSize: '2.5rem', color: '#ffffff', fontWeight: 800, letterSpacing: '-0.02em' }}>Visual Progress Tracking</h2>
            <p className="dark-text-muted" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>Plot your carbon footprint reduction path over time against sustainability targets.</p>
          </div>

          <div className="landing-grid-2" style={{ alignItems: 'center', gap: '4rem' }}>
            
            {/* SVG line chart mockup */}
            <div className="dark-card" style={{ display: 'flex', flexDirection: 'column', height: '300px', padding: '2rem', background: '#0d1527' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '1.5rem', display: 'block', letterSpacing: '0.05em' }}>DAILY EMISSIONS TREND (KG CO2e)</span>
              <div style={{ flex: 1, position: 'relative' }}>
                <svg viewBox="0 0 500 150" width="100%" height="100%" style={{ overflow: 'visible' }}>
                  {/* Grid lines */}
                  <line x1="40" y1="20" x2="460" y2="20" stroke="rgba(255,255,255,0.03)" />
                  <line x1="40" y1="75" x2="460" y2="75" stroke="rgba(255,255,255,0.03)" />
                  <line x1="40" y1="130" x2="460" y2="130" stroke="rgba(255,255,255,0.03)" />
                  
                  {/* Target benchmark red dashed line */}
                  <line x1="40" y1="120" x2="460" y2="120" stroke="#f87171" strokeDasharray="4 4" strokeWidth="1.5" />
                  <text x="450" y="112" fill="#f87171" fontSize="8" fontWeight="600" textAnchor="end">TARGET CEILING</text>
                  
                  {/* Trend line path */}
                  <path d="M 40 30 L 110 50 L 180 40 L 250 85 L 320 65 L 390 110 L 460 95" fill="none" stroke="url(#trendLineGradient)" strokeWidth="3" />
                  
                  {/* Points */}
                  <circle cx="460" cy="95" r="5" fill="#0d1527" stroke="#10b981" strokeWidth="3" />
                  
                  <defs>
                    <linearGradient id="trendLineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Goals details */}
            <div style={{ display: 'flex', flexDirection: 'column', justifySelf: 'start', gap: '1.25rem', width: '100%', maxWidth: '460px' }}>
              <div className="dark-card-inner" style={{ display: 'flex', gap: '1.25rem', alignItems: 'start', padding: '1.5rem', background: '#0d1527', borderRadius: '16px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', marginTop: '0.35rem', flexShrink: 0 }} />
                <div>
                  <h4 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Sustainable target alignment</h4>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>Reductions slope downwards towards the &lt;2.0 T/yr limit.</p>
                </div>
              </div>
              
              <div className="dark-card-inner" style={{ display: 'flex', gap: '1.25rem', alignItems: 'start', padding: '1.5rem', background: '#0d1527', borderRadius: '16px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#06b6d4', marginTop: '0.35rem', flexShrink: 0 }} />
                <div>
                  <h4 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Streaking and habit triggers</h4>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>Logs history track streak counts to lock habits.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 10. Global Awareness Section */}
      <section className="landing-section" style={{ padding: '6rem 1.5rem', background: 'linear-gradient(180deg, #070a13 0%, #0d1527 100%)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 4rem auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>BENCHMARKS</span>
            <h2 style={{ fontSize: '2.5rem', color: '#ffffff', fontWeight: 800, letterSpacing: '-0.02em' }}>Global Benchmark Comparisons</h2>
            <p className="dark-text-muted" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>Compare local averages with global sustainability metrics.</p>
          </div>

          <div className="landing-grid-3" style={{ gap: '2rem' }}>
            <div className="dark-card" style={{ background: '#0a0f1d', padding: '2rem', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '20px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', letterSpacing: '0.05em' }}>USA AVERAGE</span>
              <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', margin: '0.5rem 0' }}>16.0 T/yr</p>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>High consumption energy reliance, heavy personal vehicle usage averages.</p>
            </div>
            <div className="dark-card" style={{ background: '#0a0f1d', padding: '2rem', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '20px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', letterSpacing: '0.05em' }}>GLOBAL AVERAGE</span>
              <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', margin: '0.5rem 0' }}>4.7 T/yr</p>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>Current baseline per capita across developed and developing regions.</p>
            </div>
            <div className="dark-card" style={{ background: '#0a0f1d', padding: '2rem', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '20px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', letterSpacing: '0.05em' }}>SAFE TARGET</span>
              <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#10b981', margin: '0.5rem 0' }}>&lt; 2.0 T/yr</p>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>Required individual ceiling to limit global temperature rises to 2°C by 2050.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Final CTA Section */}
      <section className="landing-section" style={{ padding: '6rem 1.5rem', background: '#070a13', borderBottom: 'none' }}>
        <div className="container">
          <div style={{ 
            padding: '5rem 2rem', 
            borderRadius: '24px', 
            background: 'radial-gradient(circle at top right, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.03) 50%, #0d1527 100%)', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <h2 style={{ fontSize: '2.5rem', color: '#ffffff', fontWeight: 800, letterSpacing: '-0.02em', maxWidth: '640px', margin: '0 auto', lineHeight: '1.15' }}>
              Ready to transition to a low-carbon lifestyle?
            </h2>
            <p className="dark-text-muted" style={{ maxWidth: '520px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.65', color: '#94a3b8' }}>
              Get started today. Log your footprint locally and let our AI-powered engine plan your sustainability goals.
            </p>
            <button 
              className="btn dark-btn-primary" 
              style={{ 
                padding: '1.1rem 2.5rem', 
                fontSize: '1rem', 
                borderRadius: '12px',
                marginTop: '1rem',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.25)',
                transition: 'all 0.2s'
              }} 
              onClick={onGetStarted}
            >
              Get Started Now
            </button>
          </div>
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
