import React, { useMemo } from 'react';

/**
 * SVG line chart showing carbon emission trend over time.
 * @param {Object} props
 * @param {Array} props.history - Array of calculation records sorted newest-first
 * @param {number} props.limit - Number of data points to display (7, 30, or 90)
 */
export default function TrendChart({ history = [], limit = 30 }) {
  const { points, pathString, gridLinesY } = useMemo(() => {
    const PADDING_X = 50;
    const PADDING_Y = 40;
    const CHART_W = 600 - PADDING_X * 2;
    const CHART_H = 220 - PADDING_Y * 2;
    const MAX_VAL = 380;

    const dataPoints = [...history].slice(0, limit).reverse();

    if (dataPoints.length === 0) {
      return { points: [], pathString: '', gridLinesY: [0, 95, 190, 285, 380] };
    }

    const pts = dataPoints.map((item, idx) => {
      const valKg = (item.total * 1000) / 365;
      const x = PADDING_X + (idx / Math.max(1, dataPoints.length - 1)) * CHART_W;
      const y = 220 - (PADDING_Y + ((valKg - 0) / MAX_VAL) * CHART_H);
      return {
        x,
        y: Math.max(PADDING_Y, Math.min(220 - PADDING_Y, y)),
        total: parseFloat(valKg.toFixed(1)),
        date: new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      };
    });

    const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    return { points: pts, pathString: path, gridLinesY: [0, 95, 190, 285, 380] };
  }, [history, limit]);

  // Daily safe target: 2.0 t/yr / 365 days * 1000 g = 5.48 kg/day
  const SAFE_TARGET_KG = 5.48;
  const safeLineY = 220 - (40 + (SAFE_TARGET_KG / 380) * 140);

  return (
    <svg
      viewBox="0 0 600 220"
      width="100%"
      height="100%"
      style={{ overflow: 'visible' }}
      role="img"
      aria-label={`Carbon emission trend chart showing ${points.length} data points`}
    >
      <title>Carbon Emission Trend</title>

      {/* Y-axis grid lines */}
      {gridLinesY.map((yVal) => {
        const yPos = 220 - (40 + (yVal / 380) * 140);
        return (
          <g key={yVal}>
            <line x1="50" y1={yPos} x2="550" y2={yPos} stroke="rgba(0,0,0,0.05)" />
            <text x="25" y={yPos + 4} fill="var(--text-light)" fontSize="10" textAnchor="middle">{yVal}</text>
          </g>
        );
      })}

      {/* Safe target dashed line */}
      <line
        x1="50" y1={safeLineY} x2="550" y2={safeLineY}
        stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3"
      />
      <text x="300" y={safeLineY - 5} fill="#ef4444" fontSize="9" fontWeight="700" textAnchor="middle">
        2.0 t/yr Safe Target
      </text>

      {/* Trend path */}
      {points.length > 1 && (
        <path d={pathString} fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinejoin="round" />
      )}

      {/* Data point nodes */}
      {points.map((p, idx) => (
        <g key={idx}>
          <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="var(--accent-primary)" strokeWidth="2.5" />
          {idx === points.length - 1 && (
            <g>
              <rect x={p.x - 40} y={p.y - 46} width="80" height="32" rx="4" fill="#ffffff" stroke="rgba(0,0,0,0.06)" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.05))' }} />
              <text x={p.x} y={p.y - 33} fill="var(--text-muted)" fontSize="8" fontWeight="600" textAnchor="middle">{p.date}</text>
              <text x={p.x} y={p.y - 20} fill="var(--accent-primary)" fontSize="9" fontWeight="700" textAnchor="middle">{p.total} kg/day</text>
            </g>
          )}
        </g>
      ))}

      {/* Empty state */}
      {points.length === 0 && (
        <text x="300" y="115" fill="var(--text-muted)" fontSize="12" textAnchor="middle">
          Log carbon entries to see your trend
        </text>
      )}
    </svg>
  );
}
