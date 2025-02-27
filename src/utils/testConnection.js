// Using CommonJS require for direct execution with Node.js
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://naryyzfncswysrbrzizo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcnl5emZuY3N3eXNyYnJ6aXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNzgsImV4cCI6MjA1NjI0MTA3OH0.ZFWy1MGtxvOMmAEytWZQaHYQUwLi_TcqGSVzlNu2LqY';

// Create a single supabase client for interacting with the database
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Simple test to verify connection to Supabase
 */
const testSupabaseConnection = async () => {
  console.log('Testing connection to Supabase...');
  
  try {
    // A simple query to test the connection
    const { data, error } = await supabase.from('_dummy_query').select('*').limit(1);
    
    // We expect an error since the table doesn't exist, but the error should be about the table,
    // not about connection issues
    if (error && error.code === '42P01') {  // PostgreSQL error code for undefined_table
      console.log('✅ Successfully connected to Supabase!');
      console.log('Error (expected):', error.message);
      return true;
    } else if (error) {
      console.error('❌ Connection test failed with error:', error);
      return false;
    } else {
      console.log('✅ Connection successful!');
      console.log('Data:', data);
      return true;
    }
  } catch (err) {
    console.error('❌ Connection test failed with exception:', err);
    return false;
  }
};

// Run the test if this file is executed directly
if (require.main === module) {
  console.log('\n==================================================');
  console.log('AdoptMe Supabase Connection Test');
  console.log('==================================================\n');
  
  testSupabaseConnection()
    .then(isConnected => {
      if (isConnected) {
        console.log('\n✅ Connection test completed successfully.');
        console.log('\nNext steps:');
        console.log('1. Run the SQL to create tables in Supabase SQL Editor');
        console.log('2. Use the insertSampleData function to populate tables');
      } else {
        console.error('\n❌ Connection test failed. Please check your Supabase URL and API key.');
      }
    })
    .catch(err => {
      console.error('Error during connection test:', err);
    });
}

module.exports = testSupabaseConnection; 