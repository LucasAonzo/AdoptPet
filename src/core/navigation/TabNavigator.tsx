import React, { useEffect, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { 
  MainTabParamList, 
  HomeStackParamList,
  ProfileStackParamList 
} from '../../types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';

// Screen imports
import HomeScreen from '../../screens/home/HomeScreen';
import ProfileScreen from '../../screens/profile/ProfileScreen';
import AddAnimalScreen from '../../screens/animals/AddAnimalScreen';
import AnimalDetailScreen from '../../screens/animals/AnimalDetailScreen';
import PublicationSuccessScreen from '../../screens/animals/PublicationSuccessScreen';

import theme from '../../styles/theme';

type AddStackParamList = {
  AddAnimal: undefined;
  PublicationSuccess: { animal: any };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const AddStack = createStackNavigator<AddStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

/**
 * Home Stack Navigator
 * Handles navigation for the home tab including animal listings and details
 */
const HomeStackScreen: React.FC = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary.main,
        },
        headerTintColor: theme.colors.white,
        headerTitleStyle: {
          fontWeight: theme.fontWeights.bold,
        },
      }}
    >
      <HomeStack.Screen
        name="HomeScreen"
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
          title: route.params?.animalId ? `Animal ${route.params.animalId}` : 'Animal Details',
          headerTitleStyle: {
            color: theme.colors.white,
            fontSize: theme.fontSizes.lg,
          }
        })}
      />
    </HomeStack.Navigator>
  );
};

interface AddStackScreenProps {
  navigation: StackNavigationProp<MainTabParamList>;
}

/**
 * Add Animal Stack Navigator
 * Handles navigation for adding new animals
 */
const AddStackScreen: React.FC<AddStackScreenProps> = ({ navigation }) => {
  // Handle hardware back button in Add stack
  useFocusEffect(
    useCallback(() => {
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
          backgroundColor: theme.colors.primary.main,
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

interface ProfileStackScreenProps {
  navigation: StackNavigationProp<MainTabParamList>;
}

/**
 * Profile Stack Navigator
 * Handles navigation for the user profile section
 */
const ProfileStackScreen: React.FC<ProfileStackScreenProps> = ({ navigation }) => {
  // Handle hardware back button in Profile stack
  useFocusEffect(
    useCallback(() => {
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
          backgroundColor: theme.colors.primary.main,
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
        name="ProfileScreen"
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
const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>["name"] = 'help-circle';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary.main,
        tabBarInactiveTintColor: theme.colors.gray600,
        tabBarStyle: {
          height: 60,
          paddingBottom: theme.spacing.xs,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Search" component={AddStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator; 