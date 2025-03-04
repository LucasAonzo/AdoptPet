import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, ViewStyle } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  cancelAnimation,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { SkeletonPlaceholder } from 'react-native-skeleton-placeholder';

const { width } = Dimensions.get('window');

// Define types for skeleton variants
type SkeletonVariant = 'card' | 'list' | 'detail' | 'profile' | 'applications';

// Define interfaces for props
interface SkeletonLoaderProps {
  variant?: SkeletonVariant;
  count?: number;
  style?: ViewStyle;
}

interface SkeletonComponentProps {
  style: any; // Use any type for animated styles to avoid type conflicts
}

// Define color constants for the skeleton
const skeletonColors = {
  background: '#e0e0e0',
  highlight: '#f0f0f0',
};

/**
 * SkeletonLoader component
 * Displays animated skeleton loaders for content before it loads
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  variant = 'card',
  count = 3,
  style 
}) => {
  const opacity = useSharedValue(0.3);
  
  // Set up the shimmer animation
  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, { duration: 1000 }),
      -1,
      true
    );
    
    return () => {
      cancelAnimation(opacity);
    };
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Render different skeleton layouts based on the variant
  const renderVariant = () => {
    switch (variant) {
      case 'card':
        return <CardSkeleton style={shimmerStyle} />;
      case 'list':
        return (
          <>
            {Array(count).fill(undefined).map((_, index) => (
              <ListItemSkeleton key={index} style={shimmerStyle} />
            ))}
          </>
        );
      case 'detail':
        return <DetailSkeleton style={shimmerStyle} />;
      case 'profile':
        return <ProfileSkeleton style={shimmerStyle} />;
      case 'applications':
        return renderApplicationSkeleton();
      default:
        return <CardSkeleton style={shimmerStyle} />;
    }
  };

  // Skeleton for application listings
  const renderApplicationSkeleton = () => {
    return Array(count)
      .fill(undefined)
      .map((_, index) => (
        <View key={index} style={[styles.applicationCard, { marginBottom: 16 }]}>
          <View style={styles.applicationContent}>
            <View style={styles.applicationImageContainer}>
              <SkeletonPlaceholder
                backgroundColor={skeletonColors.background}
                highlightColor={skeletonColors.highlight}
              >
                <View style={styles.applicationImage} />
              </SkeletonPlaceholder>
            </View>
            <View style={styles.applicationInfo}>
              <SkeletonPlaceholder
                backgroundColor={skeletonColors.background}
                highlightColor={skeletonColors.highlight}
              >
                <View style={styles.applicationTitle} />
                <View style={styles.applicationDate} />
                <View style={styles.applicationStatus} />
              </SkeletonPlaceholder>
            </View>
            <View style={styles.applicationArrow}>
              <SkeletonPlaceholder
                backgroundColor={skeletonColors.background}
                highlightColor={skeletonColors.highlight}
              >
                <View style={styles.arrowIcon} />
              </SkeletonPlaceholder>
            </View>
          </View>
        </View>
      ));
  };

  return (
    <View style={[styles.container, style]}>
      {renderVariant()}
    </View>
  );
};

// Card skeleton for grid layouts
const CardSkeleton: React.FC<SkeletonComponentProps> = ({ style }) => (
  <MotiView
    from={{ opacity: 0.5 }}
    animate={{ opacity: 1 }}
    transition={{ type: 'timing', duration: 1000, loop: true }}
    style={[styles.card, style]}
  >
    <Animated.View style={[styles.cardImage, style]} />
    <Animated.View style={[styles.cardTitle, style]} />
    <Animated.View style={[styles.cardSubtitle, style]} />
    <Animated.View style={[styles.cardText, style]} />
  </MotiView>
);

// List item skeleton for list layouts
const ListItemSkeleton: React.FC<SkeletonComponentProps> = ({ style }) => (
  <MotiView
    from={{ opacity: 0.5 }}
    animate={{ opacity: 1 }}
    transition={{ type: 'timing', duration: 1000, loop: true }}
    style={[styles.listItem, style]}
  >
    <Animated.View style={[styles.listItemImage, style]} />
    <View style={styles.listItemContent}>
      <Animated.View style={[styles.listItemTitle, style]} />
      <Animated.View style={[styles.listItemSubtitle, style]} />
      <Animated.View style={[styles.listItemText, style]} />
    </View>
  </MotiView>
);

// Detail skeleton for detail screens
const DetailSkeleton: React.FC<SkeletonComponentProps> = ({ style }) => (
  <MotiView
    from={{ opacity: 0.5 }}
    animate={{ opacity: 1 }}
    transition={{ type: 'timing', duration: 1000, loop: true }}
    style={[styles.detail, style]}
  >
    <Animated.View style={[styles.detailHeader, style]} />
    <Animated.View style={[styles.detailTitle, style]} />
    <Animated.View style={[styles.detailSubtitle, style]} />
    <Animated.View style={[styles.detailText, style]} />
    <Animated.View style={[styles.detailText, style]} />
    <Animated.View style={[styles.detailShortText, style]} />
  </MotiView>
);

// Profile skeleton for profile screens
const ProfileSkeleton: React.FC<SkeletonComponentProps> = ({ style }) => (
  <MotiView
    from={{ opacity: 0.5 }}
    animate={{ opacity: 1 }}
    transition={{ type: 'timing', duration: 1000, loop: true }}
    style={[styles.profile, style]}
  >
    <Animated.View style={[styles.profileImage, style]} />
    <Animated.View style={[styles.profileName, style]} />
    <Animated.View style={[styles.profileText, style]} />
    <Animated.View style={[styles.profileText, style]} />
  </MotiView>
);

// Define style types
interface Styles {
  container: ViewStyle;
  card: ViewStyle;
  cardImage: ViewStyle;
  cardTitle: ViewStyle;
  cardSubtitle: ViewStyle;
  cardText: ViewStyle;
  listItem: ViewStyle;
  listItemImage: ViewStyle;
  listItemContent: ViewStyle;
  listItemTitle: ViewStyle;
  listItemSubtitle: ViewStyle;
  listItemText: ViewStyle;
  detail: ViewStyle;
  detailHeader: ViewStyle;
  detailTitle: ViewStyle;
  detailSubtitle: ViewStyle;
  detailText: ViewStyle;
  detailShortText: ViewStyle;
  profile: ViewStyle;
  profileImage: ViewStyle;
  profileName: ViewStyle;
  profileText: ViewStyle;
  applicationCard: ViewStyle;
  applicationContent: ViewStyle;
  applicationImageContainer: ViewStyle;
  applicationImage: ViewStyle;
  applicationInfo: ViewStyle;
  applicationTitle: ViewStyle;
  applicationDate: ViewStyle;
  applicationStatus: ViewStyle;
  applicationArrow: ViewStyle;
  arrowIcon: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    width: '100%',
    padding: 10,
  },
  // Card skeleton styles
  card: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    padding: 12,
    marginBottom: 15,
  },
  cardImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
  },
  cardTitle: {
    width: '80%',
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  cardSubtitle: {
    width: '60%',
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  cardText: {
    width: '40%',
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  // List item skeleton styles
  listItem: {
    width: '100%',
    height: 80,
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    marginBottom: 12,
    overflow: 'hidden',
  },
  listItemImage: {
    width: 80,
    height: 80,
    backgroundColor: '#e0e0e0',
  },
  listItemContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  listItemTitle: {
    width: '70%',
    height: 18,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  listItemSubtitle: {
    width: '50%',
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 6,
  },
  listItemText: {
    width: '40%',
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  // Detail skeleton styles
  detail: {
    width: '100%',
    paddingHorizontal: 15,
  },
  detailHeader: {
    width: '100%',
    height: 200,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 20,
  },
  detailTitle: {
    width: '80%',
    height: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 12,
  },
  detailSubtitle: {
    width: '60%',
    height: 18,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 20,
  },
  detailText: {
    width: '100%',
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  detailShortText: {
    width: '50%',
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  // Profile skeleton styles
  profile: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    marginBottom: 20,
  },
  profileName: {
    width: 180,
    height: 22,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 15,
  },
  profileText: {
    width: 220,
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 10,
  },
  // Application skeleton styles
  applicationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  applicationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  applicationImageContainer: {
    marginRight: 16,
  },
  applicationImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  applicationInfo: {
    flex: 1,
  },
  applicationTitle: {
    height: 20,
    width: '80%',
    borderRadius: 4,
    marginBottom: 8,
  },
  applicationDate: {
    height: 14,
    width: '60%',
    borderRadius: 4,
    marginBottom: 8,
  },
  applicationStatus: {
    height: 24,
    width: '40%',
    borderRadius: 12,
  },
  applicationArrow: {
    paddingLeft: 8,
  },
  arrowIcon: {
    height: 24,
    width: 24,
    borderRadius: 12,
  },
});

export default SkeletonLoader; 