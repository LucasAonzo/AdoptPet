import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabaseClient';

const fetchAnimals = async () => {
  const { data, error } = await supabase.from('animals').select('*');
  if (error) throw new Error(error.message);
  return data;
};

export const useAnimalData = () => {
  return useQuery(['animals'], fetchAnimals, {
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: true,
    onError: (error) => {
      console.error('Error fetching animals:', error);
    },
  });
}; 