import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  RefreshControl,
  ScrollView,
  TextInput,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import supabase from './src/config/supabase';

// Animal Card Component
const AnimalCard = ({ animal, onPress }) => {
  return (
    <TouchableOpacity style={styles.petCard} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: animal.image_url }}
          style={styles.petImage}
          resizeMode="cover"
        />
        {animal.is_adopted && (
          <View style={styles.adoptedBadge}>
            <Text style={styles.adoptedText}>Adopted</Text>
          </View>
        )}
      </View>
      <View style={styles.petInfo}>
        <View style={styles.petHeader}>
          <Text style={styles.petName}>{animal.name}</Text>
          <View style={styles.genderContainer}>
            <Ionicons 
              name={animal.gender === 'male' ? 'male' : 'female'} 
              color={animal.gender === 'male' ? '#3498db' : '#e84393'} 
              size={16} 
            />
          </View>
        </View>
        <View style={styles.locationContainer}>
          <Ionicons name="location" color="#7f8c8d" size={14} />
          <Text style={styles.locationText}>
            {animal.species} • {animal.breed} • {animal.age} years
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Category Button Component
const CategoryButton = ({ title, icon, isActive, onPress, backgroundColor, iconBackground }) => (
  <TouchableOpacity 
    style={[
      styles.categoryItem, 
      { backgroundColor: backgroundColor || '#ab9abb' },
      isActive && styles.selectedCategory
    ]} 
    onPress={onPress}
  >
    <View style={[
      styles.categoryIcon, 
      { backgroundColor: iconBackground || backgroundColor || '#ab9abb' }
    ]}>
      <Ionicons name={icon} size={24} color={isActive ? '#fff' : '#8e74ae'} />
    </View>
    <Text style={styles.categoryText}>{title}</Text>
  </TouchableOpacity>
);

export default function App() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchText, setSearchText] = useState('');

  const categories = [
    { id: 'all', name: 'All Pets', icon: 'paw', color: '#8e74ae', backgroundColor: '#ab9abb' },
    { id: 'cat', name: 'Cat', icon: 'paw', color: '#fff', backgroundColor: '#ab9abb', iconBackground: '#e8b3b5' },
    { id: 'dog', name: 'Dog', icon: 'paw', color: '#fff', backgroundColor: '#b9e6e0', iconBackground: '#a0cbc4' },
    { id: 'bird', name: 'Bird', icon: 'paw', color: '#fff', backgroundColor: '#a7d1d6', iconBackground: '#8db3b8' },
    { id: 'other', name: 'Other', icon: 'paw', color: '#fff', backgroundColor: '#f3b8a2', iconBackground: '#d39a84' },
  ];

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('animals')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply category filter if not "All"
      if (selectedCategory !== 'all') {
        // Convert category to appropriate species filter
        const speciesMap = {
          cat: 'cat',
          dog: 'dog',
          bird: 'bird',
          // Add other mappings as needed
        };
        const species = speciesMap[selectedCategory];
        if (species) {
          query = query.eq('species', species);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setAnimals(data || []);
    } catch (error) {
      console.error('Error fetching animals:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, [selectedCategory]);

  useEffect(() => {
    // Subscribe to changes in the animals table
    const subscription = supabase
      .channel('animals_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'animals' }, fetchAnimals)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnimals();
  };

  const handleCategoryPress = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleSearch = (text) => {
    setSearchText(text);
  };

  const getFilteredAnimals = () => {
    if (!searchText) return animals;
    return animals.filter(animal => 
      animal.name.toLowerCase().includes(searchText.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchText.toLowerCase()) ||
      animal.species.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8e74ae" />
        <Text style={styles.loadingText}>Loading animals...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
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
            {getFilteredAnimals().length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No animals available for adoption</Text>
              </View>
            ) : (
              <View style={styles.petsContainer}>
                {getFilteredAnimals().map((animal) => (
                  <AnimalCard 
                    key={animal.id} 
                    animal={animal} 
                    onPress={() => {}} 
                  />
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

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
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    borderRadius: 25,
  },
  selectedCategory: {
    borderWidth: 2,
    borderColor: '#8e74ae',
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  petsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  petCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    width: '48%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  petImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  adoptedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  adoptedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  petInfo: {
    padding: 12,
  },
  petHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  genderContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#8e74ae',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    height: 300,
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  }
}); 