import create from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * User store that manages global user state
 * Uses AsyncStorage for persistence to ensure data is stored between sessions
 */
export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      
      // Set user data
      setUser: (user) => set({ user }),
      
      // Clear user data
      resetUser: () => set({ user: null }),
      
      // Update specific user properties
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),
    }),
    {
      name: 'user-storage', // unique name
      getStorage: () => ({
        getItem: async (name) => {
          try {
            const value = await AsyncStorage.getItem(name);
            return value ? JSON.parse(value) : null;
          } catch (error) {
            console.error('Error retrieving data from AsyncStorage:', error);
            return null;
          }
        },
        setItem: async (name, value) => {
          try {
            await AsyncStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            console.error('Error saving data to AsyncStorage:', error);
          }
        },
        removeItem: async (name) => {
          try {
            await AsyncStorage.removeItem(name);
          } catch (error) {
            console.error('Error removing data from AsyncStorage:', error);
          }
        },
      }),
    }
  )
); 