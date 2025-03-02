import supabase from '../config/supabase';
import { createAnimal, getAnimals, getAnimalsByUser } from '../api/database';

/**
 * Service for managing animal data in the application
 */
export const AnimalService = {
  /**
   * Create a new animal in the database
   * @param {Object} animalData - The animal data to create
   * @returns {Promise<Object>} - Result of the create operation
   */
  createAnimal: async (animalData) => {
    try {
      // Use the database function to create the animal
      const result = await createAnimal(animalData);
      return result;
    } catch (error) {
      console.error('Error in AnimalService.createAnimal:', error);
      return { success: false, error };
    }
  },

  /**
   * Get all animals from the database
   * @returns {Promise<Object>} - Result containing animal data
   */
  getAnimals: async () => {
    try {
      const result = await getAnimals();
      return result;
    } catch (error) {
      console.error('Error in AnimalService.getAnimals:', error);
      return { success: false, error };
    }
  },

  /**
   * Get animals belonging to a specific user
   * @param {string} userId - The user ID to filter by
   * @returns {Promise<Object>} - Result containing filtered animal data
   */
  getAnimalsByUser: async (userId) => {
    try {
      const result = await getAnimalsByUser(userId);
      return result;
    } catch (error) {
      console.error('Error in AnimalService.getAnimalsByUser:', error);
      return { success: false, error };
    }
  },

  /**
   * Upload an image for an animal
   * @param {File} imageFile - The image file to upload
   * @returns {Promise<Object>} - Result with the image URL
   */
  uploadAnimalImage: async (imageFile) => {
    try {
      // Generate a unique file name
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      const filePath = `animal-images/${fileName}`;

      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('animals')
        .upload(filePath, imageFile);

      if (error) {
        throw error;
      }

      // Get the public URL for the image
      const { data: urlData } = supabase.storage
        .from('animals')
        .getPublicUrl(filePath);

      return { 
        success: true, 
        imageUrl: urlData.publicUrl 
      };
    } catch (error) {
      console.error('Error in AnimalService.uploadAnimalImage:', error);
      return { success: false, error };
    }
  },

  /**
   * Update an animal's adoption status
   * @param {string} animalId - The ID of the animal to update
   * @param {boolean} isAdopted - The new adoption status
   * @returns {Promise<Object>} - Result of the update operation
   */
  updateAdoptionStatus: async (animalId, isAdopted) => {
    try {
      const { data, error } = await supabase
        .from('animals')
        .update({ is_adopted: isAdopted })
        .eq('id', animalId)
        .select();

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in AnimalService.updateAdoptionStatus:', error);
      return { success: false, error };
    }
  }
};

export default AnimalService; 