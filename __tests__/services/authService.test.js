/**
 * @jest-environment node
 */

import { describe, beforeEach, test, expect, jest } from '@jest/globals';
import supabase from '../../src/config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock the Supabase client
jest.mock('../../src/config/supabase', () => ({
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
    getUser: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    signInWithOAuth: jest.fn(),
  },
  from: jest.fn().mockImplementation(() => ({
    insert: jest.fn().mockReturnValue({ error: null })
  })),
}));

// Import the service
import AuthService from '../../src/services/authService';

describe('Authentication Service Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('should sign in a user successfully', async () => {
    // Mock data
    const email = 'test@example.com';
    const password = 'password123';
    const mockUser = { id: '123', email };
    const mockSession = { access_token: 'token123' };

    // Mock the Supabase response
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: mockUser,
        session: mockSession,
      },
      error: null,
    });

    // Execute the service function
    const result = await AuthService.signIn(email, password);

    // Assertions
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email,
      password,
    });
    expect(result).toEqual({
      success: true,
      user: mockUser,
      session: mockSession,
    });
  });

  test('should handle sign in errors', async () => {
    // Mock data
    const email = 'test@example.com';
    const password = 'wrong-password';
    const mockError = { message: 'Invalid login credentials' };

    // Mock the Supabase response
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: mockError,
    });

    // Spy on console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Execute the service function
    const result = await AuthService.signIn(email, password);

    // Assertions
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email,
      password,
    });
    expect(result).toEqual({
      success: false,
      error: mockError,
    });
    expect(console.error).toHaveBeenCalledWith('Error in sign in:', mockError.message);
  });

  test('should sign up a new user successfully', async () => {
    // Mock data
    const email = 'newuser@example.com';
    const password = 'password123';
    const userData = {
      name: 'New User',
      phone: '123-456-7890',
    };
    const mockUser = { id: '456', email };

    // Mock the Supabase auth response
    supabase.auth.signUp.mockResolvedValue({
      data: {
        user: mockUser,
      },
      error: null,
    });

    // Mock the Supabase database insert
    supabase.from.mockImplementation(() => ({
      insert: jest.fn().mockResolvedValue({ error: null })
    }));

    // Execute the service function
    const result = await AuthService.signUp(email, password, userData);

    // Assertions
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email,
      password,
    });
    expect(result).toEqual({
      success: true,
      user: mockUser,
    });
  });

  test('should sign out a user successfully', async () => {
    // Mock the Supabase response
    supabase.auth.signOut.mockResolvedValue({
      error: null,
    });

    // Execute the service function
    const result = await AuthService.signOut();

    // Assertions
    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
    });
  });

  test('should get current session', async () => {
    // Mock data
    const mockUser = { id: '123', email: 'test@example.com' };
    const mockSession = { access_token: 'token123', user: mockUser };

    // Mock the Supabase response
    supabase.auth.getSession.mockResolvedValue({
      data: {
        session: mockSession,
      },
      error: null,
    });

    // Execute the service function
    const result = await AuthService.getSession();

    // Assertions
    expect(supabase.auth.getSession).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      session: mockSession,
      user: mockSession.user,
    });
  });

  test('should handle errors when getting session', async () => {
    // Mock error
    const mockError = { message: 'Session error' };

    // Mock the Supabase response
    supabase.auth.getSession.mockResolvedValue({
      data: null,
      error: mockError,
    });

    // Spy on console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Execute the service function
    const result = await AuthService.getSession();

    // Assertions
    expect(supabase.auth.getSession).toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: mockError,
    });
    expect(console.error).toHaveBeenCalledWith('Error getting session:', mockError.message);
  });

  test('should get current user', async () => {
    // Mock data
    const mockUser = { id: '123', email: 'test@example.com' };

    // Mock the Supabase response
    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: mockUser,
      },
      error: null,
    });

    // Execute the service function
    const result = await AuthService.getCurrentUser();

    // Assertions
    expect(supabase.auth.getUser).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      user: mockUser,
    });
  });

  test('should reset password', async () => {
    // Mock data
    const email = 'test@example.com';

    // Mock the Supabase response
    supabase.auth.resetPasswordForEmail.mockResolvedValue({
      error: null,
    });

    // Execute the service function
    const result = await AuthService.resetPassword(email);

    // Assertions
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(email, {
      redirectTo: 'adoptmeapp://reset-password',
    });
    expect(result).toEqual({
      success: true,
    });
  });

  test('should sign in with Google successfully', async () => {
    // Mock data
    const mockAuthData = { url: 'https://google.oauth.redirect.url' };

    // Mock the Supabase response
    supabase.auth.signInWithOAuth.mockResolvedValue({
      data: mockAuthData,
      error: null,
    });

    // Execute the service function
    const result = await AuthService.signInWithGoogle();

    // Assertions
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'https://naryyzfncswysrbrzizo.supabase.co/auth/v1/callback',
      },
    });
    expect(result).toEqual({
      success: true,
      data: mockAuthData,
    });
  });

  test('should handle Google sign in error', async () => {
    // Mock error
    const mockError = new Error('Google sign in failed');

    // Spy on console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock the Supabase response with error
    supabase.auth.signInWithOAuth.mockResolvedValue({
      data: null,
      error: mockError,
    });

    // Execute the service function
    const result = await AuthService.signInWithGoogle();

    // Assertions
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'https://naryyzfncswysrbrzizo.supabase.co/auth/v1/callback',
      },
    });
    expect(result).toEqual({
      success: false,
      error: mockError,
    });
    expect(console.error).toHaveBeenCalledWith('Error in Google sign in:', mockError.message);
  });
}); 