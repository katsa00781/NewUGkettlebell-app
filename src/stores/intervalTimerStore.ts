import { create } from 'zustand';
import type { TimerConfig } from '@/lib/intervalTimers';

export type Phase = 'intro' | 'work' | 'rest' | 'cooldown' | 'done';

interface IntervalTimerState {
  config: TimerConfig | null;
  phase: Phase;
  currentRound: number;
  secondsLeft: number;
  isPlaying: boolean;
  preloadFactoryId: string | null;

  loadTimer: (config: TimerConfig) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  setPreloadFactoryId: (id: string | null) => void;
}

function firstPhase(config: TimerConfig): { phase: Phase; secondsLeft: number } {
  if (config.intro_sec > 0) return { phase: 'intro', secondsLeft: config.intro_sec };
  return { phase: 'work', secondsLeft: config.work_sec };
}

export const useIntervalTimerStore = create<IntervalTimerState>((set, get) => ({
  config: null,
  phase: 'intro',
  currentRound: 1,
  secondsLeft: 0,
  isPlaying: false,
  preloadFactoryId: null,

  setPreloadFactoryId: (id) => set({ preloadFactoryId: id }),

  loadTimer: (config) => {
    const { phase, secondsLeft } = firstPhase(config);
    set({ config, phase, secondsLeft, currentRound: 1, isPlaying: false });
  },

  start: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),

  reset: () => {
    const config = get().config;
    if (!config) return;
    const { phase, secondsLeft } = firstPhase(config);
    set({ phase, secondsLeft, currentRound: 1, isPlaying: false });
  },

  tick: () => {
    const { config, phase, currentRound, secondsLeft, isPlaying } = get();
    if (!isPlaying || !config || phase === 'done') return;

    if (secondsLeft > 1) {
      set({ secondsLeft: secondsLeft - 1 });
      return;
    }

    // Fázisváltás a 0 elérésekor
    switch (phase) {
      case 'intro':
        set({ phase: 'work', secondsLeft: config.work_sec, currentRound: 1 });
        break;

      case 'work':
        if (config.rest_sec > 0) {
          set({ phase: 'rest', secondsLeft: config.rest_sec });
        } else if (currentRound < config.rounds) {
          set({ phase: 'work', secondsLeft: config.work_sec, currentRound: currentRound + 1 });
        } else if (config.cooldown_sec > 0) {
          set({ phase: 'cooldown', secondsLeft: config.cooldown_sec });
        } else {
          set({ phase: 'done', secondsLeft: 0, isPlaying: false });
        }
        break;

      case 'rest':
        if (currentRound < config.rounds) {
          set({ phase: 'work', secondsLeft: config.work_sec, currentRound: currentRound + 1 });
        } else if (config.cooldown_sec > 0) {
          set({ phase: 'cooldown', secondsLeft: config.cooldown_sec });
        } else {
          set({ phase: 'done', secondsLeft: 0, isPlaying: false });
        }
        break;

      case 'cooldown':
        set({ phase: 'done', secondsLeft: 0, isPlaying: false });
        break;
    }
  },
}));
