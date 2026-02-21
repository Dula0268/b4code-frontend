import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface PlatformActivityChartProps {
  chartPoints: number[];
  chartLabels: string[];
  dotIndices: number[];
  chartWidth?: number;
  chartHeight?: number;
}

// ─── Helper: Catmull-Rom → Cubic Bezier smooth path ──────────────────────────
function buildSmoothPath(
  points: number[],
  width: number,
  height: number,
  pad = 28,
): { line: string; area: string } {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const xs = points.map(
    (_, i) => pad + (i / (points.length - 1)) * (width - pad * 2),
  );
  const ys = points.map(
    (v) => pad + (1 - (v - min) / range) * (height - pad * 2),
  );

  // Catmull-Rom tension
  const tension = 0.4;
  let line = `M ${xs[0].toFixed(2)},${ys[0].toFixed(2)}`;
  for (let i = 0; i < xs.length - 1; i++) {
    const p0x = xs[Math.max(i - 1, 0)],
      p0y = ys[Math.max(i - 1, 0)];
    const p1x = xs[i],
      p1y = ys[i];
    const p2x = xs[i + 1],
      p2y = ys[i + 1];
    const p3x = xs[Math.min(i + 2, xs.length - 1)],
      p3y = ys[Math.min(i + 2, ys.length - 1)];

    const cp1x = p1x + (p2x - p0x) * tension;
    const cp1y = p1y + (p2y - p0y) * tension;
    const cp2x = p2x - (p3x - p1x) * tension;
    const cp2y = p2y - (p3y - p1y) * tension;

    line += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2x.toFixed(2)},${p2y.toFixed(2)}`;
  }

  const lastX = xs[xs.length - 1];
  const bottomY = height - pad + 4;
  const area = `${line} L ${lastX.toFixed(2)},${bottomY} L ${xs[0].toFixed(2)},${bottomY} Z`;
  return { line, area };
}

export default function PlatformActivityChart({
  chartPoints,
  chartLabels,
  dotIndices,
  chartWidth = 900,
  chartHeight = 260,
}: PlatformActivityChartProps) {
  const [selectedRange, setSelectedRange] = useState("Last 30 Days");
  const { line, area } = buildSmoothPath(chartPoints, chartWidth, chartHeight);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h2 className="m-0 text-base font-bold text-[var(--black-2)]">
            Platform Activity
          </h2>
          <p className="mt-1 mb-0 text-[13px] text-[var(--gray-3)]">
            Revenue trend over the last 30 days
          </p>
        </div>
        <div className="flex items-center gap-[10px]">
          {/* Range selector */}
          <button className="flex items-center gap-1.5 px-[14px] py-2 rounded-lg border border-[var(--gray-5)] bg-white text-[13px] text-[var(--gray-2)] cursor-pointer">
            {selectedRange} <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* SVG Chart */}
      <div style={{ width: "100%", overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          style={{ width: "100%", height: "auto", display: "block" }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#953002" stopOpacity="0.14" />
              <stop offset="60%" stopColor="#953002" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#953002" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Very faint grid lines */}
          {[0.3, 0.6].map((t) => (
            <line
              key={t}
              x1={28}
              y1={28 + t * (chartHeight - 56)}
              x2={chartWidth - 28}
              y2={28 + t * (chartHeight - 56)}
              stroke="#e8e2df"
              strokeWidth="1"
              strokeDasharray="6 6"
            />
          ))}

          {/* Gradient area fill */}
          <path d={area} fill="url(#chartGrad)" />

          {/* Smooth line */}
          <path
            d={line}
            fill="none"
            stroke="#953002"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Small hollow dots at key inflection points */}
          {dotIndices.map((idx) => {
            const v = chartPoints[idx];
            const minV = Math.min(...chartPoints);
            const maxV = Math.max(...chartPoints);
            const x = 28 + (idx / (chartPoints.length - 1)) * (chartWidth - 56);
            const y =
              28 + (1 - (v - minV) / (maxV - minV)) * (chartHeight - 56);
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r={4}
                fill="#fff"
                stroke="#953002"
                strokeWidth="2"
              />
            );
          })}

          {/* Week labels */}
          {chartLabels.map((label, i) => (
            <text
              key={label}
              x={28 + (i / (chartLabels.length - 1)) * (chartWidth - 56)}
              y={chartHeight - 6}
              textAnchor="middle"
              fontSize="12"
              fill="#c4b8b4"
              fontFamily="Inter, sans-serif"
            >
              {label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
