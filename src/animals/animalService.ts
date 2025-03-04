import supabase from '../config/supabase';
import { createAnimal, getAnimals, getAnimalsByUser } from '../api/database';

/**
 * Interface for animal data structure
 */
export interface AnimalData {
  id?: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  description: string;
  image_url?: string;
  owner_id?: string;
  is_adopted?: boolean;
  created_at?: string;
}

/**
 * Interface for API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: any;
  imageUrl?: string;
}

/**
 * Service for managing animal data in the application
 */
export const AnimalService = {
  /**
   * Create a new animal in the database
   * @param {AnimalData} animalData - The animal data to create
   * @returns {Promise<ApiResponse>} - Result of the create operation
   */
  createAnimal: async (animalData: AnimalData): Promise<ApiResponse> => {
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
   * @returns {Promise<ApiResponse<AnimalData[]>>} - Result containing animal data
   */
  getAnimals: async (): Promise<ApiResponse<AnimalData[]>> => {
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
   * @returns {Promise<ApiResponse<AnimalData[]>>} - Result containing filtered animal data
   */
  getAnimalsByUser: async (userId: string): Promise<ApiResponse<AnimalData[]>> => {
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
   * @returns {Promise<ApiResponse>} - Result with the image URL
   */
  uploadAnimalImage: async (imageFile: File): Promise<ApiResponse> => {
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
   * @returns {Promise<ApiResponse>} - Result of the update operation
   */
  updateAdoptionStatus: async (animalId: string, isAdopted: boolean): Promise<ApiResponse> => {
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