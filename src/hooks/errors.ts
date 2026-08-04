import { toast } from 'react-toastify';
import { create } from 'zustand';

export interface LayerError {
  layerId: string;
  layerName: string;
  message: string;
  timestamp: number;
}

/** Error input type without timestamp (timestamp is added automatically) */
export type LayerErrorInput = Omit<LayerError, 'timestamp'>;

interface ErrorState {
  errors: LayerError[];
  addError: (error: LayerErrorInput) => void;
  clearErrors: () => void;
  clearError: (layerId: string) => void;
}

export const useErrorStore = create<ErrorState>((set, get) => ({
  errors: [],
  addError: error => {
    const existing = get().errors.find(e => e.layerId === error.layerId && e.message === error.message);
    if (existing) return; // Avoid duplicate errors

    const newError = { ...error, timestamp: Date.now() };
    set(state => ({ errors: [...state.errors, newError] }));

    // Show toast notification
    toast.error(`Layer "${error.layerName}" failed: ${error.message}`);
  },
  clearErrors: () => set({ errors: [] }),
  clearError: layerId => set(state => ({ errors: state.errors.filter(e => e.layerId !== layerId) })),
}));
