import React, { useState, useEffect, memo } from 'react';
import { StyleSheet, Platform, View, ActivityIndicator, Text, ViewStyle, TextStyle } from 'react-native';
import { Image, ImageProps, ImageSource, ImageStyle, ImageErrorEventData } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { cacheImage, getProgressiveSources } from '../../utils/imageOptimizations';

// Create a custom props interface without extending ImageProps to avoid type conflicts
interface OptimizedImageProps {
  /**
   * Image source URI or require()
   */
  source: string | ImageSource | number;
  
  /**
   * Style object for the image container
   */
  style?: ViewStyle;
  
  /**
   * How the image should fit (cover, contain, fill, etc.)
   */
  contentFit?: ImageProps['contentFit'];
  
  /**
   * Whether to show a loading indicator
   */
  showLoader?: boolean;
  
  /**
   * Blurhash placeholder string
   */
  blurhash?: string;
  
  /**
   * Duration of transition animation in ms
   */
  transitionDuration?: number;
  
  /**
   * Callback when image is loaded
   */
  onLoad?: () => void;
  
  /**
   * Callback when image fails to load
   */
  onError?: (event: ImageErrorEventData) => void;
  
  /**
   * Memoization key for the component
   */
  memoKey?: string;
  
  /**
   * Additional props for the Image component
   */
  imageProps?: Partial<ImageProps>;
}

interface StylesType {
  container: ViewStyle;
  image: ImageStyle;
  loaderContainer: ViewStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
}

/**
 * OptimizedImage component for efficient image loading and rendering
 * 
 * Features:
 * - Automatic image caching
 * - Progressive loading from low to high quality
 * - Blurhash placeholders during loading
 * - Memory and disk caching policy
 * - Transition animations
 * - Loading indicator (optional)
 * - Error handling with fallback
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  contentFit = 'cover',
  showLoader = false,
  blurhash = 'LGF5?xYk^6#M@-5c,1J5@[or[Q6.',
  transitionDuration = 300,
  onLoad,
  onError,
  memoKey,
  imageProps = {},
}) => {
  const [optimizedSource, setOptimizedSource] = useState<ImageSource | number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<boolean>(false);
  
  useEffect(() => {
    let isMounted = true;
    
    const prepareImage = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setLoadError(false);
        
        // Handle different source types
        let imageUri = '';
        if (typeof source === 'string') {
          imageUri = source;
        } else if (source && typeof source === 'object' && 'uri' in source) {
          imageUri = source.uri;
        } else if (typeof source === 'number') {
          // Local require() image, no need for optimization
          setOptimizedSource(source);
          setIsLoading(false);
          return;
        }
        
        if (!imageUri) {
          setLoadError(true);
          setIsLoading(false);
          return;
        }
        
        // Get progressive sources for the image
        const progressiveSources = getProgressiveSources(imageUri);
        
        // First set the low quality version for immediate display
        if (isMounted) {
          setOptimizedSource({ uri: progressiveSources.lowQuality });
        }
        
        // Then cache the high quality version
        const cachedUri = await cacheImage(progressiveSources.highQuality);
        
        if (isMounted) {
          setOptimizedSource({ uri: cachedUri });
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error optimizing image:', error);
        if (isMounted) {
          if (typeof source === 'object' || typeof source === 'number') {
            setOptimizedSource(source as ImageSource | number);
          }
          setLoadError(true);
          setIsLoading(false);
        }
      }
    };
    
    prepareImage();
    
    return () => {
      isMounted = false;
    };
  }, [source, memoKey]);
  
  const handleLoad = (): void => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };
  
  const handleError = (event: ImageErrorEventData): void => {
    setLoadError(true);
    setIsLoading(false);
    if (onError) onError(event);
  };
  
  return (
    <View style={[styles.container, style]}>
      <Image
        source={optimizedSource || source}
        style={styles.image}
        contentFit={contentFit}
        placeholder={{ blurhash }}
        placeholderContentFit={contentFit}
        transition={transitionDuration}
        cachePolicy="memory-disk"
        onLoad={handleLoad}
        onError={handleError}
        {...imageProps}
      />
      
      {showLoader && isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#8e74ae" />
        </View>
      )}
      
      {loadError && (
        <View style={styles.errorContainer}>
          <Ionicons name="image-outline" size={50} color="#aaa" />
          <Text style={styles.errorText}>Image failed to load</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create<StylesType>({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    opacity: 1,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 240, 240, 0.8)',
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  }
});

// Use memo to prevent unnecessary re-renders
export default memo(OptimizedImage); 