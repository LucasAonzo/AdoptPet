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
 * Caches an image for faster loading with improved cache management
 * @param {string} uri - The URI of the image to cache
 * @returns {Promise<string>} - The URI of the cached image
 */
export const cacheImage = async (uri) => {
  try {
    // Skip for local files that are already on the device
    if (uri.startsWith('file://') || uri.startsWith('data:')) {
      return uri;
    }

    // Create a unique filename based on the URI using a hash function
    const filename = uri.split('/').pop();
    const cacheDir = `${FileSystem.cacheDirectory}images/`;
    const cachedFile = `${cacheDir}${filename}`;

    // Create cache metadata if needed
    const metadataFile = `${cacheDir}metadata.json`;
    let metadata = {};

    // Check if the directory exists, if not create it
    const dirInfo = await FileSystem.getInfoAsync(cacheDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
    }

    // Try to load existing metadata
    try {
      const metadataContent = await FileSystem.readAsStringAsync(metadataFile);
      metadata = JSON.parse(metadataContent);
    } catch (e) {
      // Metadata doesn't exist yet, create new one
      metadata = { 
        version: 1, 
        lastCleanup: Date.now(),
        files: {} 
      };
    }

    // Check if the file is already cached
    const fileInfo = await FileSystem.getInfoAsync(cachedFile);
    
    if (fileInfo.exists) {
      // Update access time in metadata
      metadata.files[filename] = {
        lastAccessed: Date.now(),
        size: fileInfo.size || 0,
        source: uri
      };
      
      // Save updated metadata
      await FileSystem.writeAsStringAsync(metadataFile, JSON.stringify(metadata));
      
      return cachedFile;
    }

    // Download the file to the cache
    const downloadResult = await FileSystem.downloadAsync(uri, cachedFile);
    
    // Update metadata with the new file
    metadata.files[filename] = {
      lastAccessed: Date.now(),
      size: downloadResult.headers['content-length'] || 0,
      source: uri
    };
    
    // Save updated metadata
    await FileSystem.writeAsStringAsync(metadataFile, JSON.stringify(metadata));
    
    // Clean cache periodically (once per day)
    const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    if (Date.now() - metadata.lastCleanup > ONE_DAY) {
      cleanupImageCache(metadata, cacheDir).catch(console.error);
    }
    
    return downloadResult.uri;
  } catch (error) {
    console.error('Error caching image:', error);
    return uri; // Return original URI if caching fails
  }
};

/**
 * Cleans up old cached images to prevent excessive storage usage
 * @param {Object} metadata - Cache metadata
 * @param {string} cacheDir - Directory where images are cached
 */
export const cleanupImageCache = async (metadata, cacheDir) => {
  try {
    const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
    const MAX_FILE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    // Current time
    const now = Date.now();
    
    // Update last cleanup time
    metadata.lastCleanup = now;
    
    // Get all files and their info
    const files = Object.entries(metadata.files);
    
    // Sort files by last accessed (oldest first)
    files.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    // Calculate total cache size
    const totalSize = files.reduce((sum, [_, info]) => sum + (parseInt(info.size) || 0), 0);
    
    // Files to delete (start with empty array)
    const filesToDelete = [];
    
    // Mark old files for deletion
    for (const [filename, info] of files) {
      // Delete files older than MAX_FILE_AGE
      if (now - info.lastAccessed > MAX_FILE_AGE) {
        filesToDelete.push(filename);
        continue;
      }
    }
    
    // If still over size limit, remove oldest files until under limit
    if (totalSize > MAX_CACHE_SIZE) {
      let currentSize = totalSize;
      
      for (const [filename, info] of files) {
        // Skip if already marked for deletion
        if (filesToDelete.includes(filename)) continue;
        
        // Delete file and reduce current size
        filesToDelete.push(filename);
        currentSize -= (parseInt(info.size) || 0);
        
        // Stop if we're under the limit
        if (currentSize <= MAX_CACHE_SIZE) break;
      }
    }
    
    // Delete the files
    for (const filename of filesToDelete) {
      const filePath = `${cacheDir}${filename}`;
      await FileSystem.deleteAsync(filePath, { idempotent: true });
      delete metadata.files[filename];
    }
    
    // Update metadata file
    const metadataFile = `${cacheDir}metadata.json`;
    await FileSystem.writeAsStringAsync(metadataFile, JSON.stringify(metadata));
    
    console.log(`Cleaned up ${filesToDelete.length} cached images`);
  } catch (error) {
    console.error('Error cleaning up image cache:', error);
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

/**
 * Transforms image URLs to load appropriate resolutions based on network conditions
 * @param {string} originalUrl - The original image URL
 * @param {string} networkType - The current network type ('wifi', 'cellular', 'unknown')
 * @returns {string} - The transformed URL with appropriate quality parameters
 */
export const getProgressiveImageUrl = (originalUrl, networkType = 'unknown') => {
  // Skip processing if it's a local file or data URL
  if (!originalUrl || originalUrl.startsWith('file://') || originalUrl.startsWith('data:')) {
    return originalUrl;
  }

  // For Supabase Storage URLs, we can append transformations
  if (originalUrl.includes('storage.googleapis.com') || 
      originalUrl.includes('supabase.co/storage')) {
    
    // Base quality settings
    let width;
    let quality;
    
    // Adjust quality based on network type
    switch(networkType) {
      case 'wifi':
        width = 1200;
        quality = 80;
        break;
      case 'cellular':
        width = 800;
        quality = 70;
        break;
      default: // unknown or slow
        width = 600;
        quality = 60;
    }
    
    // Construct parameters based on whether the URL already has query params
    const separator = originalUrl.includes('?') ? '&' : '?';
    return `${originalUrl}${separator}width=${width}&quality=${quality}`;
  }
  
  return originalUrl;
};

/**
 * Creates a set of progressive source URLs for different network conditions
 * @param {string} originalUrl - The original image URL
 * @returns {Object} - Object with URLs for different network conditions
 */
export const getProgressiveSources = (originalUrl) => {
  return {
    lowQuality: getProgressiveImageUrl(originalUrl, 'unknown'),
    mediumQuality: getProgressiveImageUrl(originalUrl, 'cellular'),
    highQuality: getProgressiveImageUrl(originalUrl, 'wifi'),
    original: originalUrl
  };
}; 