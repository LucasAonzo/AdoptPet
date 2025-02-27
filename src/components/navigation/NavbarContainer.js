import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Navbar from './Navbar';

/**
 * NavbarContainer component
 * Wraps the Navbar and children components
 * Handles safe area insets and provides proper spacing for the navbar
 */
const NavbarContainer = ({ children, hideNavbar = false, tabs = [] }) => {
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

const styles = StyleSheet.create({
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