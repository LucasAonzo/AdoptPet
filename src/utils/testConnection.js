// Using CommonJS require for direct execution with Node.js
const { createClient } = require('@supabase/supabase-js');

// Configure Supabase client directly in this file to avoid import issues
const supabaseUrl = 'https://naryyzfncswysrbrzizo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcnl5emZuY3N3eXNyYnJ6aXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNzgsImV4cCI6MjA1NjI0MTA3OH0.ZFWy1MGtxvOMmAEytWZQaHYQUwLi_TcqGSVzlNu2LqY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to test connection to Supabase and animals table
const testSupabaseConnection = async () => {
  console.log('Testing Supabase connection...');
  
  try {
    // Test general connection
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (userError) {
      console.error('❌ Error connecting to Supabase users table:', userError.message);
    } else {
      console.log('✅ Successfully connected to Supabase users table!');
      console.log(`Retrieved ${userData.length} users from the database.`);
    }
    
    // Test animals table specifically
    const { data: animalData, error: animalError } = await supabase
      .from('animals')
      .select(`
        id, name, species, breed, age, gender, image_url, is_adopted, location, created_at
      `)
      .limit(5);
    
    if (animalError) {
      console.error('❌ Error connecting to Supabase animals table:', animalError.message);
      console.error('This could indicate the animals table does not exist or you don\'t have permission to access it.');
      return false;
    }
    
    console.log('✅ Successfully connected to Supabase animals table!');
    console.log(`Retrieved ${animalData.length} animals from the database.`);
    
    if (animalData.length > 0) {
      console.log('Sample animal record:');
      console.log(JSON.stringify(animalData[0], null, 2));
    } else {
      console.log('⚠️ No animals found in the database. You need to add some animal records!');
    }
    
    // Test the relationship with users
    const { data: animalWithUserData, error: relationError } = await supabase
      .from('animals')
      .select(`
        id, name, 
        users(id, name, profile_picture)
      `)
      .limit(2);
      
    if (relationError) {
      console.error('❌ Error fetching animals with users:', relationError.message);
      console.error('This could indicate a relationship issue between animals and users tables.');
    } else {
      console.log('✅ Successfully fetched animals with user data:');
      console.log(JSON.stringify(animalWithUserData, null, 2));
    }
    
    return !animalError && !relationError;
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
};

// Execute the test
testSupabaseConnection()
  .then(success => {
    if (success) {
      console.log('Connection test completed successfully.');
    } else {
      console.log('Connection test failed. Please check your database schema and network connection.');
    }
  })
  .catch(error => {
    console.error('Test execution failed:', error);
  });

module.exports = testSupabaseConnection; 