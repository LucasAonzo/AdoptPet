import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

/**
 * Optimizes an image from a URI by resizing and compressing it
 * @param {string} uri - The URI of the image to optimize
 * @param {Object} options - Optimization options
 * @param {number} options.width - The target width of the image (default: 600)
 * @param {number} options.height - The target height of the image (default: maintain aspect ratio)
 * @param {number} options.quality - The quality of the resulting image (0-1, default: 0.7)
 * @param {string} options.format - The format of the resulting image ('jpeg' or 'png', default: 'jpeg')
 * @returns {Promise<string>} - The URI of the optimized image
 */
export const optimizeImage = async (
  uri,
  { width = 600, height, quality = 0.7, format = 'jpeg' } = {}
) => {
  try {
    const manipulatorOptions = {
      compress: quality,
      format: ImageManipulator.SaveFormat[format.toUpperCase()],
    };

    const actions = [];
    
    // Only resize if width or height is provided
    if (width || height) {
      actions.push({ 
        resize: { 
          width, 
          height 
        } 
      });
    }

    const result = await ImageManipulator.manipulateAsync(
      uri,
      actions,
      manipulatorOptions
    );

    return result.uri;
  } catch (error) {
    console.error('Error optimizing image:', error);
    return uri; // Return original URI if optimization fails
  }
};

/**
 * Caches an image for faster loading
 * @param {string} uri - The URI of the image to cache
 * @returns {Promise<string>} - The URI of the cached image
 */
export const cacheImage = async (uri) => {
  try {
    // Skip for local files that are already on the device
    if (uri.startsWith('file://') || uri.startsWith('data:')) {
      return uri;
    }

    // Create a unique filename based on the URI
    const filename = uri.split('/').pop();
    const cacheDir = `${FileSystem.cacheDirectory}images/`;
    const cachedFile = `${cacheDir}${filename}`;

    // Check if the directory exists, if not create it
    const dirInfo = await FileSystem.getInfoAsync(cacheDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
    }

    // Check if the file is already cached
    const fileInfo = await FileSystem.getInfoAsync(cachedFile);
    if (fileInfo.exists) {
      return cachedFile;
    }

    // Download the file to the cache
    const downloadResult = await FileSystem.downloadAsync(uri, cachedFile);
    return downloadResult.uri;
  } catch (error) {
    console.error('Error caching image:', error);
    return uri; // Return original URI if caching fails
  }
};

/**
 * Returns configuration options for the FlashList component based on content type
 * @param {string} contentType - The type of content being displayed ('images', 'text', 'mixed')
 * @returns {Object} - Configuration object for FlashList
 */
export const getFlashListConfig = (contentType = 'mixed') => {
  // Base configuration
  const config = {
    estimatedItemSize: 100,
    overrideItemLayout: undefined,
    keyExtractor: (item, index) => item.id?.toString() || index.toString(),
  };

  // Adjust configuration based on content type
  switch (contentType) {
    case 'images':
      config.estimatedItemSize = 200;
      break;
    case 'text':
      config.estimatedItemSize = 80;
      break;
    default:
      config.estimatedItemSize = 120;
  }

  return config;
};

/**
 * Determines the appropriate image quality based on network conditions
 * @returns {Object} - Image quality settings based on network condition
 */
export const getAdaptiveQuality = async () => {
  // Default values for when network info is not available
  const defaultQuality = {
    quality: 0.7,
    width: 600,
    format: 'jpeg',
  };

  // On web, always return default quality
  if (Platform.OS === 'web') {
    return defaultQuality;
  }

  try {
    // In a real implementation, you would use NetInfo or similar 
    // to check actual network conditions
    // For this example, we're just returning the default
    return defaultQuality;
  } catch (error) {
    console.error('Error getting adaptive quality:', error);
    return defaultQuality;
  }
}; 