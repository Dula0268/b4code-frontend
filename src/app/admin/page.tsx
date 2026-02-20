"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Home,
  CalendarCheck,
  ChevronDown,
  Building2,
  User,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type VerificationStatus = "Pending" | "Verified" | "Rejected";
type VerificationAction = "Review" | "View";

interface VerificationRequest {
  id: string;
  name: string;
  entityId: string;
  type: string;
  dateSubmitted: string;
  status: VerificationStatus;
  action: VerificationAction;
  icon: "property" | "user";
}

// ─── Static Data ──────────────────────────────────────────────────────────────
const RECENT_VERIFICATIONS: VerificationRequest[] = [
  {
    id: "1",
    name: "Sunny Villa",
    entityId: "#PROP-8291",
    type: "Property Verification",
    dateSubmitted: "Oct 24, 2023",
    status: "Pending",
    action: "Review",
    icon: "property",
  },
  {
    id: "3",
    name: "Downtown Loft",
    entityId: "#PROP-1120",
    type: "Property Verification",
    dateSubmitted: "Oct 22, 2023",
    status: "Rejected",
    action: "View",
    icon: "property",
  },
  {
    id: "5",
    name: "Ocean Breeze Suite",
    entityId: "#PROP-3345",
    type: "Property Verification",
    dateSubmitted: "Oct 20, 2023",
    status: "Pending",
    action: "Review",
    icon: "property",
  },
];

// ─── Chart Data ──────────────────────────────────────────────────────────────
const CHART_POINTS = [210, 185, 155, 120, 135, 175, 230, 280, 310, 295, 265, 255, 270, 305, 335, 355, 375, 390];
const CHART_LABELS = ["Week 1", "Week 2", "Week 3", "Week 4"];
// Indices of inflection point dots shown on chart
const DOT_INDICES = [3, 7, 10, 15];

// ─── Helper: Catmull-Rom → Cubic Bezier smooth path ──────────────────────────
function buildSmoothPath(points: number[], width: number, height: number, pad = 28): { line: string; area: string } {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const xs = points.map((_, i) => pad + (i / (points.length - 1)) * (width - pad * 2));
  const ys = points.map((v) => pad + (1 - (v - min) / range) * (height - pad * 2));

  // Catmull-Rom tension
  const tension = 0.4;
  let line = `M ${xs[0].toFixed(2)},${ys[0].toFixed(2)}`;
  for (let i = 0; i < xs.length - 1; i++) {
    const p0x = xs[Math.max(i - 1, 0)], p0y = ys[Math.max(i - 1, 0)];
    const p1x = xs[i],   p1y = ys[i];
    const p2x = xs[i+1], p2y = ys[i+1];
    const p3x = xs[Math.min(i + 2, xs.length - 1)], p3y = ys[Math.min(i + 2, ys.length - 1)];

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

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: VerificationStatus }) {
  const config: Record<VerificationStatus, { bg: string; dot: string; text: string }> = {
    Pending: { bg: "rgba(255,180,1,0.15)", dot: "#ffb401", text: "#a07600" },
    Verified: { bg: "rgba(39,174,96,0.12)", dot: "#27ae60", text: "#1a7a45" },
    Rejected: { bg: "rgba(235,87,87,0.12)", dot: "#eb5757", text: "#b83030" },
  };
  const c = config[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        borderRadius: "999px",
        backgroundColor: c.bg,
        fontSize: "12px",
        fontWeight: 600,
        color: c.text,
      }}
    >
      <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: c.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

// ─── Entity Icon ─────────────────────────────────────────────────────────────
function EntityIcon({ type }: { type: "property" | "user" }) {
  const bg = type === "property" ? "rgba(149,48,2,0.1)" : "rgba(47,128,237,0.1)";
  const color = type === "property" ? "var(--brand-primary)" : "#2f80ed";
  return (
    <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {type === "property" ? <Building2 size={16} color={color} /> : <User size={16} color={color} />}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [selectedRange, setSelectedRange] = useState("Last 30 Days");
  const chartW = 900;
  const chartH = 260;
  const { line, area } = buildSmoothPath(CHART_POINTS, chartW, chartH);

  const statCards = [
    {
      label: "Total Revenue",
      value: "LKR 1,200,000",
      change: "+12%",
      positive: true,
      icon: <DollarSign size={20} color="var(--brand-primary)" />,
      iconBg: "rgba(149,48,2,0.1)",
    },
    {
      label: "Occupancy Rate",
      value: "82%",
      change: "+4%",
      positive: true,
      icon: <Home size={20} color="#2f80ed" />,
      iconBg: "rgba(47,128,237,0.1)",
    },
    {
      label: "Active Bookings",
      value: "1,240",
      change: "-1%",
      positive: false,
      icon: <CalendarCheck size={20} color="#27ae60" />,
      iconBg: "rgba(39,174,96,0.1)",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* ── Page Title ── */}
      <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--black-2)", margin: 0 }}>
        Dashboard Overview
      </h1>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* Top row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: "13px", color: "var(--gray-3)", fontWeight: 500 }}>{card.label}</span>
              <div style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: card.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {card.icon}
              </div>
            </div>
            {/* Value */}
            <p style={{ fontSize: "26px", fontWeight: 700, color: "var(--black-2)", margin: 0, lineHeight: 1 }}>
              {card.value}
            </p>
            {/* Change */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {card.positive
                ? <TrendingUp size={14} color="#27ae60" />
                : <TrendingDown size={14} color="#eb5757" />}
              <span style={{ fontSize: "13px", fontWeight: 600, color: card.positive ? "#27ae60" : "#eb5757" }}>
                {card.change}
              </span>
              <span style={{ fontSize: "13px", color: "var(--gray-4)" }}>vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Platform Activity Chart ── */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--black-2)" }}>Platform Activity</h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--gray-3)" }}>Revenue trend over the last 30 days</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Range selector */}
            <button
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 14px", borderRadius: "8px",
                border: "1px solid var(--gray-5)", backgroundColor: "#fff",
                fontSize: "13px", color: "var(--gray-2)", cursor: "pointer",
              }}
            >
              {selectedRange} <ChevronDown size={14} />
            </button>
          </div>
        </div>

        {/* SVG Chart */}
        <div style={{ width: "100%", overflowX: "auto" }}>
          <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: "100%", height: "auto", display: "block" }} preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#953002" stopOpacity="0.14" />
                <stop offset="60%"  stopColor="#953002" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#953002" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Very faint grid lines */}
            {[0.3, 0.6].map((t) => (
              <line
                key={t}
                x1={28} y1={28 + t * (chartH - 56)}
                x2={chartW - 28} y2={28 + t * (chartH - 56)}
                stroke="#e8e2df" strokeWidth="1" strokeDasharray="6 6"
              />
            ))}

            {/* Gradient area fill */}
            <path d={area} fill="url(#chartGrad)" />

            {/* Smooth line */}
            <path d={line} fill="none" stroke="#953002" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Small hollow dots at key inflection points */}
            {DOT_INDICES.map((idx) => {
              const v   = CHART_POINTS[idx];
              const minV = Math.min(...CHART_POINTS);
              const maxV = Math.max(...CHART_POINTS);
              const x = 28 + (idx / (CHART_POINTS.length - 1)) * (chartW - 56);
              const y = 28 + (1 - (v - minV) / (maxV - minV)) * (chartH - 56);
              return (
                <circle key={idx} cx={x} cy={y} r={4} fill="#fff" stroke="#953002" strokeWidth="2" />
              );
            })}

            {/* Week labels */}
            {CHART_LABELS.map((label, i) => (
              <text
                key={label}
                x={28 + (i / (CHART_LABELS.length - 1)) * (chartW - 56)}
                y={chartH - 6}
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

      {/* ── Recent Verification Requests ── */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--black-2)" }}>
            Recent Verification Requests
          </h2>
          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "var(--brand-primary)" }}>
            View All
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F6F8F7" }}>
                {["Name / Entity", "Type", "Date Submitted", "Status", "Actions"].map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: "10px 16px",
                      textAlign: "left",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--gray-3)",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_VERIFICATIONS.map((row, idx) => (
                <tr
                  key={row.id}
                  style={{
                    borderTop: "1px solid var(--gray-5)",
                    backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fafafa",
                    transition: "background-color 0.15s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#f5efec"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = idx % 2 === 0 ? "#ffffff" : "#fafafa"; }}
                >
                  {/* Name / Entity */}
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <EntityIcon type={row.icon} />
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, color: "var(--black-2)" }}>{row.name}</p>
                        <p style={{ margin: 0, fontSize: "12px", color: "var(--gray-3)" }}>{row.entityId}</p>
                      </div>
                    </div>
                  </td>
                  {/* Type */}
                  <td style={{ padding: "14px 16px", color: "var(--gray-2)" }}>{row.type}</td>
                  {/* Date */}
                  <td style={{ padding: "14px 16px", color: "var(--gray-2)" }}>{row.dateSubmitted}</td>
                  {/* Status */}
                  <td style={{ padding: "14px 16px" }}>
                    <StatusBadge status={row.status} />
                  </td>
                  {/* Action */}
                  <td style={{ padding: "14px 16px" }}>
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: row.action === "Review" ? "var(--brand-primary)" : "var(--gray-3)",
                        padding: 0,
                      }}
                    >
                      {row.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
