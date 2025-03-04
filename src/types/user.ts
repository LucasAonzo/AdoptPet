/**
 * Type definitions for user data in the application
 */

export type UserRole = 'user' | 'admin';

/**
 * Represents a user in the application
 */
export interface User {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
  role: UserRole;
  bio?: string;
  phone_number?: string;
  location?: string;
  preferences?: UserPreferences;
}

/**
 * Represents user preferences
 */
export interface UserPreferences {
  notifications_enabled?: boolean;
  favorite_species?: string[];
  dark_mode?: boolean;
}

/**
 * Represents data needed to create a new user
 */
export type UserCreationData = Pick<User, 'email' | 'username'> & {
  password: string;
};

/**
 * Represents data for updating an existing user
 */
export type UserUpdateData = Partial<Omit<User, 'id' | 'email' | 'created_at' | 'role'>>;

/**
 * Represents user authentication data
 */
export interface UserAuthData {
  email: string;
  password: string;
}

/**
 * Represents the user's authentication session
 */
export interface UserSession {
  user: User;
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
} 