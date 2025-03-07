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

const HomeScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
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
  
  // Flatten the pages of data into a single array
  const animals = data?.pages?.flatMap(page => page.animals) || [];
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

  const handleCategoryPress = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleSearch = (text) => {
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
      <StatusBar barStyle="light-content" backgroundColor="#8e74ae" />
      
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