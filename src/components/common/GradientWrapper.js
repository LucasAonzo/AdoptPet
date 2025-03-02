import React from 'react';
import CustomGradient from './CustomGradient';

/**
 * A wrapper component for gradient backgrounds that avoids LinearGradient React reference errors
 * This helps fix issues with "Property 'React' doesn't exist" errors by using a fallback
 */
export const GradientWrapper = ({ children, ...props }) => {
  return <CustomGradient {...props}>{children}</CustomGradient>;
};

export default GradientWrapper; 