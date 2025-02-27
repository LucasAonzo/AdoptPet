import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import supabase from '../../config/supabase';
import defaultAvatarBase64 from '../../../assets/defaultAvatar';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    bio: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [myAnimals, setMyAnimals] = useState([]);
  const [adoptedAnimals, setAdoptedAnimals] = useState([]);

  useEffect(() => {
    fetchUserData();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchUserData();
    });
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !currentUser) {
        throw new Error('User not authenticated');
      }
      
      setUser(currentUser);
      
      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }
      
      if (profileData) {
        setProfile(profileData);
        setFormData({
          name: profileData.name || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          bio: profileData.bio || '',
        });
      }
      
      // Get animals posted by user
      const { data: postedAnimals, error: postedError } = await supabase
        .from('animals')
        .select('*')
        .eq('user_id', currentUser.id);
      
      if (postedError) throw postedError;
      setMyAnimals(postedAnimals || []);
      
      // Get animals adopted by user - filtering client-side for now
      // We'll assume animals where is_adopted = true and the current user has created are their adopted animals
      // In a full implementation, you'd have a separate adoptions table
      const { data: allAnimals, error: allAnimalsError } = await supabase
        .from('animals')
        .select('*')
        .eq('is_adopted', true);
      
      if (allAnimalsError) throw allAnimalsError;
      // For now, we'll just show adopted animals (assuming the current user's animals that are marked as adopted)
      const adoptedByCurrentUser = allAnimals ? allAnimals.filter(animal => 
        animal.user_id === currentUser.id && animal.is_adopted
      ) : [];
      setAdoptedAnimals(adoptedByCurrentUser);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

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

  const uploadProfileImage = async () => {
    if (!profileImage?.base64) return null;
    
    try {
      const fileName = `profile_${user.id}_${Date.now()}.jpg`;
      const contentType = 'image/jpeg';
      const base64FileData = profileImage.base64;
      
      const { data, error } = await supabase.storage
        .from('profile_images')
        .upload(fileName, decode(base64FileData), {
          contentType,
          upsert: true,
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile_images')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  };

  const handleSaveProfile = async () => {
    try {
      setUpdating(true);
      
      let profileImageUrl = profile?.avatar_url;
      
      // Upload new profile image if selected
      if (profileImage) {
        profileImageUrl = await uploadProfileImage();
      }
      
      // Update profile in database
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          bio: formData.bio,
          avatar_url: profileImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Refresh profile data
      await fetchUserData();
      
      setEditMode(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
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

  if (loading) {
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
                <Text style={styles.userEmail}>{user?.email}</Text>
                
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
                disabled={updating}
              >
                <LinearGradient
                  colors={['#a58fd8', '#8e74ae', '#7d5da7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButtonGradient}
                >
                  {updating ? (
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
                <Text style={styles.detailValue}>{user?.email}</Text>
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
          <Text style={styles.sectionTitle}>My Animals</Text>
          
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
          <Text style={styles.sectionTitle}>Adopted Animals</Text>
          
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
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f4ff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8e74ae',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#8e74ae',
    overflow: 'hidden',
    backgroundColor: '#E8E0FF',
    shadowColor: '#8e74ae',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  editImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(142, 116, 174, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8e74ae',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8e74ae',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 25,
    backgroundColor: '#E0E0E0',
  },
  editNameContainer: {
    marginBottom: 10,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  editNameInput: {
    backgroundColor: '#F8F6FB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E0FF',
    padding: 10,
    fontSize: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  editButton: {
    width: '60%',
  },
  editButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#8e74ae',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  editActionButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelButton: {
    width: '45%',
    borderWidth: 1,
    borderColor: '#8e74ae',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#8e74ae',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    width: '45%',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#8e74ae',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#8e74ae',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8e74ae',
    marginBottom: 20,
  },
  detailsContainer: {
    paddingHorizontal: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0eaf7',
  },
  detailIconLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
    marginRight: 10,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginLeft: 10,
  },
  detailValue: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    flexWrap: 'wrap',
    paddingRight: 5,
  },
  editDetailsContainer: {
    marginTop: 5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F6FB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E0FF',
    shadowColor: '#8e74ae',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
  },
  inputIcon: {
    marginLeft: 15,
    marginRight: 5,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#444',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  animalsSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#8e74ae',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  addAnimalButton: {
    width: '70%',
    marginTop: 10,
  },
  addAnimalButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#8e74ae',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  addAnimalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  animalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  animalCard: {
    width: '48%',
    backgroundColor: '#F8F6FB',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#8e74ae',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  animalImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#E8E0FF',
  },
  animalInfo: {
    padding: 10,
  },
  animalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8e74ae',
    marginBottom: 4,
  },
  animalBreed: {
    fontSize: 12,
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#8e74ae',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    backgroundColor: 'rgba(142, 116, 174, 0.05)',
  },
  logoutButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#8e74ae',
  },
});

export default ProfileScreen; 