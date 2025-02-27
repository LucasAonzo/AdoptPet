import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  RefreshControl,
  ScrollView,
  TextInput,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AnimalCard from '../../components/animals/AnimalCard';
import CategoryButton from '../../components/categories/CategoryButton';
import { useAnimals } from '../../hooks/useAnimals';
import categories from '../../data/categories';
import commonStyles from '../../styles/commonStyles';

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

  // Remove FastImage preloading as we're using regular Image
  useEffect(() => {
    // Image preloading not needed with standard Image component
  }, [animals]);

  if (isLoading && !refreshing) {
    return (
      <View style={commonStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#8e74ae" />
        <Text style={commonStyles.loadingText}>Loading animals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8e74ae" />
      
      {/* Safe Area for top inset */}
      <SafeAreaView style={styles.safeAreaTop} />
      
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity>
          <Ionicons name="menu" size={26} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>AdoptMe</Text>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationContainer}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
              style={styles.profilePic}
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <SafeAreaView style={styles.safeAreaContent}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 90 }}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              colors={['#8e74ae']}
              tintColor="#8e74ae"
            />
          }
        >
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <TextInput
                placeholder="Search..."
                style={styles.searchInput}
                value={searchText}
                onChangeText={handleSearch}
              />
            </View>
            <TouchableOpacity style={styles.searchButton}>
              <Ionicons name="search" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {/* Community Banner */}
          <View style={styles.bannerContainer}>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Join our animal lovers Community</Text>
              <TouchableOpacity style={styles.joinButton}>
                <Text style={styles.joinButtonText}>Join Now</Text>
              </TouchableOpacity>
            </View>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }} 
              style={styles.bannerImage}
            />
          </View>
          
          {/* Pet Categories Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pet Categories</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>More Category</Text>
            </TouchableOpacity>
          </View>
          
          {/* Categories List */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <CategoryButton
                key={category.id}
                title={category.name}
                icon={category.icon}
                isActive={selectedCategory === category.id}
                onPress={() => handleCategoryPress(category.id)}
                backgroundColor={category.backgroundColor}
                iconBackground={category.iconBackground}
              />
            ))}
          </ScrollView>
          
          {/* Adopt Pet Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Adopt pet</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          {/* Pet Cards */}
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
                  onPress={handleLoadMore}
                >
                  <Text style={styles.loadMoreButtonText}>Load more animals</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  safeAreaTop: {
    flex: 0,
    backgroundColor: '#8e74ae',
  },
  safeAreaContent: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#8e74ae',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationContainer: {
    marginRight: 15,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    borderWidth: 1,
    borderColor: '#fff',
  },
  profilePic: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  searchInputContainer: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    marginRight: 10,
    justifyContent: 'center',
  },
  searchInput: {
    fontSize: 16,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8e74ae',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    flexDirection: 'row',
    backgroundColor: '#8e74ae',
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 20,
    height: 150,
    marginBottom: 25,
  },
  bannerContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  joinButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  joinButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  bannerImage: {
    width: '50%',
    height: '100%',
  },
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
  categoriesContainer: {
    paddingLeft: 15,
    marginBottom: 25,
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

export default HomeScreen; 