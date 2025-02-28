import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AnimalCard from '../../src/components/animals/AnimalCard';

// Mock the Expo vector icons
jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  return {
    Ionicons: ({ name, color, size }) => {
      return <View testID={`icon-${name}`} />;
    },
  };
});

describe('AnimalCard Component', () => {
  const mockAnimal = {
    id: '1',
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    image_url: 'https://example.com/dog.jpg',
    is_adopted: false,
  };

  const mockAdoptedAnimal = {
    ...mockAnimal,
    is_adopted: true,
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with animal data', () => {
    const { getByText, getByTestId } = render(
      <AnimalCard animal={mockAnimal} onPress={mockOnPress} />
    );

    // Check if the animal name is displayed
    expect(getByText('Buddy')).toBeTruthy();
    
    // Check if species, breed and age are displayed
    expect(getByText('Dog • Golden Retriever • 3 years')).toBeTruthy();
    
    // Check if the paw icon is displayed
    expect(getByTestId('icon-paw-outline')).toBeTruthy();
    
    // Check if the location icon is displayed
    expect(getByTestId('icon-location')).toBeTruthy();
  });

  test('displays "year" (singular) when age is 1', () => {
    const youngAnimal = { ...mockAnimal, age: 1 };
    const { getByText } = render(
      <AnimalCard animal={youngAnimal} onPress={mockOnPress} />
    );
    
    expect(getByText('Dog • Golden Retriever • 1 year')).toBeTruthy();
  });

  test('shows adopted badge when animal is adopted', () => {
    const { getByText } = render(
      <AnimalCard animal={mockAdoptedAnimal} onPress={mockOnPress} />
    );
    
    expect(getByText('Adopted')).toBeTruthy();
  });

  test('does not show adopted badge when animal is not adopted', () => {
    const { queryByText } = render(
      <AnimalCard animal={mockAnimal} onPress={mockOnPress} />
    );
    
    expect(queryByText('Adopted')).toBeNull();
  });

  test('calls onPress when card is pressed', () => {
    const { getByText } = render(
      <AnimalCard animal={mockAnimal} onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Buddy'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
}); 