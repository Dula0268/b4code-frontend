import { ChevronLeft, ChevronRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserRole = "Admin" | "Staff" | "Owner";

export type ActionType =
  | "Updated"
  | "Deleted"
  | "Login Success"
  | "Created"
  | "Config Change"
  | "Login Failed";

export interface LogEntry {
  id: string;
  userName: string;
  userRole: UserRole;
  avatarColor: string;
  avatarInitial: string;
  ip: string;
  action: ActionType;
  entity: string;
  entityDetail: string;
  timestamp: string;
}

interface AuditLogsTableProps {
  logs: LogEntry[];
  currentPage: number;
  totalPages: number;
  totalResults: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

// ─── Action Badge ──────────────────────────────────────────────────────────────
function ActionBadge({ action }: { action: ActionType }) {
  const cfg: Record<ActionType, string> = {
    Updated: "bg-yellow-100/80 text-yellow-800",
    Deleted: "bg-red-100/70 text-red-700",
    "Login Success": "bg-green-100/70 text-green-700",
    Created: "bg-green-100/70 text-green-700",
    "Config Change": "bg-gray-100/70 text-gray-700",
    "Login Failed": "bg-red-100/70 text-red-700",
  };
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${cfg[action]}`}
    >
      {action}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ entry }: { entry: LogEntry }) {
  return (
    <div
      className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-white font-bold text-[13px] shrink-0"
      style={{ backgroundColor: entry.avatarColor }}
    >
      {entry.avatarInitial}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AuditLogsTable({
  logs,
  currentPage,
  totalPages,
  totalResults,
  pageSize,
  onPageChange,
}: AuditLogsTableProps) {
  const goPage = (p: number) =>
    onPageChange(Math.max(1, Math.min(totalPages, p)));

  const startIndex = totalResults === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalResults);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#F6F8F7]">
              {[
                "USER / ROLE",
                "IP ADDRESS",
                "ACTION",
                "ENTITY / DETAILS",
                "TIMESTAMP",
              ].map((h) => (
                <th
                  key={h}
                  className="px-5 py-[11px] text-left text-[11px] font-bold text-[var(--gray-3)] tracking-wider uppercase whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-[var(--gray-3)] text-sm"
                >
                  No audit logs found.
                </td>
              </tr>
            ) : (
              logs.map((log, idx) => (
                <tr
                  key={log.id}
                  className={`border-t border-[var(--gray-5)] transition-colors ${
                    idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
                  } hover:bg-[#f5efec]`}
                >
                  {/* User / Role */}
                  <td className="px-5 py-[14px] min-w-[180px]">
                    <div className="flex items-center gap-[10px]">
                      <Avatar entry={log} />
                      <div>
                        <p className="m-0 font-semibold text-[var(--black-2)]">
                          {log.userName}
                        </p>
                        <p className="m-0 text-xs text-[var(--gray-3)]">
                          {log.userRole}
                        </p>
                      </div>
                    </div>
                  </td>
                  {/* IP */}
                  <td className="px-5 py-[14px] text-[var(--gray-2)] font-mono text-[13px] whitespace-nowrap">
                    {log.ip}
                  </td>
                  {/* Action */}
                  <td className="px-5 py-[14px]">
                    <ActionBadge action={log.action} />
                  </td>
                  {/* Entity */}
                  <td className="px-5 py-[14px] min-w-[220px]">
                    <p className="m-0 font-semibold text-[var(--black-2)]">
                      {log.entity}
                    </p>
                    <p className="m-0 text-xs text-[var(--gray-3)]">
                      {log.entityDetail}
                    </p>
                  </td>
                  {/* Timestamp */}
                  <td className="px-5 py-[14px] text-[var(--gray-3)] text-[13px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex justify-between items-center px-5 py-[14px] border-t border-[var(--gray-5)]">
        <span className="text-[13px] text-[var(--gray-3)]">
          Showing{" "}
          <strong className="text-[var(--black-2)]">{startIndex}</strong> to{" "}
          <strong className="text-[var(--black-2)]">{endIndex}</strong> of{" "}
          <strong className="text-[var(--black-2)]">{totalResults}</strong>{" "}
          results
        </span>

        <div className="flex items-center gap-1">
          {/* Prev */}
          <button
            onClick={() => goPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`w-8 h-8 rounded-md border border-[var(--gray-5)] bg-white flex items-center justify-center ${
              currentPage === 1
                ? "cursor-not-allowed text-[var(--gray-4)]"
                : "cursor-pointer text-[var(--gray-2)]"
            }`}
          >
            <ChevronLeft size={14} />
          </button>

          {/* Page numbers with ellipsis */}
          {(() => {
            const pages: (number | "...")[] = [];
            if (totalPages <= 5) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
              pages.push(1);
              if (currentPage > 3) pages.push("...");
              for (
                let i = Math.max(2, currentPage - 1);
                i <= Math.min(totalPages - 1, currentPage + 1);
                i++
              )
                pages.push(i);
              if (currentPage < totalPages - 2) pages.push("...");
              pages.push(totalPages);
            }
            return pages.map((p, i) =>
              p === "..." ? (
                <span
                  key={`e${i}`}
                  className="w-8 h-8 flex items-center justify-center text-[13px] text-[var(--gray-3)]"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goPage(p as number)}
                  className={`w-8 h-8 rounded-md border cursor-pointer text-[13px] ${
                    currentPage === p
                      ? "border-[var(--brand-secondary)] bg-[var(--brand-secondary)] text-white font-bold"
                      : "border-[var(--gray-5)] bg-white text-[var(--gray-2)] font-normal"
                  }`}
                >
                  {p}
                </button>
              ),
            );
          })()}

          {/* Next */}
          <button
            onClick={() => goPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`w-8 h-8 rounded-md border border-[var(--gray-5)] bg-white flex items-center justify-center ${
              currentPage === totalPages
                ? "cursor-not-allowed text-[var(--gray-4)]"
                : "cursor-pointer text-[var(--gray-2)]"
            }`}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
