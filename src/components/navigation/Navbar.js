import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

/**
 * Reusable Navbar component for bottom navigation
 * Uses Ionicons for tab icons and follows the app's color scheme
 */
const Navbar = ({ tabs = [] }) => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Default tabs if none provided
  const defaultTabs = [
    { name: 'Home', icon: 'home', screen: 'Home' },
    { name: 'Favorites', icon: 'heart', screen: 'Favorites' },
    { name: 'Add', icon: 'add-circle', screen: 'AddAnimal', special: true },
    { name: 'Messages', icon: 'chatbubble', screen: 'Messages' },
    { name: 'Profile', icon: 'person', screen: 'Profile' },
  ];
  
  // Use provided tabs or default tabs
  const navTabs = tabs.length > 0 ? tabs : defaultTabs;
  
  // Get the current screen name
  const currentRouteName = route.name;
  
  // Navigate to the selected screen
  const handleNavigation = (screenName) => {
    // Only navigate if we're not already on that screen
    if (currentRouteName !== screenName) {
      navigation.navigate(screenName);
    }
  };
  
  return (
    <View style={styles.container}>
      {navTabs.map((tab, index) => {
        const isActive = currentRouteName === tab.screen;
        
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.tabItem,
              tab.special && styles.specialTabItem
            ]}
            onPress={() => handleNavigation(tab.screen)}
          >
            {tab.special ? (
              <View style={styles.specialIconContainer}>
                <Ionicons
                  name={tab.icon}
                  size={32}
                  color="#fff"
                />
              </View>
            ) : (
              <>
                <Ionicons
                  name={isActive ? tab.icon : `${tab.icon}-outline`}
                  size={28}
                  color={isActive ? '#8e74ae' : '#888'}
                />
                <Text style={[
                  styles.tabText,
                  isActive && styles.activeTabText
                ]}>
                  {tab.name}
                </Text>
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 90,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
    height: '100%',
  },
  specialTabItem: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  specialIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#8e74ae',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 20,
    shadowColor: '#8e74ae',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
  },
  tabText: {
    fontSize: 13,
    marginTop: 8,
    color: '#888',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#8e74ae',
    fontWeight: 'bold',
  },
});

export default Navbar; 