import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import supabase from '../../config/supabase';

const AnimalCard = ({ animal, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: animal.image_url }}
        style={styles.cardImage}
        contentFit="cover"
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{animal.name}</Text>
        <View style={styles.cardDetails}>
          <Text style={styles.cardBreed}>
            {animal.species} • {animal.breed}
          </Text>
          <Text style={styles.cardAge}>{animal.age} years old</Text>
        </View>
        {animal.is_adopted && (
          <View style={styles.adoptedBadge}>
            <Text style={styles.adoptedText}>Adopted</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const AnimalListScreen = ({ navigation }) => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('animals')
        .select('*, users(name)')
        .order('created_at', { ascending: false });

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

  const handleAnimalPress = (animal) => {
    navigation.navigate('AnimalDetail', { animal });
  };

  const handleAddAnimal = () => {
    navigation.navigate('AddAnimal');
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0077B6" />
        <Text style={styles.loadingText}>Loading animals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={animals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AnimalCard animal={item} onPress={() => handleAnimalPress(item)} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No animals available for adoption</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddAnimal}
            >
              <Text style={styles.addButtonText}>Add Your Pet</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <TouchableOpacity style={styles.fab} onPress={handleAddAnimal}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for FAB
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardBreed: {
    fontSize: 14,
    color: '#555',
  },
  cardAge: {
    fontSize: 14,
    color: '#555',
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
  },
  addButton: {
    backgroundColor: '#0077B6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#0077B6',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default AnimalListScreen; 