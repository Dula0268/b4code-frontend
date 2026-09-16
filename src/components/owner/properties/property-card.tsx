"use client";
import Image from "next/image";
import { Building2, MapPin, Star, BedDouble } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { type OwnerProperty, READ_ONLY_STATUSES, PROPERTY_STATUS_LABELS, TOGGLEABLE_STATUSES } from "@/models/owner";
import PropertyStatusBadge from "./property-status-badge";
import { Switch } from "@/components/ui/switch";
import { useOwnerPropertiesStore } from "@/store/owner/owner-properties.store";

interface PropertyCardProps {
  property: OwnerProperty;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const router = useRouter();
  const { toggleStatus, isSubmitting } = useOwnerPropertiesStore();
  const displayAddress = [property.city, property.country].filter(Boolean).join(", ");

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on a toggle switch or other interactive elements
    if ((e.target as HTMLElement).closest('.action-element')) return;

    if (READ_ONLY_STATUSES.includes(property.status)) {
      toast.info(`Editing disabled: Property is ${PROPERTY_STATUS_LABELS[property.status]}`);
      return;
    }
    router.push(`/owner/properties/${property.id}`);
  };

  const handleToggle = async (checked: boolean) => {
    try {
      const success = await toggleStatus(property.id);
      if (success) {
        toast.success(`Property marked as ${checked ? 'Active' : 'Inactive'}`);
      }
    } catch (err) {
      toast.error("Failed to toggle status");
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group bg-white rounded-3xl border border-[#E8DDD8] shadow-sm overflow-hidden transition-all duration-300 ${
        READ_ONLY_STATUSES.includes(property.status) ? "opacity-80 cursor-not-allowed hover:border-[#E8DDD8]" : "hover:shadow-xl hover:-translate-y-1 cursor-pointer"
      }`}
    >
      {/* Image */}
      <div className="relative h-44 bg-[#F3F4F6] overflow-hidden">
        {property.image ? (
          <Image src={property.image} alt={property.name} fill sizes="400px" className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 size={40} className="text-[#D1D5DB]" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <PropertyStatusBadge status={property.status} size="sm" />
        </div>
        {TOGGLEABLE_STATUSES.includes(property.status) && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1.5 rounded-xl action-element flex items-center gap-2 shadow-sm border border-slate-200">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              {property.status === 'ACTIVE' ? 'Listed' : 'Hidden'}
            </span>
            <Switch 
              checked={property.status === 'ACTIVE'}
              onCheckedChange={handleToggle}
              disabled={isSubmitting}
              className="data-[state=checked]:bg-[var(--brand-primary)]"
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="font-bold text-[#1A1A1A] text-[15px] leading-snug line-clamp-1 mb-1">{property.name}</p>
        {displayAddress && (
          <p className="flex items-center gap-1.5 text-[12px] text-[#9E7B6A] mb-3">
            <MapPin size={12} className="flex-shrink-0" />{displayAddress}
          </p>
        )}
        <div className="flex items-center justify-between text-[12px] text-[#6B7280] border-t border-[#F0EBE7] pt-3 mt-3">
          <span className="flex items-center gap-1">
            <BedDouble size={13} />{property.roomCount ?? 0} room{(property.roomCount ?? 0) !== 1 ? "s" : ""}
          </span>
          {typeof property.rating === "number" ? (
            <span className="flex items-center gap-1 font-medium">
              <Star size={12} className="text-[#F59E0B] fill-[#F59E0B]" />{property.rating.toFixed(1)}
              <span className="text-[#9CA3AF]">({property.reviews ?? 0})</span>
            </span>
          ) : (
            <span className="text-[#D1D5DB]">No reviews yet</span>
          )}
        </div>
      </div>
    </div>
  );
}
