import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { decode } from 'base64-arraybuffer';
import supabase from '../config/supabase';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to create a new animal
 */
export const useCreateAnimal = (navigation) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ animalData, imageData }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      try {
        // Upload image first
        let imageUrl = null;
        
        if (imageData?.base64) {
          const fileName = `animal_${Date.now()}.jpg`;
          const contentType = 'image/jpeg';
          const base64FileData = imageData.base64;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('animal_images')
            .upload(fileName, decode(base64FileData), {
              contentType,
              upsert: true,
            });
          
          if (uploadError) throw uploadError;
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('animal_images')
            .getPublicUrl(fileName);
          
          imageUrl = publicUrl;
        }
        
        // Create animal record
        const { data, error } = await supabase
          .from('animals')
          .insert([{
            ...animalData,
            user_id: user.id,
            image_url: imageUrl,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_adopted: false
          }])
          .select()
          .single();
        
        if (error) throw error;
        
        return data;
      } catch (error) {
        console.error('Error creating animal:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      
      Alert.alert('Success', 'Animal created successfully!');
      
      // Navigate to the animal detail screen
      if (navigation) {
        navigation.navigate('AnimalDetail', { animal: data });
      }
    },
    onError: (error) => {
      Alert.alert('Error', `Failed to create animal: ${error.message}`);
    }
  });
};

/**
 * Hook to update an animal
 */
export const useUpdateAnimal = (navigation) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ animalId, animalData, imageData }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      try {
        // Upload new image if provided
        let imageUrl = animalData.image_url;
        
        if (imageData?.base64) {
          const fileName = `animal_${animalId}_${Date.now()}.jpg`;
          const contentType = 'image/jpeg';
          const base64FileData = imageData.base64;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('animal_images')
            .upload(fileName, decode(base64FileData), {
              contentType,
              upsert: true,
            });
          
          if (uploadError) throw uploadError;
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('animal_images')
            .getPublicUrl(fileName);
          
          imageUrl = publicUrl;
        }
        
        // Update animal record
        const { data, error } = await supabase
          .from('animals')
          .update({
            ...animalData,
            image_url: imageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', animalId)
          .select()
          .single();
        
        if (error) throw error;
        
        return data;
      } catch (error) {
        console.error('Error updating animal:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: ['animal', data.id] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      
      Alert.alert('Success', 'Animal updated successfully!');
      
      // Navigate to the animal detail screen
      if (navigation) {
        navigation.navigate('AnimalDetail', { animal: data });
      }
    },
    onError: (error) => {
      Alert.alert('Error', `Failed to update animal: ${error.message}`);
    }
  });
};

/**
 * Hook to delete an animal
 */
export const useDeleteAnimal = (navigation) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (animalId) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      try {
        // Delete animal record
        const { error } = await supabase
          .from('animals')
          .delete()
          .eq('id', animalId);
        
        if (error) throw error;
        
        return { success: true };
      } catch (error) {
        console.error('Error deleting animal:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      
      Alert.alert('Success', 'Animal deleted successfully!');
      
      // Navigate back to the profile screen
      if (navigation) {
        navigation.navigate('Profile');
      }
    },
    onError: (error) => {
      Alert.alert('Error', `Failed to delete animal: ${error.message}`);
    }
  });
};

/**
 * Hook to mark an animal as adopted
 */
export const useAdoptAnimal = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (animalId) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      try {
        // Update animal record
        const { data, error } = await supabase
          .from('animals')
          .update({
            is_adopted: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', animalId)
          .select()
          .single();
        
        if (error) throw error;
        
        return data;
      } catch (error) {
        console.error('Error adopting animal:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: ['animal', data.id] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      
      Alert.alert('Success', 'Animal marked as adopted!');
    },
    onError: (error) => {
      Alert.alert('Error', `Failed to adopt animal: ${error.message}`);
    }
  });
}; 