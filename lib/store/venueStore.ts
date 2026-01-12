// Super Admin用：選択中の式場管理（Zustand）
import { create } from 'zustand';

export interface Venue {
  id: string;
  name: string;
  status: 'active' | 'suspended' | 'inactive';
  email: string;
  phone: string;
  address: string;
  todayWeddings: number;
  monthlyRevenue: number;
  createdAt: string;
  updatedAt: string;
}

interface VenueState {
  selectedVenue: Venue | null;
  setSelectedVenue: (venue: Venue | null) => void;
}

export const useVenueStore = create<VenueState>((set) => ({
  selectedVenue: null,
  setSelectedVenue: (venue) => set({ selectedVenue: venue }),
}));
