"use client";

import { useEffect, useState, useCallback } from "react";
import { useOwnerPricingStore } from "@/store/owner/owner-pricing.store";
import { restrictionsApi, ReservationRestriction, RoomInventoryLock, IcalSyncChannel } from "@/api/owner/restrictions.api";
import { ownerPricingApi } from "@/api/owner/pricing.api";
import RestrictionBuilderModal from "./restriction-builder-modal";
import IcalSyncModal from "./ical-sync-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  ShieldAlert,
  CalendarSync,
  Plus,
  RefreshCw,
  Trash2,
  Lock,
  DoorOpen,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Ban,
  ArrowRightLeft,
  ExternalLink,
} from "lucide-react";

interface RestrictionsTabProps {
  propertyName?: string;
}

export default function RestrictionsTab({ propertyName }: RestrictionsTabProps) {
  const { propertyId } = useOwnerPricingStore();

  const [restrictions, setRestrictions] = useState<ReservationRestriction[]>([]);
  const [inventoryLocks, setInventoryLocks] = useState<RoomInventoryLock[]>([]);
  const [icalFeeds, setIcalFeeds] = useState<IcalSyncChannel[]>([]);
  const [rooms, setRooms] = useState<Array<{ id: number; name: string }>>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncingFeedId, setSyncingFeedId] = useState<number | null>(null);

  // Modals
  const [isRestrictionModalOpen, setIsRestrictionModalOpen] = useState(false);
  const [isIcalModalOpen, setIsIcalModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    setError(null);

    try {
      const [restrData, locksData, feedsData, ratesData] = await Promise.all([
        restrictionsApi.getRestrictions(propertyId).catch(() => []),
        restrictionsApi.getInventoryLocks(propertyId).catch(() => []),
        restrictionsApi.getIcalFeeds(propertyId).catch(() => []),
        ownerPricingApi.getRateOverview(propertyId).catch(() => null),
      ]);

      setRestrictions(restrData);
      setInventoryLocks(locksData);
      setIcalFeeds(feedsData);

      if (ratesData?.rooms) {
        setRooms(ratesData.rooms.map((r: { id: number; name: string }) => ({ id: r.id, name: r.name })));
      } else if (locksData.length > 0) {
        setRooms(locksData.map((l: RoomInventoryLock) => ({ id: l.roomTypeId, name: l.roomTypeName })));
      }
    } catch (err: any) {
      console.error("Failed to load restrictions data:", err);
      setError("Could not load restrictions or calendar sync data.");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleRestriction = async (restriction: ReservationRestriction) => {
    try {
      const updated = await restrictionsApi.updateRestriction(restriction.id, {
        isActive: !restriction.isActive,
      });
      setRestrictions((prev) =>
        prev.map((r) => (r.id === restriction.id ? { ...r, isActive: updated.isActive } : r))
      );
    } catch (err: any) {
      alert("Failed to toggle restriction: " + (err?.response?.data?.message || err.message));
    }
  };

  const handleDeleteRestriction = async (id: number) => {
    if (!confirm("Are you sure you want to delete this restriction rule?")) return;
    try {
      await restrictionsApi.deleteRestriction(id);
      setRestrictions((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert("Failed to delete restriction: " + (err?.response?.data?.message || err.message));
    }
  };

  const handleSyncFeedNow = async (id: number) => {
    setSyncingFeedId(id);
    try {
      const updated = await restrictionsApi.syncIcalFeed(id);
      setIcalFeeds((prev) => prev.map((f) => (f.id === id ? updated : f)));
      // Refresh restrictions since new blackout dates might have been imported
      restrictionsApi.getRestrictions(propertyId!).then(setRestrictions).catch(() => {});
    } catch (err: any) {
      alert("Sync failed: " + (err?.response?.data?.message || err.message));
    } finally {
      setSyncingFeedId(null);
    }
  };

  const handleDeleteFeed = async (id: number) => {
    if (!confirm("Delete this iCal feed? Synced blackout dates for this channel will be removed.")) return;
    try {
      await restrictionsApi.deleteIcalFeed(id);
      setIcalFeeds((prev) => prev.filter((f) => f.id !== id));
      restrictionsApi.getRestrictions(propertyId!).then(setRestrictions).catch(() => {});
    } catch (err: any) {
      alert("Failed to delete feed: " + (err?.response?.data?.message || err.message));
    }
  };

  const activeRulesCount = restrictions.filter((r) => r.isActive).length;
  const lockedRoomsCount = inventoryLocks.filter((l) => l.isOverbookingLocked).length;

  return (
    <div className="space-y-8">
      {/* Top Banner with Actions */}
      <div className="bg-gradient-to-r from-amber-900 via-[#953002] to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-md">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
              Overbooking Guard & Calendar Synchronization
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Restrictions & Overbooking Prevention
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              Enforce minimum stay rules, block arrival/departure dates, lock inventory to physical doors, and auto-sync calendars with Airbnb and Booking.com.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setIsRestrictionModalOpen(true)}
              className="rounded-2xl text-xs font-bold bg-white text-[#953002] hover:bg-amber-50 shadow-md h-10 px-4"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Restriction Rule
            </Button>
            <Button
              onClick={() => setIsIcalModalOpen(true)}
              variant="outline"
              className="rounded-2xl text-xs font-bold bg-white/10 border-white/20 text-white hover:bg-white/20 h-10 px-4"
            >
              <CalendarSync className="w-4 h-4 mr-1.5 text-amber-300" />
              iCal Sync (Airbnb / Booking.com)
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
            <span>Active Restrictions</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#953002] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900">{activeRulesCount}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Stay length & CTA/CTD rules</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
            <span>Physical Room Locks</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900">
              {lockedRoomsCount} / {inventoryLocks.length}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">1:1 Physical Door Protection</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
            <span>Connected iCal Feeds</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <CalendarSync className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900">{icalFeeds.length}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Airbnb, Booking.com, VRBO</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
            <span>Double Booking Risk</span>
            <div className="w-8 h-8 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm font-black text-green-700 uppercase tracking-wide">Protected</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Physical door lock active</div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Physical Room Inventory & Overbooking Lock */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <DoorOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">
                Physical Room Inventory & Overbooking Locks
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Each room inventory unit is bound to an actual physical door number to prevent overbooking beyond real capacity.
              </p>
            </div>
          </div>
          <Button
            onClick={loadData}
            variant="ghost"
            size="sm"
            className="rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-6">Room Type</th>
                <th className="py-3.5 px-6">Configured Inventory</th>
                <th className="py-3.5 px-6">Physical Door Numbers</th>
                <th className="py-3.5 px-6">Active Bookings</th>
                <th className="py-3.5 px-6">Available to Book</th>
                <th className="py-3.5 px-6 text-right">Lock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inventoryLocks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    No room types found for this property.
                  </td>
                </tr>
              ) : (
                inventoryLocks.map((lock) => (
                  <tr key={lock.roomTypeId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900">
                      {lock.roomTypeName}
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-700">
                      {lock.configuredInventory} {lock.configuredInventory === 1 ? "room" : "rooms"}
                    </td>
                    <td className="py-4 px-6">
                      {lock.doorNumbers && lock.doorNumbers.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {lock.doorNumbers.map((d, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700 font-mono text-[11px] font-semibold border border-gray-200"
                            >
                              Door #{d}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No door numbers mapped</span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-semibold text-amber-700">
                      {lock.activeBookingsCount} occupied
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-700">
                      {lock.availableCount} available
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold px-2.5 py-1 inline-flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Hard Cap Enforced
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Stay Restriction Rules Grid */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-[#953002] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">
                Stay Restriction Rules ({restrictions.length})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Active minimum stay requirements, closed-to-arrival dates, and maintenance blocks
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsRestrictionModalOpen(true)}
            size="sm"
            className="rounded-xl text-xs font-bold bg-[#953002] hover:bg-[#7a2702] text-white shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> New Rule
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-6">Rule Name</th>
                <th className="py-3.5 px-6">Scope</th>
                <th className="py-3.5 px-6">Constraint Type</th>
                <th className="py-3.5 px-6">Requirement / Dates</th>
                <th className="py-3.5 px-6">Reason / Note</th>
                <th className="py-3.5 px-6 text-center">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {restrictions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    <ShieldAlert className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    No restriction rules defined yet. Click &quot;Add Restriction Rule&quot; above to set minimum stays or block arrival dates.
                  </td>
                </tr>
              ) : (
                restrictions.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900">
                      {r.name}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700 text-[11px] font-semibold">
                        {r.roomTypeName || "Entire Property"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {r.type === "MIN_STAY" && (
                        <Badge className="bg-amber-50 text-amber-900 border-amber-200 text-[10px] font-bold">
                          Min Stay: {r.minStay || 2} Nights
                        </Badge>
                      )}
                      {r.type === "MAX_STAY" && (
                        <Badge className="bg-blue-50 text-blue-900 border-blue-200 text-[10px] font-bold">
                          Max Stay: {r.maxStay || 14} Nights
                        </Badge>
                      )}
                      {r.type === "CLOSED_TO_ARRIVAL" && (
                        <Badge className="bg-orange-50 text-orange-900 border-orange-200 text-[10px] font-bold">
                          Closed to Arrival (CTA)
                        </Badge>
                      )}
                      {r.type === "CLOSED_TO_DEPARTURE" && (
                        <Badge className="bg-purple-50 text-purple-900 border-purple-200 text-[10px] font-bold">
                          Closed to Departure (CTD)
                        </Badge>
                      )}
                      {r.type === "BLACKOUT" && (
                        <Badge className="bg-red-50 text-red-900 border-red-200 text-[10px] font-bold">
                          Maintenance / Blackout
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-mono text-[11px]">
                      {r.startDate} &rarr; {r.endDate}
                    </td>
                    <td className="py-4 px-6 text-gray-500 italic max-w-xs truncate">
                      {r.reason || "—"}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Switch
                        checked={r.isActive}
                        onCheckedChange={() => handleToggleRestriction(r)}
                        aria-label="Toggle restriction"
                      />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        onClick={() => handleDeleteRestriction(r.id)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: Connected iCal Synchronization Feeds */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
              <CalendarSync className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">
                Connected iCal Calendar Feeds ({icalFeeds.length})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Two-way calendar syncing with Airbnb, Booking.com, VRBO, and Google Calendar
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsIcalModalOpen(true)}
              size="sm"
              className="rounded-xl text-xs font-bold bg-[#953002] hover:bg-[#7a2702] text-white shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Connect Channel
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-6">Channel</th>
                <th className="py-3.5 px-6">Assigned Room</th>
                <th className="py-3.5 px-6">Sync Status</th>
                <th className="py-3.5 px-6">Events Imported</th>
                <th className="py-3.5 px-6">Last Synchronized</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {icalFeeds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    <CalendarSync className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    No external calendar channels connected. Click &quot;Connect Channel&quot; to import your Airbnb or Booking.com iCal calendar.
                  </td>
                </tr>
              ) : (
                icalFeeds.map((feed) => (
                  <tr key={feed.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center">
                        {feed.channelName.charAt(0)}
                      </span>
                      {feed.channelName}
                    </td>
                    <td className="py-4 px-6 text-gray-700 font-semibold">
                      {feed.roomTypeName || "Entire Property"}
                    </td>
                    <td className="py-4 px-6">
                      {feed.syncStatus === "SUCCESS" && (
                        <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                          Active &bull; Synced
                        </Badge>
                      )}
                      {feed.syncStatus === "PENDING" && (
                        <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-bold">
                          Pending Sync
                        </Badge>
                      )}
                      {feed.syncStatus === "FAILED" && (
                        <Badge className="bg-red-50 text-red-800 border-red-200 text-[10px] font-bold">
                          Sync Error
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-700 font-bold">
                      {feed.eventsImported} booked blocks
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-[11px]">
                      {feed.lastSyncAt ? new Date(feed.lastSyncAt).toLocaleString() : "Never"}
                    </td>
                    <td className="py-4 px-6 text-right space-x-1">
                      <Button
                        onClick={() => handleSyncFeedNow(feed.id)}
                        disabled={syncingFeedId === feed.id}
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-[11px] font-bold text-gray-700 hover:text-gray-900 border-gray-200"
                      >
                        <RefreshCw
                          className={`w-3 h-3 mr-1 ${syncingFeedId === feed.id ? "animate-spin" : ""}`}
                        />
                        Sync Now
                      </Button>
                      <Button
                        onClick={() => handleDeleteFeed(feed.id)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <RestrictionBuilderModal
        isOpen={isRestrictionModalOpen}
        onClose={() => setIsRestrictionModalOpen(false)}
        propertyId={propertyId!}
        rooms={rooms}
        onSuccess={loadData}
      />

      <IcalSyncModal
        isOpen={isIcalModalOpen}
        onClose={() => setIsIcalModalOpen(false)}
        propertyId={propertyId!}
        rooms={rooms}
        onSuccess={loadData}
      />
    </div>
  );
}
