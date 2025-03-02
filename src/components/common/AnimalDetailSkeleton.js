import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Skeleton } from 'moti/skeleton';
import { MotiView } from 'moti';
import GradientWrapper from './GradientWrapper';

const { width } = Dimensions.get('window');

export const AnimalDetailSkeleton = () => {
  // Color scheme for the skeleton loader
  const colorMode = {
    colorMode: 'light',
    darkColors: {
      backgroundColor: '#2a2a2a'
    },
    lightColors: {
      backgroundColor: '#e0e0e0'
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Image Area */}
      <Skeleton
        colorMode={colorMode}
        height={300}
        width={width}
        show
      />
      
      {/* Name and Status */}
      <View style={styles.headerContainer}>
        <Skeleton
          colorMode={colorMode}
          height={32}
          width={width * 0.6}
          show
        />
        <Skeleton
          colorMode={colorMode}
          height={24}
          width={100}
          show
          radius="round"
        />
      </View>
      
      {/* Location */}
      <Skeleton
        colorMode={colorMode}
        height={20}
        width={width * 0.5}
        show
        style={styles.location}
      />
      
      {/* Info Cards - 2x2 Grid */}
      <View style={styles.infoCardsContainer}>
        <View style={styles.infoCardRow}>
          <Skeleton
            colorMode={colorMode}
            height={80}
            width={width * 0.44}
            show
          />
          <Skeleton
            colorMode={colorMode}
            height={80}
            width={width * 0.44}
            show
          />
        </View>
        <View style={styles.infoCardRow}>
          <Skeleton
            colorMode={colorMode}
            height={80}
            width={width * 0.44}
            show
          />
          <Skeleton
            colorMode={colorMode}
            height={80}
            width={width * 0.44}
            show
          />
        </View>
      </View>
      
      {/* Owner Section */}
      <View style={styles.ownerSection}>
        <View style={styles.ownerInfo}>
          <Skeleton
            colorMode={colorMode}
            height={50}
            width={50}
            show
            radius="round"
          />
          <View style={styles.ownerTextInfo}>
            <Skeleton
              colorMode={colorMode}
              height={16}
              width={100}
              show
            />
            <Skeleton
              colorMode={colorMode}
              height={20}
              width={150}
              show
              style={styles.marginTop}
            />
          </View>
        </View>
      </View>
      
      {/* Description */}
      <Skeleton
        colorMode={colorMode}
        height={24}
        width={180}
        show
        style={styles.sectionTitle}
      />
      
      <Skeleton
        colorMode={colorMode}
        height={80}
        width={width * 0.9}
        show
      />
      
      {/* Compatibility */}
      <Skeleton
        colorMode={colorMode}
        height={24}
        width={150}
        show
        style={styles.sectionTitle}
      />
      
      <View style={styles.compatibilityRow}>
        <Skeleton
          colorMode={colorMode}
          height={50}
          width={80}
          show
          radius="round"
        />
        <Skeleton
          colorMode={colorMode}
          height={50}
          width={80}
          show
          radius="round"
        />
        <Skeleton
          colorMode={colorMode}
          height={50}
          width={80}
          show
          radius="round"
        />
      </View>
      
      {/* Action Button */}
      <Skeleton
        colorMode={colorMode}
        height={50}
        width={width * 0.9}
        show
        radius="round"
        style={styles.adoptButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
  }
});

export default AnimalDetailSkeleton; 