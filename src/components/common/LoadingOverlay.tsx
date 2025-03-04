import React from 'react';
import { 
  View, 
  Text,
  Dimensions,
} from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import styles from './LoadingOverlay.styles';

const { width, height } = Dimensions.get('window');

// Define types for loading indicators
type LoadingIndicatorType = 'spinner' | 'dots' | 'pulse' | 'paw';

// Define interfaces for props
interface LoadingOverlayProps {
  /**
   * Optional text to display below the spinner
   */
  text?: string;
  
  /**
   * Loading indicator type
   */
  type?: LoadingIndicatorType;
  
  /**
   * Gradient colors for the loading indicator
   */
  colors?: string[];
  
  /**
   * Background opacity
   */
  opacity?: number;
}

interface IndicatorProps {
  /**
   * Color for single-color indicators
   */
  color: string;
}

interface DotsIndicatorProps {
  /**
   * Array of colors for the dots
   */
  colors: string[];
}

/**
 * Modern LoadingOverlay component
 * Displays a fullscreen animated loading indicator with optional text
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  text,
  type = 'spinner',
  colors = ['#a58fd8', '#8e74ae', '#7d5da7'],
  opacity = 0.8,
}) => {
  return (
    <View style={[
      styles.container, 
      { backgroundColor: `rgba(0, 0, 0, ${opacity})` }
    ]}>
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 300 }}
        style={styles.loaderContainer}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,1)']}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {renderLoadingIndicator(type, colors)}
          
          {text && (
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 300, delay: 200 }}
            >
              <Text style={styles.text}>{text}</Text>
            </MotiView>
          )}
        </LinearGradient>
      </MotiView>
    </View>
  );
};

const renderLoadingIndicator = (type: LoadingIndicatorType, colors: string[]) => {
  switch (type) {
    case 'dots':
      return <DotsIndicator colors={colors} />;
    case 'pulse':
      return <PulseIndicator color={colors[0]} />;
    case 'paw':
      return <PawIndicator color={colors[0]} />;
    case 'spinner':
    default:
      return <SpinnerIndicator color={colors[0]} />;
  }
};

// Spinning dots indicator
const DotsIndicator: React.FC<DotsIndicatorProps> = ({ colors }) => (
  <View style={styles.dotsContainer}>
    {[0, 1, 2].map((index) => (
      <MotiView
        key={index}
        from={{ opacity: 0.4, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: 'timing',
          duration: 800,
          loop: true,
          delay: index * 150,
          repeatReverse: true,
        }}
        style={[
          styles.dot, 
          { backgroundColor: colors[index % colors.length] }
        ]}
      />
    ))}
  </View>
);

// Pulsing circle indicator
const PulseIndicator: React.FC<IndicatorProps> = ({ color }) => (
  <View style={styles.pulseContainer}>
    <MotiView
      from={{ opacity: 1, scale: 0.8 }}
      animate={{ opacity: 0, scale: 1.5 }}
      transition={{
        type: 'timing',
        duration: 1500,
        loop: true,
      }}
      style={[styles.pulse, { borderColor: color }]}
    />
    <MotiView
      from={{ opacity: 1, scale: 0.6 }}
      animate={{ opacity: 0, scale: 1.2 }}
      transition={{
        type: 'timing',
        duration: 1500,
        loop: true,
        delay: 400,
      }}
      style={[styles.pulse, { borderColor: color }]}
    />
    <View style={[styles.pulseCenter, { backgroundColor: color }]} />
  </View>
);

// Spinning paw indicator (custom)
const PawIndicator: React.FC<IndicatorProps> = ({ color }) => (
  <MotiView
    from={{ rotate: '0deg' }}
    animate={{ rotate: '360deg' }}
    transition={{
      type: 'timing',
      duration: 1500,
      loop: true,
    }}
    style={styles.pawContainer}
  >
    <Ionicons name="paw" size={40} color={color} />
  </MotiView>
);

// Classic spinner with improved animation
const SpinnerIndicator: React.FC<IndicatorProps> = ({ color }) => (
  <MotiView
    from={{ rotate: '0deg' }}
    animate={{ rotate: '360deg' }}
    transition={{
      type: 'timing',
      duration: 1000,
      loop: true,
      repeatReverse: false,
    }}
    style={styles.spinnerContainer}
  >
    <Ionicons name="reload-outline" size={40} color={color} />
  </MotiView>
);

export default LoadingOverlay; 