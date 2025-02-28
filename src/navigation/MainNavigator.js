import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import HomeScreen from '../screens/home/HomeScreen';
import AnimalDetailScreen from '../screens/animals/AnimalDetailScreen';
import AuthNavigator from './AuthNavigator';
import { useAuth } from '../context/AuthContext';
import TabNavigator from './TabNavigator';

const Stack = createStackNavigator();

const MainNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0077B6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#f8f8f8' },
        }}
      >
        {isAuthenticated ? (
          // User is signed in
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen 
              name="AnimalDetail" 
              component={AnimalDetailScreen}
              options={{
                headerShown: true,
                headerTitle: 'Animal Details',
                headerTitleStyle: {
                  fontWeight: 'bold',
                  fontSize: 20,
                  color: '#fff'
                },
                headerStyle: {
                  backgroundColor: '#8e74ae',
                },
                headerTintColor: '#fff',
              }}
            />
          </>
        ) : (
          // User is not signed in
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator; 