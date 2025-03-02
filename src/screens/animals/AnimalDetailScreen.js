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
  Animated,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import supabase from '../../config/supabase';
import { useAnimal } from '../../hooks/useAnimals';
import { useAuth } from '../../context/AuthContext';
import { useUpdateAnimal, useDeleteAnimal, useAdoptAnimal } from '../../hooks/useAnimalMutations';
import styles from './AnimalDetailScreen.styles';
import { useModalContext } from '../../components/modals';
import { useNavigation } from '@react-navigation/native';
import { LoadingOverlay, OptimizedImage, SkeletonLoader } from '../../components/common';
import { useCheckPendingApplication } from '../../hooks/useAdoptionMutations';

// Set global React for components that might need it
global.React = React;

const AnimalDetailScreen = ({ route, navigation }) => {
  // Get the animalId from route params
  const { animalId, animal: initialAnimal } = route.params;
  const id = animalId || (initialAnimal?.id);
  
  const [isFavorite, setIsFavorite] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { user } = useAuth();
  
  // Use the global modal context
  const { 
    showConfirmationModal, 
    showSuccessModal, 
    showErrorModal,
    showLoadingModal,
    hideModal,
    showInfoModal
  } = useModalContext();

  // Get animal data and mutations
  const { data: animalData, isLoading: isLoadingAnimal, isError: isLoadError } = useAnimal(id);
  const { mutate: deleteAnimal, isPending: isDeleting } = useDeleteAnimal(navigation);
  const { mutate: adoptAnimal, isPending: isAdopting } = useAdoptAnimal();
  const { data: applicationStatus } = useCheckPendingApplication(id);
  
  // Use the fetched animal data if available, otherwise use the initial data
  const displayAnimal = animalData || initialAnimal;
  
  // Is the current user the owner of this animal?
  const isOwner = user?.id && displayAnimal?.user_id === user.id;

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
      // Keep gesture enabled but hide the header back button
      gestureEnabled: true,
      gestureDirection: 'horizontal',
      headerLeft: () => null,
    });
  }, [navigation]);

  // Use state from the fetched data or fall back to initial data
  const isAdopted = displayAnimal?.is_adopted;

  const handleAdopt = () => {
    if (!user) {
      showErrorModal('Authentication Required', 'Please login to adopt this pet');
      return;
    }
    
    // Check if user already has a pending application
    if (applicationStatus?.hasApplication) {
      const application = applicationStatus.applicationDetails;
      
      // Show different modals based on application status
      if (application.status === 'pending') {
        showInfoModal(
          'Application Pending',
          `You already have a pending application for ${displayAnimal.name}. Would you like to view your application?`,
          () => {
            navigation.navigate('ApplicationDetails', { applicationId: application.id });
          }
        );
      } else if (application.status === 'approved') {
        showSuccessModal(
          'Application Approved',
          `Great news! Your application to adopt ${displayAnimal.name} has been approved. Please check your application details.`,
          () => {
            navigation.navigate('ApplicationDetails', { applicationId: application.id });
          }
        );
      } else if (application.status === 'rejected') {
        showErrorModal(
          'Application Rejected',
          `We're sorry, but your application for ${displayAnimal.name} was not approved. You can view the details or contact us for more information.`,
          () => {
            navigation.navigate('ApplicationDetails', { applicationId: application.id });
          }
        );
      } else {
        // For cancelled applications, allow reapplying
        navigation.navigate('AdoptionApplication', { animal: displayAnimal });
      }
      return;
    }
    
    // If no application exists, direct to the application form
    navigation.navigate('AdoptionApplication', { animal: displayAnimal });
  };

  const handleContact = () => {
    showInfoModal(
      'Contact Information',
      `Please contact ${displayAnimal.users?.name || 'the shelter'} for more information about ${displayAnimal.name}.`
    );
  };

  const toggleFavorite = () => {
    // Animate heart when toggling favorite
    const newValue = !isFavorite;
    setIsFavorite(newValue);
    
    if (newValue) {
      // Show a small animation or feedback when adding to favorites
      showSuccessModal('Added to Favorites', `${displayAnimal.name} has been added to your favorites!`);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditAnimal', { 
      editMode: true, 
      animal: displayAnimal 
    });
  };

  const handleDelete = () => {
    showConfirmationModal(
      'Delete Animal',
      'Are you sure you want to delete this animal? This action cannot be undone.',
      () => {
        // User confirmed deletion
        showLoadingModal('Deleting animal...');
        
        deleteAnimal(displayAnimal.id, {
          onSuccess: () => {
            hideModal(); // Hide loading modal
            showSuccessModal('Success', 'Animal deleted successfully', () => {
              // Navigate back after user acknowledges
              navigation.goBack();
            });
          },
          onError: (error) => {
            hideModal(); // Hide loading modal
            showErrorModal('Error', `Failed to delete animal: ${error.message}`);
          }
        });
      }
    );
  };

  // Show loading state
  if (isLoadingAnimal && !initialAnimal) {
    return (
      <View style={styles.loadingContainer}>
        <SkeletonLoader variant="detail" />
      </View>
    );
  }

  // Show error state
  if (isLoadError && !initialAnimal) {
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
    <>
      {(isDeleting || isAdopting) && <LoadingOverlay type="paw" text="Processing..." />}
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8e74ae" />
        
        <View style={styles.mainContent}>
          {/* Pet Image */}
          <View style={styles.petDetailImageContainer}>
            <OptimizedImage 
              source={displayAnimal.image_url}
              style={styles.petDetailImage}
              contentFit="cover"
              showLoader={true}
              transitionDuration={500}
              memoKey={`detail-${displayAnimal.id}`}
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
                <Ionicons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isFavorite ? "#e74c3c" : "#444"} 
                />
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
                <OptimizedImage 
                  source={displayAnimal.users?.profile_picture || 'https://randomuser.me/api/portraits/women/32.jpg'} 
                  style={styles.ownerImage}
                  contentFit="cover"
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
            
            {/* Adopt/Edit buttons */}
            {isOwner ? (
              <View style={styles.ownerButtonsContainer}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleEdit}
                  disabled={isDeleting || isAdopting}
                >
                  <LinearGradient
                    colors={['#a58fd8', '#8e74ae']}
                    style={styles.editButtonGradient}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDelete}
                  disabled={isDeleting || isAdopting}
                >
                  <LinearGradient
                    colors={['#ff6b6b', '#ee5253']}
                    style={styles.deleteButtonGradient}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.adoptButton,
                  displayAnimal.is_adopted && styles.adoptButtonDisabled
                ]}
                onPress={handleAdopt}
                disabled={isDeleting || isAdopting || displayAnimal.is_adopted}
              >
                <LinearGradient
                  colors={displayAnimal.is_adopted ? 
                    ['#aaaaaa', '#888888'] : 
                    ['#a58fd8', '#8e74ae']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.adoptButtonGradient}
                >
                  <View style={styles.adoptButtonContent}>
                    {isDeleting || isAdopting ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="heart" size={20} color="#fff" />
                        <Text style={styles.adoptButtonText}>
                          {displayAnimal.is_adopted ? 'Already Adopted' : 
                          (applicationStatus?.hasApplication && 
                           applicationStatus.applicationDetails?.status === 'pending') ? 
                           'Application Pending' : 'Adopt Me!'}
                        </Text>
                      </>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </Animated.ScrollView>
        </View>
      </View>
    </>
  );
};

export default AnimalDetailScreen; 