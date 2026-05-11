import { create } from 'zustand';

interface ToastMessage {
  text: string;
  type: 'success' | 'error' | 'info';
}

interface AppState {
  toast: ToastMessage | null;
  showToast: (toast: ToastMessage) => void;
  clearToast: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  toast: null,
  showToast: (toast) => set({ toast }),
  clearToast: () => set({ toast: null }),
}));
