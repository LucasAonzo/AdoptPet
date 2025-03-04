import React from 'react';
import CustomGradient from './CustomGradient';
import { ViewProps, ViewStyle } from 'react-native';

interface GradientWrapperProps extends ViewProps {
  /**
   * Array of colors for the gradient
   */
  colors?: string[];
  
  /**
   * Start coordinates for the gradient
   */
  start?: { x: number; y: number };
  
  /**
   * End coordinates for the gradient
   */
  end?: { x: number; y: number };
  
  /**
   * Additional styles for the gradient
   */
  style?: ViewStyle | ViewStyle[];
  
  /**
   * Child components
   */
  children?: React.ReactNode;
}

/**
 * A wrapper component for gradient backgrounds that avoids LinearGradient React reference errors
 * This helps fix issues with "Property 'React' doesn't exist" errors by using a fallback
 */
export const GradientWrapper: React.FC<GradientWrapperProps> = ({ children, ...props }) => {
  return <CustomGradient {...props}>{children}</CustomGradient>;
};

export default GradientWrapper; 