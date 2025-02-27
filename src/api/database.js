import supabase from '../config/supabase';

/**
 * Database Table Creation and Setup Functions
 */

// Create users table
export const createUsersTable = async () => {
  const { data, error } = await supabase.rpc('create_users_table', {});
  
  if (error) {
    console.error('Error creating users table:', error);
    return { success: false, error };
  }
  
  return { success: true, data };
};

// Create animals table
export const createAnimalsTable = async () => {
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
export const createUser = async (userData) => {
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
export const getUsers = async () => {
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
export const createAnimal = async (animalData) => {
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
export const getAnimals = async () => {
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
export const getAnimalsByUser = async (userId) => {
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