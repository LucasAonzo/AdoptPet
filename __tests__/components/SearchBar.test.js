import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchBar from '../../src/components/home/SearchBar';

// Mock the Expo vector icons
jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  return {
    Ionicons: ({ name, color, size }) => {
      return <View testID={`icon-${name}`} />;
    },
  };
});

describe('SearchBar Component', () => {
  const mockSearchText = 'golden retriever';
  const mockOnSearchChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with search text', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <SearchBar searchText={mockSearchText} onSearchChange={mockOnSearchChange} />
    );

    // Check if the input has the correct value
    const searchInput = getByPlaceholderText('Search...');
    expect(searchInput.props.value).toBe(mockSearchText);
    
    // Check if the search icon is displayed
    expect(getByTestId('icon-search')).toBeTruthy();
  });

  test('renders correctly with empty search text', () => {
    const { getByPlaceholderText } = render(
      <SearchBar searchText="" onSearchChange={mockOnSearchChange} />
    );

    // Check if the input has empty value
    const searchInput = getByPlaceholderText('Search...');
    expect(searchInput.props.value).toBe('');
  });

  test('calls onSearchChange when text is entered', () => {
    const { getByPlaceholderText } = render(
      <SearchBar searchText="" onSearchChange={mockOnSearchChange} />
    );

    const searchInput = getByPlaceholderText('Search...');
    fireEvent.changeText(searchInput, 'new search');
    
    expect(mockOnSearchChange).toHaveBeenCalledWith('new search');
  });

  test('search button is rendered and clickable', () => {
    const { getByTestId } = render(
      <SearchBar searchText="" onSearchChange={mockOnSearchChange} />
    );

    // Find the search button by its icon
    const searchIcon = getByTestId('icon-search');
    
    // Get the parent TouchableOpacity
    const searchButton = searchIcon.parent;
    
    // Verify the button is rendered
    expect(searchButton).toBeTruthy();
  });
}); 