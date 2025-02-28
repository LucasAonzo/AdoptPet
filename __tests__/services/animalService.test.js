/**
 * @jest-environment node
 */

import { describe, beforeEach, test, expect, jest } from '@jest/globals';
import supabase from '../../src/config/supabase';

// Mock the database API functions
jest.mock('../../src/api/database', () => ({
  createAnimal: jest.fn(),
  getAnimals: jest.fn(),
  getAnimalsByUser: jest.fn(),
}));

// Mock the Supabase client for storage operations
jest.mock('../../src/config/supabase', () => ({
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn(),
      getPublicUrl: jest.fn(),
    }),
  },
  from: jest.fn(),
}));

// Import the database API functions
import { createAnimal, getAnimals, getAnimalsByUser } from '../../src/api/database';

// Import the service
import AnimalService from '../../src/services/animalService';

describe('Animal Service Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('should get all animals successfully', async () => {
    // Mock data
    const mockAnimals = [
      { 
        id: '1', 
        name: 'Buddy', 
        species: 'Dog', 
        breed: 'Golden Retriever', 
        age: 3, 
        gender: 'Male',
        is_adopted: false 
      },
      { 
        id: '2', 
        name: 'Whiskers', 
        species: 'Cat', 
        breed: 'Siamese', 
        age: 2, 
        gender: 'Female',
        is_adopted: false 
      },
    ];

    // Mock the database API response
    getAnimals.mockResolvedValue({ success: true, data: mockAnimals });

    // Execute the service function
    const result = await AnimalService.getAnimals();

    // Assertions
    expect(getAnimals).toHaveBeenCalled();
    expect(result).toEqual({ success: true, data: mockAnimals });
  });

  test('should handle errors when getting animals', async () => {
    // Mock error
    const mockError = new Error('Database error');
    
    // Mock the database API response with error
    getAnimals.mockRejectedValue(mockError);

    // Execute the service function
    const result = await AnimalService.getAnimals();

    // Assertions
    expect(getAnimals).toHaveBeenCalled();
    expect(result).toEqual({ success: false, error: mockError });
  });

  test('should get animals by user ID', async () => {
    // Mock data
    const userId = 'user123';
    const mockUserAnimals = [
      { 
        id: '1', 
        name: 'Buddy', 
        species: 'Dog', 
        user_id: 'user123',
        is_adopted: true 
      }
    ];

    // Mock the database API response
    getAnimalsByUser.mockResolvedValue({ success: true, data: mockUserAnimals });

    // Execute the service function
    const result = await AnimalService.getAnimalsByUser(userId);

    // Assertions
    expect(getAnimalsByUser).toHaveBeenCalledWith(userId);
    expect(result).toEqual({ success: true, data: mockUserAnimals });
  });

  test('should create a new animal', async () => {
    // Mock animal data
    const animalData = {
      name: 'Max',
      species: 'Dog',
      breed: 'Labrador',
      age: 1,
      gender: 'Male',
      image_url: 'https://example.com/image.jpg'
    };

    // Mock the database API response
    createAnimal.mockResolvedValue({ 
      success: true, 
      data: { id: 'new123', ...animalData } 
    });

    // Execute the service function
    const result = await AnimalService.createAnimal(animalData);

    // Assertions
    expect(createAnimal).toHaveBeenCalledWith(animalData);
    expect(result).toEqual({ 
      success: true, 
      data: { id: 'new123', ...animalData } 
    });
  });

  test('should upload an animal image', async () => {
    // Mock file
    const mockFile = new Blob(['test'], { type: 'image/jpeg' });
    
    // Mock responses
    const mockUploadResponse = { data: { path: 'animal-images/test-file' }, error: null };
    const mockUrlResponse = { publicUrl: 'https://example.com/animal-images/test-file' };
    
    // Set up the mock chain for storage
    const mockUpload = jest.fn().mockResolvedValue(mockUploadResponse);
    const mockGetPublicUrl = jest.fn().mockReturnValue({ data: mockUrlResponse });
    
    const mockStorageFrom = jest.fn().mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl
    });
    
    supabase.storage.from.mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl
    });

    // Execute the service function
    const result = await AnimalService.uploadAnimalImage(mockFile);

    // Assertions
    expect(supabase.storage.from).toHaveBeenCalledWith('animals');
    expect(mockUpload).toHaveBeenCalled();
    expect(mockGetPublicUrl).toHaveBeenCalled();
    expect(result).toEqual({ 
      success: true, 
      imageUrl: mockUrlResponse.publicUrl 
    });
  });

  test('should update animal adoption status', async () => {
    // Mock data
    const animalId = 'animal123';
    const isAdopted = true;
    const mockUpdatedAnimal = { 
      id: animalId, 
      name: 'Buddy', 
      is_adopted: isAdopted 
    };
    
    // Mock the Supabase response
    const mockResponse = {
      data: [mockUpdatedAnimal],
      error: null,
    };
    
    // Set up the mock chain for update
    const mockSelect = jest.fn().mockResolvedValue(mockResponse);
    const mockEq = jest.fn().mockReturnValue({ select: mockSelect });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
    
    supabase.from.mockReturnValue({
      update: mockUpdate
    });

    // Execute the service function
    const result = await AnimalService.updateAdoptionStatus(animalId, isAdopted);

    // Assertions
    expect(supabase.from).toHaveBeenCalledWith('animals');
    expect(mockUpdate).toHaveBeenCalledWith({ is_adopted: isAdopted });
    expect(mockEq).toHaveBeenCalledWith('id', animalId);
    expect(result).toEqual({ success: true, data: [mockUpdatedAnimal] });
  });
}); 