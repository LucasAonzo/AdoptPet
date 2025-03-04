import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
}

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
 * Function to seed the database with sample data
 */
const seedDatabase = async (): Promise<void> => {
  console.log('\n==================================================');
  console.log('AdoptMe Database Seed Utility');
  console.log('==================================================\n');
  
  console.log('Starting to seed database with sample data...');
  
  try {
    // First check if tables exist
    const { data: tableCheck, error: tableError } = await supabase
      .from('users')
      .select('count(*)', { count: 'exact', head: true });
    
    if (tableError && tableError.code === '42P01') {
      console.error('\n❌ Error: Tables do not exist yet!');
      console.error('Please create the tables first using the SQL provided by the setup-db script.');
      console.error('Run: npm run setup-db');
      return;
    }
    
    // Insert sample users
    console.log('\nInserting sample users...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .insert(sampleUsers)
      .select();
    
    if (userError) {
      console.error('❌ Error inserting sample users:', userError);
      return;
    }
    
    if (!users || users.length === 0) {
      console.error('❌ No users were inserted.');
      return;
    }
    
    console.log('✅ Sample users inserted successfully!');
    console.log(`   Added ${users.length} users.`);
    
    // Get user IDs for animal records
    const userIds = users.map(user => user.id as string);
    
    // Insert sample animals
    console.log('\nInserting sample animals...');
    const { data: animals, error: animalError } = await supabase
      .from('animals')
      .insert(sampleAnimals(userIds))
      .select();
    
    if (animalError) {
      console.error('❌ Error inserting sample animals:', animalError);
      return;
    }
    
    console.log('✅ Sample animals inserted successfully!');
    console.log(`   Added ${animals?.length || 0} animals.`);
    
    console.log('\n✅ Database seeded successfully!');
    console.log('\nNext steps:');
    console.log('1. Run the demo queries to test the database: npm run demo-queries');
    console.log('2. Start building the front-end components for your app');
    
  } catch (error) {
    console.error('❌ An unexpected error occurred:', error instanceof Error ? error.message : String(error));
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedDatabase().catch(error => {
    console.error('Error during database seeding:', error);
  });
}

export { seedDatabase }; 