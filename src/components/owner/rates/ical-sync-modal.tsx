"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarSync, Copy, Check, ExternalLink, AlertCircle, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { restrictionsApi } from "@/api/owner/restrictions.api";

interface RoomOption {
  id: number;
  name: string;
}

interface IcalSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: number;
  rooms: RoomOption[];
  onSuccess: () => void;
}

export default function IcalSyncModal({
  isOpen,
  onClose,
  propertyId,
  rooms,
  onSuccess,
}: IcalSyncModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<"import" | "export">("export");
  const [exportRoomId, setExportRoomId] = useState<string>("ALL");
  const [copied, setCopied] = useState(false);

  // Import form state
  const [channelName, setChannelName] = useState("Airbnb");
  const [customChannel, setCustomChannel] = useState("");
  const [importRoomId, setImportRoomId] = useState<string>("ALL");
  const [feedUrl, setFeedUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive export URL based on current origin
  const apiBase = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const backendBase = "http://localhost:8080";
  const exportUrl =
    exportRoomId === "ALL"
      ? `${backendBase}/api/v1/public/ical/properties/${propertyId}/calendar.ics`
      : `${backendBase}/api/v1/public/ical/properties/${propertyId}/rooms/${exportRoomId}/calendar.ics`;

  const handleCopy = () => {
    navigator.clipboard.writeText(exportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalChannel = channelName === "Other" ? customChannel.trim() : channelName;
    if (!finalChannel) {
      setError("Please specify a channel name.");
      return;
    }
    if (!feedUrl.trim()) {
      setError("Please paste the external iCal calendar URL.");
      return;
    }
    if (!feedUrl.startsWith("http://") && !feedUrl.startsWith("https://") && !feedUrl.startsWith("webcal://")) {
      setError("Invalid feed URL. Must start with https:// or http://");
      return;
    }

    setLoading(true);
    try {
      await restrictionsApi.addIcalFeed({
        propertyId,
        roomTypeId: importRoomId === "ALL" ? null : Number(importRoomId),
        channelName: finalChannel,
        feedUrl: feedUrl.trim().replace(/^webcal:\/\//, "https://"),
        isActive: true,
      });

      setFeedUrl("");
      setChannelName("Airbnb");
      setCustomChannel("");
      setImportRoomId("ALL");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to add iCal calendar feed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl rounded-3xl p-6 bg-white border border-gray-100 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <CalendarSync className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-gray-900">
                iCal Calendar Synchronization
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                Connect Airbnb, Booking.com, and Google Calendar to prevent double bookings
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Tabs value={activeSubTab} onValueChange={(v: any) => setActiveSubTab(v)} className="w-full pt-2">
          <TabsList className="bg-gray-100 p-1 rounded-xl w-full grid grid-cols-2">
            <TabsTrigger
              value="export"
              className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-gray-900 flex items-center justify-center gap-1.5"
            >
              <ArrowUpFromLine className="w-3.5 h-3.5 text-blue-600" />
              Export iCal (To OTAs)
            </TabsTrigger>
            <TabsTrigger
              value="import"
              className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-gray-900 flex items-center justify-center gap-1.5"
            >
              <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-600" />
              Import iCal (From OTAs)
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: EXPORT */}
          <TabsContent value="export" className="space-y-4 pt-3 outline-none">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">Select Room Calendar to Export</Label>
              <Select value={exportRoomId} onValueChange={setExportRoomId}>
                <SelectTrigger className="rounded-xl text-xs font-semibold">
                  <SelectValue placeholder="Select Scope" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="ALL" className="text-xs font-bold">Entire Property Feed</SelectItem>
                  {rooms.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)} className="text-xs">
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <Label className="text-xs font-bold text-slate-800">Your iCalendar (.ics) Feed URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={exportUrl}
                  className="rounded-xl bg-white text-xs font-mono text-slate-600 border-slate-300"
                />
                <Button
                  type="button"
                  onClick={handleCopy}
                  className={`rounded-xl text-xs font-bold shrink-0 transition-all ${
                    copied ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-slate-800 hover:bg-slate-900 text-white"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" /> Copy Link
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                Copy this URL and paste it into Airbnb (Listing &gt; Pricing and availability &gt; Calendar sync &gt; Import) or Booking.com extranet to automatically sync reserved dates.
              </p>
            </div>
          </TabsContent>

          {/* TAB 2: IMPORT */}
          <TabsContent value="import" className="space-y-4 pt-3 outline-none">
            <form onSubmit={handleImportSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700">OTA / Platform</Label>
                  <Select value={channelName} onValueChange={setChannelName}>
                    <SelectTrigger className="rounded-xl text-xs font-semibold">
                      <SelectValue placeholder="Channel" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Airbnb" className="text-xs">Airbnb</SelectItem>
                      <SelectItem value="Booking.com" className="text-xs">Booking.com</SelectItem>
                      <SelectItem value="VRBO" className="text-xs">VRBO</SelectItem>
                      <SelectItem value="Google Calendar" className="text-xs">Google Calendar</SelectItem>
                      <SelectItem value="TripAdvisor" className="text-xs">TripAdvisor</SelectItem>
                      <SelectItem value="Other" className="text-xs">Other Channel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700">Assign To Room Type</Label>
                  <Select value={importRoomId} onValueChange={setImportRoomId}>
                    <SelectTrigger className="rounded-xl text-xs font-semibold">
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="ALL" className="text-xs font-bold">Entire Property</SelectItem>
                      {rooms.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)} className="text-xs">
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {channelName === "Other" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700">Custom Channel Name</Label>
                  <Input
                    placeholder="e.g. Agoda / Direct Partner"
                    value={customChannel}
                    onChange={(e) => setCustomChannel(e.target.value)}
                    className="rounded-xl text-xs"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">External Feed URL (.ics)</Label>
                <Input
                  placeholder="https://www.airbnb.com/calendar/ical/1234567.ics?s=..."
                  value={feedUrl}
                  onChange={(e) => setFeedUrl(e.target.value)}
                  className="rounded-xl text-xs font-mono"
                  required
                />
                <p className="text-[11px] text-gray-500">
                  Our system will automatically fetch reservations and lock matching calendar dates to prevent overbooking.
                </p>
              </div>

              <DialogFooter className="pt-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="rounded-xl text-xs font-bold text-gray-600"
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl text-xs font-bold bg-[#953002] hover:bg-[#7a2702] text-white"
                >
                  {loading ? "Connecting..." : "Add & Sync Channel"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
