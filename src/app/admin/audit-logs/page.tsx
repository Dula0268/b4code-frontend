"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Loader2 } from "lucide-react";
import AdminPageLayout from "@/components/admin/admin-page-layout";
import AuditLogsHeader from "@/components/admin/audit-logs/audit-logs-header";
import AuditLogsTable from "@/components/admin/audit-logs/audit-logs-table";
import { useAdminAuditLogsStore } from "@/store/admin/audit-logs/audit-logs.store";

// ─── Helper Functions ──────────────────────────────────────────────────────────
function roleCfg(role: string) {
  const map: Record<string, string> = {
    All: "bg-[var(--brand-primary)]/8 text-[var(--brand-primary)]",
    Admin: "bg-blue-500/12 text-blue-700",
    Staff: "bg-green-500/12 text-green-700",
    Owner: "bg-purple-500/12 text-purple-700",
  };
  return map[role] ?? map.All;
}

// ─── Filters Component ─────────────────────────────────────────────────────────
interface AuditLogsFiltersProps {
  search: string;
  roleFilter: string;
  roleOpen: boolean;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (role: string) => void;
  onRoleOpenChange: (open: boolean) => void;
}

function AuditLogsFilters({
  search,
  roleFilter,
  roleOpen,
  onSearchChange,
  onRoleFilterChange,
  onRoleOpenChange,
}: AuditLogsFiltersProps) {
  const roles = ["All", "Admin", "Staff", "Owner"];
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onRoleOpenChange(false);
      }
    }
    
    if (roleOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [roleOpen, onRoleOpenChange]);

  return (
    <div className="flex gap-3 items-center flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-60">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-(--gray-4) pointer-events-none"
          size={14}
        />
        <input
          placeholder="Search by User or Entity ID"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full py-2 px-3 pl-9 rounded-[10px] border-[1.5px] border-(--gray-5) text-[13px] text-(--black-2) bg-white outline-none box-border focus:border-(--brand-primary)"
        />
      </div>

      {/* Role Filter */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => onRoleOpenChange(!roleOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-[10px] border-[1.5px] border-(--gray-5) bg-white text-[13px] font-semibold cursor-pointer ${roleCfg(roleFilter)}`}
        >
          Role: {roleFilter}
          <ChevronDown size={14} />
        </button>
        {roleOpen && (
          <div className="absolute top-[calc(100%+6px)] left-0 bg-white border-[1.5px] border-(--gray-5) rounded-[10px] shadow-[0_6px_20px_rgba(0,0,0,0.10)] z-100 min-w-37.5 overflow-hidden">
            {roles.map((r) => {
              return (
                <button
                  key={r}
                  onClick={() => {
                    onRoleFilterChange(r);
                    onRoleOpenChange(false);
                  }}
                  className={`flex items-center gap-2 w-full text-left px-3.5 py-2 border-none text-[13px] cursor-pointer ${
                    roleFilter === r
                      ? "bg-(--brand-primary)/5 text-(--brand-primary) font-semibold"
                      : "bg-white text-(--gray-2) font-normal hover:bg-gray-50"
                  }`}
                >
                  {r !== "All" && (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          r === "Admin"
                            ? "#1a5fa8"
                            : r === "Staff"
                              ? "#1a7a45"
                              : "#7d3c98",
                      }}
                    />
                  )}
                  {r === "All" ? "All Roles" : r}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [roleOpen, setRoleOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const { logs, totalElements, totalPages, fetchLogs, loading } =
    useAdminAuditLogsStore();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchLogs({
      page: currentPage - 1,
      size: PAGE_SIZE,
      search: debouncedSearch,
      role: roleFilter,
    });
  }, [fetchLogs, currentPage, debouncedSearch, roleFilter]);

  return (
    <AdminPageLayout>
      <div className="flex flex-col gap-6 relative">
        {loading && logs.length === 0 && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50">
            <Loader2 className="animate-spin text-[#C05621]" size={48} />
          </div>
        )}
        <AuditLogsHeader />

        <AuditLogsFilters
          search={search}
          roleFilter={roleFilter}
          roleOpen={roleOpen}
          onSearchChange={(value) => {
            setSearch(value);
            setCurrentPage(1);
          }}
          onRoleFilterChange={(role) => {
            setRoleFilter(role);
            setCurrentPage(1);
          }}
          onRoleOpenChange={setRoleOpen}
        />

        <AuditLogsTable
          logs={logs}
          currentPage={currentPage}
          totalPages={totalPages}
          totalResults={totalElements}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>
    </AdminPageLayout>
  );
}
