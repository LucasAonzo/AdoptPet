const { createClient } = require('@supabase/supabase-js');

// Configure Supabase client
const supabaseUrl = 'https://naryyzfncswysrbrzizo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcnl5emZuY3N3eXNyYnJ6aXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNzgsImV4cCI6MjA1NjI0MTA3OH0.ZFWy1MGtxvOMmAEytWZQaHYQUwLi_TcqGSVzlNu2LqY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to check the actual schema of the animals table
const checkAnimalSchema = async () => {
  console.log('Checking animals table schema...');
  
  try {
    // Get all animals to examine the structure without specifying fields
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error querying animals table:', error.message);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No animal records found to examine.');
      
      // Try to get the table structure
      console.log('Attempting to retrieve table structure...');
      
      // Alternative approach - try to query specific fields and see which ones work
      const fieldsToTest = [
        'id', 'name', 'type', 'species', 'breed', 'age', 
        'gender', 'sex', 'color', 'size',
        'image_url', 'image', 'photo_url', 'picture',
        'is_adopted', 'adopted', 'status',
        'location', 'description', 'created_at', 'created_by'
      ];
      
      for (const field of fieldsToTest) {
        const { data: testData, error: testError } = await supabase
          .from('animals')
          .select(field)
          .limit(1);
          
        if (testError) {
          console.log(`❌ Field "${field}" does not exist in animals table`);
        } else {
          console.log(`✅ Field "${field}" exists in animals table`);
        }
      }
      
      return;
    }
    
    // If we have data, examine the structure
    const sampleAnimal = data[0];
    console.log('✅ Successfully retrieved animal record.');
    console.log('Animals table has the following fields:');
    
    const fields = Object.keys(sampleAnimal);
    fields.forEach(field => {
      console.log(`- ${field}: ${typeof sampleAnimal[field]} (${sampleAnimal[field] === null ? 'NULL' : 'has value'})`);
    });
    
    // Check for foreign key relationship with users
    console.log('\nChecking relationship with users table...');
    const { data: relationData, error: relationError } = await supabase
      .from('animals')
      .select(`
        id, created_by, 
        user:created_by(id, name)
      `)
      .limit(1);
      
    if (relationError) {
      console.error('❌ Error checking relationship:', relationError.message);
      
      // Try alternative relationship field
      const { data: altData, error: altError } = await supabase
        .from('animals')
        .select(`
          id, user_id, 
          user:user_id(id, name)
        `)
        .limit(1);
        
      if (altError) {
        console.error('❌ Error checking alternative relationship:', altError.message);
      } else {
        console.log('✅ Found alternative relationship through user_id field:', altData);
      }
    } else {
      console.log('✅ Found relationship through created_by field:', relationData);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
};

// Execute the check
checkAnimalSchema()
  .then(() => {
    console.log('\nSchema check completed.');
  })
  .catch(error => {
    console.error('Check failed with error:', error);
  }); 