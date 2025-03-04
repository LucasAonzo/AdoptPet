import React from 'react';
import { View, Text, StyleSheet, Dimensions, ViewStyle, TextStyle } from 'react-native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import AnimalCard from './AnimalCard';
import { getFlashListConfig } from '../../utils/imageOptimizations';
import { Animal } from '../../types/animal';

const { width } = Dimensions.get('window');

interface AnimalListProps {
  /**
   * Array of animals to display in the list
   */
  animals: Animal[];
  
  /**
   * Callback function when an animal card is pressed
   */
  onPressAnimal: (animal: Animal) => void;
  
  /**
   * Optional component to render at the top of the list
   */
  ListHeaderComponent?: React.ReactElement | null;
  
  /**
   * Optional component to render when the list is empty
   */
  ListEmptyComponent?: React.ReactElement | null;
  
  /**
   * Style for the content container
   */
  contentContainerStyle?: object | object[];
  
  /**
   * RefreshControl component for pull-to-refresh functionality
   */
  refreshControl?: React.ReactElement;
  
  /**
   * Callback function when the end of the list is reached
   */
  onEndReached?: () => void;
  
  /**
   * Threshold for triggering the onEndReached callback
   */
  onEndReachedThreshold?: number;
  
  /**
   * Whether the list is currently refreshing
   */
  refreshing?: boolean;
}

interface Styles {
  container: ViewStyle;
  listContent: ViewStyle;
  emptyContainer: ViewStyle;
  emptyText: TextStyle;
}

const AnimalList: React.FC<AnimalListProps> = ({ 
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
  const renderItem: ListRenderItem<Animal> = ({ item }) => (
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
        contentContainerStyle={[styles.listContent, contentContainerStyle] as any}
        refreshControl={refreshControl as any}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        refreshing={refreshing}
        // Performance optimizations
        removeClippedSubviews={true}
        disableIntervalMomentum={true}
      />
    </View>
  );
};

const styles = StyleSheet.create<Styles>({
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