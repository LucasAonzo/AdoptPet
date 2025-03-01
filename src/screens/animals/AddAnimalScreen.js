import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import AnimalService from '../../services/animalService';
import supabase from '../../config/supabase';
import styles from './AddAnimalScreen.styles';
import { useCreateAnimal, useUpdateAnimal } from '../../hooks/useAnimalMutations';
import { pickImage, formatImageForUpload } from '../../utils/imageUtils';
import * as ImagePicker from 'expo-image-picker';
import debugImagePicker from '../../utils/imagePickerDebug';
import { useFocusEffect } from '@react-navigation/native';
import { LoadingOverlay } from '../../components/common';
import { useModalContext } from '../../components/modals';

const AddAnimalScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { 
    showSuccessModal, 
    showErrorModal,
    showLoadingModal,
    hideModal
  } = useModalContext();
  
  // Create and update animal mutations
  const { mutate: createAnimal, isPending: isCreating } = useCreateAnimal(navigation);
  const { mutate: updateAnimal, isPending: isUpdating } = useUpdateAnimal(navigation);
  
  // Check if we're in edit mode
  const editMode = route.params?.editMode || false;
  const animalToEdit = route.params?.animal || null;
  
  // Initialize form data with default empty values
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    species: '',
    breed: '',
    description: '',
    image_url: '',
    is_adopted: false,
    imageBase64: null,
    hasNewImage: false,
  });

  // Function to reset the form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      species: '',
      breed: '',
      description: '',
      image_url: '',
      is_adopted: false,
      imageBase64: null,
      hasNewImage: false,
    });
    console.log('Form data reset to initial state');
  };

  // Reset form when we navigate to this screen (when it comes into focus)
  // But only reset if not in edit mode
  useFocusEffect(
    React.useCallback(() => {
      // When the screen comes into focus
      if (!editMode) {
        resetForm();
      }
      return () => {
        // When the screen goes out of focus
        // No cleanup needed here
      };
    }, [editMode])
  );

  // Add a dedicated useEffect to initialize form data when in edit mode
  useEffect(() => {
    if (editMode && animalToEdit) {
      console.log('Initializing form data for edit mode:', animalToEdit);
      setFormData({
        name: animalToEdit.name || '',
        age: animalToEdit.age !== undefined ? String(animalToEdit.age) : '',
        species: animalToEdit.species || '',
        breed: animalToEdit.breed || '',
        description: animalToEdit.description || '',
        image_url: animalToEdit.image_url || '',
        is_adopted: animalToEdit.is_adopted || false,
        imageBase64: null,
        hasNewImage: false,
      });
    }
  }, [editMode, animalToEdit]);

  // Log form data changes for debugging
  useEffect(() => {
    if (editMode) {
      console.log('Current form data:', formData);
    }
  }, [formData, editMode]);

  const updateFormField = (field, value) => {
    setFormData(prev => {
      // Special handling for age field - ensure it's stored as a string in the form
      // but will be converted to number when submitted
      if (field === 'age') {
        // Only try to parse as int if there's a value
        return {
          ...prev,
          [field]: value // Store age as string in the form
        };
      } 
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const validateForm = () => {
    if (!formData.name) {
      showErrorModal('Missing Information', 'Please enter a name for the animal');
      return false;
    }
    if (!formData.species) {
      showErrorModal('Missing Information', 'Please enter the animal species');
      return false;
    }
    return true;
  };

  const handleAddAnimal = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    showLoadingModal(editMode ? 'Updating animal...' : 'Creating new animal...');
    
    try {
      // Prepare the animal data without extra image fields
      const animalData = {
        name: formData.name,
        age: formData.age ? parseInt(formData.age, 10) : null, // Convert age string to number
        species: formData.species,
        breed: formData.breed,
        description: formData.description,
        is_adopted: formData.is_adopted,
        image_url: formData.image_url,
      };
      
      // Prepare image data if we have a new image
      const imageData = formData.hasNewImage && formData.imageBase64 
        ? { base64: formData.imageBase64 } 
        : null;
      
      if (editMode && animalToEdit) {
        // Update existing animal
        console.log('Updating animal with ID:', animalToEdit.id);
        console.log('Update data:', animalData);
        
        updateAnimal(
          {
            animalId: animalToEdit.id,
            animalData: animalData,
            imageData: imageData
          },
          {
            onSuccess: (data) => {
              hideModal(); // Hide loading modal
              showSuccessModal('Success', 'Animal updated successfully!', () => {
                // Navigate back to animal detail screen after user acknowledges success
                navigation.goBack();
              });
              // Don't reset form here since we're navigating away
            },
            onError: (error) => {
              hideModal(); // Hide loading modal
              showErrorModal('Error', `Failed to update animal: ${error.message}`);
            }
          }
        );
      } else {
        // Create new animal
        createAnimal(
          {
            animalData: animalData,
            imageData: imageData
          },
          {
            onSuccess: (data) => {
              hideModal(); // Hide loading modal
              // Navigate to the success screen instead of showing a modal
              navigation.navigate('PublicationSuccess', {
                animalId: data.id,
                animalName: data.name
              });
              // Reset form after successful animal creation
              resetForm();
            },
            onError: (error) => {
              hideModal(); // Hide loading modal
              showErrorModal('Error', `Failed to create animal: ${error.message}`);
            }
          }
        );
      }
    } catch (error) {
      console.error('Error:', error);
      hideModal(); // Hide loading modal
      showErrorModal('Error', `Failed to ${editMode ? 'update' : 'create'} animal listing`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image picking using our utility function
  const handleImagePick = async () => {
    try {
      // Debug ImagePicker API
      debugImagePicker();
      
      // First try our utility function
      const result = await pickImage({
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (result) {
        // Store base64 image temporarily
        setFormData(prev => ({
          ...prev,
          imageBase64: result.base64,
          // Keep the original image_url but mark it for update
          image_url: prev.image_url,
          hasNewImage: true
        }));
        return;
      }
      
      // If our utility fails, try direct approach as fallback
      console.log("Falling back to direct ImagePicker implementation");
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        showErrorModal('Permission Required', 'You need to grant camera roll permissions to upload images.');
        return;
      }
      
      // Launch image picker directly
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });
      
      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        const asset = pickerResult.assets[0];
        setFormData(prev => ({
          ...prev,
          imageBase64: asset.base64,
          image_url: prev.image_url,
          hasNewImage: true
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showErrorModal('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Render picked image or placeholder
  const renderImagePreview = () => {
    if (formData.hasNewImage && formData.imageBase64) {
      // Show the newly selected image
      return (
        <View style={styles.imagePreviewContainer}>
          <Image 
            source={{ uri: `data:image/jpeg;base64,${formData.imageBase64}` }} 
            style={styles.imagePreview} 
            resizeMode="cover" 
          />
          <TouchableOpacity 
            style={styles.changeImageButton}
            onPress={handleImagePick}
          >
            <Text style={styles.changeImageText}>Change Image</Text>
          </TouchableOpacity>
        </View>
      );
    } else if (formData.image_url) {
      // Show the existing image
      return (
        <View style={styles.imagePreviewContainer}>
          <Image 
            source={{ uri: formData.image_url }} 
            style={styles.imagePreview} 
            resizeMode="cover" 
          />
          <TouchableOpacity 
            style={styles.changeImageButton}
            onPress={handleImagePick}
          >
            <Text style={styles.changeImageText}>Change Image</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return null;
  };

  return (
    <LinearGradient
      colors={['#ffffff', '#f8f4ff']}
      style={styles.gradientContainer}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {editMode ? 'Edit Animal' : 'Add a New Animal'}
            </Text>
            <Text style={styles.subtitle}>
              {editMode 
                ? 'Update the details of your animal listing' 
                : 'Enter the details of the animal you want to add for adoption'
              }
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="paw-outline" size={22} color="#8e74ae" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter animal name"
                  placeholderTextColor="#aaa"
                  value={formData.name}
                  onChangeText={(text) => updateFormField('name', text)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Species</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="help-buoy-outline" size={22} color="#8e74ae" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Dog, Cat, Bird"
                  placeholderTextColor="#aaa"
                  value={formData.species}
                  onChangeText={(text) => updateFormField('species', text)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Breed</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="information-circle-outline" size={22} color="#8e74ae" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Labrador, Siamese"
                  placeholderTextColor="#aaa"
                  value={formData.breed}
                  onChangeText={(text) => updateFormField('breed', text)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Age</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="calendar-outline" size={22} color="#8e74ae" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter age in years"
                  placeholderTextColor="#aaa"
                  value={formData.age}
                  onChangeText={(text) => updateFormField('age', text)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                <Ionicons name="create-outline" size={22} color="#8e74ae" style={[styles.inputIcon, {alignSelf: 'flex-start', marginTop: 12}]} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter a description of the animal"
                  placeholderTextColor="#aaa"
                  value={formData.description}
                  onChangeText={(text) => updateFormField('description', text)}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {renderImagePreview()}
            {(!formData.image_url && !formData.hasNewImage) && (
              <TouchableOpacity
                style={styles.imageButton}
                onPress={handleImagePick}
              >
                <Ionicons name="image-outline" size={24} color="white" />
                <Text style={styles.imageButtonText}>Add Image</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddAnimal}
              disabled={isLoading || isCreating || isUpdating}
            >
              <LinearGradient
                colors={['#a58fd8', '#8e74ae', '#7d5da7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addButton}
              >
                {isLoading || isCreating || isUpdating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.addButtonText}>
                    {editMode ? 'Update Animal' : 'Add Animal'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default AddAnimalScreen; 