import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import AnimalCard from './AnimalCard';
import { getFlashListConfig } from '../../utils/imageOptimizations';

const { width } = Dimensions.get('window');

const AnimalList = ({ 
  animals, 
  onPressAnimal, 
  ListHeaderComponent, 
  ListEmptyComponent,
  contentContainerStyle,
  refreshControl,
  onEndReached,
  onEndReachedThreshold = 0.5,
  refreshing = false,
}) => {
  // Get the FlashList configuration for images
  const flashListConfig = getFlashListConfig('images');
  
  // Setup for 2-column grid layout
  const renderItem = ({ item }) => (
    <AnimalCard 
      animal={item}
      onPress={() => onPressAnimal(item)}
    />
  );

  return (
    <View style={styles.container}>
      <FlashList
        data={animals}
        renderItem={renderItem}
        estimatedItemSize={flashListConfig.estimatedItemSize}
        numColumns={2}
        keyExtractor={flashListConfig.keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent || (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No animals found</Text>
          </View>
        )}
        contentContainerStyle={[styles.listContent, contentContainerStyle]}
        refreshControl={refreshControl}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        refreshing={refreshing}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        disableIntervalMomentum={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    height: 200,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default AnimalList; 