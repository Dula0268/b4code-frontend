"use client";

import OwnerHeader from "@/components/owner/layout/owner-header";
import NotificationSettingsPanel from "@/components/owner/settings/notification-settings-panel";

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <OwnerHeader 
        title="Settings" 
        subtitle="Manage your account preferences" 
      />
      <div className="flex-1 p-6 mt-[64px] max-w-4xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
        
        <div className="space-y-6">
          <NotificationSettingsPanel />
        </div>
      </div>
    </div>
  );
}
