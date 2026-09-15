import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ownerReservationApi, OwnerReservationDto } from '@/api/owner/owner-reservation.api';
import { ownerPricingApi } from '@/api/owner/pricing.api';

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELED' | 'NO_SHOW';

export type FilterType = 'ALL' | 'UPCOMING' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELED';

export interface PropertyOpt {
  id: number;
  name: string;
}

// Convert DTO to internal Reservation type for easier mapping in UI
export interface Reservation {
  id: string; // The DTO uses number, but existing UI might use string ID
  confirmationCode: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  status: ReservationStatus;
  payout: number;
  propertyId: number;
  propertyName: string;
  lateArrivalAllowed: boolean;
}

interface OwnerBookingState {
  reservations: Reservation[];
  properties: PropertyOpt[];
  selectedPropertyId: number | 'ALL';
  activeFilter: FilterType;
  isLoading: boolean;
  error: string | null;
  stompClient: Client | null;
  
  connect: () => void;
  disconnect: () => void;
  fetchReservations: () => Promise<void>;
  setSelectedPropertyId: (id: number | 'ALL') => void;
  setActiveFilter: (filter: FilterType) => void;
  updateReservationStatus: (id: string, status: ReservationStatus) => Promise<void>;
  toggleLateArrival: (id: string, allowed: boolean) => Promise<void>;
  modifyReservation: (id: string, updates: Partial<Reservation>) => void; // Keep as local state for now until modify API is added
}

const mapDtoToReservation = (dto: OwnerReservationDto): Reservation => ({
  id: dto.id.toString(),
  confirmationCode: dto.confirmationCode,
  guestName: dto.guestName || 'Guest',
  checkIn: dto.checkIn,
  checkOut: dto.checkOut,
  roomType: dto.roomName || 'Unknown Room',
  status: dto.status as ReservationStatus,
  payout: parseFloat(dto.totalAmount) || 0,
  propertyId: dto.propertyId,
  propertyName: dto.propertyName,
  lateArrivalAllowed: dto.lateArrivalAllowed || false,
});

export const useOwnerBookingStore = create<OwnerBookingState>((set, get) => ({
  reservations: [],
  properties: [],
  selectedPropertyId: 'ALL',
  activeFilter: 'ALL',
  isLoading: false,
  error: null,
  stompClient: null,

  setSelectedPropertyId: (id) => set({ selectedPropertyId: id }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),

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
            const dto = JSON.parse(message.body);
            const newRes = mapDtoToReservation(dto);
            set((state) => ({
              reservations: state.reservations.find(r => r.id === newRes.id) 
                ? state.reservations.map(r => r.id === newRes.id ? newRes : r)
                : [newRes, ...state.reservations]
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

  fetchReservations: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch properties for the dropdown if not already fetched
      if (get().properties.length === 0) {
        const props = await ownerPricingApi.getOwnerProperties();
        set({ properties: props });
      }

      // Fetch reservations
      const dtos = await ownerReservationApi.getAllReservations();
      set({ reservations: dtos.map(mapDtoToReservation) });
    } catch (err: any) {
      console.error(err);
      set({ error: err.message || 'Failed to fetch reservations' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateReservationStatus: async (id, status) => {
    try {
      const numId = parseInt(id, 10);
      let updatedDto;
      
      if (status === 'CHECKED_IN') {
        updatedDto = await ownerReservationApi.checkIn(numId);
      } else if (status === 'CHECKED_OUT') {
        updatedDto = await ownerReservationApi.checkOut(numId);
      } else if (status === 'CANCELED' || status === 'NO_SHOW') {
        updatedDto = await ownerReservationApi.cancel(numId); // simplified, assuming cancel handles NO_SHOW or just updates status
      } else {
        throw new Error('Unsupported status update via API');
      }

      if (updatedDto) {
        const updatedRes = mapDtoToReservation(updatedDto);
        set((state) => ({
          reservations: state.reservations.map(r => r.id === id ? updatedRes : r)
        }));
      }
    } catch (err: any) {
      console.error('Failed to update status', err);
      // Revert or show error UI if necessary
    }
  },

  toggleLateArrival: async (id, allowed) => {
    try {
      const numId = parseInt(id, 10);
      const updatedDto = await ownerReservationApi.toggleLateArrival(numId, allowed);
      if (updatedDto) {
        const updatedRes = mapDtoToReservation(updatedDto);
        set((state) => ({
          reservations: state.reservations.map(r => r.id === id ? updatedRes : r)
        }));
      }
    } catch (err: any) {
      console.error('Failed to toggle late arrival', err);
    }
  },

  modifyReservation: (id, updates) => {
    set((state) => ({
      reservations: state.reservations.map(r => r.id === id ? { ...r, ...updates } : r)
    }));
  }
}));
