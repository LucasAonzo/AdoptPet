import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';
import { decode } from 'base64-arraybuffer';

/**
 * ImageAsset interface representing the result from ImagePicker
 */
export interface ImageAsset {
  uri: string;
  width: number;
  height: number;
  type?: string;
  fileName?: string;
  fileSize?: number;
  base64?: string;
}

/**
 * Formatted image data for upload
 */
export interface FormattedImage {
  uri: string;
  base64?: string;
  type: string;
  fileName: string;
}

/**
 * Image upload parameters for Supabase
 */
export interface ImageUploadParams {
  bucketName: string;
  fileName: string;
  fileData: ArrayBuffer;
  contentType: string;
  upsert: boolean;
}

/**
 * Requests permission to access the device's media library
 * @returns Whether permission was granted
 */
export const requestMediaLibraryPermission = async (): Promise<boolean> => {
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
 * @param options Additional options for the image picker
 * @returns The selected image or null if canceled/error
 */
export const pickImage = async (options: Partial<ImagePicker.ImagePickerOptions> = {}): Promise<ImageAsset | null> => {
  try {
    // Ensure we have permission
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return null;

    // Default options - completely avoiding mediaTypes that's causing issues
    const defaultOptions: ImagePicker.ImagePickerOptions = {
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
      return result.assets[0] as ImageAsset;
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
 * @param imageAsset The image asset from ImagePicker
 * @returns Formatted image data
 */
export const formatImageForUpload = (imageAsset: ImageAsset | null): FormattedImage | null => {
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
 * @param prefix Prefix for the filename
 * @param id Optional ID to include in the filename
 * @returns Generated filename
 */
export const generateUniqueFileName = (prefix: string = 'image', id: string | null = null): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return id 
    ? `${prefix}_${id}_${timestamp}_${random}.jpg`
    : `${prefix}_${timestamp}_${random}.jpg`;
};

/**
 * Prepares an image for upload to Supabase storage
 * @param imageData The formatted image data
 * @param bucketName The Supabase storage bucket name
 * @param prefix Prefix for the filename
 * @param id Optional ID to include in the filename
 * @returns Upload parameters object
 */
export const prepareImageUpload = (
  imageData: FormattedImage | null, 
  bucketName: string = 'animals', 
  prefix: string = 'animal', 
  id: string | null = null
): ImageUploadParams | null => {
  if (!imageData?.base64) return null;

  return {
    bucketName,
    fileName: generateUniqueFileName(prefix, id),
    fileData: decode(imageData.base64),
    contentType: imageData.type || 'image/jpeg',
    upsert: true
  };
}; 