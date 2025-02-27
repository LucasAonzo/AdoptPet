const { createClient } = require('@supabase/supabase-js');

// Configure Supabase client
const supabaseUrl = 'https://naryyzfncswysrbrzizo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcnl5emZuY3N3eXNyYnJ6aXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNzgsImV4cCI6MjA1NjI0MTA3OH0.ZFWy1MGtxvOMmAEytWZQaHYQUwLi_TcqGSVzlNu2LqY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to test category filtering logic
const testCategoryFiltering = async () => {
  // List of categories to test
  const categoriesToTest = ['all', 'cat', 'dog', 'bird', 'other'];
  
  console.log('Testing category filtering logic from the app:');
  
  for (const category of categoriesToTest) {
    console.log(`\nTesting category: ${category}`);
    
    // Build the query using the same logic as in the app
    let query = supabase
      .from('animals')
      .select(`
        id, name, species, breed, age, description, image_url, is_adopted, location, created_at
      `, { count: 'exact' })
      .order('created_at', { ascending: false });
    
    // Apply category filter if not "All" - using the same logic as in useAnimals hook
    if (category !== 'all') {
      // Convert category to appropriate species filter
      const speciesMap = {
        cat: 'Cat',
        dog: 'Dog', 
        bird: 'Bird',
        other: 'Hamster'
      };
      
      const species = speciesMap[category];
      if (species) {
        query = query.eq('species', species);
      } else if (category === 'other') {
        query = query.not('species', 'in', ['Cat', 'Dog', 'Bird']);
      }
    }
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      console.error(`❌ Error with category '${category}':`, error.message);
      continue;
    }
    
    console.log(`✅ Found ${count || 0} animals for category '${category}'`);
    
    // Print the first few animals if any
    if (data && data.length > 0) {
      console.log(`Sample animals (showing up to 3):`);
      data.slice(0, 3).forEach(animal => {
        console.log(`- ${animal.name} (${animal.species}): ${animal.breed}, ${animal.age} years`);
      });
    } else {
      console.log('No animals found for this category');
    }
  }
};

// Execute the test
testCategoryFiltering()
  .then(() => {
    console.log('\nCategory filtering test completed.');
  })
  .catch(error => {
    console.error('Test failed with error:', error);
  }); 