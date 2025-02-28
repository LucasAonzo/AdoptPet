import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import supabase from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import { decode } from 'base64-arraybuffer';
import 'react-native-get-random-values';
import { useModalContext } from '../components/modals';

// Helper function to get authenticated user
const getUser = async () => {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user;
};

/**
 * Hook to create a new animal
 */
export const useCreateAnimal = (navigation) => {
  const queryClient = useQueryClient();
  const { showSuccessModal, showErrorModal } = useModalContext();

  return useMutation({
    mutationFn: async ({ animalData, imageData }) => {
      // Get the current authenticated user
      const user = await getUser();
      if (!user) {
        throw new Error('You must be logged in to create an animal listing');
      }

      // Initialize image URL as null
      let imageUrl = null;

      // Upload image if provided
      if (imageData && imageData.base64) {
        try {
          // Create a unique filename with extension
          const filename = `${uuidv4()}.jpg`;
          const filePath = `${user.id}/${filename}`;

          // Convert base64 to Uint8Array for upload
          const base64Data = imageData.base64;
          const binaryData = decode(base64Data);
          
          // Upload the image to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('animals')
            .upload(filePath, binaryData, {
              contentType: 'image/jpeg',
            });

          if (uploadError) {
            console.error('Image upload failed:', uploadError);
            throw new Error(`Image upload failed: ${uploadError.message}`);
          }

          // Get public URL for the uploaded image
          const { data: publicUrlData } = supabase.storage
            .from('animals')
            .getPublicUrl(filePath);

          imageUrl = publicUrlData.publicUrl;
        } catch (error) {
          console.error('Error in image upload:', error);
          throw new Error(`Image upload error: ${error.message}`);
        }
      }

      // Create the animal record with the image URL if available
      const { data, error } = await supabase
        .from('animals')
        .insert([{
          ...animalData,
          user_id: user.id,
          image_url: imageUrl, // Use the uploaded image URL or null
        }])
        .select();

      if (error) {
        console.error('Error creating animal:', error);
        throw new Error(`Animal creation failed: ${error.message}`);
      }

      return data[0];
    },
    onSuccess: (data) => {
      // Invalidate queries to force refetch
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: ['userAnimals'] });
      
      // Component should handle success notification via modal
      console.log('Animal created successfully:', data);
    },
    onError: (error) => {
      // Component should handle error notification via modal
      console.error('Animal creation error:', error);
    },
  });
};

/**
 * Hook to update an animal
 */
export const useUpdateAnimal = (navigation) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ animalId, animalData, imageData }) => {
      // Verify we have an animal ID
      if (!animalId) {
        throw new Error('Animal ID is required for updates');
      }

      // Get the current authenticated user
      const user = await getUser();
      if (!user) {
        throw new Error('You must be logged in to update an animal listing');
      }

      // Prepare update data with existing fields
      const updateData = { ...animalData };

      // Upload a new image if provided
      if (imageData && imageData.base64) {
        try {
          // Create a unique filename with extension
          const filename = `${uuidv4()}.jpg`;
          const filePath = `${user.id}/${filename}`;
          
          // Convert base64 to Uint8Array for upload
          const base64Data = imageData.base64;
          const binaryData = decode(base64Data);
          
          // Upload the image to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('animals')
            .upload(filePath, binaryData, {
              contentType: 'image/jpeg',
            });

          if (uploadError) {
            console.error('Image upload failed:', uploadError);
            throw new Error(`Image upload failed: ${uploadError.message}`);
          }

          // Get public URL for the uploaded image
          const { data: publicUrlData } = supabase.storage
            .from('animals')
            .getPublicUrl(filePath);
          
          // Update the image URL in our data
          updateData.image_url = publicUrlData.publicUrl;
        } catch (error) {
          console.error('Error in image upload:', error);
          throw new Error(`Image upload error: ${error.message}`);
        }
      }

      // Update the animal record
      const { data, error } = await supabase
        .from('animals')
        .update(updateData)
        .eq('id', animalId)
        .eq('user_id', user.id) // Ensure we only update owned records (RLS should enforce this too)
        .select();

      if (error) {
        console.error('Error updating animal:', error);
        throw new Error(`Animal update failed: ${error.message}`);
      }

      return data[0];
    },
    onSuccess: (data) => {
      // Invalidate queries to force refetch
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: ['animal', data.id] });
      queryClient.invalidateQueries({ queryKey: ['userAnimals'] });
      
      // Component should handle success notification via modal
      console.log('Animal updated successfully:', data);
    },
    onError: (error) => {
      // Component should handle error notification via modal
      console.error('Animal update error:', error);
    },
  });
};

/**
 * Hook to delete an animal
 */
export const useDeleteAnimal = (navigation) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (animalId) => {
      if (!animalId) {
        throw new Error('Animal ID is required for deletion');
      }

      // Get the current authenticated user
      const user = await getUser();
      if (!user) {
        throw new Error('You must be logged in to delete an animal listing');
      }

      // Delete the animal record
      const { data, error } = await supabase
        .from('animals')
        .delete()
        .eq('id', animalId)
        .eq('user_id', user.id) // Ensure we only delete owned records (RLS should enforce this too)
        .select();

      if (error) {
        console.error('Error deleting animal:', error);
        throw new Error(`Animal deletion failed: ${error.message}`);
      }

      return { success: true, animalId };
    },
    onSuccess: (result) => {
      // Invalidate queries to force refetch
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: ['userAnimals'] });
      
      // Component should handle success notification via modal
      console.log('Animal deleted successfully:', result);
    },
    onError: (error) => {
      // Component should handle error notification via modal
      console.error('Animal deletion error:', error);
    },
  });
};

/**
 * Hook for marking an animal as adopted
 */
export const useAdoptAnimal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (animalId) => {
      console.log('Adopting animal with ID:', animalId);
      
      if (!animalId) {
        throw new Error('Animal ID is required');
      }

      // Get the current authenticated user
      const user = await getUser();
      if (!user) {
        throw new Error('You must be logged in to mark an animal as adopted');
      }

      // Update the animal's adoption status
      const { data, error } = await supabase
        .from('animals')
        .update({ is_adopted: true })
        .eq('id', animalId)
        .eq('user_id', user.id) // Ensure we only update owned records (RLS should enforce this too)
        .select();

      if (error) {
        console.error('Error marking animal as adopted:', error);
        throw new Error(`Failed to mark as adopted: ${error.message}`);
      }

      // If no data is returned (which shouldn't happen), create a minimal object with the ID
      return data && data.length > 0 ? data[0] : { id: animalId, is_adopted: true };
    },
    onSuccess: (data) => {
      console.log('Animal adoption succeeded:', data);
      
      // Invalidate queries to force refetch
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      if (data && data.id) {
        queryClient.invalidateQueries({ queryKey: ['animal', data.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['userAnimals'] });
    },
    onError: (error) => {
      console.error('Error marking animal as adopted:', error);
    },
  });
}; 