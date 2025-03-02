import React from 'react';
import LoadingOverlay from './LoadingOverlay';
import AnimalDetailSkeleton from './AnimalDetailSkeleton';
import AnimalCardSkeleton from './AnimalCardSkeleton';
import MotiTransitions from './MotiTransition';
import SimpleAnimatedSkeleton from './SimpleAnimatedSkeleton';
import ErrorBoundary from './ErrorBoundary';

// We're exporting two sets of skeletons:
// 1. Original Moti skeletons (if Reanimated is working)
// 2. Simple animated skeletons (as a fallback)
export {
  LoadingOverlay,
  AnimalDetailSkeleton,
  AnimalCardSkeleton,
  ErrorBoundary
};

// Export simple skeletons that don't depend on Reanimated
export const {
  SkeletonBox,
  SimpleAnimalDetailSkeleton,
  SimpleAnimalCardSkeleton
} = SimpleAnimatedSkeleton;

// Re-export all Moti animations
export const {
  MotiTransition,
  MotiStaggerContainer,
  MotiFadeIn,
  MotiSlideUp,
  MotiSlideRight
} = MotiTransitions; 