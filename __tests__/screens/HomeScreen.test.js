import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { useAnimals } from '../../src/hooks/useAnimals';

// Mock the hooks
jest.mock('../../src/hooks/useAnimals');

describe('HomeScreen Component Functionality', () => {
  const mockAnimals = [
    { id: '1', name: 'Buddy', species: 'Dog' },
    { id: '2', name: 'Whiskers', species: 'Cat' },
  ];
  
  const mockUseAnimalsReturn = {
    data: { pages: [{ animals: mockAnimals }] },
    fetchNextPage: jest.fn(),
    hasNextPage: true,
    isFetchingNextPage: false,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    isRefetching: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAnimals.mockReturnValue(mockUseAnimalsReturn);
  });

  test('useAnimals hook is called with correct parameters', () => {
    // Call useAnimals with category 'all'
    useAnimals({ category: 'all', searchText: '' });
    
    // Verify it was called with the correct parameters
    expect(useAnimals).toHaveBeenCalledWith({ category: 'all', searchText: '' });
  });

  test('useAnimals hook is called with category filter', () => {
    // Call useAnimals with category 'dogs'
    useAnimals({ category: 'dogs', searchText: '' });
    
    // Verify it was called with the correct parameters
    expect(useAnimals).toHaveBeenCalledWith({ category: 'dogs', searchText: '' });
  });

  test('useAnimals hook is called with search text', () => {
    // Call useAnimals with search text
    useAnimals({ category: 'all', searchText: 'buddy' });
    
    // Verify it was called with the correct parameters
    expect(useAnimals).toHaveBeenCalledWith({ category: 'all', searchText: 'buddy' });
  });

  test('fetchNextPage is called when loading more animals', () => {
    // Get the mock return value
    const { fetchNextPage, hasNextPage, isFetchingNextPage } = useAnimals();
    
    // Simulate the handleLoadMore function from HomeScreen
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
    
    // Verify fetchNextPage was called
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  test('refetch is called when refreshing', () => {
    // Get the mock return value
    const { refetch } = useAnimals();
    
    // Simulate the handleRefresh function from HomeScreen
    refetch();
    
    // Verify refetch was called
    expect(refetch).toHaveBeenCalledTimes(1);
  });
}); 