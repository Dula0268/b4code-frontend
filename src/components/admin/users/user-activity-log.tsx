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
    if (t.includes('login') || t.includes('verify')) return { bg: "bg-emerald-50", icon: <LogIn size={14} className="text-emerald-600" /> };
    if (t.includes('password')) return { bg: "bg-amber-50", icon: <Key size={14} className="text-amber-600" /> };
    if (t.includes('create') || t.includes('register')) return { bg: "bg-purple-50", icon: <Plus size={14} className="text-purple-600" /> };
    if (t.includes('delete') || t.includes('remove')) return { bg: "bg-red-50", icon: <Trash2 size={14} className="text-red-600" /> };
    if (t.includes('suspend')) return { bg: "bg-red-50", icon: <ShieldAlert size={14} className="text-red-600" /> };
    if (t.includes('reactivate')) return { bg: "bg-emerald-50", icon: <ShieldCheck size={14} className="text-emerald-600" /> };
    return { bg: "bg-blue-50", icon: <Pencil size={14} className="text-blue-600" /> }; // default update/other
  };
  const { bg, icon } = getIconConfig(type);
  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full shadow-sm shrink-0 border border-white ${bg} transition-transform group-hover:scale-110`}>
      {icon}
    </span>
  );
}

export default function UserActivityLog({
  activities,
}: UserActivityLogProps) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-neutral-100 overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
      {/* Header */}
      <div className="flex justify-between items-center px-8 py-6 border-b border-neutral-100/80 bg-neutral-50/30">
        <h2 className="m-0 text-xl font-extrabold text-neutral-900 flex items-center gap-2 tracking-tight">
          <span className="w-1.5 h-6 rounded-full bg-indigo-600 inline-block" />
          Activity Log
        </h2>
        <div className="flex gap-2">
          {/* Filter icon */}
          <button className="bg-white hover:bg-neutral-50 border border-neutral-200 transition-colors cursor-pointer text-neutral-500 flex p-2 rounded-xl shadow-sm hover:shadow active:scale-95">
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
        <table className="w-full border-collapse text-[14px]">
          <thead>
            <tr className="bg-neutral-50/80 border-b border-neutral-100">
              {["Action", "Target", "Date & Time", "IP Address"].map((h) => (
                <th
                  key={h}
                  className="px-8 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-widest whitespace-nowrap"
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
                  className="border-b border-neutral-50 hover:bg-indigo-50/30 transition-colors group"
                >
                  <td className="px-8 py-4.5">
                    <div className="flex items-center gap-3.5">
                      <ActivityIcon type={log.action} />
                      <span className="font-semibold text-neutral-900 group-hover:text-indigo-700 transition-colors">
                        {log.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-4.5 text-neutral-500 font-medium truncate max-w-[200px]">
                    {log.target}
                  </td>
                  <td className="px-8 py-4.5 text-neutral-500 whitespace-nowrap font-medium">
                    {log.date}
                  </td>
                  <td className="px-8 py-4.5">
                    <span className="text-neutral-500 whitespace-nowrap font-mono text-xs bg-neutral-100/80 px-2.5 py-1.5 rounded-md border border-neutral-200/60 inline-block">
                      {log.ip || "Unknown IP"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-8 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center shadow-inner">
                      <Activity size={26} className="text-neutral-400" />
                    </div>
                    <p className="text-neutral-500 font-medium m-0">No recent activity logs found</p>
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
