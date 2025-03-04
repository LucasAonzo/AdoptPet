import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://naryyzfncswysrbrzizo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcnl5emZuY3N3eXNyYnJ6aXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNzgsImV4cCI6MjA1NjI0MTA3OH0.ZFWy1MGtxvOMmAEytWZQaHYQUwLi_TcqGSVzlNu2LqY';

// Create a single supabase client for interacting with the database
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

/**
 * Type definitions
 */
interface User {
  id?: string;
  name: string;
  email: string;
  profile_picture?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

interface Animal {
  id?: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  description?: string;
  image_url?: string;
  user_id: string;
  is_adopted: boolean;
  created_at?: string;
  updated_at?: string;
}

interface QueryResult<T> {
  success: boolean;
  data?: T;
  error?: PostgrestError | Error;
}

/**
 * SQL for creating tables in Supabase
 * Note: These functions should be executed in Supabase's SQL Editor
 */

const CREATE_USERS_TABLE_SQL = `
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  profile_picture TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users
CREATE POLICY "Users are viewable by everyone" 
  ON users FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON users FOR UPDATE USING (auth.uid() = id);
`;

const CREATE_ANIMALS_TABLE_SQL = `
-- Create animals table
CREATE TABLE IF NOT EXISTS animals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  species VARCHAR(100) NOT NULL,
  breed VARCHAR(100),
  age INTEGER,
  description TEXT,
  image_url TEXT,
  user_id UUID REFERENCES users(id) NOT NULL,
  is_adopted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;

-- Create policies for animals
CREATE POLICY "Animals are viewable by everyone" 
  ON animals FOR SELECT USING (true);

CREATE POLICY "Users can insert their own animals" 
  ON animals FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own animals" 
  ON animals FOR UPDATE USING (auth.uid() = user_id);
`;

/**
 * Sample data for testing
 */

const sampleUsers: User[] = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    profile_picture: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
    bio: 'Animal lover and volunteer at local shelters.'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    profile_picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    bio: 'Veterinarian with passion for rescuing animals.'
  },
  {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    bio: 'Pet photographer and adoption advocate.'
  }
];

const sampleAnimals = (userIds: string[]): Animal[] => [
  {
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    description: 'Friendly and energetic golden retriever looking for an active family.',
    image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d',
    user_id: userIds[0],
    is_adopted: false
  },
  {
    name: 'Whiskers',
    species: 'Cat',
    breed: 'Tabby',
    age: 2,
    description: 'Sweet and calm tabby cat that loves to cuddle.',
    image_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba',
    user_id: userIds[0],
    is_adopted: false
  },
  {
    name: 'Max',
    species: 'Dog',
    breed: 'German Shepherd',
    age: 4,
    description: 'Intelligent and loyal German Shepherd good with children.',
    image_url: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95',
    user_id: userIds[1],
    is_adopted: false
  },
  {
    name: 'Luna',
    species: 'Cat',
    breed: 'Siamese',
    age: 1,
    description: 'Playful Siamese kitten with blue eyes and a curious nature.',
    image_url: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6',
    user_id: userIds[2],
    is_adopted: false
  },
  {
    name: 'Rocky',
    species: 'Dog',
    breed: 'Beagle',
    age: 5,
    description: 'Gentle beagle who loves long walks and sniffing adventures.',
    image_url: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2',
    user_id: userIds[1],
    is_adopted: false
  }
];

/**
 * Function to insert sample data
 */
const insertSampleData = async (): Promise<QueryResult<{users: User[], animals: Animal[]}>> => {
  try {
    // Insert sample users
    const { data: users, error: userError } = await supabase
      .from('users')
      .insert(sampleUsers)
      .select();
    
    if (userError) {
      console.error('Error inserting sample users:', userError);
      return { success: false, error: userError };
    }
    
    if (!users || users.length === 0) {
      return { success: false, error: new Error('No users were inserted') };
    }
    
    console.log('Sample users inserted successfully:', users);
    
    // Get user IDs for animal records
    const userIds = users.map(user => user.id as string);
    
    // Insert sample animals
    const { data: animals, error: animalError } = await supabase
      .from('animals')
      .insert(sampleAnimals(userIds))
      .select();
    
    if (animalError) {
      console.error('Error inserting sample animals:', animalError);
      return { success: false, error: animalError };
    }
    
    if (!animals) {
      return { success: false, error: new Error('No animals were inserted') };
    }
    
    console.log('Sample animals inserted successfully:', animals);
    
    return { success: true, data: { users, animals } };
  } catch (error) {
    console.error('Error in insertSampleData:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error in insertSampleData') 
    };
  }
};

/**
 * This file provides methods to initialize the database for the AdoptMe application.
 * It contains SQL statements to create tables and functions to insert sample data.
 * 
 * IMPORTANT: The SQL code needs to be executed directly in the Supabase SQL Editor.
 * The insertSampleData function can be run from the application to populate the tables.
 */

/**
 * Instructions for setting up the AdoptMe database in Supabase:
 * 
 * 1. Log in to your Supabase account and go to your project
 * 2. Navigate to the SQL Editor
 * 3. Create the 'users' table by pasting and executing the CREATE_USERS_TABLE_SQL
 * 4. Create the 'animals' table by pasting and executing the CREATE_ANIMALS_TABLE_SQL
 * 5. After tables are created, you can run the insertSampleData() function from your application
 *    to populate the tables with sample data for testing
 */

// Function to set up the database and insert sample data
const setupDatabase = async (): Promise<QueryResult<{users: User[], animals: Animal[]}>> => {
  console.log('Starting database setup...');
  console.log('Note: Tables should be created manually in Supabase SQL Editor first.');
  
  // Insert sample data
  console.log('Inserting sample data...');
  const result = await insertSampleData();
  
  if (result.success && result.data) {
    console.log('✅ Sample data inserted successfully!');
    console.log(`Added ${result.data.users.length} users and ${result.data.animals.length} animals.`);
    return { success: true, data: result.data };
  } else {
    console.error('❌ Failed to insert sample data:', result.error);
    return { success: false, error: result.error };
  }
};

// Display the SQL for creating tables (for reference)
const displaySQLStatements = (): void => {
  console.log('\n===== SQL for Creating Users Table =====\n');
  console.log(CREATE_USERS_TABLE_SQL);
  
  console.log('\n===== SQL for Creating Animals Table =====\n');
  console.log(CREATE_ANIMALS_TABLE_SQL);
};

// If this file is run directly (not imported)
if (require.main === module) {
  console.log('\n==================================================');
  console.log('AdoptMe Database Setup Instructions');
  console.log('==================================================\n');
  
  console.log('Please follow these steps to set up your database:\n');
  console.log('1. Log in to your Supabase dashboard');
  console.log('2. Go to the SQL Editor');
  console.log('3. Copy and execute the following SQL statements to create the tables:\n');
  
  displaySQLStatements();
  
  console.log('\n4. After creating the tables, run the setupDatabase function from your application to insert sample data');
  console.log('\n==================================================\n');
}

// Exports
export {
  CREATE_USERS_TABLE_SQL,
  CREATE_ANIMALS_TABLE_SQL,
  insertSampleData,
  setupDatabase,
  displaySQLStatements
}; 