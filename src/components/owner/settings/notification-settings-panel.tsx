"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { userApi } from "@/api/user/user.api";
import { toast } from "sonner";
import { Loader2, Mail, Smartphone, Bell, CalendarPlus, Ban, MessageSquare } from "lucide-react";

type NotificationCategory = "newBooking" | "cancellations" | "guestMessages";
type NotificationChannel = "email" | "sms" | "push";

type Preferences = Record<NotificationCategory, Record<NotificationChannel, boolean>>;

const defaultPreferences: Preferences = {
  newBooking: { email: true, sms: false, push: true },
  cancellations: { email: true, sms: true, push: true },
  guestMessages: { email: false, sms: false, push: true },
};

const categories = [
  { id: "newBooking", label: "New Bookings", description: "Receive alerts when a new booking is made.", icon: CalendarPlus },
  { id: "cancellations", label: "Cancellations", description: "Receive alerts when a guest cancels a booking.", icon: Ban },
  { id: "guestMessages", label: "Guest Messages", description: "Receive alerts for new messages from guests.", icon: MessageSquare },
] as const;

export default function NotificationSettingsPanel() {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    userApi.getCurrentUser().then(user => {
      if (user.notificationPreferences) {
        try {
          const parsed = JSON.parse(user.notificationPreferences);
          if (parsed && parsed.notifications) {
            setPreferences(parsed.notifications);
          }
        } catch (e) {
          console.error("Failed to parse preferences", e);
        }
      }
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  const handleToggle = async (category: NotificationCategory, channel: NotificationChannel, checked: boolean) => {
    const updatedPreferences = {
      ...preferences,
      [category]: {
        ...preferences[category],
        [channel]: checked,
      },
    };
    
    setPreferences(updatedPreferences);
    setLoading(true);

    try {
      await userApi.updatePreferences({ notifications: updatedPreferences });
      toast.success("Notification preferences updated.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update preferences.");
      // Revert state on failure
      setPreferences(preferences);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full border-0 shadow-sm ring-1 ring-zinc-200/50">
      <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl text-zinc-900 font-semibold tracking-tight">Notification Preferences</CardTitle>
            <CardDescription className="text-zinc-500">
              Manage how and when you receive notifications across different channels.
            </CardDescription>
          </div>
          {loading && (
            <div className="flex items-center text-sm font-medium text-zinc-500 bg-zinc-100/80 px-3 py-1.5 rounded-full shrink-0">
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin text-zinc-400" /> 
              Saving
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-zinc-100">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.id} className="p-6 transition-all duration-200 hover:bg-zinc-50/50 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 group">
                <div className="flex gap-4 items-start max-w-lg">
                  <div className="p-2 rounded-lg bg-zinc-100/80 text-zinc-600 ring-1 ring-zinc-200/50 shrink-0 transition-colors group-hover:bg-white group-hover:shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 mt-0.5">
                    <h4 className="text-[15px] font-medium text-zinc-900">{category.label}</h4>
                    <p className="text-sm text-zinc-500 leading-relaxed">{category.description}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-6 shrink-0 bg-white xl:bg-transparent p-4 xl:p-0 rounded-lg xl:rounded-none ring-1 ring-zinc-100 xl:ring-0">
                  <div className="flex items-center gap-3 min-w-[100px]">
                    <Switch
                      id={`${category.id}-email`}
                      checked={preferences[category.id].email}
                      onCheckedChange={(checked) => handleToggle(category.id, "email", checked)}
                      disabled={loading}
                    />
                    <Label htmlFor={`${category.id}-email`} className="flex items-center gap-2 text-sm font-medium text-zinc-600 cursor-pointer hover:text-zinc-900 transition-colors">
                      <Mail className="w-4 h-4 text-zinc-400" />
                      Email
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 min-w-[100px]">
                    <Switch
                      id={`${category.id}-sms`}
                      checked={preferences[category.id].sms}
                      onCheckedChange={(checked) => handleToggle(category.id, "sms", checked)}
                      disabled={loading}
                    />
                    <Label htmlFor={`${category.id}-sms`} className="flex items-center gap-2 text-sm font-medium text-zinc-600 cursor-pointer hover:text-zinc-900 transition-colors">
                      <Smartphone className="w-4 h-4 text-zinc-400" />
                      SMS
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 min-w-[100px]">
                    <Switch
                      id={`${category.id}-push`}
                      checked={preferences[category.id].push}
                      onCheckedChange={(checked) => handleToggle(category.id, "push", checked)}
                      disabled={loading}
                    />
                    <Label htmlFor={`${category.id}-push`} className="flex items-center gap-2 text-sm font-medium text-zinc-600 cursor-pointer hover:text-zinc-900 transition-colors">
                      <Bell className="w-4 h-4 text-zinc-400" />
                      Push
                    </Label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

