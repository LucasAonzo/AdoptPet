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
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import AnimalService from '../../services/animalService';
import supabase from '../../config/supabase';
import styles from './AddAnimalScreen.styles';
import { useCreateAnimal, useUpdateAnimal } from '../../hooks/useAnimalMutations';
import { pickImage, formatImageForUpload, ImageAsset } from '../../utils/imageUtils';
import * as ImagePicker from 'expo-image-picker';
import debugImagePicker from '../../utils/imagePickerDebug';
import { useFocusEffect } from '@react-navigation/native';
import { LoadingOverlay } from '../../components/common';
import { useModalContext } from '../../components/modals';
import { NavigationProp, RouteProp, ParamListBase } from '@react-navigation/native';
import { Animal, AnimalSpecies, AnimalStatus } from '../../types/animal';

// Define the navigation stack param list
interface RootStackParamList extends ParamListBase {
  AddAnimal: {
    editMode?: boolean;
    animal?: Animal;
  };
  PublicationSuccess: {
    animal: Animal;
    editMode: boolean;
  };
  // Add other routes as needed
}

interface AddAnimalScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'AddAnimal'>;
}

// Form data interface
interface AnimalFormData {
  name: string;
  age: string;
  species: string;
  breed: string;
  description: string;
  imageUrls: string[];
  status: string;
  imageBase64: string | null;
  hasNewImage: boolean;
}

// Matches the AnimalData structure from useAnimalMutations.ts
interface AnimalData {
  name: string;
  species: string;
  breed?: string;
  age?: number;
  description?: string;
  image_url?: string;
  user_id?: string;
  status?: string;
}

const AddAnimalScreen: React.FC<AddAnimalScreenProps> = ({ navigation, route }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
  const [formData, setFormData] = useState<AnimalFormData>({
    name: '',
    age: '',
    species: '',
    breed: '',
    description: '',
    imageUrls: [],
    status: 'available',
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
      imageUrls: [],
      status: 'available',
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
        imageUrls: animalToEdit.imageUrls || [],
        status: animalToEdit.status || 'available',
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

  const updateFormField = (field: keyof AnimalFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
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

  const handleAddAnimal = async (): Promise<void> => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    showLoadingModal(editMode ? 'Updating animal...' : 'Creating new animal...');
    
    try {
      // Create data object to send to the server
      // Convert age from string to number
      const animalData: AnimalData = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed || '',
        description: formData.description || '',
        // Convert age to number or undefined if empty string
        age: formData.age ? parseInt(formData.age, 10) : undefined,
        status: formData.status,
      };
      
      // Handle image upload if there's a new image
      if (formData.hasNewImage && formData.imageBase64) {
        try {
          console.log('Uploading image...');
          
          // Create an ImageAsset object from the imageBase64 URI
          const imageAsset: ImageAsset = {
            uri: formData.imageBase64,
            width: 0,
            height: 0
          };
          
          // Format the image data for upload
          const formattedImage = formatImageForUpload(imageAsset);
          
          // Create a unique filename based on timestamp and animal name
          const timestamp = new Date().getTime();
          const cleanedName = formData.name.replace(/\s+/g, '_').toLowerCase();
          const filename = `${cleanedName}_${timestamp}.jpg`;
          
          // Upload the image to Supabase storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('animals')
            .upload(`public/${filename}`, formattedImage as any, {
              contentType: 'image/jpeg'
            });
            
          if (uploadError) {
            console.error('Error uploading image:', uploadError);
            hideModal();
            setIsLoading(false);
            showErrorModal('Upload Failed', `Failed to upload image: ${uploadError.message}`);
            return;
          }
          
          // Get the public URL for the uploaded image
          const { data: urlData } = await supabase.storage
            .from('animals')
            .getPublicUrl(`public/${filename}`);
            
          // Add the image URL to the animal data
          if (urlData?.publicUrl) {
            animalData.image_url = urlData.publicUrl;
          }
          
        } catch (error) {
          console.error('Error in image upload process:', error);
          hideModal();
          setIsLoading(false);
          showErrorModal('Error', `Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
          return;
        }
      } else if (formData.imageUrls && formData.imageUrls.length > 0) {
        // Use the first image URL from the array if there's no new image
        animalData.image_url = formData.imageUrls[0];
      }
      
      if (editMode && animalToEdit) {
        // Update existing animal
        console.log('Updating animal with data:', animalData);
        updateAnimal({ 
          animalId: animalToEdit.id,
          animalData 
        });
      } else {
        // Create new animal
        console.log('Creating new animal with data:', animalData);
        createAnimal({
          animalData
        });
      }
      
      // Note: The navigation happens in the useCreateAnimal/useUpdateAnimal hooks
      // after successful mutation
      
    } catch (error) {
      console.error('Error saving animal:', error);
      hideModal();
      setIsLoading(false);
      showErrorModal('Error', `Failed to save animal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleImagePick = async (): Promise<void> => {
    try {
      console.log('Attempting to pick an image...');
      
      // Request permission to access media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        showErrorModal('Permission Denied', 'We need access to your photo library to upload an image');
        return;
      }
      
      // Get device & permission debug info
      const debugInfo = await debugImagePicker();
      console.log('Image picker debug info:', debugInfo);
      
      // Launch image picker
      const result = await pickImage();
      
      if (!result) {
        console.log('No image selected');
        return;
      }
      
      // Update form data with the image details
      setFormData(prev => ({
        ...prev,
        imageBase64: result.uri,
        hasNewImage: true
      }));
    } catch (error) {
      console.error('Error picking image:', error);
      showErrorModal('Error', `Failed to select image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const renderImagePreview = (): React.ReactNode => {
    if (formData.imageBase64) {
      // Show the selected image
      return (
        <View style={styles.imagePreviewContainer}>
          <Image 
            source={{ uri: formData.imageBase64 }} 
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
    } else if (formData.imageUrls && formData.imageUrls.length > 0) {
      // Show the existing image
      return (
        <View style={styles.imagePreviewContainer}>
          <Image 
            source={{ uri: formData.imageUrls[0] }} 
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
                  keyboardType="numeric"
                  value={formData.age}
                  onChangeText={(text) => updateFormField('age', text)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                <Ionicons 
                  name="document-text-outline" 
                  size={22} 
                  color="#8e74ae" 
                  style={[styles.inputIcon, { marginTop: 15 }]} 
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={5}
                  placeholder="Describe the animal and any special notes"
                  placeholderTextColor="#aaa"
                  value={formData.description}
                  onChangeText={(text) => updateFormField('description', text)}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.imageButton}
              onPress={handleImagePick}
            >
              <Ionicons name="image-outline" size={22} color="white" />
              <Text style={styles.imageButtonText}>
                {(formData.imageUrls && formData.imageUrls.length > 0) || formData.imageBase64 
                  ? 'Change Image' 
                  : 'Add Image'
                }
              </Text>
            </TouchableOpacity>

            {renderImagePreview()}

            <LinearGradient
              colors={['#9C84BE', '#8e74ae']}
              style={styles.addButton}
            >
              <TouchableOpacity
                onPress={handleAddAnimal}
                disabled={isLoading || isCreating || isUpdating}
                style={{ width: '100%', alignItems: 'center' }}
              >
                <Text style={styles.addButtonText}>
                  {isLoading || isCreating || isUpdating 
                    ? (editMode ? 'Updating...' : 'Creating...') 
                    : (editMode ? 'Update Animal' : 'Add Animal')
                  }
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default AddAnimalScreen; 