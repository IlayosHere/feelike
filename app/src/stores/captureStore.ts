import { create } from 'zustand';
import type { MoodValue } from '@/types/api';

type CaptureState = {
  content: string;
  mood: MoodValue | null;
  tagInput: string;
  tags: string[];
  setContent: (v: string) => void;
  setMood: (v: MoodValue | null) => void;
  setTagInput: (v: string) => void;
  addTag: (name: string) => void;
  removeTag: (name: string) => void;
  reset: () => void;
};

const initialState = {
  content: '',
  mood: null as MoodValue | null,
  tagInput: '',
  tags: [] as string[],
};

export const useCaptureStore = create<CaptureState>((set) => ({
  ...initialState,

  setContent: (v) => set({ content: v }),

  setMood: (v) => set({ mood: v }),

  setTagInput: (v) => set({ tagInput: v }),

  addTag: (name) =>
    set((state) => {
      const trimmed = name.trim();
      if (!trimmed || state.tags.includes(trimmed)) return state;
      return { tags: [...state.tags, trimmed], tagInput: '' };
    }),

  removeTag: (name) =>
    set((state) => ({ tags: state.tags.filter((t) => t !== name) })),

  reset: () => set({ ...initialState, tags: [] }),
}));
