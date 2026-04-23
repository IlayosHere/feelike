import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@feelike/auth-token';

type AuthState = {
  token: string | null;
  isLoading: boolean;
  setToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
  loadToken: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isLoading: true,
  setToken: async (token) => {
    await AsyncStorage.setItem(STORAGE_KEY, token);
    set({ token });
  },
  clearToken: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ token: null });
  },
  loadToken: async () => {
    const token = await AsyncStorage.getItem(STORAGE_KEY);
    set({ token, isLoading: false });
  },
}));
