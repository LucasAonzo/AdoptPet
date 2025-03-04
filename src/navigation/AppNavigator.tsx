import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

// Animal Screens
import AnimalListScreen from '../screens/animals/AnimalListScreen';
import AnimalDetailScreen from '../screens/animals/AnimalDetailScreen';
import AddAnimalScreen from '../screens/animals/AddAnimalScreen';

// Profile Screens
import ProfileScreen from '../screens/profile/ProfileScreen';
import HomeScreen from '../screens/home/HomeScreen';
import { Animal } from '../types/animal';

// Define navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type AnimalStackParamList = {
  AnimalList: undefined;
  AnimalDetail: { animal: Animal };
  AddAnimal: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
};

export type MainTabParamList = {
  Animals: undefined;
  Profile: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const AnimalStack = createStackNavigator<AnimalStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// Auth Navigator
const AuthNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0077B6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <AuthStack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }}
      />
      <AuthStack.Screen 
        name="SignUp" 
        component={SignUpScreen} 
        options={{ title: 'Create Account' }}
      />
    </AuthStack.Navigator>
  );
};

// Animals Navigator
const AnimalsNavigator: React.FC = () => {
  return (
    <AnimalStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0077B6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <AnimalStack.Screen 
        name="AnimalList" 
        component={AnimalListScreen} 
        options={{ title: 'Pets for Adoption' }}
      />
      <AnimalStack.Screen 
        name="AnimalDetail" 
        component={AnimalDetailScreen} 
        options={({ route }) => ({ title: route.params?.animal?.name || 'Pet Details' })}
      />
      <AnimalStack.Screen 
        name="AddAnimal" 
        component={AddAnimalScreen} 
        options={{ title: 'Add a Pet' }}
      />
    </AnimalStack.Navigator>
  );
};

// Profile Navigator
const ProfileNavigator: React.FC = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0077B6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <ProfileStack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'My Profile' }}
      />
    </ProfileStack.Navigator>
  );
};

// Main Tab Navigator
const MainNavigator: React.FC = () => {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Animals') {
            iconName = focused ? 'paw' : 'paw-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          // @ts-ignore: Ionicons has these names but TypeScript doesn't recognize them
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0077B6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <MainTab.Screen name="Animals" component={AnimalsNavigator} />
      <MainTab.Screen name="Profile" component={ProfileNavigator} />
    </MainTab.Navigator>
  );
};

/**
 * Main application navigator
 * Handles navigation between authentication and main app flows
 */
const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#f8f8f8' },
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18
          },
          animationEnabled: false,
        }}
      >
        <RootStack.Screen name="Auth" component={AuthNavigator} />
        <RootStack.Screen name="Main" component={MainNavigator} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 