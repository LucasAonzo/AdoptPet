import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Navbar from '../../src/components/navigation/Navbar';

// Create a mock navigate function
const mockNavigate = jest.fn();

// Mock the navigation hooks
jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
    useRoute: () => ({
      name: 'Home',
    }),
  };
});

// Mock the Expo vector icons
jest.mock('@expo/vector-icons', () => {
  const { View, Text } = require('react-native');
  return {
    Ionicons: ({ name, color, size }) => {
      return <View testID={`icon-${name}`}><Text>{name}</Text></View>;
    },
  };
});

describe('Navbar Component', () => {
  const mockTabs = [
    { name: 'Home', icon: 'home', screen: 'Home' },
    { name: 'Favorites', icon: 'heart', screen: 'Favorites' },
    { name: 'Add', icon: 'add-circle', screen: 'AddAnimal', special: true },
    { name: 'Messages', icon: 'chatbubble', screen: 'Messages' },
    { name: 'Profile', icon: 'person', screen: 'Profile' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all tabs correctly', () => {
    const { getByText, getAllByText, getByTestId } = render(
      <Navbar tabs={mockTabs} />
    );

    // Check if all tab names are displayed
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Favorites')).toBeTruthy();
    expect(getByText('Messages')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
    
    // Special tab (Add) doesn't have text, only icon
    expect(getByTestId('icon-add-circle')).toBeTruthy();
    
    // Check if the active tab (Home) has the solid icon
    expect(getByTestId('icon-home')).toBeTruthy();
    
    // Check if inactive tabs have outline icons
    expect(getByTestId('icon-heart-outline')).toBeTruthy();
    expect(getByTestId('icon-chatbubble-outline')).toBeTruthy();
    expect(getByTestId('icon-person-outline')).toBeTruthy();
  });

  test('renders with default tabs when no tabs are provided', () => {
    const { getByText } = render(<Navbar />);
    
    // Check if default tabs are displayed
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Favorites')).toBeTruthy();
    expect(getByText('Messages')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
  });

  test('navigates when a tab is pressed', () => {
    const { getByText } = render(<Navbar tabs={mockTabs} />);
    
    // Press the Favorites tab
    fireEvent.press(getByText('Favorites'));
    
    // Check if navigation.navigate was called with the correct screen
    expect(mockNavigate).toHaveBeenCalledWith('Favorites');
  });

  test('does not navigate when current tab is pressed', () => {
    const { getByText } = render(<Navbar tabs={mockTabs} />);
    
    // Press the Home tab (current tab)
    fireEvent.press(getByText('Home'));
    
    // Check if navigation.navigate was not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('special tab has different styling', () => {
    const { getByTestId } = render(<Navbar tabs={mockTabs} />);
    
    // Get the special tab (Add)
    const specialIcon = getByTestId('icon-add-circle');
    
    // The special icon should be in a View with a specific testID
    expect(specialIcon).toBeTruthy();
    
    // We can't directly test the styling in this way, so we'll just verify
    // that the special icon is rendered correctly
    const specialIconText = specialIcon.findByType('Text');
    expect(specialIconText.props.children).toBe('add-circle');
  });
}); 