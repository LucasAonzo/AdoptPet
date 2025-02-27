import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/home/HomeScreen';
import AnimalDetailScreen from '../screens/animals/AnimalDetailScreen';

const Stack = createStackNavigator();

const MainNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#f8f8f8' },
          headerLargeTitle: false,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18
          }
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
        />
        <Stack.Screen 
          name="AnimalDetail" 
          component={AnimalDetailScreen} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator; 