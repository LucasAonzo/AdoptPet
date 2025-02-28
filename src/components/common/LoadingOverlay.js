import React from 'react';
import { 
  View, 
  ActivityIndicator, 
  Text,
  Dimensions,
} from 'react-native';
import styles from './LoadingOverlay.styles';

/**
 * LoadingOverlay component
 * Displays a fullscreen loading indicator with optional text
 * 
 * @param {Object} props
 * @param {string} [props.text] - Optional text to display below the spinner
 * @param {string} [props.color] - Spinner color, defaults to purple
 * @param {string} [props.size] - Spinner size ('small' or 'large'), defaults to large
 * @param {number} [props.opacity] - Background opacity, defaults to 0.7
 */
const LoadingOverlay = ({ 
  text,
  color = '#8e74ae',
  size = 'large',
  opacity = 0.7,
}) => {
  return (
    <View style={[
      styles.container, 
      { backgroundColor: `rgba(0, 0, 0, ${opacity})` }
    ]}>
      <View style={styles.loaderContainer}>
        <ActivityIndicator 
          size={size} 
          color={color} 
          style={styles.activityIndicator} 
        />
        {text && <Text style={styles.text}>{text}</Text>}
      </View>
    </View>
  );
};

export default LoadingOverlay; 