"use client";

import { useState, useRef, useEffect } from "react";
import { RotateCcw, ShieldOff, RefreshCw, ChevronDown, Check } from "lucide-react";

interface UserProfileHeaderProps {
  user: {
    name: string;
    email: string;
    avatarColor: string;
    avatarInitial: string;
    role: string;
  };
  suspended: boolean;
  onResetPassword: () => void;
  onSuspendToggle: () => void;
  onRoleChange?: (newRole: string) => void;
}

export default function UserProfileHeader({
  user,
  suspended,
  onResetPassword,
  onSuspendToggle,
  onRoleChange,
}: UserProfileHeaderProps) {
  const [roleOpen, setRoleOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setRoleOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const roles = ["Owner", "Staff", "Admin", "Guest"];

  return (
    <div className="bg-white rounded-2xl px-7 py-6 shadow-sm flex items-center gap-5 flex-wrap">
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className="w-18 h-18 rounded-full flex items-center justify-center text-white font-extrabold text-[26px]"
          style={{ backgroundColor: user.avatarColor }}
        >
          {user.avatarInitial}
        </div>
        {/* Online dot */}
        <span
          className="absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white"
          style={{ backgroundColor: suspended ? "#eb5757" : "#27ae60" }}
        />
      </div>

      {/* Name / email / badges */}
      <div className="flex-1 min-w-50">
        <h1 className="m-0 mb-1 text-[22px] font-extrabold text-(--black-2)">
          {user.name}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-(--gray-3)">{user.email}</span>
          <span className="w-1 h-1 rounded-full bg-(--gray-4) shrink-0" />
          {/* Role badge / dropdown */}
          {/* Role badge / dropdown */}
          {onRoleChange ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setRoleOpen(!roleOpen)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(155,89,182,0.12)] text-[#7d3c98] text-xs font-bold border-none cursor-pointer hover:bg-[rgba(155,89,182,0.2)] transition-colors outline-none"
              >
                {user.role}
                <ChevronDown size={14} className={`transition-transform duration-200 ${roleOpen ? "rotate-180" : ""}`} />
              </button>

              {roleOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-36 bg-white border border-neutral-100 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-1">
                    {roles.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          onRoleChange(r);
                          setRoleOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium cursor-pointer border-none transition-colors ${
                          user.role === r
                            ? "bg-[rgba(155,89,182,0.08)] text-[#7d3c98]"
                            : "bg-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                        }`}
                      >
                        {r}
                        {user.role === r && <Check size={14} className="text-[#7d3c98]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-[rgba(155,89,182,0.12)] text-[#7d3c98] text-xs font-bold">
              {user.role}
            </span>
          )}
          {/* Suspended badge (only when suspended) */}
          {suspended && (
            <span className="px-2.5 py-0.5 rounded-full bg-[rgba(235,87,87,0.12)] text-[#b83030] text-xs font-bold">
              Suspended
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 shrink-0 flex-wrap">
        {/* Reset Password */}
        <button
          onClick={onResetPassword}
          className="flex items-center gap-1.75 px-4.5 py-2.5 rounded-[10px] border-[1.5px] border-(--gray-5) bg-white text-sm font-semibold text-(--black-2) cursor-pointer transition-colors hover:border-(--brand-primary) hover:text-(--brand-primary)"
        >
          <RotateCcw size={15} />
          Reset Password
        </button>

        {/* Suspend / Reactivate */}
        <button
          onClick={onSuspendToggle}
          className={`flex items-center gap-1.75 px-4.5 py-2.5 rounded-[10px] border-none text-white text-sm font-semibold cursor-pointer transition-opacity hover:opacity-88 ${
            suspended
              ? "bg-(--state-success) shadow-[0_2px_8px_rgba(39,174,96,0.3)]"
              : "bg-(--state-error) shadow-[0_2px_8px_rgba(235,87,87,0.3)]"
          }`}
        >
          {suspended ? <RefreshCw size={15} /> : <ShieldOff size={15} />}
          {suspended ? "Reactivate Account" : "Suspend Account"}
        </button>
      </div>
    </div>
  );
}
