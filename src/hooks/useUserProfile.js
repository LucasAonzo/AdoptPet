import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { decode } from 'base64-arraybuffer';
import supabase from '../config/supabase';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to fetch user profile data
 */
export const useUserProfile = () => {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      
      
      if (!userId) {
        console.log('No user ID available, skipping profile fetch');
        return {
          profile: null,
          myAnimals: [],
          adoptedAnimals: []
        };
      }
      
      try {
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        
        // If user doesn't exist in the users table, create them
        if (profileError && profileError.code === 'PGRST116') {
          console.log('User not found in users table, creating user record...');
          const { data: newProfileData, error: createUserError } = await supabase
            .from('users')
            .insert([{
              id: userId,
              email: user.email,
              name: user.user_metadata?.name || '',
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
        
        return {
          profile: profileData,
          myAnimals: postedAnimals || [],
          adoptedAnimals: adoptedByCurrentUser
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
  
  return useMutation({
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
  
  return useQuery({
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