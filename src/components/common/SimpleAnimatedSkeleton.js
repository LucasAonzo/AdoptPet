import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';

const { width } = Dimensions.get('window');

// A simple skeleton box that pulses
export const SkeletonBox = ({ width: boxWidth, height, style, radius = 4 }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;
  
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    
    animation.start();
    
    return () => {
      animation.stop();
    };
  }, [opacity]);
  
  return (
    <Animated.View 
      style={[
        styles.skeletonBox, 
        { 
          width: boxWidth, 
          height,
          borderRadius: radius,
          opacity,
        },
        style
      ]}
    />
  );
};

// Animal Detail Skeleton using the simple SkeletonBox component
export const SimpleAnimalDetailSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Image Area */}
      <SkeletonBox
        width={width}
        height={300}
      />
      
      {/* Name and Status */}
      <View style={styles.headerContainer}>
        <SkeletonBox
          width={width * 0.6}
          height={32}
        />
        <SkeletonBox
          width={100}
          height={24}
          radius={20}
        />
      </View>
      
      {/* Location */}
      <SkeletonBox
        width={width * 0.5}
        height={20}
        style={styles.location}
      />
      
      {/* Info Cards - 2x2 Grid */}
      <View style={styles.infoCardsContainer}>
        <View style={styles.infoCardRow}>
          <SkeletonBox
            width={width * 0.44}
            height={80}
          />
          <SkeletonBox
            width={width * 0.44}
            height={80}
          />
        </View>
        <View style={styles.infoCardRow}>
          <SkeletonBox
            width={width * 0.44}
            height={80}
          />
          <SkeletonBox
            width={width * 0.44}
            height={80}
          />
        </View>
      </View>
      
      {/* Owner Section */}
      <View style={styles.ownerSection}>
        <View style={styles.ownerInfo}>
          <SkeletonBox
            width={50}
            height={50}
            radius={25}
          />
          <View style={styles.ownerTextInfo}>
            <SkeletonBox
              width={100}
              height={16}
            />
            <SkeletonBox
              width={150}
              height={20}
              style={styles.marginTop}
            />
          </View>
        </View>
      </View>
      
      {/* Description */}
      <SkeletonBox
        width={180}
        height={24}
        style={styles.sectionTitle}
      />
      
      <SkeletonBox
        width={width * 0.9}
        height={80}
        style={styles.description}
      />
      
      {/* Compatibility */}
      <SkeletonBox
        width={150}
        height={24}
        style={styles.sectionTitle}
      />
      
      <View style={styles.compatibilityRow}>
        <SkeletonBox
          width={80}
          height={50}
          radius={25}
        />
        <SkeletonBox
          width={80}
          height={50}
          radius={25}
        />
        <SkeletonBox
          width={80}
          height={50}
          radius={25}
        />
      </View>
      
      {/* Action Button */}
      <SkeletonBox
        width={width * 0.9}
        height={50}
        radius={25}
        style={styles.adoptButton}
      />
    </View>
  );
};

// Animal Card Skeleton
export const SimpleAnimalCardSkeleton = ({ count = 4 }) => {
  const cardWidth = (width - 48) / 2;
  const skeletonCards = Array(count).fill(0);
  
  return (
    <View style={styles.container}>
      <View style={styles.cardsContainer}>
        {skeletonCards.map((_, index) => (
          <View key={index} style={styles.card}>
            <SkeletonBox
              width={cardWidth}
              height={130}
              radius={8}
            />
            
            <View style={styles.cardContent}>
              <SkeletonBox
                width={cardWidth * 0.7}
                height={20}
                style={styles.nameText}
              />
              
              <SkeletonBox
                width={cardWidth * 0.5}
                height={16}
                style={styles.locationText}
              />
              
              <View style={styles.tagsContainer}>
                <SkeletonBox
                  width={60}
                  height={24}
                  radius={20}
                />
                <SkeletonBox
                  width={60}
                  height={24}
                  radius={20}
                  style={{ marginLeft: 8 }}
                />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonBox: {
    backgroundColor: '#E1E9EE',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  location: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  infoCardsContainer: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  infoCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ownerSection: {
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerTextInfo: {
    marginLeft: 12,
  },
  marginTop: {
    marginTop: 4,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  description: {
    marginHorizontal: 16,
  },
  compatibilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginVertical: 10,
  },
  adoptButton: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 12,
  },
  nameText: {
    marginBottom: 4,
  },
  locationText: {
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 6,
  },
});

export default {
  SkeletonBox,
  SimpleAnimalDetailSkeleton,
  SimpleAnimalCardSkeleton
}; 