"use client";

import { useState } from "react";
import { X, Camera, Trash2, Loader2, Check } from "lucide-react";
import { validateUploadFile } from "@/lib/file-validator";
import { toast } from "sonner";

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarUrl: string;
  userName: string;
  hasCustomAvatar: boolean;
  onUpload: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function AvatarModal({
  isOpen,
  onClose,
  avatarUrl,
  userName,
  hasCustomAvatar,
  onUpload,
  onDelete,
}: AvatarModalProps) {
  const [isBusy, setIsBusy] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateUploadFile(file, {
      maxSizeMB: 5,
      allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    });

    if (!validation.valid) {
      toast.error(validation.error || "Invalid file");
      return;
    }

    setIsBusy(true);
    try {
      await onUpload(file);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsBusy(false);
    }
  };

  const handleDeleteClick = async () => {
    setIsBusy(true);
    try {
      await onDelete();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      {/* Background overlay click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-white/20 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#fdfaf8]">
          <h3 className="text-base font-bold text-[#1c1917]">Profile Photo</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Large Avatar Display Area */}
        <div className="p-8 flex flex-col items-center justify-center bg-neutral-900 relative">
          <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl relative group">
            <img
              src={avatarUrl}
              alt={userName}
              className="w-full h-full object-cover"
              suppressHydrationWarning
            />

            {isBusy && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                <Loader2 size={32} className="text-white animate-spin" />
                <span className="text-xs font-semibold text-white/90">Updating photo...</span>
              </div>
            )}
          </div>
          <p className="text-white/80 text-xs font-medium mt-4 tracking-wide">{userName}</p>
        </div>

        {/* Action Buttons */}
        <div className="p-6 flex flex-col gap-3 bg-white">
          <label className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#953002] text-white font-bold text-sm rounded-xl cursor-pointer hover:bg-[#7a2600] active:scale-[0.98] transition-all shadow-md">
            <Camera size={16} />
            <span>Upload New Photo</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isBusy}
            />
          </label>

          {hasCustomAvatar && (
            <button
              onClick={handleDeleteClick}
              disabled={isBusy}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100 hover:text-red-700 active:scale-[0.98] transition-all border border-red-200"
            >
              <Trash2 size={16} />
              <span>Remove Photo</span>
            </button>
          )}

          <button
            onClick={onClose}
            disabled={isBusy}
            className="w-full py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors mt-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
