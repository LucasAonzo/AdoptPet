import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../../types/user';

/**
 * Interface for the user store state
 */
interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  resetUser: () => void;
  updateUser: (updates: Partial<User>) => void;
}

/**
 * User store that manages global user state
 * Uses AsyncStorage for persistence to ensure data is stored between sessions
 */
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      
      // Set user data
      setUser: (user: User) => set({ user }),
      
      // Clear user data
      resetUser: () => set({ user: null }),
      
      // Update specific user properties
      updateUser: (updates: Partial<User>) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),
    }),
    {
      name: 'user-storage', // unique name
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 