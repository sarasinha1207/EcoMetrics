import React, { useMemo } from 'react';

/**
 * SVG donut chart for emission category breakdown.
 * @param {Object} props
 * @param {Object} props.breakdown - Object with transport, housing, food, waste values in tonnes
 */
export default function DonutChart({ breakdown = {} }) {
  const RADIUS = 40;
  const CIRC = 2 * Math.PI * RADIUS;

  const categories = useMemo(() => [
    { key: 'transport', label: 'Transport', color: '#d1d5db', value: breakdown.transport || 0 },
    { key: 'housing',   label: 'Energy',    color: '#6b7280', value: breakdown.housing   || 0 },
    { key: 'food',      label: 'Food',      color: '#4b5563', value: breakdown.food      || 0 },
    { key: 'waste',     label: 'Waste',     color: '#1f2937', value: breakdown.waste     || 0 },
  ], [breakdown]);

  const total = useMemo(() => categories.reduce((s, c) => s + c.value, 0), [categories]);

  const segments = useMemo(() => {
    let cumulative = 0;
    return categories
      .filter(c => c.value > 0)
      .map(cat => {
        const pct = cat.value / total;
        const dash = pct * CIRC;
        const offset = CIRC - cumulative * CIRC;
        cumulative += pct;
        return { ...cat, dash, offset };
      });
  }, [categories, total, CIRC]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
      <div
        role="img"
        aria-label={`Emission breakdown donut chart. Total: ${total.toFixed(2)} tonnes CO2e`}
        style={{ position: 'relative', width: '130px', height: '130px' }}
      >
        <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          {total === 0 ? (
            <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="12" />
          ) : (
            segments.map(seg => (
              <circle
                key={seg.key}
                cx="50" cy="50" r={RADIUS}
                fill="none"
                stroke={seg.color}
                strokeWidth="11"
                strokeDasharray={`${seg.dash} ${CIRC - seg.dash}`}
                strokeDashoffset={seg.offset}
              />
            ))
          )}
        </svg>
        {/* Centre total */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL</span>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{total.toFixed(1)}t</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem 1rem' }}>
        {categories.map(cat => (
          <div key={cat.key} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cat.color, flexShrink: 0 }} />
            <span>{cat.label}: {cat.value.toFixed(2)}t</span>
          </div>
        ))}
      </div>
    </div>
  );
}
