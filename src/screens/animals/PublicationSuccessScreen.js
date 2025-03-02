import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import supabase from '../../config/supabase';
import { useModalContext } from '../../components/modals';
import { CommonActions } from '@react-navigation/native';

const PublicationSuccessScreen = ({ navigation, route }) => {
  const { animalName, animalId } = route.params || { animalName: 'Tu mascota' };
  const [isLoading, setIsLoading] = useState(false);
  const { showErrorModal } = useModalContext();

  const handleReturnHome = () => {
    // Properly reset navigation state to prevent going back to success screen
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      })
    );
  };

  const handleViewPublication = async () => {
    // We need to fetch the animal data first because the detail screen expects an animal object
    if (route.params?.animalId) {
      setIsLoading(true);
      
      try {
        // Get the animal data from the database
        const { data: animal, error } = await supabase
          .from('animals')
          .select('*')
          .eq('id', route.params.animalId)
          .single();
        
        if (error) {
          console.error('Error fetching animal:', error);
          showErrorModal('Error', 'Failed to load animal data. Please try again.');
          setIsLoading(false);
          return;
        }

        // First reset to home tab
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          })
        );
        
        // Then navigate to the detail screen with the animal object
        // This needs to be done separately to ensure the first reset completes
        setTimeout(() => {
          navigation.navigate('Home', {
            screen: 'AnimalDetail',
            params: { animal }
          });
        }, 100);
      } catch (error) {
        console.error('Error:', error);
        showErrorModal('Error', 'Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Fallback if no animalId is provided
      handleReturnHome();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f8f6fb" barStyle="dark-content" />
      
      <View style={styles.content}>
        {/* Success icon and circle */}
        <View style={styles.iconContainer}>
          <View style={styles.iconOuterCircle}>
            <View style={styles.iconInnerContainer}>
              <Ionicons name="heart" size={50} color="#8e74ae" />
            </View>
          </View>
        </View>

        {/* Success message */}
        <Text style={styles.titleText}>¡Excelente!</Text>
        <Text style={styles.messageText}>
          Tu aviso fue publicado con éxito
        </Text>

        {/* Thank you message */}
        <View style={styles.thanksContainer}>
          <Text style={styles.thanksText}>
            La mascota pronto conseguirá un hogar.
            ¡Gracias por tu ayuda!
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleReturnHome}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#a58fd8', '#8e74ae', '#7d5da7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.primaryButtonText}>Volver al inicio</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleViewPublication}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#8e74ae" size="small" />
            ) : (
              <Text style={styles.secondaryButtonText}>Ver publicación</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6fb',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  iconOuterCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#8e74ae',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInnerContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f0ebff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8e74ae',
    marginBottom: 12,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
  },
  thanksContainer: {
    backgroundColor: '#e6e1ff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    width: '100%',
  },
  thanksText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#8e74ae',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#8e74ae',
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#8e74ae',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default PublicationSuccessScreen; 