import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEY = '@feelike/auth-token';

// SecureStore is not available on web — fall back to AsyncStorage there.
const storage = {
  async get(): Promise<string | null> {
    if (Platform.OS === 'web') return AsyncStorage.getItem(STORAGE_KEY);
    return SecureStore.getItemAsync(STORAGE_KEY);
  },
  async set(value: string): Promise<void> {
    if (Platform.OS === 'web') { await AsyncStorage.setItem(STORAGE_KEY, value); return; }
    await SecureStore.setItemAsync(STORAGE_KEY, value);
  },
  async remove(): Promise<void> {
    if (Platform.OS === 'web') { await AsyncStorage.removeItem(STORAGE_KEY); return; }
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  },
};

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
    await storage.set(token);
    set({ token });
  },
  clearToken: async () => {
    await storage.remove();
    set({ token: null });
  },
  loadToken: async () => {
    const token = await storage.get();
    set({ token, isLoading: false });
  },
}));
