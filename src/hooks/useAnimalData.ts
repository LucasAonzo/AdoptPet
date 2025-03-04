import { supabase } from '../services/supabaseClient';
import { useState, useEffect } from 'react';
import { Animal } from '../types/animal';

interface UseAnimalDataResult {
  animals: Animal[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage animal data
 * @returns Object containing animals, loading state, error, and refetch function
 */
export const useAnimalData = (): UseAnimalDataResult => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setAnimals(data || []);
    } catch (err) {
      console.error('Error fetching animals:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching animals'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  return { animals, loading, error, refetch: fetchAnimals };
};

export default useAnimalData; 