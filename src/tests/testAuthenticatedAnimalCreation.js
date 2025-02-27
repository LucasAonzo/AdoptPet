// Test script to verify adding a new animal with an authenticated user
const { createClient } = require('@supabase/supabase-js');

// Configure Supabase client
const supabaseUrl = 'https://naryyzfncswysrbrzizo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcnl5emZuY3N3eXNyYnJ6aXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNzgsImV4cCI6MjA1NjI0MTA3OH0.ZFWy1MGtxvOMmAEytWZQaHYQUwLi_TcqGSVzlNu2LqY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test user credentials - these should be valid credentials from your database
// We're using the user created in our previous test
const TEST_USER_EMAIL = 'test+1740690966561@gmail.com'; // A user that exists in the database
const TEST_USER_PASSWORD = 'Password123!';   // The user's password

// Test animal data
const createTestAnimal = (userId) => ({
  name: "Buddy",
  species: "Dog",
  breed: "Golden Retriever",
  age: 2,
  description: "Friendly and playful golden retriever looking for a loving home.",
  image_url: "https://example.com/dog.jpg",
  is_adopted: false,
  user_id: userId
});

// Function to authenticate a user and create an animal
const testAuthenticatedAnimalCreation = async () => {
  console.log('Starting authenticated animal creation test...');
  
  try {
    // Step 1: Authenticate the user
    console.log(`Attempting to sign in as ${TEST_USER_EMAIL}...`);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    });
    
    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      console.log('\nTo fix this issue:');
      console.log('1. Create a valid user in your Supabase database');
      console.log('2. Update the TEST_USER_EMAIL and TEST_USER_PASSWORD constants in this script');
      return { success: false, error: authError };
    }
    
    console.log('✅ Authentication successful!');
    console.log(`Authenticated as: ${authData.user.email} (${authData.user.id})`);
    
    // Step 2: Create an animal with the authenticated user
    const testAnimal = createTestAnimal(authData.user.id);
    
    console.log('\nAttempting to create new animal...');
    const { data: animalData, error: animalError } = await supabase
      .from('animals')
      .insert([testAnimal])
      .select();
    
    if (animalError) {
      console.error('❌ Error creating animal:', animalError.message);
      return { success: false, error: animalError };
    }
    
    console.log('✅ Animal created successfully!');
    console.log('Animal details:');
    console.log(JSON.stringify(animalData[0], null, 2));
    
    // Step 3: Verify the animal was created correctly
    const { data: verifyData, error: verifyError } = await supabase
      .from('animals')
      .select('*')
      .eq('id', animalData[0].id)
      .single();
    
    if (verifyError) {
      console.error('❌ Error verifying animal:', verifyError.message);
      return { success: false, error: verifyError };
    }
    
    console.log('\n✅ Verification successful!');
    console.log('Database record:');
    console.log(JSON.stringify(verifyData, null, 2));
    
    return { success: true, animal: verifyData };
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return { success: false, error };
  } finally {
    // Sign out to clean up the session
    await supabase.auth.signOut();
  }
};

// Execute the test
testAuthenticatedAnimalCreation()
  .then(result => {
    if (result.success) {
      console.log('\n✅ Test completed successfully!');
      console.log('This confirms that an authenticated user can create animals in the database.');
    } else {
      console.log('\n❌ Test failed.');
      console.log('Please review the error messages above and make necessary adjustments.');
    }
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
  }); 