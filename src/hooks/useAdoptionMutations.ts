import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import supabase from '../config/supabase';
import { useAuth } from '../context/AuthContext';

/**
 * Animal interface
 */
interface Animal {
  id: string;
  name: string;
  species: string;
  breed?: string;
  image_url?: string;
  is_adopted: boolean;
  user_id: string;
  shelter_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * User interface
 */
interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Application status type
 */
type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'all';

/**
 * Application interface
 */
interface AdoptionApplication {
  id: string;
  user_id: string;
  animal_id: string;
  status: ApplicationStatus;
  application_data: Record<string, any>;
  created_at: string;
  updated_at?: string;
  animals?: Animal;
  users?: User;
}

/**
 * Simplified application for pending check
 */
interface PendingApplication {
  id: string;
  status: ApplicationStatus;
}

/**
 * Application form data
 */
interface ApplicationFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  housingType: string;
  hasChildren: boolean;
  hasOtherPets: boolean;
  petExperience: string;
  reasonForAdopting: string;
  submittedAt?: string;
  [key: string]: any;
}

/**
 * Submit application parameters
 */
interface SubmitApplicationParams {
  animalId: string;
  formData: ApplicationFormData;
}

/**
 * Hook to get a user's adoption applications
 */
export const useUserApplications = (status: ApplicationStatus = 'all') => {
  const { user } = useAuth();
  
  return useQuery<AdoptionApplication[], Error>({
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
export const useCheckPendingApplication = (animalId?: string) => {
  const { user } = useAuth();
  
  return useQuery<PendingApplication | null, Error>({
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
  
  return useMutation<AdoptionApplication, Error, SubmitApplicationParams>({
    mutationFn: async ({ animalId, formData }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const applicationData = {
        user_id: user.id,
        animal_id: animalId,
        status: 'pending' as const,
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
  
  return useMutation<AdoptionApplication, Error, string>({
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
export const useApplicationDetails = (applicationId?: string) => {
  return useQuery<AdoptionApplication | null, Error>({
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
export const useShelterApplications = (status: ApplicationStatus = 'all') => {
  const { user } = useAuth();
  
  return useQuery<AdoptionApplication[], Error>({
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