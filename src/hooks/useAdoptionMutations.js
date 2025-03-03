import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import supabase from '../config/supabase';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to get a user's adoption applications
 */
export const useUserApplications = (status = 'all') => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['adoptionApplications', 'user', user?.id, status],
    enabled: !!user?.id,
    queryFn: async () => {
      try {
        let query = supabase
          .from('adoption_applications')
          .select(`
            *,
            animals:animal_id(*)
          `)
          .eq('user_id', user.id);
          
        if (status !== 'all') {
          query = query.eq('status', status);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error('Error in useUserApplications:', error);
        return [];
      }
    },
  });
};

/**
 * Hook to check if a user has a pending application for an animal
 */
export const useCheckPendingApplication = (animalId) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['pendingApplication', animalId, user?.id],
    enabled: !!user?.id && !!animalId,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('adoption_applications')
          .select('id, status')
          .eq('animal_id', animalId)
          .eq('user_id', user.id)
          .not('status', 'eq', 'cancelled')
          .single();
          
        if (error && error.code !== 'PGRST116') { // No rows returned is not an error for us
          throw error;
        }
        
        return data || null;
      } catch (error) {
        console.error('Error in useCheckPendingApplication:', error);
        return null;
      }
    },
  });
};

/**
 * Hook to submit an adoption application
 */
export const useSubmitAdoptionApplication = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ animalId, formData }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const applicationData = {
        user_id: user.id,
        animal_id: animalId,
        status: 'pending',
        application_data: {
          ...formData,
          submittedAt: new Date().toISOString()
        }
      };
      
      const { data, error } = await supabase
        .from('adoption_applications')
        .insert(applicationData)
        .select();
        
      if (error) {
        throw error;
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adoptionApplications'] });
      queryClient.invalidateQueries({ queryKey: ['pendingApplication'] });
    },
  });
};

/**
 * Hook to cancel an adoption application
 */
export const useCancelApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (applicationId) => {
      const { data, error } = await supabase
        .from('adoption_applications')
        .update({ status: 'cancelled' })
        .eq('id', applicationId)
        .select();
        
      if (error) {
        throw error;
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adoptionApplications'] });
    },
  });
};

/**
 * Hook to get application details
 */
export const useApplicationDetails = (applicationId) => {
  return useQuery({
    queryKey: ['applicationDetails', applicationId],
    enabled: !!applicationId,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('adoption_applications')
          .select(`
            *,
            animals:animal_id(*),
            users:user_id(*)
          `)
          .eq('id', applicationId)
          .single();
          
        if (error) {
          throw error;
        }
        
        return data;
      } catch (error) {
        console.error('Error in useApplicationDetails:', error);
        return null;
      }
    },
  });
};

/**
 * Hook for shelters to view adoption applications for their animals
 */
export const useShelterApplications = (status = 'all') => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['shelterApplications', user?.id, status],
    enabled: !!user?.id,
    queryFn: async () => {
      try {
        let query = supabase
          .from('adoption_applications')
          .select(`
            *,
            animals:animal_id(*),
            users:user_id(*)
          `)
          .eq('animals.shelter_id', user.id);
          
        if (status !== 'all') {
          query = query.eq('status', status);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error('Error in useShelterApplications:', error);
        return [];
      }
    },
  });
}; 