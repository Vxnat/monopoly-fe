import { create } from 'zustand';
import { soundEngine } from '@/utils/audio';

export type CameraViewMode = '3d' | 'topdown';

interface UIState {
  cameraView: CameraViewMode;
  isMuted: boolean;
  isTradeModalOpen: boolean;
  selectedTradePartnerId: string | null;
  isGameLogOpen: boolean;
  
  setCameraView: (mode: CameraViewMode) => void;
  toggleCameraView: () => void;
  toggleMute: () => void;
  openTradeModal: (partnerId?: string) => void;
  closeTradeModal: () => void;
  toggleGameLog: () => void;
  setGameLogOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  cameraView: '3d',
  isMuted: false,
  isTradeModalOpen: false,
  selectedTradePartnerId: null,
  isGameLogOpen: false,

  setCameraView: (mode: CameraViewMode) => set({ cameraView: mode }),
  
  toggleCameraView: () => {
    const current = get().cameraView;
    const next = current === '3d' ? 'topdown' : '3d';
    soundEngine.playButtonClick();
    set({ cameraView: next });
  },

  toggleMute: () => {
    const newMuted = !get().isMuted;
    soundEngine.setMuted(newMuted);
    if (!newMuted) {
      soundEngine.playButtonClick();
    }
    set({ isMuted: newMuted });
  },

  openTradeModal: (partnerId?: string) => {
    soundEngine.playButtonClick();
    set({ isTradeModalOpen: true, selectedTradePartnerId: partnerId || null });
  },

  closeTradeModal: () => set({ isTradeModalOpen: false, selectedTradePartnerId: null }),

  toggleGameLog: () => {
    soundEngine.playButtonClick();
    set({ isGameLogOpen: !get().isGameLogOpen });
  },

  setGameLogOpen: (open: boolean) => set({ isGameLogOpen: open }),
}));
