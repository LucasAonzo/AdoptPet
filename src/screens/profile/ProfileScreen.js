import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import defaultAvatarBase64 from '../../../assets/defaultAvatar';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useUserProfile, useUpdateProfile } from '../../hooks/useUserProfile';
import { useQueryClient } from '@tanstack/react-query';
import styles from './ProfileScreen.styles';
import theme from '../../styles/theme';
import componentStyles from '../../styles/componentStyles';
import { Image as ExpoImage } from 'expo-image';
import { SkeletonLoader } from '../../components/common';
import * as Animatable from 'react-native-animatable';

const ProfileScreen = ({ navigation }) => {
  const { user: authUser, signOut } = useAuth();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  
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
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'listed', 'adopted', 'applications'

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
          <View style={[componentStyles.badge, componentStyles.statusSuccess]}>
            <Text style={[componentStyles.badgeText, componentStyles.successText]}>Adopted</Text>
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
        // Navigate to adoption progress screen
        if (application.animals) {
          navigation.navigate('AdoptionProgress', { 
            animal: application.animals,
            application: application,
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
          componentStyles.badge,
          application.status === 'approved' ? componentStyles.statusSuccess :
          application.status === 'rejected' ? componentStyles.statusError :
          componentStyles.statusPending
        ]}>
          <Text style={[
            componentStyles.badgeText,
            application.status === 'approved' ? componentStyles.successText :
            application.status === 'rejected' ? componentStyles.errorText :
            componentStyles.pendingText
          ]}>
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render header with profile title
  const renderHeader = () => (
    <SafeAreaView style={{ backgroundColor: theme.colors.primary.main }}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.light} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Profile</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={refetch}
          >
            <Ionicons name="refresh" size={22} color={theme.colors.text.light} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={22} color={theme.colors.text.light} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );

  // Render profile header with avatar and edit button
  const renderProfileHeader = () => (
    <Animatable.View 
      animation="fadeIn" 
      duration={800}
      delay={200}
      style={styles.profileHeaderContainer}
    >
      <LinearGradient
        colors={['#ffffff', '#f8f4ff']}
        style={styles.profileHeaderGradient}
      >
        <View style={styles.profileAvatarContainer}>
          <View style={styles.profileAvatarWrapper}>
            {isUpdating ? (
              <ActivityIndicator size="large" color={theme.colors.primary.main} />
            ) : (
              <ExpoImage
                source={{ 
                  uri: profileImage?.uri || 
                      profile?.avatar_url || 
                      `data:image/png;base64,${defaultAvatarBase64}` 
                }}
                style={styles.profileAvatar}
                contentFit="cover"
                transition={300}
              />
            )}
            
            {editMode && (
              <TouchableOpacity 
                style={styles.editAvatarButton}
                onPress={pickImage}
              >
                <LinearGradient
                  colors={theme.colors.gradients.primary}
                  style={styles.editAvatarGradient}
                >
                  <Ionicons name="camera" size={22} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={styles.profileName}>{profile?.name || 'User'}</Text>
          <Text style={styles.profileEmail}>{authUser?.email || ''}</Text>
        </View>
      </LinearGradient>
      
      <View style={styles.statsContainer}>
        <TouchableOpacity 
          style={[
            styles.statItem, 
            activeTab === 'info' && styles.activeStatItem
          ]}
          onPress={() => setActiveTab('info')}
        >
          <View style={styles.statIconContainer}>
            <Ionicons 
              name="person" 
              size={22} 
              color={activeTab === 'info' ? theme.colors.primary.main : theme.colors.text.secondary} 
            />
          </View>
          <Text style={[
            styles.statLabel, 
            activeTab === 'info' && styles.activeStatLabel
          ]}>
            Info
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.statItem, 
            activeTab === 'listed' && styles.activeStatItem
          ]}
          onPress={() => setActiveTab('listed')}
        >
          <View style={styles.statIconContainer}>
            <Ionicons 
              name="paw" 
              size={22} 
              color={activeTab === 'listed' ? theme.colors.primary.main : theme.colors.text.secondary} 
            />
            {myAnimals.length > 0 && (
              <View style={styles.statBadge}>
                <Text style={styles.statBadgeText}>{myAnimals.length}</Text>
              </View>
            )}
          </View>
          <Text style={[
            styles.statLabel, 
            activeTab === 'listed' && styles.activeStatLabel
          ]}>
            Listed
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.statItem, 
            activeTab === 'adopted' && styles.activeStatItem
          ]}
          onPress={() => setActiveTab('adopted')}
        >
          <View style={styles.statIconContainer}>
            <Ionicons 
              name="heart" 
              size={22} 
              color={activeTab === 'adopted' ? theme.colors.primary.main : theme.colors.text.secondary} 
            />
            {adoptedAnimals.length > 0 && (
              <View style={styles.statBadge}>
                <Text style={styles.statBadgeText}>{adoptedAnimals.length}</Text>
              </View>
            )}
          </View>
          <Text style={[
            styles.statLabel, 
            activeTab === 'adopted' && styles.activeStatLabel
          ]}>
            Adopted
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.statItem, 
            activeTab === 'applications' && styles.activeStatItem
          ]}
          onPress={() => setActiveTab('applications')}
        >
          <View style={styles.statIconContainer}>
            <Ionicons 
              name="document-text" 
              size={22} 
              color={activeTab === 'applications' ? theme.colors.primary.main : theme.colors.text.secondary} 
            />
            {myApplications.length > 0 && (
              <View style={styles.statBadge}>
                <Text style={styles.statBadgeText}>{myApplications.length}</Text>
              </View>
            )}
          </View>
          <Text style={[
            styles.statLabel, 
            activeTab === 'applications' && styles.activeStatLabel
          ]}>
            Apps
          </Text>
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );

  // Render profile info when not in edit mode
  const renderProfileInfo = () => (
    <Animatable.View 
      animation="fadeIn" 
      duration={500}
      style={styles.detailsCard}
    >
      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <TouchableOpacity
          style={styles.editActionButton}
          onPress={() => setEditMode(true)}
        >
          <Ionicons name="create-outline" size={20} color={theme.colors.primary.main} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailIconLabelContainer}>
            <Ionicons name="person-outline" size={20} color={theme.colors.primary.main} />
            <Text style={styles.detailLabel}>Name</Text>
          </View>
          <Text style={styles.detailValue}>{profile?.name || 'Not set'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailIconLabelContainer}>
            <Ionicons name="call-outline" size={20} color={theme.colors.primary.main} />
            <Text style={styles.detailLabel}>Phone</Text>
          </View>
          <Text style={styles.detailValue}>{profile?.phone || 'Not set'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailIconLabelContainer}>
            <Ionicons name="location-outline" size={20} color={theme.colors.primary.main} />
            <Text style={styles.detailLabel}>Address</Text>
          </View>
          <Text style={styles.detailValue}>{profile?.address || 'Not set'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailIconLabelContainer}>
            <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary.main} />
            <Text style={styles.detailLabel}>Bio</Text>
          </View>
          <Text style={styles.detailValue}>{profile?.bio || 'No bio provided'}</Text>
        </View>
      </View>
    </Animatable.View>
  );

  // Render edit form
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

  // Render my animals section
  const renderMyAnimals = () => (
    <Animatable.View 
      animation="fadeIn" 
      duration={500}
      style={styles.animalsSection}
    >
      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionTitle}>My Listed Animals</Text>
        
        <TouchableOpacity
          style={styles.addAnimalButton}
          onPress={() => navigation.navigate('AddAnimal')}
        >
          <LinearGradient
            colors={theme.colors.gradients.primary}
            style={styles.addAnimalButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addAnimalButtonText}>Add New</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      
      {myAnimals.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="paw-outline" size={48} color={theme.colors.neutral.grey400} />
          <Text style={styles.emptyStateText}>
            You haven't listed any animals for adoption yet.
          </Text>
        </View>
      ) : (
        <View style={styles.animalsGrid}>
          {myAnimals.map(animal => renderAnimalItem(animal))}
        </View>
      )}
    </Animatable.View>
  );

  // Render adopted animals section
  const renderAdoptedAnimals = () => (
    <Animatable.View 
      animation="fadeIn" 
      duration={500}
      style={styles.animalsSection}
    >
      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionTitle}>Animals I've Adopted</Text>
      </View>
      
      {adoptedAnimals.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="heart-outline" size={48} color={theme.colors.neutral.grey400} />
          <Text style={styles.emptyStateText}>
            You haven't adopted any animals yet.
          </Text>
        </View>
      ) : (
        <View style={styles.animalsGrid}>
          {adoptedAnimals.map(animal => renderAnimalItem(animal))}
        </View>
      )}
    </Animatable.View>
  );

  // Render applications section
  const renderApplications = () => (
    <Animatable.View 
      animation="fadeIn" 
      duration={500}
      style={styles.animalsSection}
    >
      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionTitle}>My Applications</Text>
      </View>
      
      {myApplications.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="document-text-outline" size={48} color={theme.colors.neutral.grey400} />
          <Text style={styles.emptyStateText}>
            You haven't submitted any adoption applications yet.
          </Text>
        </View>
      ) : (
        <View style={styles.animalsGrid}>
          {myApplications.map(application => renderApplicationItem(application))}
        </View>
      )}
    </Animatable.View>
  );
  
  // Render profile actions
  const renderProfileActions = () => (
    <View style={styles.profileActionsContainer}>
      <TouchableOpacity
        style={styles.signOutButton}
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
        <LinearGradient
          colors={['#ff6b6b', '#ee5253']}
          style={styles.signOutButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="log-out-outline" size={22} color="#fff" />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // Determine which content to render based on active tab
  const renderTabContent = () => {
    if (editMode) return renderEditForm();
    
    switch (activeTab) {
      case 'info':
        return (
          <>
            {renderProfileInfo()}
            {renderProfileActions()}
          </>
        );
      case 'listed':
        return renderMyAnimals();
      case 'adopted':
        return renderAdoptedAnimals();
      case 'applications':
        return renderApplications();
      default:
        return renderProfileInfo();
    }
  };

  // Create a section for the main content rendering
  const renderMainContent = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContainer,
        { paddingBottom: insets.bottom + theme.spacing.xl }
      ]}
      showsVerticalScrollIndicator={false}
    >
      {renderProfileHeader()}
      {renderTabContent()}
    </ScrollView>
  );

  if (isLoading) {
    return (
      <View style={[componentStyles.loadingContainer, { paddingTop: insets.top }]}>
        <SkeletonLoader variant="profile" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {renderHeader()}
      {renderMainContent()}
    </View>
  );
};

export default ProfileScreen; 