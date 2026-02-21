import { Building2, User } from "lucide-react";

type VerificationStatus = "Pending" | "Verified" | "Rejected";
type VerificationAction = "Review" | "View";

export interface VerificationRequest {
  id: string;
  name: string;
  entityId: string;
  type: string;
  dateSubmitted: string;
  status: VerificationStatus;
  action: VerificationAction;
  icon: "property" | "user";
}

interface RecentVerificationRequestsProps {
  requests: VerificationRequest[];
  onViewAll?: () => void;
  onActionClick?: (request: VerificationRequest) => void;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: VerificationStatus }) {
  const config: Record<
    VerificationStatus,
    { bg: string; dot: string; text: string }
  > = {
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
      <span
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          backgroundColor: c.dot,
          flexShrink: 0,
        }}
      />
      {status}
    </span>
  );
}

// ─── Entity Icon ─────────────────────────────────────────────────────────────
function EntityIcon({ type }: { type: "property" | "user" }) {
  const bg =
    type === "property" ? "rgba(149,48,2,0.1)" : "rgba(47,128,237,0.1)";
  const color = type === "property" ? "var(--brand-primary)" : "#2f80ed";
  return (
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: bg }}
    >
      {type === "property" ? (
        <Building2 size={16} color={color} />
      ) : (
        <User size={16} color={color} />
      )}
    </div>
  );
}

export default function RecentVerificationRequests({
  requests,
  onViewAll,
  onActionClick,
}: RecentVerificationRequestsProps) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: 700,
            color: "var(--black-2)",
          }}
        >
          Recent Verification Requests
        </h2>
        <button
          onClick={onViewAll}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--brand-primary)",
          }}
        >
          View All
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#F6F8F7" }}>
              {[
                "Name / Entity",
                "Type",
                "Date Submitted",
                "Status",
                "Actions",
              ].map((col) => (
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
            {requests.map((row, idx) => (
              <tr
                key={row.id}
                style={{
                  borderTop: "1px solid var(--gray-5)",
                  backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fafafa",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  (
                    e.currentTarget as HTMLTableRowElement
                  ).style.backgroundColor = "#f5efec";
                }}
                onMouseLeave={(e) => {
                  (
                    e.currentTarget as HTMLTableRowElement
                  ).style.backgroundColor =
                    idx % 2 === 0 ? "#ffffff" : "#fafafa";
                }}
              >
                {/* Name / Entity */}
                <td style={{ padding: "14px 16px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <EntityIcon type={row.icon} />
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 600,
                          color: "var(--black-2)",
                        }}
                      >
                        {row.name}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "12px",
                          color: "var(--gray-3)",
                        }}
                      >
                        {row.entityId}
                      </p>
                    </div>
                  </div>
                </td>
                {/* Type */}
                <td style={{ padding: "14px 16px", color: "var(--gray-2)" }}>
                  {row.type}
                </td>
                {/* Date */}
                <td style={{ padding: "14px 16px", color: "var(--gray-2)" }}>
                  {row.dateSubmitted}
                </td>
                {/* Status */}
                <td style={{ padding: "14px 16px" }}>
                  <StatusBadge status={row.status} />
                </td>
                {/* Action */}
                <td style={{ padding: "14px 16px" }}>
                  <button
                    onClick={() => onActionClick?.(row)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 600,
                      color:
                        row.action === "Review"
                          ? "var(--brand-primary)"
                          : "var(--gray-3)",
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
  );
}

// Export types for use in parent components
export type { VerificationStatus, VerificationAction };
