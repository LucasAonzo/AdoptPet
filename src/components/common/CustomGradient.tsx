import React from 'react';
import { View, StyleSheet, ViewStyle, ViewProps } from 'react-native';

interface CustomGradientProps extends ViewProps {
  /**
   * Array of colors (only first and last are used in fallback)
   */
  colors?: string[];
  
  /**
   * Additional styles for the gradient view
   */
  style?: ViewStyle | ViewStyle[];
  
  /**
   * Child components
   */
  children?: React.ReactNode;
}

/**
 * Custom gradient component that doesn't rely on expo-linear-gradient
 * Used as a fallback when expo-linear-gradient causes React reference errors
 */
export const CustomGradient: React.FC<CustomGradientProps> = ({ 
  colors = ['#a58fd8', '#8e74ae'], 
  style, 
  children, 
  ...rest 
}) => {
  // Use the first color as the fallback background color
  const backgroundColor = colors && colors.length > 0 ? colors[0] : '#a58fd8';
  
  return (
    <View 
      style={[
        { backgroundColor },
        style
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

export default CustomGradient; 