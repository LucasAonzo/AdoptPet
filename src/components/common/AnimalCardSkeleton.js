import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Skeleton } from 'moti/skeleton';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export const AnimalCardSkeleton = ({ count = 4 }) => {
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
  
  // Create an array based on the count
  const skeletonCards = Array(count).fill(0);
  
  return (
    <View style={styles.container}>
      <View style={styles.cardsContainer}>
        {skeletonCards.map((_, index) => (
          <View key={index} style={styles.card}>
            <Skeleton
              colorMode={colorMode}
              height={130}
              width={cardWidth}
              show
              radius={8}
            />
            
            <View style={styles.cardContent}>
              <Skeleton
                colorMode={colorMode}
                height={20}
                width={cardWidth * 0.7}
                show
                style={styles.nameText}
              />
              
              <Skeleton
                colorMode={colorMode}
                height={16}
                width={cardWidth * 0.5}
                show
                style={styles.locationText}
              />
              
              <View style={styles.tagsContainer}>
                <Skeleton
                  colorMode={colorMode}
                  height={24}
                  width={60}
                  show
                  radius="round"
                />
                <Skeleton
                  colorMode={colorMode}
                  height={24}
                  width={60}
                  show
                  radius="round"
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
  container: {
    flex: 1,
    marginHorizontal: 16,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: cardWidth,
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

export default AnimalCardSkeleton; 