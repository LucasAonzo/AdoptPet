import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * Custom gradient component that doesn't rely on expo-linear-gradient
 * Used as a fallback when expo-linear-gradient causes React reference errors
 * 
 * @param {Array} colors - Array of colors (only first and last are used in fallback)
 * @param {Object} style - Additional styles for the gradient view
 * @param {Object} children - Child components
 * @param {Object} rest - Additional props
 */
export const CustomGradient = ({ colors = ['#a58fd8', '#8e74ae'], style, children, ...rest }) => {
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