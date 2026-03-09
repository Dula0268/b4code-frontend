import { Download } from "lucide-react";

export default function AuditLogsHeader() {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="m-0 text-2xl font-extrabold text-(--black-2)">
          Audit Logs
        </h1>
        <p className="mt-1.5 mb-0 text-sm text-(--gray-3)">
          Track system-wide activities, user actions, and security events.
        </p>
      </div>
      {/* Export CSV */}
      <button className="flex items-center gap-2 px-4.5 py-2.5 rounded-[10px] border-[1.5px] border-(--gray-5) bg-white text-[13.5px] font-semibold text-(--black-2) cursor-pointer shadow-sm hover:border-(--brand-primary) hover:text-(--brand-primary) transition-colors">
        <Download size={15} />
        Export CSV
      </button>
    </div>
  );
}
