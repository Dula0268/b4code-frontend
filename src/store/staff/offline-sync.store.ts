import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/axios';

/** Give up on an action after this many failed replay attempts. */
export const MAX_SYNC_ATTEMPTS = 5;

export interface SyncAction {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: unknown;
  timestamp: number;
  /** How many replay attempts have already failed for this action. */
  attempts: number;
  /** Last error message, kept so the UI can explain a stuck queue. */
  lastError?: string;
}

interface OfflineSyncState {
  /** Pending writes, oldest first. Replayed strictly in this order. */
  queue: SyncAction[];
  /** Writes that permanently failed (rejected by the server, or out of retries). */
  failed: SyncAction[];
  isSyncing: boolean;
  isBackendOnline: boolean;
  /** Epoch ms of the last moment the backend was confirmed reachable. */
  lastOnlineAt: number | null;
  /** Epoch ms of the last time the queue was fully drained. */
  lastSyncedAt: number | null;
  /** Set when the most recent sync attempt did not fully drain the queue. */
  lastSyncError: string | null;

  setBackendOnline: (status: boolean) => void;
  addAction: (action: Omit<SyncAction, 'id' | 'timestamp' | 'attempts'>) => SyncAction;
  removeAction: (id: string) => void;
  syncAll: () => Promise<void>;
  clearQueue: () => void;
  clearFailed: () => void;
  /** Move permanently-failed actions back into the queue for another try. */
  retryFailed: () => void;
}

const newId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `sync_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

/**
 * A 4xx (other than 408/429) means the server received and rejected the write.
 * Replaying it will never succeed, so it must not block the rest of the queue.
 */
const isPermanentFailure = (error: unknown): boolean => {
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (typeof status !== 'number') return false; // no response => network failure
  if (status === 408 || status === 429) return false;
  return status >= 400 && status < 500;
};

/** No HTTP response at all means we never reached the server. Stop draining. */
const isNetworkFailure = (error: unknown): boolean =>
  (error as { response?: unknown })?.response === undefined;

const errorMessage = (error: unknown): string => {
  const e = error as { response?: { status?: number }; message?: string };
  if (e?.response?.status) return `HTTP ${e.response.status}`;
  return e?.message || 'Unknown error';
};

export const useOfflineSyncStore = create<OfflineSyncState>()(
  persist(
    (set, get) => ({
      queue: [],
      failed: [],
      isSyncing: false,
      isBackendOnline: true,
      lastOnlineAt: null,
      lastSyncedAt: null,
      lastSyncError: null,

      setBackendOnline: (status) =>
        set((state) => ({
          isBackendOnline: status,
          // Freshness anchor for the UI: "showing cached data from <lastOnlineAt>".
          lastOnlineAt: status ? Date.now() : state.lastOnlineAt,
        })),

      addAction: (action) => {
        const newAction: SyncAction = {
          ...action,
          id: newId(),
          timestamp: Date.now(),
          attempts: 0,
        };
        set((state) => ({ queue: [...state.queue, newAction] }));
        return newAction;
      },

      removeAction: (id) => {
        set((state) => ({ queue: state.queue.filter((a) => a.id !== id) }));
      },

      syncAll: async () => {
        if (get().isSyncing) return;
        if (get().queue.length === 0) {
          set({ lastSyncError: null });
          return;
        }

        set({ isSyncing: true, lastSyncError: null });

        let stoppedError: string | null = null;

        try {
          // Drain by always re-reading the head of the LIVE queue. The previous
          // implementation snapshotted the queue, mutated the copy, then wrote it
          // back wholesale at the end -- which silently discarded any write that
          // was enqueued while the sync was in flight.
          // The guard counter prevents an infinite loop if an entry can neither
          // succeed nor be removed.
          let guard = get().queue.length + 1;

          while (guard-- > 0) {
            const action = get().queue[0];
            if (!action) break;

            try {
              // The idempotency key lets the backend collapse a replay of a write
              // whose response was lost mid-flight. If the server ignores the
              // header we are no worse off than before.
              const config = { headers: { 'X-Idempotency-Key': action.id } };

              switch (action.method) {
                case 'POST':
                  await api.post(action.url, action.payload, config);
                  break;
                case 'PUT':
                  await api.put(action.url, action.payload, config);
                  break;
                case 'PATCH':
                  await api.patch(action.url, action.payload, config);
                  break;
                case 'DELETE':
                  await api.delete(action.url, { ...config, data: action.payload });
                  break;
              }

              // Success: drop this exact action by id from the live queue.
              set((state) => ({ queue: state.queue.filter((a) => a.id !== action.id) }));
            } catch (error) {
              const message = errorMessage(error);

              if (isNetworkFailure(error)) {
                // We never reached the server. Stop immediately and keep the
                // action at the head so ordering is preserved for later.
                stoppedError = message;
                set((state) => ({
                  isBackendOnline: false,
                  queue: state.queue.map((a) =>
                    a.id === action.id ? { ...a, lastError: message } : a
                  ),
                }));
                break;
              }

              const attempts = action.attempts + 1;
              const permanent = isPermanentFailure(error) || attempts >= MAX_SYNC_ATTEMPTS;

              if (permanent) {
                // Park it so it can be inspected/retried, but never let it wedge
                // the rest of the queue.
                console.error(`Dropping un-syncable action ${action.id}`, error);
                stoppedError = message;
                set((state) => ({
                  queue: state.queue.filter((a) => a.id !== action.id),
                  failed: [...state.failed, { ...action, attempts, lastError: message }],
                }));
              } else {
                // Transient server-side failure (5xx/408/429). Preserve ordering
                // by stopping here; the next pass retries from the head.
                stoppedError = message;
                set((state) => ({
                  queue: state.queue.map((a) =>
                    a.id === action.id ? { ...a, attempts, lastError: message } : a
                  ),
                }));
                break;
              }
            }
          }
        } finally {
          const drained = get().queue.length === 0;
          set({
            isSyncing: false,
            lastSyncError: stoppedError,
            lastSyncedAt: drained && !stoppedError ? Date.now() : get().lastSyncedAt,
          });
        }
      },

      clearQueue: () => set({ queue: [], lastSyncError: null }),

      clearFailed: () => set({ failed: [] }),

      retryFailed: () =>
        set((state) => ({
          queue: [
            ...state.queue,
            ...state.failed.map((a) => ({ ...a, attempts: 0, lastError: undefined })),
          ],
          failed: [],
        })),
    }),
    {
      name: 'staff-offline-sync-queue',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      // Only durable data is persisted. `isSyncing` in particular must never be
      // written to storage: if the tab was closed mid-sync it would rehydrate as
      // `true` and permanently short-circuit every future syncAll().
      partialize: (state) => ({
        queue: state.queue,
        failed: state.failed,
        lastOnlineAt: state.lastOnlineAt,
        lastSyncedAt: state.lastSyncedAt,
      }),
      migrate: (persisted) => {
        const p = (persisted ?? {}) as Partial<OfflineSyncState>;
        return {
          ...p,
          queue: (p.queue ?? []).map((a) => ({ ...a, attempts: a.attempts ?? 0 })),
          failed: p.failed ?? [],
        } as OfflineSyncState;
      },
      onRehydrateStorage: () => (state) => {
        // Belt and braces in case an older persisted blob carried these.
        if (state) {
          state.isSyncing = false;
          state.lastSyncError = null;
        }
      },
    }
  )
);
