import { Pencil, LogIn, Key, Plus, Trash2 } from "lucide-react";

type ActionType = "update" | "login" | "password" | "create" | "delete";

interface ActivityLogEntry {
  action: ActionType;
  label: string;
  target: string;
  date: string;
  ip: string;
}

interface UserActivityLogProps {
  activities: ActivityLogEntry[];
  onViewFullLog?: () => void;
}

// ─── Activity icon ────────────────────────────────────────────────────────────
function ActivityIcon({ type }: { type: ActionType }) {
  const cfg: Record<ActionType, { bg: string; icon: React.ReactNode }> = {
    update: { bg: "#e8f0fe", icon: <Pencil size={13} color="#3b82f6" /> },
    login: { bg: "#e6f7ee", icon: <LogIn size={13} color="#22c55e" /> },
    password: { bg: "#fff4e0", icon: <Key size={13} color="#f59e0b" /> },
    create: { bg: "#f3e8ff", icon: <Plus size={13} color="#a855f7" /> },
    delete: { bg: "#fee2e2", icon: <Trash2 size={13} color="#ef4444" /> },
  };
  const { bg, icon } = cfg[type];
  return (
    <span
      className="inline-flex items-center justify-center w-[26px] h-[26px] rounded-full flex-shrink-0"
      style={{ backgroundColor: bg }}
    >
      {icon}
    </span>
  );
}

export default function UserActivityLog({
  activities,
  onViewFullLog,
}: UserActivityLogProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-6 pt-5">
        <h2 className="m-0 text-base font-bold text-[var(--black-2)]">
          Activity Log
        </h2>
        <div className="flex gap-2">
          {/* Filter icon */}
          <button className="bg-transparent border-none cursor-pointer text-[var(--gray-3)] flex p-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 4h12M4 8h8M6 12h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "13px",
          marginTop: "12px",
        }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid var(--gray-5)" }}>
            {["ACTION", "TARGET", "DATE & TIME", "IP ADDRESS"].map((h) => (
              <th
                key={h}
                style={{
                  padding: "8px 24px",
                  textAlign: "left",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--gray-3)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activities.map((log, i) => (
            <tr
              key={i}
              style={{ borderBottom: "1px solid var(--gray-5)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                  "#f5efec";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                  "";
              }}
            >
              <td style={{ padding: "13px 24px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <ActivityIcon type={log.action} />
                  <span style={{ fontWeight: 600, color: "var(--black-2)" }}>
                    {log.label}
                  </span>
                </div>
              </td>
              <td style={{ padding: "13px 24px", color: "var(--gray-3)" }}>
                {log.target}
              </td>
              <td
                style={{
                  padding: "13px 24px",
                  color: "var(--gray-3)",
                  whiteSpace: "nowrap",
                }}
              >
                {log.date}
              </td>
              <td
                style={{
                  padding: "13px 24px",
                  color: "var(--gray-3)",
                  whiteSpace: "nowrap",
                  fontFamily: "monospace",
                }}
              >
                {log.ip}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* View Full Log */}
      <div style={{ padding: "16px 24px", textAlign: "center" }}>
        <button
          onClick={onViewFullLog}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--brand-primary)",
            fontSize: "14px",
            fontWeight: 700,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.textDecoration = "underline")
          }
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        >
          View Full Activity Log
        </button>
      </div>
    </div>
  );
}

// Export type for use in parent components
export type { ActivityLogEntry, ActionType };
