"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, Loader2, X, Utensils } from "lucide-react";
import { staffNotificationApi, Notification } from "@/api/staff/staff.notification.api";

export default function StaffNotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const unreadNotifications = notifications.filter(n => !n.isRead && !n.read);

  const fetchNotifications = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await staffNotificationApi.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead && !n.read).length);
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await staffNotificationApi.markAsRead(id);
      const updated = notifications.map(n => n.id === id ? { ...n, isRead: true, read: true } : n);
      setNotifications(updated);
      setUnreadCount(updated.filter(n => !n.isRead && !n.read).length);
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await staffNotificationApi.markAllAsRead();
      const updated = notifications.map(n => ({ ...n, isRead: true, read: true }));
      setNotifications(updated);
      setUnreadCount(0);
    } catch (e) {
      console.error("Failed to mark all as read", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead && !notif.read) {
      await markAsRead(notif.id);
    }
    setIsOpen(false);
    
    // Always route to orders for staff notifications
    router.push(`/staff/orders`);
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
        className="relative w-9 h-9 rounded-full bg-[#F5F6F8] hover:bg-[#E8EAED] flex items-center justify-center transition-colors cursor-pointer border-none outline-none"
      >
        <Bell size={18} className="text-[#6B7280]" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center min-w-[18px] h-[18px] bg-[#C05621] rounded-full border-2 border-white text-[10px] font-bold text-white px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[340px] bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-[#E8EAED] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-[#E8EAED] bg-[#F9FAFB]">
            <h3 className="font-bold text-[16px] text-[#1A1A1A] m-0">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-[12px] font-bold text-[#C05621] hover:text-[#9E4518] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Check size={12} />
                  Mark all read
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading && unreadNotifications.length === 0 ? (
              <div className="py-12 flex items-center justify-center">
                <Loader2 size={24} className="text-[#C05621] animate-spin" />
              </div>
            ) : unreadNotifications.length === 0 ? (
              <div className="py-10 px-6 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                  <Bell size={20} className="text-gray-300" />
                </div>
                <p className="text-[14px] font-bold text-[#1A1A1A] m-0">All caught up!</p>
                <p className="text-[12px] text-[#9CA3AF] m-0 mt-1">No new notifications right now.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {unreadNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3 group relative"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#FFF8F0] flex items-center justify-center shrink-0 border border-[#F0EBE7]">
                       <Utensils size={18} className="text-[#C05621]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-bold text-[#1A1A1A] m-0 leading-snug group-hover:text-[#C05621] transition-colors">
                        {notif.title}
                      </h4>
                      <p className="text-[12px] text-gray-500 m-0 mt-0.5 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 m-0 mt-1.5 uppercase tracking-wider">
                        {getTimeAgo(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
