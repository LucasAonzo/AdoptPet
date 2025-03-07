// Using CommonJS require for direct execution with Node.js
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://naryyzfncswysrbrzizo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcnl5emZuY3N3eXNyYnJ6aXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNzgsImV4cCI6MjA1NjI0MTA3OH0.ZFWy1MGtxvOMmAEytWZQaHYQUwLi_TcqGSVzlNu2LqY';

// Create a single supabase client for interacting with the database
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * User Operations
 */

// Create a new user
const createUser = async (userData) => {
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
const getUsers = async () => {
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
const createAnimal = async (animalData) => {
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
const getAnimals = async () => {
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
const getAnimalsByUser = async (userId) => {
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

/**
 * This file contains example queries to demonstrate how to interact with the Supabase database
 * using the API functions defined in the application.
 * 
 * Run these functions to test your database setup.
 */

// Example of creating a new user
const createUserExample = async () => {
  const newUser = {
    name: 'Mike Wilson',
    email: 'mike.wilson@example.com',
    profile_picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    bio: 'Animal enthusiast and rescue coordinator.'
  };
  
  const result = await createUser(newUser);
  console.log('Create user result:', result);
  return result;
};

// Example of creating a new animal listing
const createAnimalExample = async (userId) => {
  const newAnimal = {
    name: 'Charlie',
    species: 'Dog',
    breed: 'Labrador',
    age: 2,
    description: 'Playful Labrador who loves swimming and fetching.',
    image_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1',
    user_id: userId,
    is_adopted: false
  };
  
  const result = await createAnimal(newAnimal);
  console.log('Create animal result:', result);
  return result;
};

// Example of fetching all users
const fetchUsersExample = async () => {
  const result = await getUsers();
  console.log('Fetch users result:', result);
  return result;
};

// Example of fetching all animals with user info
const fetchAnimalsExample = async () => {
  const result = await getAnimals();
  console.log('Fetch animals result:', result);
  return result;
};

// Example of fetching animals by user ID
const fetchAnimalsByUserExample = async (userId) => {
  const result = await getAnimalsByUser(userId);
  console.log('Fetch animals by user result:', result);
  return result;
};

// Example of a raw query using the supabase client directly
const rawQueryExample = async () => {
  const { data, error } = await supabase
    .from('animals')
    .select(`
      id, 
      name,
      species,
      breed,
      age,
      description,
      image_url,
      is_adopted,
      user_id,
      users (
        name,
        email,
        profile_picture
      )
    `)
    .eq('is_adopted', false)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error in raw query:', error);
    return { success: false, error };
  }
  
  console.log('Raw query result:', data);
  return { success: true, data };
};

// Run all examples
const runAllExamples = async () => {
  console.log('Running all database query examples...\n');
  
  // Get all users first to get a user ID
  const usersResult = await fetchUsersExample();
  if (!usersResult.success) {
    console.error('Failed to fetch users. Cannot continue with examples.');
    return;
  }
  
  if (usersResult.data.length === 0) {
    console.error('No users found in database. Please run the setupDatabase function first.');
    return;
  }
  
  // Use the first user's ID for other examples
  const userId = usersResult.data[0].id;
  
  // Run other examples
  await createUserExample();
  await createAnimalExample(userId);
  await fetchAnimalsExample();
  await fetchAnimalsByUserExample(userId);
  await rawQueryExample();
  
  console.log('\nAll examples completed!');
};

// If this file is run directly (not imported)
if (require.main === module) {
  console.log('\n==================================================');
  console.log('AdoptMe Database Query Examples');
  console.log('==================================================\n');
  
  console.log('Note: Make sure your database tables are created and populated');
  console.log('with sample data before running these examples.\n');
  
  runAllExamples().catch(error => {
    console.error('Error running examples:', error);
  });
}

// Exports
module.exports = {
  createUser,
  getUsers,
  createAnimal,
  getAnimals,
  getAnimalsByUser,
  createUserExample,
  createAnimalExample,
  fetchUsersExample,
  fetchAnimalsExample,
  fetchAnimalsByUserExample,
  rawQueryExample,
  runAllExamples
}; 