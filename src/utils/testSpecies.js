const { createClient } = require('@supabase/supabase-js');

// Configure Supabase client
const supabaseUrl = 'https://naryyzfncswysrbrzizo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcnl5emZuY3N3eXNyYnJ6aXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNzgsImV4cCI6MjA1NjI0MTA3OH0.ZFWy1MGtxvOMmAEytWZQaHYQUwLi_TcqGSVzlNu2LqY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to check species values in animals table
const checkSpeciesValues = async () => {
  console.log('Checking species values in animals table...');
  
  try {
    // Get distinct species values
    const { data, error } = await supabase
      .from('animals')
      .select('species')
      .order('species', { ascending: true });
    
    if (error) {
      console.error('❌ Error querying animals table:', error.message);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No animal records found.');
      return;
    }
    
    // Extract unique species values
    const uniqueSpecies = [...new Set(data.map(animal => animal.species))];
    console.log('✅ Found the following species values:');
    uniqueSpecies.forEach(species => {
      console.log(`- ${species || 'NULL'}`);
    });
    
    // Count animals by species
    console.log('\nCounting animals by species:');
    for (const species of uniqueSpecies) {
      const { count, error: countError } = await supabase
        .from('animals')
        .select('*', { count: 'exact', head: true })
        .eq('species', species);
      
      if (!countError) {
        console.log(`- ${species || 'NULL'}: ${count} animals`);
      }
    }
    
    // Test the actual category filters
    console.log('\nTesting category filters:');
    const categoriesToTest = ['Cat', 'Dog', 'Bird', 'Hamster'];
    
    for (const category of categoriesToTest) {
      const { count, error: testError } = await supabase
        .from('animals')
        .select('*', { count: 'exact', head: true })
        .eq('species', category);
      
      if (testError) {
        console.log(`❌ Error testing category '${category}':`, testError.message);
      } else {
        console.log(`- Category '${category}': ${count || 0} animals found`);
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
};

// Execute the check
checkSpeciesValues()
  .then(() => {
    console.log('\nSpecies check completed.');
  })
  .catch(error => {
    console.error('Check failed with error:', error);
  }); 