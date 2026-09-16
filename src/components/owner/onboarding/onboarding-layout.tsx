"use client";

import React from "react";
import { useOnboardingStore } from "@/store/owner/onboarding.store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  alertBanner?: React.ReactNode;
}

const STEP_TITLES = [
  "Basic Information",
  "Rooms & Layout",
  "Amenities & Policies",
  "Media Upload"
];

export default function OnboardingLayout({ children, alertBanner }: OnboardingLayoutProps) {
  const { currentStep, totalSteps, prevStep } = useOnboardingStore();
  const router = useRouter();

  const handleBack = () => {
    if (currentStep > 1) {
      prevStep();
    } else {
      router.push("/owner/properties");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <Button variant="ghost" className="mb-6 -ml-4 text-slate-500 hover:text-slate-900 transition-colors" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Properties
        </Button>

        {alertBanner}

        {/* Stepper */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-slate-200 -z-10 rounded-full" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[var(--brand-primary)] -z-10 transition-all duration-500 ease-in-out rounded-full"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            />
            {STEP_TITLES.map((title, index) => {
              const stepNumber = index + 1;
              const isCompleted = currentStep > stepNumber;
              const isCurrent = currentStep === stepNumber;
              
              return (
                <div key={title} className="flex flex-col items-center group">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm
                      ${isCompleted ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white' : 
                        isCurrent ? 'bg-white border-[var(--brand-primary)] text-[var(--brand-primary)] ring-4 ring-[var(--brand-primary)]/10' : 
                        'bg-white border-slate-200 text-slate-400'}`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <span className="font-semibold text-sm">{stepNumber}</span>}
                  </div>
                  <span className={`mt-3 text-xs font-medium transition-colors duration-300 absolute -bottom-6 w-32 text-center
                    ${isCurrent ? 'text-slate-900' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                    {title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden transition-all duration-300">
          <div className="px-6 py-8 sm:p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                {STEP_TITLES[currentStep - 1]}
              </h2>
              <p className="text-slate-500 mt-2">
                Please fill in the required information to proceed.
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
