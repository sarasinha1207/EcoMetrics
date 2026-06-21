import React, { useState, useMemo } from 'react';
import Card from '../components/Card';
import Simulator from './Simulator';
import TrendChart from '../components/TrendChart';
import DonutChart from '../components/DonutChart';
import { getRank } from '../utils/ranks';

// Leaf, Shield, Flame, and Chevron SVGs to recreate icons in reference UI
const DashboardIcons = {
  leaf: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent-primary)' }}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58.2 9.22a7 7 0 0 1-8.2 8.78z" />
      <path d="M19 2L10 11" />
    </svg>
  ),
  globeLeaf: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent-blue)' }}>
      <path d="M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  ),
  shield: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent-primary)' }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  flame: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent-orange)' }}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  ),
  bus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent-blue)' }}>
      <rect x="2" y="4" width="20" height="12" rx="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M12 4v12" />
    </svg>
  )
};

export default function Dashboard({
  currentCalc,
  history,
  dailyActions,
  onToggleAction,
  totalCo2SavedToday,
  level,
  points,
  streakDays,
  onNavigateToCalc
}) {
  const [trendDays, setTrendDays] = useState(30);

  // Compute calculated metrics
  const totalTonnes = currentCalc?.total || 0;
  const breakdown = currentCalc?.breakdown || { transport: 0, housing: 0, food: 0, waste: 0 };
  
  // Calculate relative monthly & daily values matching image
  const co2ThisMonthKg = parseFloat(((totalTonnes * 1000) / 12).toFixed(1));
  const dailyAverageKg = parseFloat(((totalTonnes * 1000) / 365).toFixed(1));

  // Compute real month-over-month trend from history
  const computedTrendPct = useMemo(() => {
    if (history.length < 2) return null;
    const latest = history[0].total;
    const previous = history[1].total;
    if (!previous || previous === 0) return null;
    return (((latest - previous) / previous) * 100).toFixed(1);
  }, [history]);

  const totalActionsCompleted = dailyActions.filter(a => a.completed).length;

  // Custom Line Chart coordinate builder (Emissions Trend)
  const buildTrendLine = () => {
    const paddingX = 50;
    const paddingY = 40;
    const chartW = 600 - paddingX * 2;
    const chartH = 220 - paddingY * 2;

    // Filter points based on chosen tab
    const limit = trendDays === 7 ? 7 : trendDays === 30 ? 30 : 90;
    const dataPoints = [...history].slice(0, limit).reverse();

    // Default placeholder points if history is empty, to replicate empty plot lines
    if (dataPoints.length === 0) {
      return { points: [], pathString: '', gridLinesY: [0, 95, 190, 285, 380] };
    }

    const totals = dataPoints.map(item => item.total * 1000 / 365); // Plot daily kg
    const maxVal = 380; // Fixed grid max matching image
    const minVal = 0;
    const range = maxVal - minVal;

    const points = dataPoints.map((item, idx) => {
      const valKg = (item.total * 1000) / 365;
      const x = paddingX + (idx / Math.max(1, dataPoints.length - 1)) * chartW;
      const y = 220 - (paddingY + ((valKg - minVal) / range) * chartH);
      return { x, y, total: parseFloat(valKg.toFixed(1)), date: new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) };
    });

    const pathString = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    return { points, pathString, gridLinesY: [0, 95, 190, 285, 380] };
  };

  const trend = buildTrendLine();

  // Donut SVG parameters
  const radius = 40;
  const circ = 2 * Math.PI * radius; // ~251.3
  
  // Memoized categories for donut chart
  const categories = useMemo(() => [
    { key: 'housing',   label: 'Energy',    color: '#6b7280', value: breakdown.housing   || 0 },
    { key: 'food',      label: 'Food',      color: '#4b5563', value: breakdown.food      || 0 },
    { key: 'shopping',  label: 'Shopping',  color: '#9ca3af', value: 0.8 },
    { key: 'transport', label: 'Transport', color: '#d1d5db', value: breakdown.transport || 0 },
    { key: 'waste',     label: 'Waste',     color: '#1f2937', value: breakdown.waste     || 0 },
  ], [breakdown])

  const totalEmissionsVal = useMemo(() => categories.reduce((s, c) => s + c.value, 0), [categories]);
  let cumulativePercent = 0;

  // Next level progress computation
  const basePoints = (level - 1) * 100;
  const currentLevelProgress = points - basePoints;
  const percentToNextLevel = Math.min(100, Math.max(0, (currentLevelProgress / 100) * 100));

  // Rank for the sidebar rank card
  const rank = useMemo(() => getRank(level), [level]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. Upper Metrics Row (4 Cards) */}
      <div className="metrics-grid">
        
        {/* Metric 1: CO2 THIS MONTH */}
        <Card className="soft-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>CO2 THIS MONTH</span>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0' }}>{co2ThisMonthKg} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>kg</span></p>
            <span style={{ fontSize: '0.75rem', color: computedTrendPct !== null ? (Number(computedTrendPct) < 0 ? 'var(--accent-primary)' : 'var(--accent-danger)') : 'var(--text-muted)', fontWeight: 600 }}>
              {computedTrendPct !== null
                ? `${Number(computedTrendPct) < 0 ? '' : '+'}${computedTrendPct}% vs previous entry`
                : 'Log more entries to compare'}
            </span>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent-soft-green)', display: 'flex', alignItems: 'center', justifySelf: 'flex-end', justifyContent: 'center' }}>
            {DashboardIcons.leaf()}
          </div>
        </Card>

        {/* Metric 2: DAILY AVERAGE */}
        <Card className="soft-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>DAILY AVERAGE</span>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0' }}>{dailyAverageKg} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>kg/day</span></p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
              Target: &lt;{((2.0 * 1000) / 365).toFixed(1)} kg/day
            </span>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent-soft-blue)', display: 'flex', alignItems: 'center', justifySelf: 'flex-end', justifyContent: 'center' }}>
            {DashboardIcons.globeLeaf()}
          </div>
        </Card>

        {/* Metric 3: CO2 SAVED */}
        <Card className="soft-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>CO2 SAVED</span>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0' }}>{totalCo2SavedToday.toFixed(1)} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>kg</span></p>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              From completed actions
            </span>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent-soft-green)', display: 'flex', alignItems: 'center', justifySelf: 'flex-end', justifyContent: 'center' }}>
            {DashboardIcons.shield()}
          </div>
        </Card>

        {/* Metric 4: CURRENT STREAK */}
        <Card className="soft-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>CURRENT STREAK</span>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0' }}>{streakDays} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>days</span></p>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-orange)', fontWeight: 600 }}>
              Keep the flame burning!
            </span>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent-soft-orange)', display: 'flex', alignItems: 'center', justifySelf: 'flex-end', justifyContent: 'center' }}>
            {DashboardIcons.flame()}
          </div>
        </Card>

      </div>

      {/* 2. Main Row: Emissions Trend & Category Breakdown */}
      <div className="dashboard-grid">
        
        {/* Emissions Trend Line Chart */}
        <Card className="soft-card col-span-2" tag="article" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--accent-dark-green)', fontWeight: 700, letterSpacing: '0.05em' }}>
                Emissions Trend
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Your carbon logs over time vs. the global target benchmark</span>
            </div>
            
            {/* Chart Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '20px', padding: '0.25rem' }}>
              {[7, 30, 90].map(days => (
                <button
                  key={days}
                  onClick={() => setTrendDays(days)}
                  style={{
                    border: 'none',
                    background: trendDays === days ? '#ffffff' : 'none',
                    boxShadow: trendDays === days ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                    borderRadius: '15px',
                    padding: '0.3rem 0.8rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: trendDays === days ? 'var(--text-main)' : 'var(--text-muted)',
                    transition: 'all 0.2s'
                  }}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          {/* TrendChart component replaces inline SVG */}
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', minHeight: '180px' }}>
            <TrendChart history={history} limit={trendDays} />
          </div>
        </Card>

        {/* Category Breakdown Donut */}
        <Card className="soft-card" tag="article" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--accent-dark-green)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            Category Breakdown
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Click segments to review detailed logs by category
          </span>

          {/* DonutChart component replaces inline SVG */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
            <DonutChart breakdown={breakdown} />
          </div>
        </Card>

      </div>

      {/* 3. Lower Row: Daily Actions & Eco Rank progress card */}
      <div className="dashboard-grid">
        
        {/* Daily actions card */}
        <Card className="soft-card col-span-2" tag="article">
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
              ⭐ {totalActionsCompleted}/5 Done
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {dailyActions.slice(0, 2).map(act => (
              <div 
                key={act.id} 
                className="soft-card-inner" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  backgroundColor: act.completed ? 'var(--accent-soft-green)' : 'var(--bg-main)',
                  transition: 'background-color 0.2s',
                  padding: '0.85rem 1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    backgroundColor: '#ffffff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    {DashboardIcons.bus()}
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
                    padding: '0.4rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {act.completed ? 'Completed' : 'Complete'}
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Eco Rank Progress bar Card */}
        <Card className="soft-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--accent-dark-green)', fontWeight: 700, letterSpacing: '0.05em' }}>
                Eco Rank
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>LEVEL {level}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h4 style={{ color: rank.color, fontSize: '1.05rem', marginBottom: '0.25rem', fontWeight: 700 }}>{rank.name.toUpperCase()}</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{points} XP total</span>
            </div>

            {/* Custom green Progress Bar matching UI */}
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

      </div>

      {/* 4. Habit Simulator panel */}
      <div>
        <h3 style={{ marginBottom: '1rem', color: 'var(--accent-dark-green)' }}>Habit Simulator</h3>
        <Simulator currentCalc={currentCalc} />
      </div>

    </div>
  );
}
