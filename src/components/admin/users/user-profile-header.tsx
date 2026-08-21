"use strict";
"use client";

import { RotateCcw, ShieldOff, RefreshCw } from "lucide-react";

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
}

export default function UserProfileHeader({
  user,
  suspended,
  onResetPassword,
  onSuspendToggle,
}: UserProfileHeaderProps) {
  return (
    <div className="bg-white rounded-2xl px-8 py-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-neutral-100 flex items-center justify-between gap-6 flex-wrap transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
      
      <div className="flex items-center gap-6">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-extrabold text-3xl shadow-inner shadow-black/10"
            style={{ backgroundColor: user.avatarColor }}
          >
            {user.avatarInitial}
          </div>
          {/* Online dot */}
          <span
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-white shadow-sm"
            style={{ backgroundColor: suspended ? "#eb5757" : "#27ae60" }}
          />
        </div>

        {/* Name / email / badges */}
        <div className="flex-1 min-w-50">
          <h1 className="m-0 mb-1.5 text-2xl font-extrabold text-neutral-900 tracking-tight">
            {user.name}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-neutral-500">{user.email}</span>
            <span className="w-1 h-1 rounded-full bg-neutral-300 shrink-0" />
            
            {/* Fixed Role Badge */}
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100/50 text-[13px] font-bold tracking-wide uppercase">
              {user.role}
            </span>

            {/* Suspended badge (only when suspended) */}
            {suspended && (
              <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-100/50 text-[13px] font-bold tracking-wide uppercase shadow-sm">
                Suspended
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 shrink-0 flex-wrap">
        {/* Reset Password */}
        <button
          onClick={onResetPassword}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 cursor-pointer transition-all hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 active:scale-95 shadow-sm"
        >
          <RotateCcw size={16} className="text-neutral-500" />
          Reset Password
        </button>

        {/* Suspend / Reactivate */}
        <button
          onClick={onSuspendToggle}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border border-transparent text-white text-sm font-semibold cursor-pointer transition-all hover:-translate-y-0.5 active:scale-95 ${
            suspended
              ? "bg-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:bg-emerald-600 hover:shadow-[0_6px_16px_rgba(16,185,129,0.4)]"
              : "bg-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:bg-red-600 hover:shadow-[0_6px_16px_rgba(239,68,68,0.4)]"
          }`}
        >
          {suspended ? <RefreshCw size={16} /> : <ShieldOff size={16} />}
          {suspended ? "Reactivate Account" : "Suspend Account"}
        </button>
      </div>
    </div>
  );
}

