const { createClient } = require('@supabase/supabase-js');

// Using the same Supabase credentials from the config file
const supabaseUrl = 'https://naryyzfncswysrbrzizo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcnl5emZuY3N3eXNyYnJ6aXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNzgsImV4cCI6MjA1NjI0MTA3OH0.ZFWy1MGtxvOMmAEytWZQaHYQUwLi_TcqGSVzlNu2LqY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkBuckets() {
  try {
    // List all buckets
    console.log('Listing all buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    console.log('Available buckets:', buckets);
    
    // Check if animal_images bucket exists
    const animalBucket = buckets?.find(bucket => bucket.name === 'animal_images');
    if (animalBucket) {
      console.log('✅ animal_images bucket exists!');
    } else {
      console.log('❌ animal_images bucket does NOT exist!');
      
      // Try to create the bucket
      console.log('Attempting to create animal_images bucket...');
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('animal_images', {
        public: true
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
      } else {
        console.log('✅ Successfully created bucket:', newBucket);
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkBuckets(); 