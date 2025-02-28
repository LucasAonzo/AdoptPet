import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import defaultAvatarBase64 from '../../../assets/defaultAvatar';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useUserProfile, useUpdateProfile, useDebugUserData } from '../../hooks/useUserProfile';
import { useQueryClient } from '@tanstack/react-query';
import styles from './ProfileScreen.styles';

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
  
  const {
    data: debugData,
    refetch: debugRefetch,
    isRefetching: isDebugRefetching
  } = useDebugUserData();
  
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

  // Update form data when profile changes
  useFocusEffect(
    React.useCallback(() => {
      console.log('Profile screen focused, refreshing data...');
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
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSaveProfile = () => {
    updateProfile({
      formData: {
        ...formData,
        avatar_url: profile?.avatar_url
      },
      profileImage
    });
    setEditMode(false);
  };

  const handleLogout = async () => {
    try {
      const success = await signOut();
      if (!success) {
        Alert.alert('Error', 'Failed to sign out. Please try again.');
      }
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const debugUserData = () => {
    debugRefetch().then(result => {
      if (result.data?.success) {
        Alert.alert(
          'Debug Info', 
          `User ID: ${result.data.userId}\nAnimals found: ${result.data.animalsCount}`
        );
      } else {
        Alert.alert('Debug Error', result.data?.message || 'Failed to fetch debug data');
      }
    });
  };

  const renderAnimalItem = (animal) => {
    return (
      <TouchableOpacity
        key={animal.id}
        style={styles.animalCard}
        onPress={() => navigation.navigate('AnimalDetail', { animal })}
      >
        <Image
          source={{ uri: animal.image_url }}
          style={styles.animalImage}
          resizeMode="cover"
        />
        <View style={styles.animalInfo}>
          <Text style={styles.animalName}>{animal.name}</Text>
          <Text style={styles.animalBreed}>
            {animal.species} • {animal.breed}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8e74ae" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#ffffff', '#f8f4ff']}
      style={styles.gradientContainer}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={editMode ? pickImage : null}
            disabled={!editMode}
          >
            <Image
              source={
                profileImage
                  ? { uri: profileImage.uri }
                  : profile?.avatar_url
                  ? { uri: profile.avatar_url }
                  : { uri: defaultAvatarBase64 }
              }
              style={styles.profileImage}
            />
            {editMode && (
              <View style={styles.editImageOverlay}>
                <Ionicons name="camera" size={24} color="white" />
              </View>
            )}
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            {!editMode ? (
              <>
                <Text style={styles.userName}>{profile?.name || 'User'}</Text>
                <Text style={styles.userEmail}>{authUser?.email}</Text>
                
                <View style={styles.statsContainer}>
                  <View style={styles.stat}>
                    <Text style={styles.statNumber}>{myAnimals.length}</Text>
                    <Text style={styles.statLabel}>Posted</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <Text style={styles.statNumber}>{adoptedAnimals.length}</Text>
                    <Text style={styles.statLabel}>Adopted</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.editNameContainer}>
                <Text style={styles.editLabel}>Name</Text>
                <TextInput
                  style={styles.editNameInput}
                  value={formData.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                  placeholder="Your name"
                  placeholderTextColor="#aaa"
                />
              </View>
            )}
          </View>
        </View>
        
        {/* Edit Button or Save/Cancel Buttons */}
        <View style={styles.actionButtonsContainer}>
          {!editMode ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditMode(true)}
            >
              <LinearGradient
                colors={['#a58fd8', '#8e74ae', '#7d5da7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.editButtonGradient}
              >
                <Ionicons name="create-outline" size={20} color="white" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActionButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setEditMode(false);
                  setProfileImage(null);
                  // Reset form data to current profile
                  if (profile) {
                    setFormData({
                      name: profile.name || '',
                      phone: profile.phone || '',
                      address: profile.address || '',
                      bio: profile.bio || '',
                    });
                  }
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
                disabled={isUpdating}
              >
                <LinearGradient
                  colors={['#a58fd8', '#8e74ae', '#7d5da7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButtonGradient}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-outline" size={20} color="white" />
                      <Text style={styles.saveButtonText}>Save</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* User Details Section */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>
            {editMode ? 'Edit Your Details' : 'Your Details'}
          </Text>
          
          {!editMode ? (
            // Display Mode
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <View style={styles.detailIconLabelContainer}>
                  <Ionicons name="mail-outline" size={20} color="#8e74ae" />
                  <Text style={styles.detailLabel}>Email:</Text>
                </View>
                <Text style={styles.detailValue}>{authUser?.email}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailIconLabelContainer}>
                  <Ionicons name="call-outline" size={20} color="#8e74ae" />
                  <Text style={styles.detailLabel}>Phone:</Text>
                </View>
                <Text style={styles.detailValue}>{profile?.phone || 'Not provided'}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailIconLabelContainer}>
                  <Ionicons name="location-outline" size={20} color="#8e74ae" />
                  <Text style={styles.detailLabel}>Address:</Text>
                </View>
                <Text style={styles.detailValue}>{profile?.address || 'Not provided'}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailIconLabelContainer}>
                  <Ionicons name="information-circle-outline" size={20} color="#8e74ae" />
                  <Text style={styles.detailLabel}>Bio:</Text>
                </View>
                <Text style={styles.detailValue}>{profile?.bio || 'No bio provided'}</Text>
              </View>
            </View>
          ) : (
            // Edit Mode
            <View style={styles.editDetailsContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="call-outline" size={20} color="#8e74ae" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={formData.phone}
                    onChangeText={(text) => handleInputChange('phone', text)}
                    placeholder="Your phone number"
                    placeholderTextColor="#aaa"
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
                    onChangeText={(text) => handleInputChange('address', text)}
                    placeholder="Your address"
                    placeholderTextColor="#aaa"
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bio</Text>
                <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                  <Ionicons name="information-circle-outline" size={20} color="#8e74ae" style={[styles.inputIcon, {alignSelf: 'flex-start', marginTop: 12}]} />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.bio}
                    onChangeText={(text) => handleInputChange('bio', text)}
                    placeholder="Tell us about yourself"
                    placeholderTextColor="#aaa"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </View>
          )}
        </View>
        
        {/* My Animals Section */}
        <View style={styles.animalsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Animals</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={() => refetch()}
              disabled={isRefetching}
            >
              {isRefetching ? (
                <ActivityIndicator size="small" color="#8e74ae" />
              ) : (
                <Ionicons name="refresh-outline" size={20} color="#8e74ae" />
              )}
            </TouchableOpacity>
          </View>
          
          {myAnimals.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="paw-outline" size={40} color="#8e74ae" />
              <Text style={styles.emptyStateText}>
                You haven't posted any animals yet
              </Text>
              <TouchableOpacity
                style={styles.addAnimalButton}
                onPress={() => navigation.navigate('Add')}
              >
                <LinearGradient
                  colors={['#a58fd8', '#8e74ae', '#7d5da7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.addAnimalButtonGradient}
                >
                  <Ionicons name="add-outline" size={20} color="white" />
                  <Text style={styles.addAnimalButtonText}>Add Animal</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.animalsContainer}>
              {myAnimals.map(animal => renderAnimalItem(animal))}
            </View>
          )}
        </View>
        
        {/* Adopted Animals Section */}
        <View style={styles.animalsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Adopted Animals</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={() => refetch()}
              disabled={isRefetching}
            >
              {isRefetching ? (
                <ActivityIndicator size="small" color="#8e74ae" />
              ) : (
                <Ionicons name="refresh-outline" size={20} color="#8e74ae" />
              )}
            </TouchableOpacity>
          </View>
          
          {adoptedAnimals.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="heart-outline" size={40} color="#8e74ae" />
              <Text style={styles.emptyStateText}>
                You haven't adopted any animals yet
              </Text>
            </View>
          ) : (
            <View style={styles.animalsContainer}>
              {adoptedAnimals.map(animal => renderAnimalItem(animal))}
            </View>
          )}
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#8e74ae" />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
        
        {/* Debug Button - only visible in development */}
        <TouchableOpacity
          style={styles.debugButton}
          onPress={debugUserData}
        >
          <Ionicons name="bug-outline" size={20} color="#8e74ae" />
          <Text style={styles.debugButtonText}>Debug Data</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

export default ProfileScreen; 