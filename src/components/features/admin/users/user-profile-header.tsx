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
    <div className="bg-white rounded-2xl px-7 py-6 shadow-sm flex items-center gap-5 flex-wrap">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-white font-extrabold text-[26px]"
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
      <div className="flex-1 min-w-[200px]">
        <h1 className="m-0 mb-1 text-[22px] font-extrabold text-[var(--black-2)]">
          {user.name}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-[var(--gray-3)]">{user.email}</span>
          <span className="w-1 h-1 rounded-full bg-[var(--gray-4)] flex-shrink-0" />
          {/* Role badge */}
          <span className="px-[10px] py-[2px] rounded-full bg-[rgba(155,89,182,0.12)] text-[#7d3c98] text-xs font-bold">
            {user.role}
          </span>
          {/* Suspended badge (only when suspended) */}
          {suspended && (
            <span className="px-[10px] py-[2px] rounded-full bg-[rgba(235,87,87,0.12)] text-[#b83030] text-xs font-bold">
              Suspended
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 flex-shrink-0 flex-wrap">
        {/* Reset Password */}
        <button
          onClick={onResetPassword}
          className="flex items-center gap-[7px] px-[18px] py-[10px] rounded-[10px] border-[1.5px] border-[var(--gray-5)] bg-white text-sm font-semibold text-[var(--black-2)] cursor-pointer transition-colors hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
        >
          <RotateCcw size={15} />
          Reset Password
        </button>

        {/* Suspend / Reactivate */}
        <button
          onClick={onSuspendToggle}
          className={`flex items-center gap-[7px] px-[18px] py-[10px] rounded-[10px] border-none text-white text-sm font-semibold cursor-pointer transition-opacity hover:opacity-88 ${
            suspended
              ? "bg-[var(--state-success)] shadow-[0_2px_8px_rgba(39,174,96,0.3)]"
              : "bg-[var(--state-error)] shadow-[0_2px_8px_rgba(235,87,87,0.3)]"
          }`}
        >
          {suspended ? <RefreshCw size={15} /> : <ShieldOff size={15} />}
          {suspended ? "Reactivate Account" : "Suspend Account"}
        </button>
      </div>
    </div>
  );
}
