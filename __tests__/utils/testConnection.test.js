/**
 * @jest-environment node
 */

import { describe, beforeEach, test, expect, jest } from '@jest/globals';

// Spy on console methods before importing the module
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

// Mock the Supabase client
jest.mock('@supabase/supabase-js', () => {
  // Create a mock Supabase client with the from method
  const mockFrom = jest.fn();
  
  // Create a mock createClient function that returns the mock client
  const mockCreateClient = jest.fn(() => ({
    from: mockFrom,
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    }
  }));
  
  return {
    createClient: mockCreateClient
  };
});

// Import the function to test - must be after the mock setup
const testSupabaseConnection = require('../../src/utils/testConnection');

// Get access to the mocked Supabase client
const { createClient } = require('@supabase/supabase-js');
const mockSupabaseClient = createClient();

describe('Supabase Connection Utility Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });
  
  test('should successfully test connection to users table', async () => {
    // Mock data
    const mockUsers = [
      { id: '1', name: 'Test User 1', email: 'test1@example.com' },
      { id: '2', name: 'Test User 2', email: 'test2@example.com' },
    ];
    
    const mockAnimals = [
      { id: '1', name: 'Buddy', species: 'Dog' }
    ];
    
    const mockAnimalsWithUsers = [
      { id: '1', name: 'Buddy', users: { id: '1', name: 'Owner' } }
    ];
    
    // Set up the mock responses
    mockSupabaseClient.from.mockImplementation((table) => {
      if (table === 'users') {
        return {
          select: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: mockUsers,
              error: null
            })
          })
        };
      } else if (table === 'animals') {
        return {
          select: jest.fn().mockImplementation((query) => {
            // Check if this is the query with users relation
            if (query && query.includes('users')) {
              return {
                limit: jest.fn().mockResolvedValue({
                  data: mockAnimalsWithUsers,
                  error: null
                })
              };
            }
            
            return {
              limit: jest.fn().mockResolvedValue({
                data: mockAnimals,
                error: null
              })
            };
          })
        };
      }
      
      return {
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      };
    });
    
    // Execute the test function
    const result = await testSupabaseConnection();
    
    // Assertions
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('animals');
    expect(consoleLogSpy).toHaveBeenCalledWith('✅ Successfully connected to Supabase users table!');
    expect(consoleLogSpy).toHaveBeenCalledWith('✅ Successfully connected to Supabase animals table!');
    expect(result).toBe(true);
  });
  
  test('should handle connection error to animals table', async () => {
    // Mock error
    const mockError = { message: 'Animals table does not exist' };
    
    // Set up the mock responses
    mockSupabaseClient.from.mockImplementation((table) => {
      if (table === 'users') {
        return {
          select: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: [{ id: '1', name: 'Test User' }],
              error: null
            })
          })
        };
      } else if (table === 'animals') {
        return {
          select: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: null,
              error: mockError
            })
          })
        };
      }
      
      return {
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      };
    });
    
    // Execute the test function
    const result = await testSupabaseConnection();
    
    // Assertions
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('animals');
    expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Error connecting to Supabase animals table:', mockError.message);
    expect(result).toBe(false);
  });
}); 