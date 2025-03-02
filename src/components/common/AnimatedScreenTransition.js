import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * AnimatedScreenTransition - A component for creating smooth animated transitions between screens
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the transition should be visible
 * @param {string} props.type - Type of animation ('fade', 'zoom', 'slideUp', 'slideDown')
 * @param {number} props.duration - Duration of the animation in milliseconds
 * @param {Array} props.colors - Array of colors for the gradient background
 * @param {Object} props.style - Additional style for the container
 * @param {Object} props.gradientStyle - Additional style for the gradient
 * @param {Object} props.contentStyle - Additional style for the content container
 * @param {React.ReactNode} props.children - Content to display in the transition
 */
const AnimatedScreenTransition = ({
  visible = false,
  type = 'fade',
  duration = 800,
  colors = ['#8e74ae', '#a58fd8'],
  style,
  gradientStyle,
  contentStyle,
  children,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const translateY = useRef(new Animated.Value(100)).current;
  const animationRef = useRef(null);

  useEffect(() => {
    if (visible) {
      // Reset animation values
      opacity.setValue(0);
      
      if (type === 'zoom') {
        scale.setValue(0.9);
      } else if (type === 'slideUp') {
        translateY.setValue(100);
      } else if (type === 'slideDown') {
        translateY.setValue(-100);
      }
      
      // Configure animations
      const animations = [
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ];
      
      if (type === 'zoom') {
        animations.push(
          Animated.timing(scale, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          })
        );
      } else if (type === 'slideUp' || type === 'slideDown') {
        animations.push(
          Animated.timing(translateY, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          })
        );
      }
      
      // Start animations
      animationRef.current = Animated.parallel(animations);
      animationRef.current.start();
    } else {
      // Hide animation
      if (animationRef.current) {
        animationRef.current.stop();
      }
      
      animationRef.current = Animated.timing(opacity, {
        toValue: 0,
        duration: duration / 2,
        useNativeDriver: true,
      });
      
      animationRef.current.start();
    }
    
    // Cleanup function to stop animations when component unmounts
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [visible, type, duration, opacity, scale, translateY]);

  if (!visible) return null;

  // Configure transform style based on animation type
  let animatedStyle = { opacity };
  
  if (type === 'zoom') {
    animatedStyle.transform = [{ scale }];
  } else if (type === 'slideUp' || type === 'slideDown') {
    animatedStyle.transform = [{ translateY }];
  }

  try {
    return (
      <View style={[styles.container, style]}>
        <LinearGradient
          colors={colors}
          style={[styles.gradient, gradientStyle]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View style={[styles.content, animatedStyle, contentStyle]}>
            {children}
          </Animated.View>
        </LinearGradient>
      </View>
    );
  } catch (error) {
    console.error('Error rendering AnimatedScreenTransition:', error);
    return null; // Fail gracefully
  }
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AnimatedScreenTransition; 