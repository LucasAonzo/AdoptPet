import React from 'react';
import LoadingOverlay from './LoadingOverlay';
import ErrorBoundary from './ErrorBoundary';
import OptimizedImage from './OptimizedImage';
import SkeletonLoader from './SkeletonLoader';
import AnimatedScreenTransition from './AnimatedScreenTransition';
import GradientWrapper from './GradientWrapper';
import CustomGradient from './CustomGradient';

// -- Loading/Animation Components --
export { default as LoadingOverlay } from './LoadingOverlay';
export { default as SkeletonLoader } from './SkeletonLoader';
export { default as AnimatedScreenTransition } from './AnimatedScreenTransition';

// -- UI Components --
export { default as GradientWrapper } from './GradientWrapper';
export { default as CustomGradient } from './CustomGradient';

export {
  ErrorBoundary,
  OptimizedImage
}; 