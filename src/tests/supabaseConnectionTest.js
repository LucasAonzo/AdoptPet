const { createClient } = require('@supabase/supabase-js');

// Configure Supabase client directly in this file to avoid import issues
const supabaseUrl = 'https://naryyzfncswysrbrzizo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcnl5emZuY3N3eXNyYnJ6aXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNzgsImV4cCI6MjA1NjI0MTA3OH0.ZFWy1MGtxvOMmAEytWZQaHYQUwLi_TcqGSVzlNu2LqY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to test connection to Supabase
const testSupabaseConnection = async () => {
  console.log('Testing Supabase connection...');
  
  try {
    // Test fetching data from the users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Error connecting to Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log(`Retrieved ${data.length} users from the database:`);
    console.log(JSON.stringify(data, null, 2));
    return true;
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
      console.log('Connection test failed. Please check your credentials and network connection.');
    }
  })
  .catch(error => {
    console.error('Test execution failed:', error);
  }); 