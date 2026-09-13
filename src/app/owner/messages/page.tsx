"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOwnerMessageStore } from "@/store/owner/message.store";
import OwnerInbox from "@/components/owner/messages/OwnerInbox";
import AutoReplyClient from "@/app/staff/auto-reply/auto-reply-client";
import { MessageCircle, Bot, Users } from "lucide-react";
import { useAuthStore } from "@/store/auth/auth.store";

export default function MessagesPage() {
  const { disconnect, fetchPropertiesAndConversations, selectedPropertyId, properties } = useOwnerMessageStore();
  const [activeTab, setActiveTab] = useState("inbox");
  const activePropertyForAutomation = selectedPropertyId === "ALL" ? null : (selectedPropertyId as number);

  // In a real app, this value would come from the backend or an admin settings store
  const isMessagingEnabledByAdmin = true;

  useEffect(() => {
    fetchPropertiesAndConversations();
    return () => {
      disconnect();
    };
  }, [disconnect, fetchPropertiesAndConversations]);

  if (!isMessagingEnabledByAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-slate-500">
        <MessageCircle size={48} className="mb-4 opacity-20" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Messaging is Disabled</h2>
        <p>Please contact the administrator to enable the guest messaging feature for your properties.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Messages</h1>
          <p className="text-slate-500 mt-1">Communicate with guests and staff, and manage automated replies.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <TabsList className="bg-slate-200/50 p-1">
            <TabsTrigger value="inbox" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <MessageCircle className="h-4 w-4" />
              Guest
            </TabsTrigger>
            <TabsTrigger value="staff-messages" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Users className="h-4 w-4" />
              Staff
            </TabsTrigger>
            <TabsTrigger value="automations" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Bot className="h-4 w-4" />
              Automations
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="inbox" className="m-0 border-none p-0 outline-none flex-1 flex flex-col min-h-0">
          <OwnerInbox />
        </TabsContent>
        
        <TabsContent value="automations" className="m-0 border-none p-0 outline-none">
          {activePropertyForAutomation ? (
            <AutoReplyClient propertyId={activePropertyForAutomation} />
          ) : (
            <div className="bg-white rounded-xl border shadow-sm p-8 text-center text-slate-500">
              <Bot size={48} className="mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Select a Property</h3>
              <p>Please select a property from the inbox to configure its automations.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="staff-messages" className="m-0 border-none p-0 outline-none flex-1">
          <div className="bg-white rounded-xl border shadow-sm p-8 text-center text-slate-500">
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Staff Messages</h3>
            <p>View messages between your staff and guests here. (Coming soon)</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
