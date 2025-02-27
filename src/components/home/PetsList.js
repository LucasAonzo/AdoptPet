import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import AnimalCard from '../animals/AnimalCard';
import commonStyles from '../../styles/commonStyles';

const PetsList = ({ 
  animals, 
  navigation, 
  isFetchingNextPage, 
  hasNextPage, 
  onLoadMore 
}) => {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Adopt pet</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      
      {animals.length === 0 ? (
        <View style={commonStyles.emptyContainer}>
          <Text style={commonStyles.emptyText}>No animals available for adoption</Text>
        </View>
      ) : (
        <View style={styles.petsContainer}>
          {animals.map((animal) => (
            <AnimalCard 
              key={animal.id} 
              animal={animal} 
              onPress={() => navigation.navigate('AnimalDetail', { animal })} 
            />
          ))}
          
          {/* Loading indicator for pagination */}
          {isFetchingNextPage && (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color="#8e74ae" />
              <Text style={styles.loadMoreText}>Loading more...</Text>
            </View>
          )}
          
          {/* Load more button if more data is available */}
          {hasNextPage && !isFetchingNextPage && (
            <TouchableOpacity 
              style={styles.loadMoreButton}
              onPress={onLoadMore}
            >
              <Text style={styles.loadMoreButtonText}>Load more animals</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
    paddingBottom: 20,
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