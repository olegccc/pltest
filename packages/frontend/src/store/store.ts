import { create } from 'zustand';
import { UserMetricsResponse } from 'shared';

interface StoreState {
  users: string[];
  selectedUser: string | null;
  userMetrics: UserMetricsResponse | null;
  setUsers: (users: string[]) => void;
  setSelectedUser: (userId: string | null) => void;
  setUserMetrics: (metrics: UserMetricsResponse | null) => void;
}

export const useStore = create<StoreState>(set => ({
  users: [],
  selectedUser: null,
  userMetrics: null,
  setUsers: (users: string[]) => set({ users }),
  setSelectedUser: (userId: string | null) => set({ selectedUser: userId }),
  setUserMetrics: (metrics: UserMetricsResponse | null) => set({ userMetrics: metrics }),
}));
