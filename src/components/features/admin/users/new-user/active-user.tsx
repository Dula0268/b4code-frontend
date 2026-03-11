import { Camera } from "lucide-react";
import Image from "next/image";

interface ActiveUserProps {
  user: {
    name: string;
    role: string;
    avatarUrl?: string;
    avatarColor?: string;
    avatarInitial?: string;
    isActive?: boolean;
    memberSince: string;
    lastLogin: string;
  };
  onAvatarChange?: () => void;
}

export default function ActiveUser({ user, onAvatarChange }: ActiveUserProps) {
  const isActive = user.isActive !== false;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center gap-4">
      {/* Avatar with camera button */}
      <div className="relative">
        <div className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center bg-[#4f9cf9] shadow-md">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name}
              width={112}
              height={112}
              className="w-full h-full object-cover"
            />
          ) : (
            <span
              className="text-white font-extrabold text-4xl"
              style={user.avatarColor ? {} : undefined}
            >
              {user.avatarInitial ?? user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        {/* Camera button */}
        <button
          onClick={onAvatarChange}
          className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
          aria-label="Change avatar"
        >
          <Camera size={16} className="text-gray-600" />
        </button>
      </div>

      {/* Name & Role */}
      <div className="text-center">
        <h2 className="text-xl font-extrabold text-(--black-2) m-0 mb-1">
          {user.name}
        </h2>
        <p className="text-sm text-gray-500 m-0">{user.role}</p>
      </div>

      {/* Active Badge */}
      <span
        className={`px-5 py-1.5 rounded-full text-sm font-semibold border ${
          isActive
            ? "bg-green-50 text-green-600 border-green-200"
            : "bg-red-50 text-red-500 border-red-200"
        }`}
      >
        {isActive ? "Active Account" : "Suspended Account"}
      </span>

      {/* Divider */}
      <div className="w-full border-t border-gray-100 my-1" />

      {/* Member since & Last login */}
      <div className="w-full flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Member Since</span>
          <span className="text-sm font-bold text-(--black-2)">
            {user.memberSince}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Last Login</span>
          <span className="text-sm font-bold text-(--black-2)">
            {user.lastLogin}
          </span>
        </div>
      </div>
    </div>
  );
}
