import React, { useState, useEffect, memo } from 'react';
import { StyleSheet, Platform, View, ActivityIndicator, Text } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { cacheImage, getProgressiveSources } from '../../utils/imageOptimizations';

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
 * 
 * @param {Object} props - Component props
 * @param {string|Object} props.source - Image source URI or require()
 * @param {Object} props.style - Style object for the image
 * @param {string} props.contentFit - How the image should fit (cover, contain, fill, etc.)
 * @param {boolean} props.showLoader - Whether to show a loading indicator
 * @param {string} props.blurhash - Blurhash placeholder string
 * @param {number} props.transitionDuration - Duration of transition animation in ms
 * @param {function} props.onLoad - Callback when image is loaded
 * @param {function} props.onError - Callback when image fails to load
 * @param {Object} props.imageProps - Additional props for the Image component
 * @param {string} props.memoKey - Memoization key for the component
 */
const OptimizedImage = ({
  source,
  style,
  contentFit = 'cover',
  showLoader = false,
  blurhash = 'LGF5?xYk^6#M@-5c,1J5@[or[Q6.',
  transitionDuration = 300,
  onLoad,
  onError,
  memoKey,
  ...imageProps
}) => {
  const [optimizedSource, setOptimizedSource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  
  useEffect(() => {
    let isMounted = true;
    
    const prepareImage = async () => {
      try {
        setIsLoading(true);
        setLoadError(false);
        
        // Handle different source types
        let imageUri = '';
        if (typeof source === 'string') {
          imageUri = source;
        } else if (source && source.uri) {
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
          setOptimizedSource(source);
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
  
  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };
  
  const handleError = (error) => {
    setLoadError(true);
    setIsLoading(false);
    if (onError) onError(error);
  };
  
  return (
    <View style={[styles.container, style]}>
      <Image
        source={optimizedSource || source}
        style={[styles.image, { opacity: loadError ? 0.5 : 1 }]}
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

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
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