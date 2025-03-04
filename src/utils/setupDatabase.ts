import supabase from '../config/supabase';

/**
 * Interface for User object
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

/**
 * Interface for Animal object
 */
interface Animal {
  id?: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  description?: string;
  image_url?: string;
  user_id: string;
  is_adopted?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * SQL for creating tables in Supabase
 * Note: These functions should be executed in Supabase's SQL Editor
 */

export const CREATE_USERS_TABLE_SQL = `
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

export const CREATE_ANIMALS_TABLE_SQL = `
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

export const sampleUsers: User[] = [
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

export const sampleAnimals = (userIds: string[]): Animal[] => [
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
 * @returns Promise with the result of the operation
 */
export const insertSampleData = async (): Promise<{
  success: boolean;
  data?: { users: User[]; animals: Animal[] };
  error?: any;
}> => {
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
    
    console.log('Sample animals inserted successfully:', animals);
    
    return { success: true, data: { users, animals } };
  } catch (error) {
    console.error('Error in insertSampleData:', error);
    return { success: false, error };
  }
}; 