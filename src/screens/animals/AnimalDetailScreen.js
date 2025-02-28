import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image,
  Animated,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import supabase from '../../config/supabase';
import { useAnimal } from '../../hooks/useAnimals';
import { useAuth } from '../../context/AuthContext';
import { useUpdateAnimal, useDeleteAnimal } from '../../hooks/useAnimalMutations';
import styles from './AnimalDetailScreen.styles';

const AnimalDetailScreen = ({ route, navigation }) => {
  const { animal: initialAnimal } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { user } = useAuth();
  const { mutate: deleteAnimal } = useDeleteAnimal(navigation);

  // Set screen options on component mount
  useEffect(() => {
    navigation.setOptions({
      title: 'Animal Details',
      headerShown: true,
      headerStyle: {
        backgroundColor: '#8e74ae',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 18,
      },
      headerLeft: () => null,
    });
  }, [navigation]);

  // Use React Query to fetch animal details
  const { 
    data: animal, 
    isLoading,
    isError,
    error
  } = useAnimal(initialAnimal.id);

  // Use state from the fetched data or fall back to initial data
  const isAdopted = animal?.is_adopted || initialAnimal.is_adopted;
  const displayAnimal = animal || initialAnimal;

  // Check if current user is the owner of the animal
  const isOwner = user?.id && animal?.user_id === user.id;

  const handleAdopt = async () => {
    try {
      // Show loading indicator
      Alert.alert('Processing', 'Submitting adoption request...');
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Error', 'You must be logged in to adopt an animal');
        return;
      }
      
      // Update the animal's adoption status
      const { error } = await supabase
        .from('animals')
        .update({ 
          is_adopted: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', displayAnimal.id);
      
      if (error) throw error;
      
      // No need to set local state as React Query will automatically refetch
      Alert.alert(
        'Success!', 
        `Congratulations! You've started the adoption process for ${displayAnimal.name}. The shelter will contact you soon with next steps.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error adopting animal:', error);
      Alert.alert('Error', 'Failed to adopt animal. Please try again.');
    }
  };

  const handleContact = () => {
    Alert.alert(
      'Contact Information',
      `Please contact ${displayAnimal.users?.name || 'the shelter'} for more information about ${displayAnimal.name}.`,
      [{ text: 'OK' }]
    );
  };

  const toggleFavorite = () => {
    // Animate heart when toggling favorite
    const newValue = !isFavorite;
    setIsFavorite(newValue);
    
    if (newValue) {
      // Show a small animation or feedback when adding to favorites
      Alert.alert('Added to Favorites', `${displayAnimal.name} has been added to your favorites!`);
    }
  };

  const handleEdit = () => {
    navigation.navigate('Add', { 
      editMode: true, 
      animal: animal || initialAnimal 
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete ${displayAnimal.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteAnimal(displayAnimal.id);
          }
        }
      ]
    );
  };

  // Show loading state
  if (isLoading && !initialAnimal) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8e74ae" />
        <Text style={styles.loadingText}>Loading pet details...</Text>
      </View>
    );
  }

  // Show error state
  if (isError && !initialAnimal) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle" size={50} color="#e74c3c" />
        <Text style={styles.errorText}>Error loading pet details</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8e74ae" />
      
      <View style={styles.mainContent}>
        {/* Pet Image */}
        <View style={styles.petDetailImageContainer}>
          <Image 
            source={{ uri: displayAnimal.image_url }} 
            style={styles.petDetailImage}
            resizeMode="cover"
          />
          
          {/* Action Buttons */}
          <View style={styles.detailHeaderButtons}>
            <TouchableOpacity 
              style={styles.detailHeaderButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#444" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.detailHeaderButton}
              onPress={toggleFavorite}
            >
              <Animated.View>
                <Ionicons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isFavorite ? '#ff4081' : '#444'} 
                />
              </Animated.View>
            </TouchableOpacity>
          </View>
          
          {/* Image Gradient Overlay */}
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent', 'transparent', 'rgba(0,0,0,0.3)']}
            style={styles.imageGradientOverlay}
          />
          
          {/* Bottom Indicator */}
          <View style={styles.detailImageIndicator} />
        </View>
        
        <Animated.ScrollView 
          style={styles.petDetailContent}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          {/* Pet Name */}
          <View style={styles.petDetailHeader}>
            <View style={styles.petNameContainer}>
              <Text style={styles.petDetailName}>{displayAnimal.name}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{isAdopted ? 'Adopted' : 'Available'}</Text>
            </View>
          </View>
          
          {/* Location */}
          <View style={styles.petDetailLocation}>
            <Ionicons name="location" size={20} color="#8e74ae" />
            <Text style={styles.petDetailLocationText}>{displayAnimal.location || 'Unknown location'}</Text>
          </View>
          
          {/* Pet Information Cards - Organized into 2x2 grid */}
          <View style={styles.petInfoCardsContainer}>
            <View style={styles.petInfoCardRow}>
              <View style={styles.petInfoCard}>
                <Text style={styles.petInfoCardValue}>Pet</Text>
                <Text style={styles.petInfoCardLabel}>Type</Text>
              </View>
              
              <View style={styles.petInfoCard}>
                <Text style={styles.petInfoCardValue}>{displayAnimal.breed || 'Unknown'}</Text>
                <Text style={styles.petInfoCardLabel}>Breed</Text>
              </View>
            </View>
            
            <View style={styles.petInfoCardRow}>
              <View style={styles.petInfoCard}>
                <Text style={styles.petInfoCardValue}>{displayAnimal.species || 'Unknown'}</Text>
                <Text style={styles.petInfoCardLabel}>Species</Text>
              </View>
              
              <View style={styles.petInfoCard}>
                <Text style={styles.petInfoCardValue}>{displayAnimal.age} {displayAnimal.age === 1 ? 'year' : 'years'}</Text>
                <Text style={styles.petInfoCardLabel}>Age</Text>
              </View>
            </View>
          </View>
          
          {/* Owner Information */}
          <View style={styles.ownerSection}>
            <View style={styles.ownerInfo}>
              <Image 
                source={{ uri: displayAnimal.users?.profile_picture || 'https://randomuser.me/api/portraits/women/32.jpg' }} 
                style={styles.ownerImage}
              />
              <View style={styles.ownerTextInfo}>
                <Text style={styles.ownerLabel}>Owner by:</Text>
                <Text style={styles.ownerName}>{displayAnimal.users?.name || 'Shelter Staff'}</Text>
              </View>
            </View>
            
            <View style={styles.contactButtons}>
              <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
                <Ionicons name="call" size={24} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
                <Ionicons name="chatbubble" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>About {displayAnimal.name}</Text>
            <Text style={styles.descriptionText}>
              {displayAnimal.description || 'No description available for this pet. Please contact the shelter for more information.'}
            </Text>
          </View>
          
          {/* Compatibility Information - use assumed compatibility since we don't have the actual data */}
          <View style={styles.compatibilitySection}>
            <Text style={styles.compatibilityTitle}>Compatibility</Text>
            <View style={styles.compatibilityIcons}>
              <View style={styles.compatibilityItem}>
                <Ionicons 
                  name="people" 
                  size={28} 
                  color="#4CAF50" 
                />
                <Text style={[styles.compatibilityText, {color: '#4CAF50'}]}>Kids</Text>
              </View>
              
              <View style={styles.compatibilityItem}>
                <Ionicons 
                  name="paw" 
                  size={28} 
                  color="#4CAF50" 
                />
                <Text style={[styles.compatibilityText, {color: '#4CAF50'}]}>Dogs</Text>
              </View>
              
              <View style={styles.compatibilityItem}>
                <Ionicons 
                  name="paw" 
                  size={28} 
                  color="#4CAF50" 
                />
                <Text style={[styles.compatibilityText, {color: '#4CAF50'}]}>Cats</Text>
              </View>
            </View>
          </View>
          
          {/* Adoption Details */}
          <View style={styles.adoptionDetailsSection}>
            <Text style={styles.sectionTitle}>Adoption Details</Text>
            
            <View style={styles.adoptionDetailItem}>
              <Ionicons name="cash-outline" size={20} color="#8e74ae" />
              <Text style={styles.adoptionDetailText}>
                Adoption Fee: $95
              </Text>
            </View>
            
            <View style={styles.adoptionDetailItem}>
              <Ionicons name="calendar" size={20} color="#8e74ae" />
              <Text style={styles.adoptionDetailText}>
                Available since: {new Date(displayAnimal.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
          
          {/* Owner Controls or Adopt Button */}
          {isOwner ? (
            <View style={styles.ownerControlsContainer}>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={handleEdit}
              >
                <LinearGradient
                  colors={['#a58fd8', '#8e74ae', '#7d5da7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.editButtonGradient}
                >
                  <View style={styles.buttonContent}>
                    <Ionicons name="create-outline" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Edit</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <LinearGradient
                  colors={['#e74c3c', '#c0392b', '#962d22']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.deleteButtonGradient}
                >
                  <View style={styles.buttonContent}>
                    <Ionicons name="trash-outline" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Delete</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : !isAdopted ? (
            <TouchableOpacity 
              style={styles.adoptButton}
              onPress={handleAdopt}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#a58fd8', '#8e74ae', '#7d5da7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.adoptButtonGradient}
              >
                <View style={styles.adoptButtonContent}>
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.adoptButtonText}>Adopt Me</Text>
                      <Text style={styles.adoptButtonFee}>$95</Text>
                    </>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.adoptButton, styles.adoptButtonDisabled]}
              onPress={handleContact}
            >
              <LinearGradient
                colors={['#c4b5e0', '#b3a4d1', '#a393c2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.adoptButtonGradient}
              >
                <Text style={styles.adoptButtonText}>Contact Shelter</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.ScrollView>
      </View>
    </View>
  );
};

export default AnimalDetailScreen; 