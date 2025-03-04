/**
 * Type definitions for navigation in the AdoptMe app
 */

import { Animal } from './animal';
import { User } from './user';

/**
 * Root Stack Navigator param list
 */
export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
};

/**
 * Auth Stack Navigator param list
 */
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

/**
 * Main Tab Navigator param list
 */
export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Profile: undefined;
};

/**
 * Home Stack Navigator param list
 */
export type HomeStackParamList = {
  HomeScreen: undefined;
  AnimalDetail: { animalId: string };
};

/**
 * Profile Stack Navigator param list
 */
export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfile: undefined;
  Settings: undefined;
  MyAnimals: undefined;
  Favorites: undefined;
};

/**
 * Search Stack Navigator param list
 */
export type SearchStackParamList = {
  SearchScreen: undefined;
  SearchResults: { 
    query?: string;
    filters?: {
      species?: string;
      size?: string;
      location?: string;
    }
  };
  AnimalDetail: { animalId: string };
};

/**
 * Messages Stack Navigator param list
 */
export type MessagesStackParamList = {
  ConversationList: undefined;
  ConversationDetail: { 
    conversationId: string;
    otherUser: User;
  };
};

/**
 * Add Stack Navigator param list
 */
export type AddStackParamList = {
  AddAnimal: undefined;
  PublicationSuccess: { animal: any };
};

/**
 * Combined Navigator Param List
 */
export type AppNavigatorParamList = 
  RootStackParamList & 
  AuthStackParamList & 
  MainTabParamList & 
  HomeStackParamList & 
  ProfileStackParamList &
  SearchStackParamList &
  MessagesStackParamList &
  AddStackParamList; 