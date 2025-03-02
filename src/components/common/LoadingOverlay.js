import React, { useEffect } from 'react';
import { 
  View, 
  Text,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

/**
 * Modern LoadingOverlay component
 * Displays a fullscreen animated loading indicator with optional text
 * 
 * @param {Object} props
 * @param {string} [props.text] - Optional text to display below the spinner
 * @param {string} [props.type] - Loading indicator type ('spinner', 'dots', 'pulse', 'paw'), defaults to spinner
 * @param {string[]} [props.colors] - Gradient colors for the loading indicator
 * @param {number} [props.opacity] - Background opacity, defaults to 0.8
 */
const LoadingOverlay = ({ 
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

const renderLoadingIndicator = (type, colors) => {
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
const DotsIndicator = ({ colors }) => (
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
const PulseIndicator = ({ color }) => (
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
const PawIndicator = ({ color }) => (
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
const SpinnerIndicator = ({ color }) => (
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

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 999,
    top: 0,
    left: 0,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(5px)',
  },
  loaderContainer: {
    overflow: 'hidden',
    width: 150,
    height: 150,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  gradientBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
  },
  // Dots indicator styles
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    margin: 5,
  },
  // Pulse indicator styles
  pulseContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulse: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 30,
    borderWidth: 3,
  },
  pulseCenter: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  // Paw indicator styles
  pawContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Spinner indicator styles
  spinnerContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingOverlay; 