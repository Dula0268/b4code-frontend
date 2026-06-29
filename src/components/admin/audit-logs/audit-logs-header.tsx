import ExportButton from "./ExportButton";
import { AuditLogsApi } from "@/api/admin/audit-logs.api";

interface AuditLogsHeaderProps {
  currentRole: string;
  currentSearch: string;
}

export default function AuditLogsHeader({ currentRole, currentSearch }: AuditLogsHeaderProps) {
  const getExportParams = () => ({
    role: currentRole === "All" ? undefined : currentRole,
    search: currentSearch || undefined,
  });

  return (
    <>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="m-0 text-2xl font-extrabold text-(--black-2)">
            Audit Logs
          </h1>
          <p className="mt-1.5 mb-0 text-sm text-(--gray-3)">
            Track system-wide activities, user actions, and security events.
          </p>
        </div>
        
        {/* Export Dropdown */}
        <ExportButton
          filenamePrefix="audit-logs"
          onExportCsv={() => AuditLogsApi.exportAuditLogsCsv(getExportParams())}
          onExportPdf={() => AuditLogsApi.exportAuditLogsPdf(getExportParams())}
        />
      </div>
    </>
  );
}
