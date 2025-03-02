import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import HomeScreen from '../../features/animals/screens/HomeScreen';
import ProfileScreen from '../../features/profile/screens/ProfileScreen';
import AddAnimalScreen from '../../features/animals/screens/AddAnimalScreen';
import AnimalDetailScreen from '../../features/animals/screens/AnimalDetailScreen';
import PublicationSuccessScreen from '../../features/animals/screens/PublicationSuccessScreen';
import theme from '../../shared/styles/theme';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const AddStack = createStackNavigator();
const ProfileStack = createStackNavigator();

/**
 * Home Stack Navigator
 * Handles navigation for the home tab including animal listings and details
 */
const HomeStackScreen = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.white,
        headerTitleStyle: {
          fontWeight: theme.fontWeights.bold,
        },
      }}
    >
      <HomeStack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ 
          title: 'Adopt Me',
          headerTitleStyle: {
            color: theme.colors.white,
            fontSize: theme.fontSizes.lg,
            fontWeight: theme.fontWeights.bold,
          }
        }} 
      />
      <HomeStack.Screen 
        name="AnimalDetail" 
        component={AnimalDetailScreen}
        options={({ route }) => ({ 
          title: route.params?.name || 'Animal Details',
          headerTitleStyle: {
            color: theme.colors.white,
            fontSize: theme.fontSizes.lg,
          }
        })}
      />
    </HomeStack.Navigator>
  );
};

/**
 * Add Animal Stack Navigator
 * Handles navigation for adding new animals
 */
const AddStackScreen = ({ navigation }) => {
  // Handle hardware back button in Add stack
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Home');
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

  return (
    <AddStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.white,
        headerTitleStyle: {
          fontWeight: theme.fontWeights.bold,
        },
        headerLeft: () => (
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.white}
            style={{ marginLeft: theme.spacing.md }}
            onPress={() => navigation.navigate('Home')}
          />
        ),
      }}
    >
      <AddStack.Screen
        name="AddAnimal"
        component={AddAnimalScreen}
        options={{
          title: 'Add Animal',
          headerTitleStyle: {
            color: theme.colors.white,
            fontSize: theme.fontSizes.lg,
          },
        }}
      />
      <AddStack.Screen
        name="PublicationSuccess"
        component={PublicationSuccessScreen}
        options={{
          title: 'Publication Success',
          headerTitleStyle: {
            color: theme.colors.white,
            fontSize: theme.fontSizes.lg,
          },
          headerLeft: null, // Remove back button
        }}
      />
    </AddStack.Navigator>
  );
};

/**
 * Profile Stack Navigator
 * Handles navigation for the user profile section
 */
const ProfileStackScreen = ({ navigation }) => {
  // Handle hardware back button in Profile stack
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Home');
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.white,
        headerTitleStyle: {
          fontWeight: theme.fontWeights.bold,
        },
        headerLeft: () => (
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.white}
            style={{ marginLeft: theme.spacing.md }}
            onPress={() => navigation.navigate('Home')}
          />
        ),
      }}
    >
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerTitleStyle: {
            color: theme.colors.white,
            fontSize: theme.fontSizes.lg,
          },
        }}
      />
    </ProfileStack.Navigator>
  );
};

/**
 * Main Tab Navigator
 * Primary navigation component for authenticated users
 */
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
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.gray600,
        tabBarStyle: {
          height: 60,
          paddingBottom: theme.spacing.xs,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Add" component={AddStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator; 