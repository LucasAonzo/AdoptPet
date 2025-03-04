import supabase from '../config/supabase';
import { createAnimal, getAnimals, getAnimalsByUser } from '../api/database';
import { Animal } from '../types/animal';

/**
 * Interface for response object from service methods
 */
interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: Error;
  imageUrl?: string;
}

/**
 * Service for managing animal data in the application
 */
export const AnimalService = {
  /**
   * Create a new animal in the database
   * @param animalData - The animal data to create
   * @returns Result of the create operation
   */
  createAnimal: async (animalData: Partial<Animal>): Promise<ServiceResponse<Animal[]>> => {
    try {
      // Use the database function to create the animal
      const result = await createAnimal(animalData);
      return result;
    } catch (error) {
      console.error('Error in AnimalService.createAnimal:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Unknown error in createAnimal')
      };
    }
  },

  /**
   * Get all animals from the database
   * @returns Result containing animal data
   */
  getAnimals: async (): Promise<ServiceResponse<Animal[]>> => {
    try {
      const result = await getAnimals();
      return result;
    } catch (error) {
      console.error('Error in AnimalService.getAnimals:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Unknown error in getAnimals')
      };
    }
  },

  /**
   * Get animals belonging to a specific user
   * @param userId - The user ID to filter by
   * @returns Result containing filtered animal data
   */
  getAnimalsByUser: async (userId: string): Promise<ServiceResponse<Animal[]>> => {
    try {
      const result = await getAnimalsByUser(userId);
      return result;
    } catch (error) {
      console.error('Error in AnimalService.getAnimalsByUser:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Unknown error in getAnimalsByUser')
      };
    }
  },

  /**
   * Upload an image for an animal
   * @param imageFile - The image file to upload
   * @returns Result with the image URL
   */
  uploadAnimalImage: async (imageFile: File): Promise<ServiceResponse<null>> => {
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
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Unknown error in uploadAnimalImage')
      };
    }
  },

  /**
   * Update an animal's adoption status
   * @param animalId - The ID of the animal to update
   * @param isAdopted - The new adoption status
   * @returns Result of the update operation
   */
  updateAdoptionStatus: async (animalId: string, isAdopted: boolean): Promise<ServiceResponse<Animal[]>> => {
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
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Unknown error in updateAdoptionStatus')
      };
    }
  }
};

export default AnimalService; 