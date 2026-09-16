"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ownerPropertyApi } from "@/api/owner/property.api";
import { ownerRoomApi, OwnerRoomType } from "@/api/owner/room.api";
import { ownerSettingsApi, BankAccountDto } from "@/api/owner/settings.api";
import { ownerPayoutsApi } from "@/api/owner/payouts.api";
import { OwnerProperty } from "@/models/owner";
import { Loader2, Edit, MapPin, Building2, BedDouble, Users, HandCoins, RefreshCcw, AlertCircle, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import PropertyStatusBadge from "@/components/owner/properties/property-status-badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AxiosError } from "axios";
import EditPropertyModal from "@/components/owner/properties/edit-property-modal";
import RoomFormModal from "@/components/owner/properties/room-form-modal";

export default function PropertyDetailsDashboard() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [property, setProperty] = useState<OwnerProperty | null>(null);
  const [rooms, setRooms] = useState<OwnerRoomType[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccountDto[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  
  const [loading, setLoading] = useState(true);
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);

  // Modal states
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [selectedRoomForEdit, setSelectedRoomForEdit] = useState<OwnerRoomType | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!id || id === "new") return;
    setLoading(true);
    try {
      const propId = Number(id);
      const [propData, roomData, bankData] = await Promise.all([
        ownerPropertyApi.getProperty(propId),
        ownerRoomApi.listRooms(propId),
        ownerSettingsApi.getBankAccounts(),
      ]);
      setProperty(propData);
      setRooms(roomData.roomTypes);
      setBankAccounts(bankData);
      
      if (bankData.length > 0) {
        const primary = bankData.find(a => a.isPrimary) || bankData[0];
        setSelectedAccount(primary.id.toString());
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      toast.error("Failed to load property details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRequestPayout = async () => {
    if (!property || !selectedAccount) {
      toast.error("Please select a bank account first.");
      return;
    }
    
    setIsRequestingPayout(true);
    try {
      const result = await ownerPayoutsApi.requestPayout(property.id, parseInt(selectedAccount));
      toast.success(`Successfully requested payout of LKR ${result.amount.toLocaleString()} for ${property.name}.`);
      fetchDashboardData(); // Refresh balance
    } catch (error) {
      let message = "An error occurred while requesting the payout.";
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      toast.error(`Payout Request Failed: ${message}`);
    } finally {
      setIsRequestingPayout(false);
    }
  };

  if (loading || !property) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="animate-spin text-[#953002]" size={32} />
      </div>
    );
  }

  const displayAddress = [property.city, property.country].filter(Boolean).join(", ");

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-8 w-full">
      {property.status === 'REJECTED' && property.rejectionReason && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-3xl p-5 flex gap-4 items-start shadow-sm animate-in fade-in zoom-in duration-300">
          <div className="w-10 h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0">
            <AlertCircle className="text-[#DC2626] h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#991B1B] text-[16px]">Property Application Rejected</h3>
            <p className="text-[#B91C1C] text-[14px] mt-1.5 font-medium leading-relaxed">
              <span className="font-bold uppercase tracking-wider text-[11px] bg-[#FEE2E2] px-2 py-0.5 rounded-md mr-2">Reason</span>
              {property.rejectionReason}
            </p>
            <p className="text-[#991B1B]/80 text-[13px] mt-3 bg-[#FEE2E2]/50 inline-block px-3 py-1.5 rounded-lg border border-[#FECACA]/50">
              Please click &quot;Edit Property Details&quot; to address these issues and resubmit for approval.
            </p>
          </div>
        </div>
      )}

      {/* Header & Property Info */}
      <div className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-3xl border border-[#E8DDD8] shadow-sm hover:shadow-md transition-all duration-300 group">
        <div className="relative w-full md:w-64 h-48 bg-[#F3F4F6] rounded-2xl overflow-hidden flex-shrink-0 group-hover:shadow-inner transition-all duration-300">
          {property.image ? (
            <Image src={property.image} alt={property.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" unoptimized />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 size={40} className="text-[#D1D5DB]" />
            </div>
          )}
          <div className="absolute top-3 left-3">
             <PropertyStatusBadge status={property.status} />
          </div>
        </div>
        
        <div className="flex flex-col justify-between flex-1">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#1A1A1A]">{property.name}</h1>
                {displayAddress && (
                  <p className="flex items-center gap-1.5 text-[14px] text-[#9E7B6A] mt-1.5">
                    <MapPin size={16} className="text-[#C05621]" />
                    {displayAddress}
                  </p>
                )}
              </div>
              <Button 
                onClick={() => setIsPropertyModalOpen(true)}
                variant="outline" 
                className="rounded-xl border-[#E8DDD8] text-[#1A1A1A] font-semibold flex items-center gap-2 hover:bg-[#FDF8F6] hover:text-[#953002] transition-colors duration-200"
              >
                <Edit size={16} /> Edit Property Details
              </Button>
            </div>
            
            {property.description && (
              <p className="mt-4 text-[14px] text-[#6B7280] leading-relaxed line-clamp-3 max-w-3xl">
                {property.description}
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#F0EBE7]">
            {property.amenities?.slice(0, 5).map((amenity, idx) => (
              <span key={idx} className="px-3 py-1 bg-[#F8F9FA] border border-[#E8DDD8] text-[12px] font-medium text-[#6B7280] rounded-lg">
                {amenity}
              </span>
            ))}
            {property.amenities && property.amenities.length > 5 && (
              <span className="px-3 py-1 bg-[#F8F9FA] border border-[#E8DDD8] text-[12px] font-medium text-[#6B7280] rounded-lg">
                +{property.amenities.length - 5} more
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rooms Section */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-[20px] font-bold text-[#1A1A1A]">Rooms & Layout</h2>
              <span className="bg-[#953002]/10 text-[#953002] px-3 py-1 rounded-full text-[13px] font-bold">
                {rooms.length} Room Type{rooms.length !== 1 ? 's' : ''}
              </span>
            </div>
            <Button 
              onClick={() => {
                setSelectedRoomForEdit(null);
                setIsRoomModalOpen(true);
              }}
              className="rounded-xl bg-[#FDF8F6] hover:bg-[#F0EBE7] text-[#953002] border border-[#E8DDD8] font-bold shadow-sm"
              variant="outline"
              size="sm"
            >
              + Add Room
            </Button>
          </div>
          
          {rooms.length === 0 ? (
            <div className="bg-white border border-[#E8DDD8] rounded-2xl p-8 text-center">
              <p className="text-[#6B7280] text-sm">No rooms added yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rooms.map((room) => (
                <div key={room.id} className="bg-white border border-[#E8DDD8] rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#D9C4B8] transition-all duration-300 flex flex-col">
                  {/* Room Image Header */}
                  <div className="relative h-48 bg-[#F3F4F6] w-full border-b border-[#F0EBE7]">
                    {room.imageUrl ? (
                      <Image src={room.imageUrl} alt={room.name} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[#D1D5DB]">
                        <ImageIcon size={40} />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                       <Button
                         variant="secondary"
                         size="sm"
                         onClick={() => {
                           setSelectedRoomForEdit(room);
                           setIsRoomModalOpen(true);
                         }}
                         className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white text-[#1A1A1A] shadow-sm backdrop-blur-sm transition-transform hover:scale-105"
                       >
                         <Edit size={14} />
                       </Button>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-[18px] font-bold text-[#1A1A1A] leading-tight mb-1">{room.name}</h3>
                        <p className="text-[13px] font-medium text-[#9E7B6A]">{room.roomCategory || 'Standard Room'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[12px] font-bold text-[#9E7B6A] uppercase tracking-wider mb-0.5">Price / Night</p>
                        <p className="text-[18px] font-extrabold text-[#953002]">LKR {room.basePrice?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-[#F0EBE7] grid grid-cols-2 gap-y-3 gap-x-2">
                      <div>
                         <p className="text-[11px] font-medium text-[#9E7B6A] uppercase tracking-wider mb-1 flex items-center gap-1.5"><Users size={12}/> Capacity</p>
                         <p className="text-[13px] font-semibold text-[#1A1A1A]">{room.maxAdults || 2} Adults {room.maxChildren ? `, ${room.maxChildren} Children` : ''}</p>
                      </div>
                      <div>
                         <p className="text-[11px] font-medium text-[#9E7B6A] uppercase tracking-wider mb-1 flex items-center gap-1.5"><BedDouble size={12}/> Beds</p>
                         <p className="text-[13px] font-semibold text-[#1A1A1A] truncate" title={room.bedConfigurations?.join(" + ")}>
                           {room.bedConfigurations?.length > 0 ? room.bedConfigurations[0] : "Not specified"}
                           {room.bedConfigurations?.length > 1 && <span className="text-[#9E7B6A] font-normal"> +{room.bedConfigurations.length - 1}</span>}
                         </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payout Section */}
        <div className="flex flex-col gap-5">
           <h2 className="text-[20px] font-bold text-[#1A1A1A]">Financials</h2>
           
           <div className="bg-gradient-to-br from-[#FDFAF8] to-[#FDF4EF] border border-[#F0EBE7] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-[0.03] pointer-events-none">
                 <HandCoins size={140} />
              </div>
              
              <div className="mb-6 relative z-10">
                <span className="text-[12px] font-bold text-[#9E7B6A] uppercase tracking-wider">Available Balance</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-4xl font-extrabold text-[#953002] tracking-tight">LKR {(property.availableBalance || 0).toLocaleString()}</span>
                  <span className="text-[15px] text-[#C05621] font-medium">.00</span>
                </div>
                <p className="text-[13px] text-[#6B7280] mt-2">Net revenue available for withdrawal.</p>
              </div>

              <div className="space-y-4 pt-6 border-t border-[#E8DDD8]">
                <div>
                  <span className="text-[12px] font-bold text-[#1A1A1A] uppercase tracking-wider block mb-2">Deposit To</span>
                  <Select 
                    value={selectedAccount} 
                    onValueChange={setSelectedAccount}
                    disabled={bankAccounts.length === 0}
                  >
                    <SelectTrigger className="w-full text-[13px] rounded-xl bg-white border-[#E8DDD8] h-11">
                      <SelectValue placeholder="Select a bank account" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.bankName} - {account.accountNumber.slice(-4)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full h-12 rounded-xl bg-[#953002] hover:bg-[#C05621] text-white text-[15px] font-bold shadow-sm transition-all disabled:opacity-50"
                  onClick={handleRequestPayout}
                  disabled={isRequestingPayout || bankAccounts.length === 0 || !selectedAccount || !property.availableBalance || property.availableBalance <= 0}
                >
                  {isRequestingPayout ? (
                    <>
                      <RefreshCcw size={18} className="mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <HandCoins size={20} className="mr-2" />
                      Request Payout
                    </>
                  )}
                </Button>
              </div>
           </div>
        </div>
      </div>
      
      <EditPropertyModal 
        property={property} 
        isOpen={isPropertyModalOpen} 
        onClose={() => setIsPropertyModalOpen(false)} 
        onSaved={fetchDashboardData} 
      />

      <RoomFormModal 
        propertyId={property.id} 
        roomToEdit={selectedRoomForEdit} 
        isOpen={isRoomModalOpen} 
        onClose={() => setIsRoomModalOpen(false)} 
        onSaved={fetchDashboardData} 
      />
    </div>
  );
}
