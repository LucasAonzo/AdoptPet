import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { optimizeImage, cacheImage, getAdaptiveQuality } from '../utils/imageOptimizations';

/**
 * Custom hook for handling image picking and optimization
 * @returns {Object} - Methods and state for image optimization
 */
export default function useImageOptimization() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  /**
   * Pick an image from the device's library and optimize it
   * @param {Object} options - Options for picking and optimizing the image
   * @returns {Promise<string|null>} - The optimized image URI or null if cancelled
   */
  const pickAndOptimizeImage = async (options = {}) => {
    try {
      setIsProcessing(true);
      setProgress(0.1);

      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access media library was denied');
        setIsProcessing(false);
        return null;
      }

      // Pick the image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? true,
        quality: 1, // Get the full quality image, we'll optimize it later
        ...options.pickerOptions,
      });

      setProgress(0.4);

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setIsProcessing(false);
        return null;
      }

      // Get adaptive quality settings based on network conditions
      const qualitySettings = await getAdaptiveQuality();
      setProgress(0.6);

      // Optimize the image
      const optimizationOptions = {
        ...qualitySettings,
        ...options.optimizationOptions,
      };

      const uri = result.assets[0].uri;
      const optimizedUri = await optimizeImage(uri, optimizationOptions);
      setProgress(0.8);

      // Cache the optimized image
      const cachedUri = await cacheImage(optimizedUri);
      setProgress(1);

      setIsProcessing(false);
      return cachedUri;
    } catch (error) {
      console.error('Error picking and optimizing image:', error);
      setIsProcessing(false);
      return null;
    }
  };

  /**
   * Optimize an existing image URI
   * @param {string} uri - The URI of the image to optimize
   * @param {Object} options - Optimization options
   * @returns {Promise<string|null>} - The optimized image URI or null if failed
   */
  const optimizeExistingImage = async (uri, options = {}) => {
    try {
      setIsProcessing(true);
      setProgress(0.3);

      // Get adaptive quality settings based on network conditions
      const qualitySettings = await getAdaptiveQuality();
      setProgress(0.5);

      // Optimize the image
      const optimizationOptions = {
        ...qualitySettings,
        ...options,
      };

      const optimizedUri = await optimizeImage(uri, optimizationOptions);
      setProgress(0.8);

      // Cache the optimized image
      const cachedUri = await cacheImage(optimizedUri);
      setProgress(1);

      setIsProcessing(false);
      return cachedUri;
    } catch (error) {
      console.error('Error optimizing existing image:', error);
      setIsProcessing(false);
      return null;
    }
  };

  return {
    pickAndOptimizeImage,
    optimizeExistingImage,
    isProcessing,
    progress,
  };
} 