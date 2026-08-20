import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/axios';

export interface SyncAction {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: any;
  timestamp: number;
}

interface OfflineSyncState {
  queue: SyncAction[];
  isSyncing: boolean;
  isBackendOnline: boolean;
  setBackendOnline: (status: boolean) => void;
  addAction: (action: Omit<SyncAction, 'id' | 'timestamp'>) => void;
  removeAction: (id: string) => void;
  syncAll: () => Promise<void>;
  clearQueue: () => void;
}

export const useOfflineSyncStore = create<OfflineSyncState>()(
  persist(
    (set, get) => ({
      queue: [],
      isSyncing: false,
      isBackendOnline: true,

      setBackendOnline: (status) => set({ isBackendOnline: status }),

      addAction: (action) => {
        const newAction: SyncAction = {
          ...action,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        };
        set((state) => ({ queue: [...state.queue, newAction] }));
      },

      removeAction: (id) => {
        set((state) => ({ queue: state.queue.filter((a) => a.id !== id) }));
      },

      syncAll: async () => {
        const { queue, isSyncing } = get();
        if (isSyncing || queue.length === 0) return;

        set({ isSyncing: true });

        const newQueue = [...queue];
        
        for (const action of queue) {
          try {
            switch (action.method) {
              case 'POST':
                await api.post(action.url, action.payload);
                break;
              case 'PUT':
                await api.put(action.url, action.payload);
                break;
              case 'PATCH':
                await api.patch(action.url, action.payload);
                break;
              case 'DELETE':
                await api.delete(action.url, { data: action.payload });
                break;
            }
            // Remove from queue on success
            const index = newQueue.findIndex((a) => a.id === action.id);
            if (index > -1) {
              newQueue.splice(index, 1);
            }
          } catch (error) {
            console.error(`Failed to sync action ${action.id}`, error);
            // On failure, keep it in the queue for the next sync attempt
          }
        }

        set({ queue: newQueue, isSyncing: false });
      },

      clearQueue: () => set({ queue: [] }),
    }),
    {
      name: 'staff-offline-sync-queue',
    }
  )
);
