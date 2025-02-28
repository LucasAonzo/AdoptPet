import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
  Animated,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import supabase from '../../config/supabase';
import { useAnimal } from '../../hooks/useAnimals';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 2 cards per row with margins

const AnimalDetailScreen = ({ route, navigation }) => {
  const { animal: initialAnimal } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

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
          
          {/* Adopt Button */}
          {!isAdopted ? (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  mainContent: {
    flex: 1,
  },
  petDetailImageContainer: {
    position: 'relative',
    width: '100%',
    height: 350,
  },
  petDetailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  detailHeaderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 9,
  },
  detailHeaderButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  detailImageIndicator: {
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
    width: 50,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  petDetailContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 25,
    paddingTop: 30,
  },
  petDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  petNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speciesIcon: {
    marginRight: 8,
  },
  petDetailName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statusBadge: {
    backgroundColor: '#8e74ae',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#8e74ae',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  petDetailLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  petDetailLocationText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  petInfoCardsContainer: {
    marginBottom: 25,
  },
  petInfoCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  petInfoCard: {
    width: cardWidth,
    backgroundColor: '#f8f6fb',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#8e74ae',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(142, 116, 174, 0.1)',
  },
  petInfoCardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  petInfoCardLabel: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  ownerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 25,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#8e74ae',
  },
  ownerTextInfo: {
    marginLeft: 15,
  },
  ownerLabel: {
    fontSize: 14,
    color: '#888',
  },
  ownerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  contactButtons: {
    flexDirection: 'row',
  },
  contactButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#8e74ae',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#8e74ae',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  descriptionSection: {
    marginBottom: 25,
    backgroundColor: '#f8f6fb',
    padding: 20,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#8e74ae',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  compatibilitySection: {
    marginBottom: 25,
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  compatibilityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  compatibilityIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  compatibilityItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 10,
    borderRadius: 10,
    width: 80,
  },
  compatibilityText: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  adoptionDetailsSection: {
    marginBottom: 25,
    backgroundColor: '#f8f6fb',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#8e74ae',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  adoptionDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  adoptionDetailText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  adoptButton: {
    borderRadius: 30,
    marginBottom: 30,
    shadowColor: '#8e74ae',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    overflow: 'hidden',
  },
  adoptButtonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  adoptButtonDisabled: {
    opacity: 0.9,
  },
  adoptButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adoptButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  adoptButtonFee: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: '#e74c3c',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#8e74ae',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});

export default AnimalDetailScreen; 