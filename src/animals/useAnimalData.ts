import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { supabase } from '../services/supabaseClient';
import { AnimalData } from './animalService';

/**
 * Fetches all animals from the database
 * @returns {Promise<AnimalData[]>} - Array of animal data
 */
const fetchAnimals = async (): Promise<AnimalData[]> => {
  const { data, error } = await supabase.from('animals').select('*');
  if (error) throw new Error(error.message);
  return data as AnimalData[];
};

/**
 * Custom hook to fetch and manage animal data with React Query
 * @returns {UseQueryResult<AnimalData[], Error>} - Query result with animal data
 */
export const useAnimalData = (): UseQueryResult<AnimalData[], Error> => {
  // @ts-expect-error - API differs between React Query versions
  return useQuery(['animals'], fetchAnimals);
}; 