import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { cacheImage } from '../../utils/imageOptimizations';

const AnimalCard = ({ animal, onPress }) => {
  const [optimizedImageUri, setOptimizedImageUri] = useState(animal.image_url);
  
  // Cache the image when the component mounts
  useEffect(() => {
    const prepareImage = async () => {
      if (animal.image_url) {
        const cachedUri = await cacheImage(animal.image_url);
        setOptimizedImageUri(cachedUri);
      }
    };
    
    prepareImage();
  }, [animal.image_url]);
  
  // Use blurhash or placeholder while image loads
  const placeholder = 'LJHfLTH?_3?b~qofRjWB%MogRjWB';

  return (
    <TouchableOpacity style={styles.petCard} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: optimizedImageUri }}
          style={styles.petImage}
          contentFit="cover"
          placeholder={placeholder}
          transition={300}
          cachePolicy="memory-disk"
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