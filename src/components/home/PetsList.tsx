import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import AnimalCard from '../animals/AnimalCard';
import commonStyles from '../../styles/commonStyles';
import { Animal } from '../../types/animal';
import { NavigationProp } from '@react-navigation/native';

interface PetsListProps {
  /**
   * Array of animals to display in the list
   */
  animals: Animal[];
  
  /**
   * Navigation prop for navigating to other screens
   */
  navigation: NavigationProp<any>;
  
  /**
   * Whether additional data is being fetched
   */
  isFetchingNextPage: boolean;
  
  /**
   * Whether there is more data available to load
   */
  hasNextPage?: boolean;
  
  /**
   * Callback function when the load more button is pressed
   */
  onLoadMore?: () => void;
}

interface Styles {
  container: ViewStyle;
  sectionHeader: ViewStyle;
  sectionTitle: TextStyle;
  seeAllText: TextStyle;
  petsContainer: ViewStyle;
  footer: ViewStyle;
  loadMoreContainer: ViewStyle;
  loadMoreText: TextStyle;
  loadMoreButton: ViewStyle;
  loadMoreButtonText: TextStyle;
}

const PetsList: React.FC<PetsListProps> = ({ 
  animals, 
  navigation, 
  isFetchingNextPage, 
  hasNextPage, 
  onLoadMore 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Adopt pet</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.petsContainer}>
        {animals.map((animal) => (
          <AnimalCard 
            key={animal.id} 
            animal={animal} 
            onPress={() => navigation.navigate('AnimalDetail', { animalId: animal.id })} 
          />
        ))}
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        {isFetchingNextPage && (
          <View style={styles.loadMoreContainer}>
            <ActivityIndicator size="small" color="#8e74ae" />
            <Text style={styles.loadMoreText}>Loading more...</Text>
          </View>
        )}
        
        {hasNextPage && !isFetchingNextPage && (
          <TouchableOpacity 
            style={styles.loadMoreButton}
            onPress={onLoadMore}
          >
            <Text style={styles.loadMoreButtonText}>Load more animals</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#8e74ae',
  },
  petsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  footer: {
    paddingVertical: 10,
    width: '100%',
  },
  loadMoreContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadMoreText: {
    marginLeft: 10,
    color: '#8e74ae',
    fontSize: 14,
  },
  loadMoreButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginTop: 10,
  },
  loadMoreButtonText: {
    color: '#8e74ae',
    fontWeight: 'bold',
  },
});

export default PetsList; 