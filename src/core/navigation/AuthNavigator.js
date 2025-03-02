import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../../features/auth/screens/LoginScreen';
import SignUpScreen from '../../features/auth/screens/SignUpScreen';
import ForgotPasswordScreen from '../../features/auth/screens/ForgotPasswordScreen';

const Stack = createStackNavigator();

/**
 * Auth Navigation
 * Handles navigation between authentication screens
 */
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator; 