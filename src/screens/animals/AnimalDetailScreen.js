import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import supabase from '../../config/supabase';

const AnimalDetailScreen = ({ route, navigation }) => {
  const { animal } = route.params;
  const [loading, setLoading] = useState(false);
  const [isAdopted, setIsAdopted] = useState(animal.is_adopted);

  const handleAdopt = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Error', 'You must be logged in to adopt an animal');
        return;
      }
      
      // Update the animal's adoption status
      const { error } = await supabase
        .from('animals')
        .update({ 
          is_adopted: true,
          adopted_by: user.id,
          adopted_at: new Date().toISOString()
        })
        .eq('id', animal.id);
      
      if (error) throw error;
      
      setIsAdopted(true);
      Alert.alert(
        'Success!', 
        `Congratulations! You've started the adoption process for ${animal.name}. The shelter will contact you soon with next steps.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error adopting animal:', error);
      Alert.alert('Error', 'Failed to adopt animal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    Alert.alert(
      'Contact Information',
      `Please contact ${animal.users?.name || 'the shelter'} for more information about ${animal.name}.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: animal.image_url }}
        style={styles.image}
        resizeMode="cover"
      />
      
      {isAdopted && (
        <View style={styles.adoptedBanner}>
          <Text style={styles.adoptedText}>Adopted</Text>
        </View>
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{animal.name}</Text>
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => Alert.alert('Feature coming soon', 'Saving favorites will be available in a future update.')}
          >
            <Ionicons name="heart-outline" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="paw" size={20} color="#0077B6" />
            <Text style={styles.infoText}>{animal.species}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={20} color="#0077B6" />
            <Text style={styles.infoText}>{animal.age} years</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name={animal.gender === 'Male' ? 'male' : 'female'} size={20} color="#0077B6" />
            <Text style={styles.infoText}>{animal.gender}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{animal.description || 'No description available.'}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Breed:</Text>
            <Text style={styles.detailValue}>{animal.breed}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Size:</Text>
            <Text style={styles.detailValue}>{animal.size || 'Not specified'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Color:</Text>
            <Text style={styles.detailValue}>{animal.color || 'Not specified'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Posted by:</Text>
            <Text style={styles.detailValue}>{animal.users?.name || 'Unknown'}</Text>
          </View>
        </View>
        
        {!isAdopted ? (
          <TouchableOpacity 
            style={styles.adoptButton}
            onPress={handleAdopt}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.adoptButtonText}>Adopt Me</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={handleContact}
          >
            <Text style={styles.contactButtonText}>Contact Shelter</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 300,
  },
  adoptedBanner: {
    position: 'absolute',
    top: 20,
    right: 0,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  adoptedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  favoriteButton: {
    padding: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  infoText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  detailItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    width: 100,
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  adoptButton: {
    backgroundColor: '#0077B6',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  adoptButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AnimalDetailScreen; 