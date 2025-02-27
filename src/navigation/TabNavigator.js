import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/home/HomeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AddAnimalScreen from '../screens/animals/AddAnimalScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Add') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#8e74ae',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerStyle: {
          backgroundColor: '#8e74ae',
        },
        headerTintColor: '#fff',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'Adopt Me',
          headerTitleStyle: {
            color: '#ffffff',
            fontSize: 20,
            fontWeight: 'bold',
          },
          headerStyle: {
            backgroundColor: '#8e74ae',
          }
        }}
      />
      <Tab.Screen 
        name="Add" 
        component={AddAnimalScreen} 
        options={{ 
          title: 'Add Animal',
          headerStyle: {
            backgroundColor: '#8e74ae',
          }
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: 'My Profile',
          headerStyle: {
            backgroundColor: '#8e74ae',
          }
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator; 