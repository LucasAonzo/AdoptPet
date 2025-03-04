import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  RefreshControl,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAnimals } from '../../hooks/useAnimals';
import categories from '../../data/categories';
import commonStyles from '../../styles/commonStyles';
import {
  SearchBar,
  CommunityBanner,
  CategoriesSection,
  PetsList
} from '../../components/home';
import { SkeletonLoader } from '../../components/common';
import styles from './HomeScreen.styles';
import { Animal, AnimalSpecies, AnimalStatus, AnimalGender, AnimalSize } from '../../types/animal';
import { NavigationProp } from '@react-navigation/native';

// Define the type for AnimalCategory to match useAnimals hook
type AnimalCategory = 'all' | 'cat' | 'dog' | 'bird' | 'other';

// Interface for HomeScreen props
interface HomeScreenProps {
  navigation: NavigationProp<any>;
}

// Helper function to convert API animal data to the Animal interface format
const convertApiAnimalToAnimal = (apiAnimal: any): Animal => {
  return {
    id: apiAnimal.id || '',
    name: apiAnimal.name || '',
    species: (apiAnimal.species?.toLowerCase() || 'other') as AnimalSpecies,
    breed: apiAnimal.breed || '',
    age: apiAnimal.age || 0,
    gender: (apiAnimal.gender || 'male') as AnimalGender,
    size: (apiAnimal.size || 'medium') as AnimalSize,
    description: apiAnimal.description || '',
    imageUrls: apiAnimal.image_url ? [apiAnimal.image_url] : [],
    owner_id: apiAnimal.user_id || '',
    created_at: apiAnimal.created_at || new Date().toISOString(),
    status: apiAnimal.is_adopted ? 'adopted' : 'available' as AnimalStatus,
    location: apiAnimal.location || '',
  };
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<AnimalCategory>('all');
  const [searchText, setSearchText] = useState('');
  
  // Use React Query for data fetching with pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching
  } = useAnimals({
    category: selectedCategory,
    searchText
  });
  
  // Flatten the pages of data into a single array and convert to proper Animal format
  const apiAnimals = data?.pages?.flatMap(page => page.animals) || [];
  const animals: Animal[] = apiAnimals.map(convertApiAnimalToAnimal);
  const refreshing = isRefetching;
  
  // Load more animals when reaching the end of the list
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId as AnimalCategory);
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  if (isLoading && !refreshing) {
    return (
      <View style={commonStyles.loadingContainer}>
        <SkeletonLoader variant="list" count={6} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <SafeAreaView style={styles.safeAreaContent}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              colors={['#8e74ae']}
              tintColor="#8e74ae"
            />
          }
        >
          <SearchBar 
            searchText={searchText} 
            onSearchChange={handleSearch} 
          />
          
          <CommunityBanner />
          
          <CategoriesSection 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryPress={handleCategoryPress}
          />
          
          {animals.length === 0 ? (
            <View style={commonStyles.emptyContainer}>
              <Text style={commonStyles.emptyText}>No animals available for adoption</Text>
            </View>
          ) : (
            <PetsList 
              animals={animals}
              navigation={navigation}
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
              onLoadMore={handleLoadMore}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default HomeScreen; 