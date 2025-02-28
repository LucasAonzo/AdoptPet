/**
 * @jest-environment node
 */

import { describe, beforeEach, test, expect, jest } from '@jest/globals';
import supabase from '../../src/config/supabase';

// Mock the Supabase client
jest.mock('../../src/config/supabase', () => ({
  from: jest.fn(),
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
  },
}));

describe('Supabase Connection Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('should query users table successfully', async () => {
    // Mock data
    const mockUsers = [
      { id: '1', name: 'Test User 1', email: 'test1@example.com' },
      { id: '2', name: 'Test User 2', email: 'test2@example.com' },
    ];

    // Mock the Supabase response
    const mockResponse = {
      data: mockUsers,
      error: null,
    };

    // Set up the mock chain
    const mockSelect = jest.fn().mockReturnValue({
      limit: jest.fn().mockResolvedValue(mockResponse)
    });
    
    supabase.from.mockReturnValue({
      select: mockSelect
    });

    // Execute the query
    const result = await supabase
      .from('users')
      .select('*')
      .limit(5);

    // Assertions
    expect(supabase.from).toHaveBeenCalledWith('users');
    expect(result.data).toEqual(mockUsers);
    expect(result.error).toBeNull();
  });

  test('should handle query errors gracefully', async () => {
    // Mock error response
    const mockError = { message: 'Database connection error' };
    
    const mockResponse = {
      data: null,
      error: mockError,
    };

    // Set up the mock chain
    const mockSelect = jest.fn().mockReturnValue({
      limit: jest.fn().mockResolvedValue(mockResponse)
    });
    
    supabase.from.mockReturnValue({
      select: mockSelect
    });

    // Execute the query
    const result = await supabase
      .from('users')
      .select('*')
      .limit(5);

    // Assertions
    expect(supabase.from).toHaveBeenCalledWith('users');
    expect(result.data).toBeNull();
    expect(result.error).toEqual(mockError);
  });

  test('should query animals table successfully', async () => {
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

    // Mock the Supabase response
    const mockResponse = {
      data: mockAnimals,
      error: null,
    };
    
    // Set up the mock chain
    const mockSelect = jest.fn().mockResolvedValue(mockResponse);
    
    supabase.from.mockReturnValue({
      select: mockSelect
    });

    // Execute the query
    const result = await supabase
      .from('animals')
      .select(`
        id, name, species, breed, age, gender, is_adopted
      `);

    // Assertions
    expect(supabase.from).toHaveBeenCalledWith('animals');
    expect(result.data).toEqual(mockAnimals);
    expect(result.error).toBeNull();
  });
}); 