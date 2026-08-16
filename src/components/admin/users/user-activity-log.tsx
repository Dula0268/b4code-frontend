import { Pencil, LogIn, Key, Plus, Trash2, ShieldAlert, ShieldCheck, Activity } from "lucide-react";

export interface ActivityLogEntry {
  action: string;
  label: string;
  target: string;
  date: string;
  ip: string;
}

interface UserActivityLogProps {
  activities: ActivityLogEntry[];
}

// ─── Activity icon ────────────────────────────────────────────────────────────
function ActivityIcon({ type }: { type: string }) {
  const getIconConfig = (actionType: string) => {
    const t = actionType.toLowerCase();
    if (t.includes('login') || t.includes('verify')) return { bg: "#e6f7ee", icon: <LogIn size={13} color="#22c55e" /> };
    if (t.includes('password')) return { bg: "#fff4e0", icon: <Key size={13} color="#f59e0b" /> };
    if (t.includes('create') || t.includes('register')) return { bg: "#f3e8ff", icon: <Plus size={13} color="#a855f7" /> };
    if (t.includes('delete') || t.includes('remove')) return { bg: "#fee2e2", icon: <Trash2 size={13} color="#ef4444" /> };
    if (t.includes('suspend')) return { bg: "#fee2e2", icon: <ShieldAlert size={13} color="#ef4444" /> };
    if (t.includes('reactivate')) return { bg: "#e6f7ee", icon: <ShieldCheck size={13} color="#22c55e" /> };
    return { bg: "#e8f0fe", icon: <Pencil size={13} color="#3b82f6" /> }; // default update/other
  };
  const { bg, icon } = getIconConfig(type);
  return (
    <span
      className="inline-flex items-center justify-center w-7 h-7 rounded-full shadow-sm shrink-0 border border-white"
      style={{ backgroundColor: bg }}
    >
      {icon}
    </span>
  );
}

export default function UserActivityLog({
  activities,
}: UserActivityLogProps) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-neutral-100/50 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center px-7 py-6 border-b border-neutral-100/80">
        <h2 className="m-0 text-lg font-extrabold text-(--black-2) flex items-center gap-2">
          <span className="w-1.5 h-6 rounded-full bg-(--brand-primary) inline-block" />
          Activity Log
        </h2>
        <div className="flex gap-2">
          {/* Filter icon */}
          <button className="bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 transition-colors cursor-pointer text-neutral-500 flex p-1.5 rounded-lg">
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

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-neutral-50/50 border-b border-neutral-100">
              {["ACTION", "TARGET", "DATE & TIME", "IP ADDRESS"].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3.5 text-left text-[11px] font-bold text-(--gray-3) uppercase tracking-widest whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activities.length > 0 ? (
              activities.map((log, i) => (
                <tr
                  key={i}
                  className="border-b border-neutral-50 hover:bg-neutral-50/60 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <ActivityIcon type={log.action} />
                      <span className="font-semibold text-(--black-2) group-hover:text-(--brand-primary) transition-colors">
                        {log.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-(--gray-3) font-medium">
                    {log.target}
                  </td>
                  <td className="px-6 py-4 text-(--gray-3) whitespace-nowrap font-medium">
                    {log.date}
                  </td>
                  <td className="px-6 py-4 text-neutral-400 whitespace-nowrap font-mono text-xs bg-neutral-50/50 rounded inline-block mt-2 ml-4 mb-2">
                    {log.ip || "Unknown IP"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center">
                      <Activity size={24} className="text-neutral-300" />
                    </div>
                    <p className="text-neutral-400 font-medium m-0">No recent activity logs found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
