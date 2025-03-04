import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { optimizeImage, cacheImage, getAdaptiveQuality } from '../utils/imageOptimizations';

/**
 * Image picker options interface
 */
interface ImagePickerOptions {
  allowsEditing?: boolean;
  pickerOptions?: ImagePicker.ImagePickerOptions;
  optimizationOptions?: OptimizationOptions;
}

/**
 * Image optimization options interface
 */
interface OptimizationOptions {
  quality?: number;
  width?: number;
  height?: number;
  format?: 'jpeg' | 'png';
  [key: string]: any;
}

/**
 * Image optimization hook return type
 */
interface ImageOptimizationHook {
  pickAndOptimizeImage: (options?: ImagePickerOptions) => Promise<string | null>;
  optimizeExistingImage: (uri: string, options?: OptimizationOptions) => Promise<string | null>;
  isProcessing: boolean;
  progress: number;
}

/**
 * Type for the optimizeImage function parameters
 */
interface OptimizeImageOptions {
  quality?: number;
  width?: number;
  height?: number;
  format?: 'jpeg' | 'png';
}

/**
 * Custom hook for handling image picking and optimization
 * @returns Methods and state for image optimization
 */
export default function useImageOptimization(): ImageOptimizationHook {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  /**
   * Pick an image from the device's library and optimize it
   * @param options - Options for picking and optimizing the image
   * @returns The optimized image URI or null if cancelled
   */
  const pickAndOptimizeImage = async (options: ImagePickerOptions = {}): Promise<string | null> => {
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
      const adaptiveSettings = await getAdaptiveQuality();
      setProgress(0.6);

      // Ensure the format from adaptiveSettings is compatible with our type
      const qualitySettings: OptimizeImageOptions = {
        quality: adaptiveSettings.quality,
        width: adaptiveSettings.width,
        format: (adaptiveSettings.format === 'jpeg' || adaptiveSettings.format === 'png') 
          ? adaptiveSettings.format 
          : 'jpeg'
      };

      // Optimize the image
      const optimizationOptions: OptimizeImageOptions = {
        ...qualitySettings,
        ...(options.optimizationOptions as OptimizeImageOptions),
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
   * @param uri - The URI of the image to optimize
   * @param options - Optimization options
   * @returns The optimized image URI or null if failed
   */
  const optimizeExistingImage = async (uri: string, options: OptimizationOptions = {}): Promise<string | null> => {
    try {
      setIsProcessing(true);
      setProgress(0.3);

      // Get adaptive quality settings based on network conditions
      const adaptiveSettings = await getAdaptiveQuality();
      setProgress(0.5);

      // Ensure the format from adaptiveSettings is compatible with our type
      const qualitySettings: OptimizeImageOptions = {
        quality: adaptiveSettings.quality,
        width: adaptiveSettings.width,
        format: (adaptiveSettings.format === 'jpeg' || adaptiveSettings.format === 'png') 
          ? adaptiveSettings.format 
          : 'jpeg'
      };

      // Optimize the image
      const optimizationOptions: OptimizeImageOptions = {
        ...qualitySettings,
        ...(options as OptimizeImageOptions),
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