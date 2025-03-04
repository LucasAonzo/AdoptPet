/**
 * Type definitions for animal data in the application
 */

export type AnimalSpecies = 'dog' | 'cat' | 'bird' | 'other';
export type AnimalStatus = 'available' | 'adopted' | 'pending';
export type AnimalSize = 'small' | 'medium' | 'large';
export type AnimalGender = 'male' | 'female';

/**
 * Represents an animal listing in the application
 */
export interface Animal {
  id: string;
  name: string;
  species: AnimalSpecies;
  breed: string;
  age: number;
  gender: AnimalGender;
  size: AnimalSize;
  description: string;
  imageUrls: string[];
  owner_id: string;
  created_at: string;
  status: AnimalStatus;
  location?: string;
  // Add other properties based on your data model
}

/**
 * Represents data needed to create a new animal listing
 */
export type AnimalCreationData = Omit<Animal, 'id' | 'created_at' | 'owner_id'>;

/**
 * Represents data for updating an existing animal
 */
export type AnimalUpdateData = Partial<AnimalCreationData>;

/**
 * Represents filter criteria for animal searches
 */
export interface AnimalFilters {
  species?: AnimalSpecies;
  size?: AnimalSize;
  gender?: AnimalGender;
  status?: AnimalStatus;
  location?: string;
  ownerId?: string;
} 