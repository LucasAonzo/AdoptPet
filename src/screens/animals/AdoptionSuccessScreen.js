import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import * as Animatable from 'react-native-animatable';
import { OptimizedImage } from '../../components/common';

const AdoptionSuccessScreen = ({ route }) => {
  const { animal } = route.params;
  const navigation = useNavigation();

  // Handle go home button press
  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeTab' }],
    });
  };

  // Handle view application button press
  const handleViewApplication = () => {
    navigation.navigate('AdoptionApplications');
  };

  // Handle view animal button press
  const handleViewAnimal = () => {
    navigation.goBack();
    navigation.goBack(); // Go back twice to return to animal detail
  };

  // Hide header on mount
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#8e74ae" />

      <LinearGradient
        colors={['#a58fd8', '#8e74ae']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animatable.View 
          animation="fadeIn" 
          duration={800} 
          delay={300}
          style={styles.headerContent}
        >
          <Ionicons name="checkmark-circle" size={70} color="#ffffff" />
          <Text style={styles.headerTitle}>Application Submitted!</Text>
          <Text style={styles.headerSubtitle}>
            Thank you for applying to adopt {animal.name}
          </Text>
        </Animatable.View>
      </LinearGradient>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Animal card */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={800} 
          delay={500}
          style={styles.animalCard}
        >
          <OptimizedImage
            source={animal.image_url}
            style={styles.animalImage}
            contentFit="cover"
            transitionDuration={300}
          />
          <View style={styles.animalInfo}>
            <Text style={styles.animalName}>{animal.name}</Text>
            <Text style={styles.animalSpecies}>{animal.species} • {animal.breed}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Application Pending</Text>
            </View>
          </View>
        </Animatable.View>

        {/* Success animation */}
        <Animatable.View 
          animation="fadeIn" 
          duration={1000} 
          delay={800}
          style={styles.animationContainer}
        >
          <LottieView
            source={require('../../assets/animations/success-animation.json')}
            autoPlay
            loop={false}
            style={styles.lottieAnimation}
          />
        </Animatable.View>

        {/* Information */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={800} 
          delay={1000}
          style={styles.infoContainer}
        >
          <Text style={styles.infoTitle}>What happens next?</Text>
          
          <View style={styles.stepContainer}>
            <View style={styles.stepIcon}>
              <Ionicons name="document-text" size={24} color="#8e74ae" />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Application Review</Text>
              <Text style={styles.stepDescription}>
                Our team will review your application carefully. This process usually takes 3-5 business days.
              </Text>
            </View>
          </View>
          
          <View style={styles.stepContainer}>
            <View style={styles.stepIcon}>
              <Ionicons name="call" size={24} color="#8e74ae" />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Contact</Text>
              <Text style={styles.stepDescription}>
                We'll contact you via phone or email to discuss your application and potentially schedule a home visit.
              </Text>
            </View>
          </View>
          
          <View style={styles.stepContainer}>
            <View style={styles.stepIcon}>
              <Ionicons name="home" size={24} color="#8e74ae" />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Home Visit</Text>
              <Text style={styles.stepDescription}>
                If your application progresses, we may schedule a home visit to ensure it's a good fit for {animal.name}.
              </Text>
            </View>
          </View>
          
          <View style={styles.stepContainer}>
            <View style={styles.stepIcon}>
              <Ionicons name="heart" size={24} color="#8e74ae" />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Finalization</Text>
              <Text style={styles.stepDescription}>
                If approved, we'll contact you to schedule a time to finalize the adoption and bring {animal.name} home!
              </Text>
            </View>
          </View>
        </Animatable.View>
      </ScrollView>

      {/* Action buttons */}
      <Animatable.View 
        animation="fadeInUp" 
        duration={800} 
        delay={1200}
        style={styles.actionContainer}
      >
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={handleViewAnimal}
        >
          <Ionicons name="arrow-back" size={20} color="#8e74ae" />
          <Text style={styles.actionButtonText}>Back to Animal</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={handleViewApplication}
        >
          <Ionicons name="documents" size={20} color="#8e74ae" />
          <Text style={styles.actionButtonText}>My Applications</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleGoHome}
        >
          <LinearGradient
            colors={['#a58fd8', '#8e74ae']}
            style={styles.primaryButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.primaryButtonText}>Go Home</Text>
            <Ionicons name="home" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animatable.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: RNStatusBar.currentHeight,
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 15,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.9,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  animalCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 15,
    marginTop: -25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  animalImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  animalInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  animalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  animalSpecies: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: '#FFF5E6',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#FF9800',
    fontSize: 12,
    fontWeight: '600',
  },
  animationContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0eaf7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 15,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#8e74ae',
    fontWeight: '600',
    marginLeft: 5,
  },
  primaryButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  primaryButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    marginRight: 5,
  },
});

export default AdoptionSuccessScreen; 