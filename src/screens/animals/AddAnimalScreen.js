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
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import AnimalService from '../../services/animalService';
import supabase from '../../config/supabase';

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
      // First, check if the user exists in the users table
      const { data: userData, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
      
      // If user doesn't exist in the users table, create them
      if (userCheckError && userCheckError.code === 'PGRST116') {
        console.log('User not found in users table, creating user record...');
        const { error: createUserError } = await supabase
          .from('users')
          .insert([{
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        
        if (createUserError) {
          console.error('Error creating user record:', createUserError);
          Alert.alert('Error', 'Failed to create user record. Please try again.');
          setLoading(false);
          return;
        }
      } else if (userCheckError) {
        console.error('Error checking user:', userCheckError);
      }

      // Now create the animal
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
    <LinearGradient
      colors={['#ffffff', '#f8f4ff']}
      style={styles.gradientContainer}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Add a New Animal</Text>
            <Text style={styles.subtitle}>
              Enter the details of the animal you want to add for adoption
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="paw-outline" size={22} color="#8e74ae" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter animal name"
                  placeholderTextColor="#aaa"
                  value={formData.name}
                  onChangeText={(text) => updateFormField('name', text)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Species</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="help-buoy-outline" size={22} color="#8e74ae" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Dog, Cat, Bird"
                  placeholderTextColor="#aaa"
                  value={formData.species}
                  onChangeText={(text) => updateFormField('species', text)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Breed</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="information-circle-outline" size={22} color="#8e74ae" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Labrador, Siamese"
                  placeholderTextColor="#aaa"
                  value={formData.breed}
                  onChangeText={(text) => updateFormField('breed', text)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Age</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="calendar-outline" size={22} color="#8e74ae" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter age in years"
                  placeholderTextColor="#aaa"
                  value={formData.age.toString() || ''}
                  onChangeText={(text) => updateFormField('age', text)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                <Ionicons name="create-outline" size={22} color="#8e74ae" style={[styles.inputIcon, {alignSelf: 'flex-start', marginTop: 12}]} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter a description of the animal"
                  placeholderTextColor="#aaa"
                  value={formData.description}
                  onChangeText={(text) => updateFormField('description', text)}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.imageButton}
              onPress={() => {
                // Will implement image upload later
                Alert.alert('Coming Soon', 'Image upload will be available soon!');
              }}
            >
              <Ionicons name="image-outline" size={24} color="white" />
              <Text style={styles.imageButtonText}>Add Image</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAddAnimal}
              disabled={loading}
            >
              <LinearGradient
                colors={['#a58fd8', '#8e74ae', '#7d5da7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addButton}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.addButtonText}>Add Animal</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 25,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8e74ae',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 22,
    shadowColor: '#8e74ae',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F6FB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E0FF',
    shadowColor: '#8e74ae',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
  },
  inputIcon: {
    marginLeft: 15,
    marginRight: 5,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#444',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9C84BE',
    borderRadius: 12,
    padding: 15,
    marginBottom: 22,
    marginTop: 6,
    shadowColor: '#8e74ae',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  imageButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  addButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#8e74ae',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default AddAnimalScreen; 