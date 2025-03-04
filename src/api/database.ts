import supabase from '../core/config/supabase';

/**
 * Type definitions for database entities
 */
export interface User {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at?: string;
}

export interface Animal {
  id?: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  description?: string;
  image_url?: string;
  user_id: string;
  created_at?: string;
  users?: User;
}

export interface DatabaseResponse<T> {
  success: boolean;
  data?: T;
  error?: any;
}

/**
 * Database Table Creation and Setup Functions
 */

// Create users table
export const createUsersTable = async (): Promise<DatabaseResponse<any>> => {
  const { data, error } = await supabase.rpc('create_users_table', {});

  if (error) {
    console.error('Error creating users table:', error);
    return { success: false, error };
  }

  return { success: true, data };
};

// Create animals table
export const createAnimalsTable = async (): Promise<DatabaseResponse<any>> => {
  const { data, error } = await supabase.rpc('create_animals_table', {});

  if (error) {
    console.error('Error creating animals table:', error);
    return { success: false, error };
  }

  return { success: true, data };
};

/**
 * User Operations
 */

// Create a new user
export const createUser = async (userData: User): Promise<DatabaseResponse<User[]>> => {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select();

  if (error) {
    console.error('Error creating user:', error);
    return { success: false, error };
  }

  return { success: true, data };
};

// Get all users
export const getUsers = async (): Promise<DatabaseResponse<User[]>> => {
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    console.error('Error fetching users:', error);
    return { success: false, error };
  }

  return { success: true, data };
};

/**
 * Animal Operations
 */

// Create a new animal listing
export const createAnimal = async (animalData: Animal): Promise<DatabaseResponse<Animal[]>> => {
  const { data, error } = await supabase
    .from('animals')
    .insert([animalData])
    .select();

  if (error) {
    console.error('Error creating animal listing:', error);
    return { success: false, error };
  }

  return { success: true, data };
};

// Get all animals
export const getAnimals = async (): Promise<DatabaseResponse<Animal[]>> => {
  const { data, error } = await supabase
    .from('animals')
    .select('*, users(name, email)');

  if (error) {
    console.error('Error fetching animals:', error);
    return { success: false, error };
  }

  return { success: true, data };
};

// Get animals by user ID
export const getAnimalsByUser = async (userId: string): Promise<DatabaseResponse<Animal[]>> => {
  const { data, error } = await supabase
    .from('animals')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching animals by user:', error);
    return { success: false, error };
  }

  return { success: true, data };
}; 