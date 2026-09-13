import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELED' | 'NO_SHOW';

export interface Reservation {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  status: ReservationStatus;
  payout: number;
}

interface OwnerBookingState {
  reservations: Reservation[];
  isLoading: boolean;
  error: string | null;
  stompClient: Client | null;
  connect: () => void;
  disconnect: () => void;
  fetchReservations: () => void;
  updateReservationStatus: (id: string, status: ReservationStatus) => void;
  modifyReservation: (id: string, updates: Partial<Reservation>) => void;
}

const MOCK_RESERVATIONS: Reservation[] = [
  { id: 'R-101', guestName: 'John Doe', checkIn: new Date().toISOString(), checkOut: new Date(Date.now() + 86400000).toISOString(), roomType: 'Deluxe Suite', status: 'CONFIRMED', payout: 250 },
  { id: 'R-102', guestName: 'Jane Smith', checkIn: new Date(Date.now() + 86400000).toISOString(), checkOut: new Date(Date.now() + 86400000 * 3).toISOString(), roomType: 'Standard Room', status: 'PENDING', payout: 120 },
];

export const useOwnerBookingStore = create<OwnerBookingState>((set, get) => ({
  reservations: MOCK_RESERVATIONS,
  isLoading: false,
  error: null,
  stompClient: null,

  connect: () => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        client.subscribe('/topic/owner/reservations', (message) => {
          if (message.body) {
            const newRes = JSON.parse(message.body);
            set((state) => ({
              reservations: state.reservations.map(r => r.id === newRes.id ? newRes : r)
            }));
          }
        });
      },
    });

    client.activate();
    set({ stompClient: client });
  },

  disconnect: () => {
    const { stompClient } = get();
    if (stompClient) {
      stompClient.deactivate();
      set({ stompClient: null });
    }
  },

  fetchReservations: () => {
    set({ isLoading: true });
    setTimeout(() => {
      set({ reservations: MOCK_RESERVATIONS, isLoading: false });
    }, 1000);
  },

  updateReservationStatus: (id, status) => {
    set((state) => ({
      reservations: state.reservations.map(r => r.id === id ? { ...r, status } : r)
    }));
  },

  modifyReservation: (id, updates) => {
    set((state) => ({
      reservations: state.reservations.map(r => r.id === id ? { ...r, ...updates } : r)
    }));
  }
}));
