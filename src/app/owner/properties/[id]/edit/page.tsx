"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/owner/onboarding.store";
import OnboardingLayout from "@/components/owner/onboarding/onboarding-layout";
import BasicInfoForm from "@/components/owner/onboarding/basic-info-form";
import RoomBuilderForm from "@/components/owner/onboarding/room-builder-form";
import PoliciesForm from "@/components/owner/onboarding/policies-form";
import MediaUploader from "@/components/owner/onboarding/media-uploader";
import { ownerPropertyApi } from "@/api/owner/property.api";
import { ownerRoomApi } from "@/api/owner/room.api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EditPropertyPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { currentStep, updateFormData, setStep } = useOnboardingStore();
  
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchAndPopulate = async () => {
      try {
        const propertyId = parseInt(id);
        const [property, roomsResponse] = await Promise.all([
          ownerPropertyApi.getProperty(propertyId),
          ownerRoomApi.listRooms(propertyId)
        ]);
        const rooms = roomsResponse.roomTypes;

        updateFormData({
          id: property.id,
          originalStatus: property.status,
          rejectionReason: property.rejectionReason,
          
          propertyName: property.name || "",
          propertyType: "Hotel", // Default or extract if available
          description: property.description || "",
          address: property.addressLine1 || "",
          city: property.city || "",
          country: property.country || "",
          latitude: property.latitude || 6.9271,
          longitude: property.longitude || 79.8612,

          amenities: property.amenities || [],
          checkInTime: "14:00", // Default or extract if available
          checkOutTime: "12:00", // Default or extract if available
          customRules: property.houseRules || "",

          coverPhoto: property.mainImageUrl || null,
          images: property.images || [],

          rooms: rooms.map(room => ({
            id: room.id.toString(),
            roomType: room.name || room.roomCategory || "",
            price: room.basePrice || 0,
            baseCapacity: room.maxAdults || 2,
            maxCapacity: (room.maxAdults || 2) + (room.maxChildren || 0),
            bedConfiguration: room.bedConfigurations?.join(" + ") || ""
          }))
        });
        
        setStep(1); // Ensure they start from step 1
      } catch (error) {
        console.error(error);
        toast.error("Failed to load property details for editing.");
        router.push("/owner/properties");
      } finally {
        setIsFetching(false);
      }
    };

    fetchAndPopulate();
  }, [id, router, updateFormData, setStep]);

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#faf7f5]">
        <Loader2 className="animate-spin text-[#953002] h-8 w-8" />
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoForm />;
      case 2:
        return <RoomBuilderForm />;
      case 3:
        return <PoliciesForm />;
      case 4:
        return <MediaUploader />;
      default:
        return <BasicInfoForm />;
    }
  };

  return (
    <OnboardingLayout>
      {renderStep()}
    </OnboardingLayout>
  );
}
