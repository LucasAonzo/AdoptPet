import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Navbar from './Navbar';
import { Ionicons } from '@expo/vector-icons';

// Define TypeScript interfaces
interface NavTab {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen: string;
  special?: boolean;
}

interface NavbarContainerProps {
  children: ReactNode;
  hideNavbar?: boolean;
  tabs?: NavTab[];
}

interface NavbarContainerStyles {
  container: ViewStyle;
  content: ViewStyle;
  navbarWrapper: ViewStyle;
}

/**
 * NavbarContainer component
 * Wraps the Navbar and children components
 * Handles safe area insets and provides proper spacing for the navbar
 */
const NavbarContainer: React.FC<NavbarContainerProps> = ({ 
  children, 
  hideNavbar = false, 
  tabs = [] 
}) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[
      styles.container,
      { paddingBottom: hideNavbar ? insets.bottom : 0 }
    ]}>
      <View style={[
        styles.content,
        { paddingBottom: hideNavbar ? 0 : 90 + insets.bottom }
      ]}>
        {children}
      </View>
      
      {!hideNavbar && (
        <View style={[
          styles.navbarWrapper,
          { paddingBottom: insets.bottom }
        ]}>
          <Navbar tabs={tabs} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create<NavbarContainerStyles>({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    flex: 1,
  },
  navbarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
});

export default NavbarContainer; 