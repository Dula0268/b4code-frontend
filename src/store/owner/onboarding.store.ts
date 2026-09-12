import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OnboardingData {
  // Step 1: Basic Information
  propertyName: string;
  propertyType: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;

  // Step 2: Rooms & Layout
  rooms: {
    id: string;
    name: string;
    baseCapacity: number;
    maxCapacity: number;
    bedConfiguration: string;
  }[];

  // Step 3: Amenities & Policies
  amenities: string[];
  checkInTime: string;
  checkOutTime: string;
  customRules: string;

  // Step 4: Media Upload
  coverPhoto: string | null;
  images: string[];
}

interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  formData: OnboardingData;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  updateFormData: (data: Partial<OnboardingData>) => void;
  resetOnboarding: () => void;
}

const initialFormData: OnboardingData = {
  propertyName: '',
  propertyType: '',
  description: '',
  address: '',
  latitude: 0,
  longitude: 0,
  rooms: [],
  amenities: [],
  checkInTime: '14:00',
  checkOutTime: '11:00',
  customRules: '',
  coverPhoto: null,
  images: [],
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 1,
      totalSteps: 4,
      formData: initialFormData,
      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, state.totalSteps),
        })),
      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        })),
      setStep: (step) =>
        set((state) => ({
          currentStep: Math.max(1, Math.min(step, state.totalSteps)),
        })),
      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),
      resetOnboarding: () =>
        set(() => ({
          currentStep: 1,
          formData: initialFormData,
        })),
    }),
    {
      name: 'property-onboarding-storage',
    }
  )
);
