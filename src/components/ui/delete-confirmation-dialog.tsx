"use client";

import { X, AlertTriangle } from "lucide-react";
import { Button } from "./button";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  loading?: boolean;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  loading = false,
}: DeleteConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="relative p-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            <X size={20} className="text-gray-400" />
          </button>

          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-12 text-sm font-semibold border-gray-200 hover:bg-gray-50 transition-all"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-xl h-12 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200 transition-all active:scale-[0.98]"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Now"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
