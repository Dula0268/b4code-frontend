"use client";

import { useOnboardingStore } from "@/store/owner/onboarding.store";
import OnboardingLayout from "@/components/owner/onboarding/onboarding-layout";
import BasicInfoForm from "@/components/owner/onboarding/basic-info-form";
import RoomBuilderForm from "@/components/owner/onboarding/room-builder-form";
import PoliciesForm from "@/components/owner/onboarding/policies-form";
import MediaUploader from "@/components/owner/onboarding/media-uploader";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ownerPropertyApi } from "@/api/owner/property.api";
import { Loader2, AlertCircle, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

export default function EditPropertyPage() {
  const { id } = useParams() as { id: string };
  const { currentStep, formData, updateFormData, setStep } = useOnboardingStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (id && id !== "new") {
      setLoading(true);
      ownerPropertyApi.getProperty(Number(id))
        .then((prop) => {
          updateFormData({
            id: prop.id,
            rejectionReason: prop.rejectionReason,
            originalStatus: prop.status,
            propertyName: prop.name || "",
            propertyType: prop.propertyType || "",
            description: prop.description || "",
            address: prop.address || "",
            city: prop.city || "",
            country: prop.country || "Sri Lanka",
            coverPhoto: prop.image || null,
            images: prop.image ? [prop.image] : [], // Usually we'd get all images from backend, fallback to cover
            checkInTime: prop.checkIn || "14:00",
            checkOutTime: prop.checkOut || "11:00",
            customRules: prop.houseRules || "",
            amenities: prop.amenities || [],
            rooms: [], // Room fetching can be complex; skipping for simple edit
          });
          setStep(1);
        })
        .catch(() => toast.error("Failed to load property data"))
        .finally(() => setLoading(false));
    }
      // Disabling eslint rules below to intentionally only fetch on mount/id change
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!mounted || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-[var(--brand-primary)]" size={32} />
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <BasicInfoForm />;
      case 2: return <RoomBuilderForm />;
      case 3: return <PoliciesForm />;
      case 4: return <MediaUploader />;
      default: return <BasicInfoForm />;
    }
  };

  return (
    <OnboardingLayout
      alertBanner={
        <>
          {formData.rejectionReason && (
            <div className="mb-8 border border-red-200 bg-red-50 text-red-900 rounded-xl p-4 flex items-start shadow-sm">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <div className="ml-3">
                <h5 className="text-[15px] font-bold text-red-700 m-0">Action Required: Property Rejected</h5>
                <div className="text-[14px] mt-1.5 leading-relaxed text-red-800">
                  <span className="font-semibold block mb-1">Admin Feedback:</span>
                  {formData.rejectionReason}
                </div>
              </div>
            </div>
          )}

          {/* Critical Change Warning for Active/Approved Properties */}
          {(formData.originalStatus === 'ACTIVE' || formData.originalStatus === 'APPROVED') && (
            <div className="mb-8 border border-amber-200 bg-amber-50 text-amber-900 rounded-xl p-4 flex items-start shadow-sm">
              <TriangleAlert className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="ml-3">
                <h5 className="text-[15px] font-bold text-amber-800 m-0">QA Review Warning</h5>
                <div className="text-[14px] mt-1.5 leading-relaxed text-amber-900">
                  Modifying this property will temporarily unpublish it and revert it to <strong>Pending QA</strong> for admin verification.
                </div>
              </div>
            </div>
          )}
        </>
      }
    >
      {renderStep()}
    </OnboardingLayout>
  );
}
