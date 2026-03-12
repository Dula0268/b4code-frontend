"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = "success",
  isVisible,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const styles = {
    success: {
      bg: "bg-[#F0FDF4]",
      border: "border-[#16A34A]",
      text: "text-[#16A34A]",
      icon: <CheckCircle2 size={18} />,
    },
    error: {
      bg: "bg-[#FEF2F2]",
      border: "border-[#DC2626]",
      text: "text-[#DC2626]",
      icon: <AlertCircle size={18} />,
    },
    info: {
      bg: "bg-[#EFF6FF]",
      border: "border-[#2563EB]",
      text: "text-[#2563EB]",
      icon: <AlertCircle size={18} />,
    },
  };

  const style = styles[type];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${style.border} ${style.bg} shadow-lg animate-slideDown max-w-md`}
    >
      <div className={style.text}>{style.icon}</div>
      <p className={`flex-1 text-sm font-medium text-[#1A1A1A]`}>{message}</p>
      <button
        onClick={onClose}
        className={`${style.text} hover:opacity-70 transition`}
      >
        <X size={16} />
      </button>

      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
