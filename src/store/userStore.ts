import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the User interface
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at?: string;
  [key: string]: any; // For any additional properties
}

/**
 * Define the store state interface
 */
interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  resetUser: () => void;
}

/**
 * Create a store for managing user state with persistence
 */
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user: User) => set({ user }),
      resetUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage', // unique name
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name: string, value: unknown) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name: string) => {
          await AsyncStorage.removeItem(name);
        },
      })),
    }
  )
); 