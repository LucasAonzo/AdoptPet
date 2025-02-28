import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import supabase from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import StorageService from '../services/storageService';
import { generateUniqueFileName } from '../utils/imageUtils';
import { decode } from 'base64-arraybuffer';

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
        // Upload image first if provided
        let imageUrl = null;
        
        if (imageData?.base64) {
          try {
            // Use a simpler, direct upload approach
            const fileName = `animal_${Date.now()}.jpg`;
            
            // Upload using direct Supabase call
            const { data, error } = await supabase.storage
              .from('animals')
              .upload(fileName, decode(imageData.base64), {
                contentType: 'image/jpeg',
                upsert: true
              });
              
            if (error) {
              console.error("Direct upload failed:", error);
            } else {
              // Get public URL
              const { data: urlData } = supabase.storage
                .from('animals')
                .getPublicUrl(fileName);
                
              imageUrl = urlData.publicUrl;
            }
          } catch (imageError) {
            console.error("Image upload failed:", imageError);
            // Proceed without image if upload fails
          }
        }
        
        // Create animal record - with only the fields that exist in the database
        const { data, error } = await supabase
          .from('animals')
          .insert([{
            name: animalData.name,
            species: animalData.species,
            breed: animalData.breed,
            age: animalData.age,
            description: animalData.description, 
            user_id: user.id,
            image_url: imageUrl || animalData.image_url,
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
          try {
            // Use a simpler, direct upload approach
            const fileName = `animal_${animalId}_${Date.now()}.jpg`;
            
            // Upload using direct Supabase call
            const { data, error } = await supabase.storage
              .from('animals')
              .upload(fileName, decode(imageData.base64), {
                contentType: 'image/jpeg',
                upsert: true
              });
              
            if (error) {
              console.error("Direct upload failed:", error);
            } else {
              // Get public URL
              const { data: urlData } = supabase.storage
                .from('animals')
                .getPublicUrl(fileName);
                
              imageUrl = urlData.publicUrl;
            }
          } catch (imageError) {
            console.error("Image upload failed:", imageError);
            // Keep the existing image_url if upload fails
          }
        }
        
        // Update animal record with only fields that exist in the database
        const { data, error } = await supabase
          .from('animals')
          .update({
            name: animalData.name,
            species: animalData.species,
            breed: animalData.breed,
            age: animalData.age,
            description: animalData.description,
            image_url: imageUrl,
            updated_at: new Date().toISOString(),
            is_adopted: animalData.is_adopted
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
        // Delete animal record with user_id check to satisfy RLS policies
        const { error } = await supabase
          .from('animals')
          .delete()
          .eq('id', animalId)
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Supabase delete error:', error);
          throw error;
        }
        
        // Double check if deletion worked by trying to fetch the animal
        const { data: checkData } = await supabase
          .from('animals')
          .select('id')
          .eq('id', animalId)
          .single();
          
        if (checkData) {
          console.warn('Animal still exists after deletion attempt');
          throw new Error('Failed to delete animal - record still exists');
        }
        
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