import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import supabase from '../config/supabase';

// Number of items to fetch per page
const PAGE_SIZE = 10;

/**
 * Fetch animals with pagination, filtering, and optimized queries
 */
export const useAnimals = ({ category = 'all', searchText = '' }) => {
  return useInfiniteQuery({
    queryKey: ['animals', category, searchText],
    queryFn: async ({ pageParam = 0 }) => {
      
      
      // Calculate range for pagination
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      // Build the query using the correct schema fields
      let query = supabase
        .from('animals')
        .select(`
          id, name, species, breed, age, description, image_url, is_adopted, location, created_at,
          users:user_id(id, name, email, profile_picture)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
      
      // Apply category filter if not "All"
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
          // For 'other' category, get all species not in the main categories
          query = query.not('species', 'in', ['Cat', 'Dog', 'Bird']);
        }
      }
      
      // Apply search filter if provided
      if (searchText) {
        query = query.or(
          `name.ilike.%${searchText}%,breed.ilike.%${searchText}%,species.ilike.%${searchText}%`
        );
      }
      
      try {
        const { data, error, count } = await query;
        
        if (error) {
          console.error('Error fetching animals:', error.message);
          throw new Error(error.message);
        }
        
        
        if (data && data.length > 0) {
          
        }
        
        return {
          animals: data || [],
          count,
          nextPage: data?.length === PAGE_SIZE ? pageParam + 1 : undefined
        };
      } catch (error) {
        console.error('Unexpected error in useAnimals:', error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    keepPreviousData: true, // Keep the previous data when fetching new data
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });
};

/**
 * Fetch a single animal by ID
 */
export const useAnimal = (animalId) => {
  return useQuery({
    queryKey: ['animal', animalId],
    queryFn: async () => {
      
      
      try {
        const { data, error } = await supabase
          .from('animals')
          .select(`
            *,
            users:user_id(id, name, email, profile_picture)
          `)
          .eq('id', animalId)
          .single();
        
        if (error) {
          console.error(`Error fetching animal ${animalId}:`, error.message);
          throw new Error(error.message);
        }
        
        
        return data;
      } catch (error) {
        console.error(`Unexpected error in useAnimal for ID ${animalId}:`, error);
        throw error;
      }
    },
    enabled: !!animalId, // Only run query if animalId is provided
    retry: 2,
  });
}; 