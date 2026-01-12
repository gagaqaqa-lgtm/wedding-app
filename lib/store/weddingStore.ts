// Venue Admin用：選択中の挙式管理（Zustand）
import { create } from 'zustand';

export interface Wedding {
  id: string;
  name: string;
  date: string;
  status: 'draft' | 'preparing' | 'invited' | 'confirmed' | 'completed' | 'cancelled';
  venueId: string;
  groomName: string;
  brideName: string;
  guestCount: number;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
}

interface WeddingState {
  selectedWedding: Wedding | null;
  setSelectedWedding: (wedding: Wedding | null) => void;
}

export const useWeddingStore = create<WeddingState>((set) => ({
  selectedWedding: null,
  setSelectedWedding: (wedding) => set({ selectedWedding: wedding }),
}));
