import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';
import { decode } from 'base64-arraybuffer';

/**
 * Requests permission to access the device's media library
 * @returns {Promise<boolean>} - Whether permission was granted
 */
export const requestMediaLibraryPermission = async () => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Sorry, we need camera roll permissions to upload images.'
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error requesting media library permission:', error);
    return false;
  }
};

/**
 * Opens the image picker to select an image from the device
 * @param {Object} options - Additional options for the image picker
 * @returns {Promise<Object|null>} - The selected image or null if canceled/error
 */
export const pickImage = async (options = {}) => {
  try {
    // Ensure we have permission
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return null;

    // Default options - completely avoiding mediaTypes that's causing issues
    const defaultOptions = {
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    };

    // Launch image picker with merged options
    const result = await ImagePicker.launchImageLibraryAsync({
      ...defaultOptions,
      ...options,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    Alert.alert('Error', 'Failed to pick image. Please try again.');
    return null;
  }
};

/**
 * Formats an image for display and upload
 * @param {Object} imageAsset - The image asset from ImagePicker
 * @returns {Object} - Formatted image data
 */
export const formatImageForUpload = (imageAsset) => {
  if (!imageAsset) return null;
  
  return {
    uri: imageAsset.uri,
    base64: imageAsset.base64,
    type: imageAsset.type || 'image/jpeg',
    fileName: imageAsset.fileName || `image_${Date.now()}.jpg`,
  };
};

/**
 * Generates a unique filename for an image
 * @param {string} prefix - Prefix for the filename
 * @param {string} id - Optional ID to include in the filename
 * @returns {string} - Generated filename
 */
export const generateUniqueFileName = (prefix = 'image', id = null) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return id 
    ? `${prefix}_${id}_${timestamp}_${random}.jpg`
    : `${prefix}_${timestamp}_${random}.jpg`;
};

/**
 * Prepares an image for upload to Supabase storage
 * @param {Object} imageData - The formatted image data
 * @param {string} bucketName - The Supabase storage bucket name
 * @param {string} prefix - Prefix for the filename
 * @param {string} id - Optional ID to include in the filename
 * @returns {Object} - Upload parameters object
 */
export const prepareImageUpload = (imageData, bucketName = 'animals', prefix = 'animal', id = null) => {
  if (!imageData?.base64) return null;

  return {
    bucketName,
    fileName: generateUniqueFileName(prefix, id),
    fileData: decode(imageData.base64),
    contentType: imageData.type || 'image/jpeg',
    upsert: true
  };
}; 