import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
              name="paw-outline" 
              color="#8e74ae" 
              size={16} 
            />
          </View>
        </View>
        <View style={styles.locationContainer}>
          <Ionicons name="location" color="#7f8c8d" size={14} />
          <Text style={styles.locationText}>
            {animal.species} • {animal.breed} • {animal.age} {animal.age === 1 ? 'year' : 'years'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});

export default AnimalCard; 