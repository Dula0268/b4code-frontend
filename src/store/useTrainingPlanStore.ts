import { create } from 'zustand';
import type TrainingPlan  from "../models/training-plan";
import api from '@/lib/axios';

type State = {
  trainingPlanData: TrainingPlan[] | null;
  loading: boolean;
  error: string | null;
  fetchTrainingData: () => Promise<void>;
};

export const useTrainingPlanStore = create<State>((set, get) => ({
  trainingPlanData: null,
  loading: false,
  error: null,

  fetchTrainingData: async () => {
    if (get().trainingPlanData) return;

    set({ loading: true, error: null });

    try {
      const response = await api.get<TrainingPlan[]>(`trainingPlans`);
      console.log("API response data:", response.data);
      set({ trainingPlanData: response.data, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Error fetching users', loading: false });
    }
  },
}));