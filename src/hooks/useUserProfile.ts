import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { decode } from 'base64-arraybuffer';
import supabase from '../config/supabase';
import { useAuth } from '../context/AuthContext';

/**
 * User profile interface
 */
interface UserProfile {
  id: string;
  email?: string;
  name: string;
  phone?: string;
  address?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

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
  created_at: string;
  updated_at: string;
  age?: number;
  gender?: string;
  size?: string;
  color?: string;
  description?: string;
}

/**
 * Simplified animal data returned in applications
 */
interface ApplicationAnimal {
  id: string;
  name: string;
  species: string;
  breed?: string;
  image_url?: string;
  is_adopted: boolean;
}

/**
 * Application interface
 */
interface Application {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  application_data: Record<string, any>;
  created_at: string;
  animal_id: string;
  user_id?: string; // Make user_id optional since it might not be present in all responses
  animals: ApplicationAnimal[] | null; // The database returns an array
}

/**
 * Profile update form data
 */
interface ProfileFormData {
  name: string;
  phone?: string;
  address?: string;
  bio?: string;
  avatar_url?: string;
}

/**
 * Profile image data
 */
interface ProfileImage {
  base64: string;
}

/**
 * User profile response
 */
interface UserProfileResponse {
  profile: UserProfile | null;
  myAnimals: Animal[];
  adoptedAnimals: Animal[];
  myApplications: Application[];
}

/**
 * Update profile response
 */
interface UpdateProfileResponse {
  success: boolean;
  error?: any;
}

/**
 * Debug user data response
 */
interface DebugUserDataResponse {
  success: boolean;
  userId?: string;
  animalsCount?: number;
  animals?: Animal[];
  message?: string;
  error?: any;
}

/**
 * Auth user interface
 */
interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
  };
}

/**
 * Hook to fetch user profile data
 */
export const useUserProfile = () => {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery<UserProfileResponse, Error>({
    queryKey: ['userProfile', userId],
    queryFn: async (): Promise<UserProfileResponse> => {
      
      
      if (!userId) {
        console.log('No user ID available, skipping profile fetch');
        return {
          profile: null,
          myAnimals: [],
          adoptedAnimals: [],
          myApplications: []
        };
      }
      
      try {
        // Get user profile
        let { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        
        // If user doesn't exist in the users table, create them
        if (profileError && profileError.code === 'PGRST116') {
          console.log('User not found in users table, creating user record...');
          const authUser = user as AuthUser;
          const { data: newProfileData, error: createUserError } = await supabase
            .from('users')
            .insert([{
              id: userId,
              email: authUser.email,
              name: authUser.user_metadata?.name || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
            .select()
            .single();
          
          if (createUserError) {
            console.error('Error creating user record:', createUserError);
            throw new Error('Failed to create user profile');
          }
          
          profileData = newProfileData;
        } else if (profileError) {
          throw profileError;
        }
        
        // Get animals posted by user
        
        const { data: postedAnimals, error: postedError } = await supabase
          .from('animals')
          .select('*')
          .eq('user_id', userId);
        
        if (postedError) {
          console.error('Error fetching posted animals:', postedError);
          throw postedError;
        }
        
        // Get animals adopted by user
        const { data: allAnimals, error: allAnimalsError } = await supabase
          .from('animals')
          .select('*')
          .eq('is_adopted', true);
        
        if (allAnimalsError) throw allAnimalsError;
        
        // For now, we'll just show adopted animals (assuming the current user's animals that are marked as adopted)
        const adoptedByCurrentUser = allAnimals ? allAnimals.filter(animal => 
          animal.user_id === userId && animal.is_adopted
        ) : [];
        
        // Get user's adoption applications with animal details
        const { data: applications, error: applicationsError } = await supabase
          .from('adoption_applications')
          .select(`
            id, 
            status, 
            application_data, 
            created_at,
            animal_id,
            animals (
              id, 
              name, 
              species,
              breed,
              image_url,
              is_adopted
            )
          `)
          .eq('user_id', userId);
        
        if (applicationsError) {
          console.error('Error fetching adoption applications:', applicationsError);
          throw applicationsError;
        }
        
        // Add user_id to applications since it's not returned in the query
        const applicationsWithUserId = applications ? applications.map(app => ({
          ...app,
          user_id: userId
        })) : [];
        
        return {
          profile: profileData,
          myAnimals: postedAnimals || [],
          adoptedAnimals: adoptedByCurrentUser,
          myApplications: applicationsWithUserId
        };
      } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
      }
    },
    enabled: !!userId, // Only run query if userId is available
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation<
    UpdateProfileResponse,
    Error,
    { formData: ProfileFormData; profileImage?: ProfileImage }
  >({
    mutationFn: async ({ formData, profileImage }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      try {
        let profileImageUrl = formData.avatar_url;
        
        // Upload new profile image if selected
        if (profileImage?.base64) {
          const fileName = `profile_${user.id}_${Date.now()}.jpg`;
          const contentType = 'image/jpeg';
          const base64FileData = profileImage.base64;
          
          const { data, error } = await supabase.storage
            .from('profile_images')
            .upload(fileName, decode(base64FileData), {
              contentType,
              upsert: true,
            });
          
          if (error) throw error;
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('profile_images')
            .getPublicUrl(fileName);
          
          profileImageUrl = publicUrl;
        }
        
        // Update profile in database
        const { error } = await supabase
          .from('users')
          .update({
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            bio: formData.bio,
            avatar_url: profileImageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
        
        if (error) throw error;
        
        return { success: true };
      } catch (error) {
        console.error('Error updating profile:', error);
        return { success: false, error };
      }
    },
    onSuccess: () => {
      // Invalidate and refetch the user profile data
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      Alert.alert('Success', 'Profile updated successfully');
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  });
};

/**
 * Hook to debug user data
 */
export const useDebugUserData = () => {
  const { user } = useAuth();
  
  return useQuery<DebugUserDataResponse, Error>({
    queryKey: ['debugUserData', user?.id],
    queryFn: async () => {
      if (!user?.id) return { success: false, message: 'No user ID available' };
      
      try {
        const { data, error } = await supabase
          .from('animals')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        return {
          success: true,
          userId: user.id,
          animalsCount: data ? data.length : 0,
          animals: data
        };
      } catch (error) {
        console.error('Error in debug query:', error);
        return { success: false, error };
      }
    },
    enabled: false, // This query will not run automatically
  });
}; 