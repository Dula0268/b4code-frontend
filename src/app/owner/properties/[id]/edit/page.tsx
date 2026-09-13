"use client";

import { useOnboardingStore } from "@/store/owner/onboarding.store";
import OnboardingLayout from "@/components/owner/onboarding/onboarding-layout";
import BasicInfoForm from "@/components/owner/onboarding/basic-info-form";
import RoomBuilderForm from "@/components/owner/onboarding/room-builder-form";
import PoliciesForm from "@/components/owner/onboarding/policies-form";
import MediaUploader from "@/components/owner/onboarding/media-uploader";
import { useEffect, useState } from "react";

export default function NewPropertyPage() {
  const { currentStep } = useOnboardingStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevents hydration mismatch since we rely on localStorage persisted state
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
