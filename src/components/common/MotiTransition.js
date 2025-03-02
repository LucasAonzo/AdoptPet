import React from 'react';
import { StyleSheet } from 'react-native';
import { MotiView } from 'moti';

export const MotiTransition = ({ 
  children, 
  style,
  from = { opacity: 0, translateY: 20 },
  animate = { opacity: 1, translateY: 0 },
  transition = { type: 'timing', duration: 350 },
  delay = 0
}) => {
  return (
    <MotiView
      from={from}
      animate={animate}
      transition={{
        ...transition,
        delay
      }}
      style={style}
    >
      {children}
    </MotiView>
  );
};

// Staggered animation container (for lists)
export const MotiStaggerContainer = ({ 
  children, 
  style,
  initialDelay = 300
}) => {
  return (
    <MotiView
      style={[styles.container, style]}
      // This is just a container, so we don't animate it
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        return React.cloneElement(child, {
          delay: initialDelay + (index * 100) // Stagger by 100ms per child
        });
      })}
    </MotiView>
  );
};

// Fade-in animation
export const MotiFadeIn = ({ 
  children, 
  style,
  duration = 350,
  delay = 0
}) => {
  return (
    <MotiTransition
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: 'timing', duration }}
      delay={delay}
      style={style}
    >
      {children}
    </MotiTransition>
  );
};

// Slide-up animation
export const MotiSlideUp = ({ 
  children, 
  style,
  duration = 400,
  delay = 0
}) => {
  return (
    <MotiTransition
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration }}
      delay={delay}
      style={style}
    >
      {children}
    </MotiTransition>
  );
};

// Slide-in from right animation
export const MotiSlideRight = ({ 
  children, 
  style,
  duration = 400,
  delay = 0
}) => {
  return (
    <MotiTransition
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration }}
      delay={delay}
      style={style}
    >
      {children}
    </MotiTransition>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default {
  MotiTransition,
  MotiStaggerContainer,
  MotiFadeIn,
  MotiSlideUp,
  MotiSlideRight
}; 