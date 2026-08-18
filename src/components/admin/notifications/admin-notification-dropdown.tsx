"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, Flag, Scale, BadgeDollarSign, Building2, Check, Loader2, X } from "lucide-react";
import { useAdminNotifications } from "@/store/admin/notifications/use-admin-notifications";
import { AdminNotification } from "@/api/admin/admin-notification.api";

export default function AdminNotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead } = useAdminNotifications();
  
  const unreadNotifications = notifications.filter(n => !n.isRead);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = async (notif: AdminNotification) => {
    if (!notif.isRead) {
      await markAsRead(notif.id);
    }
    setIsOpen(false);

    // Route based on type
    switch (notif.type) {
      case "FLAGGED_REVIEW":
        router.push(`/admin/moderation?reviewId=${notif.referenceId}`);
        break;
      case "DISPUTE":
        // The backend sets the case ID (e.g. 145HFG5G). We'll pass it to disputes page.
        router.push(`/admin/moderation/disputes?caseId=${notif.referenceId}`);
        break;
      case "PAYOUT_REQUEST":
        router.push("/admin/finance/payouts");
        break;
      case "NEW_PROPERTY":
        router.push(`/admin/properties/${notif.referenceId}`);
        break;
      default:
        break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "FLAGGED_REVIEW":
        return <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0"><Flag size={14} className="text-red-500" /></div>;
      case "DISPUTE":
        return <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0"><Scale size={14} className="text-orange-500" /></div>;
      case "PAYOUT_REQUEST":
        return <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0"><BadgeDollarSign size={14} className="text-green-500" /></div>;
      case "NEW_PROPERTY":
        return <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0"><Building2 size={14} className="text-blue-500" /></div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0"><Bell size={14} className="text-gray-500" /></div>;
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // in seconds

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-full bg-[#F5F2F0] hover:bg-[#EAE4E0] flex items-center justify-center transition-colors cursor-pointer border-none outline-none"
      >
        <Bell size={18} className="text-[#6b3a2a]" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-[#F5F2F0] text-[10px] font-bold text-white px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-[360px] bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#F0EBE7] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-5 py-4 border-b border-[#F0EBE7] flex items-center justify-between bg-white">
            <h3 className="font-bold text-[16px] text-[#1A1A1A] m-0">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
                className="text-[12px] font-semibold text-[#C05621] hover:text-[#953002] cursor-pointer bg-transparent border-none flex items-center gap-1 transition-colors"
              >
                <Check size={12} /> Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading && unreadNotifications.length === 0 ? (
              <div className="py-12 flex justify-center">
                <Loader2 size={24} className="animate-spin text-[#C05621]" />
              </div>
            ) : unreadNotifications.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-[#F5F2F0] flex items-center justify-center mx-auto mb-3">
                  <Bell size={20} className="text-[#9E7B6A]" />
                </div>
                <p className="text-[14px] font-medium text-[#1A1A1A] m-0">All caught up!</p>
                <p className="text-[12px] text-[#9E7B6A] m-0 mt-1">No new notifications right now.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {unreadNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`group relative flex items-start gap-3 p-4 border-b border-[#F5F2F0] last:border-0 w-full text-left transition-colors cursor-pointer outline-none hover:bg-[#F9F7F6] ${
                      !notif.isRead ? "bg-[#FFF8F1]" : "bg-white"
                    }`}
                  >
                    {getIcon(notif.type)}
                    <div className="flex-1 pr-6">
                      <p className={`text-[13px] m-0 ${!notif.isRead ? 'font-bold text-[#1A1A1A]' : 'font-medium text-[#4B5563]'}`}>
                        {notif.title}
                      </p>
                      <p className={`text-[12px] m-0 mt-0.5 leading-snug ${!notif.isRead ? 'text-[#4B5563]' : 'text-[#6B7280]'}`}>
                        {notif.message}
                      </p>
                      <p className="text-[11px] font-medium text-[#9E7B6A] m-0 mt-1.5">
                        {getTimeAgo(notif.createdAt)}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-[#C05621] shrink-0 mt-2" />
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                      className="absolute right-2 top-2 p-1.5 text-[#9E7B6A] hover:text-[#C05621] hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all border-none bg-transparent cursor-pointer"
                      title="Mark as read"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-[#F0EBE7] bg-[#FAFAFA] text-center">
            <span className="text-[11px] font-semibold text-[#9E7B6A] uppercase tracking-wider">
              {unreadCount > 0 ? `${unreadCount} Unread Notifications` : "Notification Center"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
