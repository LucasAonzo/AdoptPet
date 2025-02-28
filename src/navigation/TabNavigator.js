import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import HomeScreen from '../screens/home/HomeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AddAnimalScreen from '../screens/animals/AddAnimalScreen';
import AnimalDetailScreen from '../screens/animals/AnimalDetailScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const AddStack = createStackNavigator();
const ProfileStack = createStackNavigator();

// Home stack with detail screen
const HomeStackScreen = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#8e74ae',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <HomeStack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ 
          title: 'Adopt Me',
          headerTitleStyle: {
            color: '#ffffff',
            fontSize: 20,
            fontWeight: 'bold',
          }
        }}
      />
      <HomeStack.Screen 
        name="AnimalDetail" 
        component={AnimalDetailScreen}
        options={{
          title: 'Animal Details',
        }}
      />
      <HomeStack.Screen 
        name="EditAnimal" 
        component={AddAnimalScreen}
        options={{
          title: 'Edit Animal',
        }}
      />
    </HomeStack.Navigator>
  );
};

// Custom navigation listener for the Add tab
const AddStackScreen = ({ navigation }) => {
  // Handle back button press/gesture
  React.useEffect(() => {
    const onBackPress = () => {
      // When back is pressed in the Add tab, navigate to Home tab
      if (navigation.isFocused()) {
        navigation.navigate('Home');
        return true; // Prevent default behavior
      }
      return false; // Let default behavior happen
    };

    // Add event listener
    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    // Remove event listener on cleanup
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, [navigation]);

  return (
    <AddStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#8e74ae',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        // Disable gesture navigation to prevent default back behavior
        gestureEnabled: false,
      }}
    >
      <AddStack.Screen 
        name="AddMain" 
        component={AddAnimalScreen} 
        options={({ route }) => ({ 
          title: route.params?.editMode ? 'Edit Animal' : 'Add Animal',
          // Add custom back button that goes to Home
          headerLeft: () => (
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color="#fff" 
              style={{ marginLeft: 15 }}
              onPress={() => navigation.navigate('Home')}
            />
          )
        })}
      />
    </AddStack.Navigator>
  );
};

// Custom navigation listener for the Profile tab
const ProfileStackScreen = ({ navigation }) => {
  // Handle back button press/gesture
  React.useEffect(() => {
    const onBackPress = () => {
      // When back is pressed in the Profile tab, navigate to Home tab
      if (navigation.isFocused()) {
        navigation.navigate('Home');
        return true; // Prevent default behavior
      }
      return false; // Let default behavior happen
    };

    // Add event listener
    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    // Remove event listener on cleanup
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, [navigation]);

  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#8e74ae',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        // Disable gesture navigation to prevent default back behavior
        gestureEnabled: false,
      }}
    >
      <ProfileStack.Screen 
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{
          title: 'My Profile',
          // Add custom back button that goes to Home
          headerLeft: () => (
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color="#fff" 
              style={{ marginLeft: 15 }}
              onPress={() => navigation.navigate('Home')}
            />
          )
        }}
      />
    </ProfileStack.Navigator>
  );
};

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
        headerShown: false, // Hide the header at Tab level since we have it in the stacks
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStackScreen}
      />
      <Tab.Screen 
        name="Add" 
        component={AddStackScreen}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackScreen}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator; 