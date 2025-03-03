import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import defaultAvatarBase64 from '../../../assets/defaultAvatar';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useUserProfile, useUpdateProfile } from '../../hooks/useUserProfile';
import { useQueryClient } from '@tanstack/react-query';
import styles from './ProfileScreen.styles';
import { Image as ExpoImage } from 'expo-image';
import { SkeletonLoader } from '../../components/common';

const ProfileScreen = ({ navigation }) => {
  const { user: authUser, signOut } = useAuth();
  const queryClient = useQueryClient();
  
  // Use React Query hooks
  const { 
    data: userData, 
    isLoading, 
    isRefetching,
    refetch 
  } = useUserProfile();
  
  const { 
    mutate: updateProfile, 
    isPending: isUpdating 
  } = useUpdateProfile();
  
  // Local state
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    bio: '',
  });
  const [profileImage, setProfileImage] = useState(null);

  // Extract data from the query result
  const profile = userData?.profile || null;
  const myAnimals = userData?.myAnimals || [];
  const adoptedAnimals = userData?.adoptedAnimals || [];
  const myApplications = userData?.myApplications || [];

  // Update form data when profile changes
  useFocusEffect(
    React.useCallback(() => {
      refetch();
      
      if (profile) {
        setFormData({
          name: profile.name || '',
          phone: profile.phone || '',
          address: profile.address || '',
          bio: profile.bio || '',
        });
      }
      
      return () => {
        // Cleanup function when screen loses focus
      };
    }, [profile, refetch])
  );

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant access to your photo library to upload images.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        setProfileImage({
          uri: result.assets[0].uri,
          base64: result.assets[0].base64,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'There was an error selecting the image. Please try again.');
    }
  };

  const handleSaveProfile = () => {
    updateProfile({
      formData,
      profileImage,
    }, {
      onSuccess: () => setEditMode(false)
    });
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // The auth provider should handle navigation after sign out
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  // Render an animal card
  const renderAnimalItem = (animal) => (
    <TouchableOpacity 
      key={animal.id}
      style={styles.animalCard}
      onPress={() => navigation.navigate('AnimalDetail', { animal })}
    >
      <ExpoImage
        source={animal.image_url}
        style={styles.animalImage}
        contentFit="cover"
      />
      <View style={styles.animalInfo}>
        <Text style={styles.animalName}>{animal.name}</Text>
        <Text style={styles.animalBreed}>
          {animal.species} - {animal.breed}
        </Text>
        {animal.is_adopted && (
          <View style={styles.adoptedTag}>
            <Text style={styles.adoptedTagText}>Adopted</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
  
  // Render an application card
  const renderApplicationItem = (application) => (
    <TouchableOpacity 
      key={application.id}
      style={styles.animalCard}
      onPress={() => {
        // Navigate to animal detail
        if (application.animals) {
          navigation.navigate('AnimalDetail', { 
            animal: application.animals,
            refreshTimestamp: new Date().getTime() 
          });
        }
      }}
    >
      <ExpoImage
        source={application.animals?.image_url}
        style={styles.animalImage}
        contentFit="cover"
      />
      <View style={styles.animalInfo}>
        <Text style={styles.animalName}>
          {application.animals?.name || 'Unknown'}
        </Text>
        <Text style={styles.animalBreed}>
          {application.animals?.species || ''} 
          {application.animals?.breed ? ` - ${application.animals.breed}` : ''}
        </Text>
        <View style={[
          styles.applicationStatus,
          application.status === 'approved' ? styles.statusApproved :
          application.status === 'rejected' ? styles.statusRejected :
          styles.statusPending
        ]}>
          <Text style={styles.applicationStatusText}>
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render profile header with avatar and edit button
  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.profileImageContainer}>
        {isUpdating ? (
          <ActivityIndicator size="large" color="#8a65c9" />
        ) : (
          <ExpoImage
            source={{ 
              uri: profileImage?.uri || 
                  profile?.avatar_url || 
                  `data:image/png;base64,${defaultAvatarBase64}` 
            }}
            style={styles.profileImage}
            contentFit="cover"
            transition={300}
          />
        )}
        
        {editMode && (
          <TouchableOpacity 
            style={styles.editImageOverlay}
            onPress={pickImage}
          >
            <Ionicons name="camera" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.profileInfo}>
        <Text style={styles.userName}>{profile?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{authUser?.email || ''}</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{myAnimals.length}</Text>
            <Text style={styles.statLabel}>Listed</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{adoptedAnimals.length}</Text>
            <Text style={styles.statLabel}>Adopted</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Render profile info when not in edit mode
  const renderProfileInfo = () => (
    <View style={styles.detailsCard}>
      <Text style={styles.sectionTitle}>Personal Information</Text>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailIconLabelContainer}>
            <Ionicons name="person-outline" size={20} color="#8e74ae" />
            <Text style={styles.detailLabel}>Name</Text>
          </View>
          <Text style={styles.detailValue}>{profile?.name || 'Not set'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailIconLabelContainer}>
            <Ionicons name="call-outline" size={20} color="#8e74ae" />
            <Text style={styles.detailLabel}>Phone</Text>
          </View>
          <Text style={styles.detailValue}>{profile?.phone || 'Not set'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailIconLabelContainer}>
            <Ionicons name="location-outline" size={20} color="#8e74ae" />
            <Text style={styles.detailLabel}>Address</Text>
          </View>
          <Text style={styles.detailValue}>{profile?.address || 'Not set'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailIconLabelContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#8e74ae" />
            <Text style={styles.detailLabel}>Bio</Text>
          </View>
          <Text style={styles.detailValue}>{profile?.bio || 'No bio provided'}</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => setEditMode(true)}
      >
        <LinearGradient
          colors={['#a58fd8', '#8e74ae']}
          style={styles.editButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // Render edit form when in edit mode
  const renderEditForm = () => (
    <View style={styles.detailsCard}>
      <Text style={styles.sectionTitle}>Edit Profile</Text>
      
      <View style={styles.editDetailsContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Name</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#8e74ae" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter your name"
            />
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={20} color="#8e74ae" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Address</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="location-outline" size={20} color="#8e74ae" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="Enter your address"
            />
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Bio</Text>
          <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
            <Ionicons name="information-circle-outline" size={20} color="#8e74ae" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(value) => handleInputChange('bio', value)}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      </View>
      
      <View style={styles.editActionButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setEditMode(false)}
          disabled={isUpdating}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveProfile}
          disabled={isUpdating}
        >
          <LinearGradient
            colors={['#a58fd8', '#8e74ae']}
            style={styles.saveButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Save</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render animal sections (my animals, adopted animals)
  const renderAnimalSections = () => (
    <>
      {myAnimals.length > 0 && (
        <View style={styles.animalsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Listed Animals</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={refetch}
            >
              <Ionicons name="refresh" size={20} color="#8e74ae" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.animalsContainer}>
            {myAnimals.map(animal => renderAnimalItem(animal))}
          </View>
          
          <TouchableOpacity
            style={styles.addAnimalButton}
            onPress={() => navigation.navigate('AddAnimal')}
          >
            <LinearGradient
              colors={['#a58fd8', '#8e74ae']}
              style={styles.addAnimalButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addAnimalButtonText}>Add New Animal</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Applications Section */}
      {myApplications.length > 0 && (
        <View style={styles.animalsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Adoption Applications</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={refetch}
            >
              <Ionicons name="refresh" size={20} color="#8e74ae" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.animalsContainer}>
            {myApplications.map(application => renderApplicationItem(application))}
          </View>
        </View>
      )}
      
      {myApplications.length === 0 && profile && (
        <View style={styles.animalsSection}>
          <Text style={styles.sectionTitle}>My Adoption Applications</Text>
          
          <View style={styles.emptyStateContainer}>
            <Ionicons name="document-text-outline" size={50} color="#E8E0FF" />
            <Text style={styles.emptyStateText}>
              You haven't submitted any adoption applications yet.
              Browse available animals and apply!
            </Text>
            
            <TouchableOpacity
              style={styles.addAnimalButton}
              onPress={() => navigation.navigate('AnimalsList')}
            >
              <LinearGradient
                colors={['#0077B6', '#00B4D8']}
                style={styles.addAnimalButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="search" size={20} color="#fff" />
                <Text style={styles.addAnimalButtonText}>Browse Animals</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {myAnimals.length === 0 && (
        <View style={styles.animalsSection}>
          <Text style={styles.sectionTitle}>My Listed Animals</Text>
          
          <View style={styles.emptyStateContainer}>
            <Ionicons name="paw" size={50} color="#E8E0FF" />
            <Text style={styles.emptyStateText}>
              You don't have any listed animals yet. 
              Add a new animal for adoption!
            </Text>
            
            <TouchableOpacity
              style={styles.addAnimalButton}
              onPress={() => navigation.navigate('AddAnimal')}
            >
              <LinearGradient
                colors={['#a58fd8', '#8e74ae']}
                style={styles.addAnimalButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addAnimalButtonText}>Add New Animal</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {adoptedAnimals.length > 0 && (
        <View style={styles.animalsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Adopted Animals</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={refetch}
            >
              <Ionicons name="refresh" size={20} color="#8e74ae" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.animalsContainer}>
            {adoptedAnimals.map(animal => renderAnimalItem(animal))}
          </View>
        </View>
      )}
    </>
  );
  
  // Render profile actions
  const renderProfileActions = () => (
    <View style={styles.profileActionsContainer}>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign Out', style: 'destructive', onPress: handleLogout },
            ]
          );
        }}
      >
        <Ionicons name="log-out-outline" size={22} color="#8e74ae" />
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );

  // Create a section for the main content rendering
  const renderMainContent = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {renderProfileHeader()}
      {editMode ? renderEditForm() : renderProfileInfo()}
      {!editMode && renderProfileActions()}
      {!editMode && renderAnimalSections()}
    </ScrollView>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <SkeletonLoader variant="profile" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#ffffff', '#f8f4ff']}
      style={styles.gradientContainer}
    >
      {renderMainContent()}
    </LinearGradient>
  );
};

export default ProfileScreen; 