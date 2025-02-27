import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import AnimalService from '../../services/animalService';

const AddAnimalScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    description: '',
    image_url: 'https://example.com/placeholder.jpg', // Placeholder for now
    is_adopted: false,
    user_id: user?.id || null,
  });

  const updateFormField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'age' ? (value ? parseInt(value, 10) : '') : value,
    }));
  };

  const validateForm = () => {
    if (!formData.name) {
      Alert.alert('Missing Information', 'Please enter a name for the animal');
      return false;
    }
    if (!formData.species) {
      Alert.alert('Missing Information', 'Please enter the animal species');
      return false;
    }
    return true;
  };

  const handleAddAnimal = async () => {
    if (!validateForm()) return;

    // Ensure user_id is set to the current user's ID
    const animalData = {
      ...formData,
      user_id: user.id,
    };

    setLoading(true);
    try {
      const result = await AnimalService.createAnimal(animalData);
      setLoading(false);

      if (!result.success) {
        Alert.alert('Error', result.error.message || 'Failed to create animal');
        return;
      }

      Alert.alert(
        'Success',
        'Animal added successfully!',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );

      // Clear the form
      setFormData({
        name: '',
        species: '',
        breed: '',
        age: '',
        description: '',
        image_url: 'https://example.com/placeholder.jpg',
        is_adopted: false,
        user_id: user?.id || null,
      });
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Add a New Animal</Text>
          <Text style={styles.subtitle}>
            Enter the details of the animal you want to add for adoption
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter animal name"
            value={formData.name}
            onChangeText={(text) => updateFormField('name', text)}
          />

          <Text style={styles.label}>Species</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Dog, Cat, Bird"
            value={formData.species}
            onChangeText={(text) => updateFormField('species', text)}
          />

          <Text style={styles.label}>Breed</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Labrador, Siamese"
            value={formData.breed}
            onChangeText={(text) => updateFormField('breed', text)}
          />

          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter age in years"
            value={formData.age.toString() || ''}
            onChangeText={(text) => updateFormField('age', text)}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter a description of the animal"
            value={formData.description}
            onChangeText={(text) => updateFormField('description', text)}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => {
              // Will implement image upload later
              Alert.alert('Coming Soon', 'Image upload will be available soon!');
            }}
          >
            <Ionicons name="image-outline" size={24} color="#0077B6" />
            <Text style={styles.imageButtonText}>Add Image</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddAnimal}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.addButtonText}>Add Animal</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0077B6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E1F5FE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  imageButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#0077B6',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#0077B6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddAnimalScreen; 