import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar as RNStatusBar,
  Platform,
  Linking,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { OptimizedImage } from '../../components/common';

// Get screen dimensions for responsive design
const { width: screenWidth } = Dimensions.get('window');
// Use a base width for scaling (iPhone 8 width as reference)
const baseWidth = 375;
// Create scaling factor based on device width
const scale = screenWidth / baseWidth;
// Scale function to adjust sizes based on device width
const scaledSize = (size) => Math.round(size * scale);

const AdoptionProgressScreen = ({ route }) => {
  const { animal, application } = route.params;
  const navigation = useNavigation();
  
  // Listen for dimension changes (e.g., rotation)
  useEffect(() => {
    const dimensionsHandler = Dimensions.addEventListener(
      'change',
      ({ window }) => {
        // Force component update on dimension change
        // This ensures the scaledSize calculations are refreshed
        navigation.setParams({ ...route.params });
      }
    );
    
    return () => dimensionsHandler.remove();
  }, []);
  
  // Get the status of the application
  const status = application?.status || 'pending';
  const applicationData = application?.application_data || {};
  
  // Determine progress stage based on status
  const getStageNumber = () => {
    switch(status) {
      case 'approved': return 4;
      case 'home_visit_scheduled': return 3;
      case 'interview_scheduled': return 2;
      case 'under_review': return 1;
      case 'pending':
      default: return 0;
    }
  };
  
  const currentStage = getStageNumber();

  // Handle view application details button press
  const handleViewApplicationDetails = () => {
    navigation.navigate('ApplicationDetail', {
      application: application
    });
  };

  // Handle contact shelter button press
  const handleContactShelter = () => {
    // Check if shelter has phone number or email
    if (animal?.shelter?.phone) {
      Linking.openURL(`tel:${animal.shelter.phone}`);
    } else if (animal?.shelter?.email) {
      Linking.openURL(`mailto:${animal.shelter.email}`);
    } else {
      // Navigate to shelter profile if no direct contact info
      navigation.navigate('ShelterDetail', { 
        shelterId: animal?.shelter_id 
      });
    }
  };

  // Hide header on mount
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Render progress indicator based on stage
  const renderProgressIndicator = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressLine} />
      
      {/* Stage 1: Application Received */}
      <View style={styles.stageContainer}>
        <View style={[
          styles.stageIndicator,
          currentStage >= 0 ? styles.stageCompleted : styles.stagePending
        ]}>
          <Ionicons 
            name={currentStage >= 0 ? "checkmark" : "time-outline"} 
            size={22} 
            color={currentStage >= 0 ? "#fff" : "#aaa"} 
          />
        </View>
        <View style={styles.stageContent}>
          <Text style={[
            styles.stageTitle,
            currentStage >= 0 ? styles.stageTitleActive : styles.stageTitleInactive
          ]}>
            Application Received
          </Text>
          <Text style={styles.stageDescription}>
            We've received your application and it has been added to our review queue.
          </Text>
        </View>
      </View>
      
      {/* Stage 2: Under Review */}
      <View style={styles.stageContainer}>
        <View style={[
          styles.stageIndicator,
          currentStage >= 1 ? styles.stageCompleted : styles.stagePending
        ]}>
          <Ionicons 
            name={currentStage >= 1 ? "checkmark" : "document-text-outline"} 
            size={22} 
            color={currentStage >= 1 ? "#fff" : "#aaa"} 
          />
        </View>
        <View style={styles.stageContent}>
          <Text style={[
            styles.stageTitle,
            currentStage >= 1 ? styles.stageTitleActive : styles.stageTitleInactive
          ]}>
            Under Review
          </Text>
          <Text style={styles.stageDescription}>
            Our team is reviewing your application details and checking your references.
          </Text>
        </View>
      </View>
      
      {/* Stage 3: Interview */}
      <View style={styles.stageContainer}>
        <View style={[
          styles.stageIndicator,
          currentStage >= 2 ? styles.stageCompleted : styles.stagePending
        ]}>
          <Ionicons 
            name={currentStage >= 2 ? "checkmark" : "call-outline"} 
            size={22} 
            color={currentStage >= 2 ? "#fff" : "#aaa"} 
          />
        </View>
        <View style={styles.stageContent}>
          <Text style={[
            styles.stageTitle,
            currentStage >= 2 ? styles.stageTitleActive : styles.stageTitleInactive
          ]}>
            Interview Scheduled
          </Text>
          <Text style={styles.stageDescription}>
            We've scheduled a phone or video interview to discuss your application further.
          </Text>
        </View>
      </View>
      
      {/* Stage 4: Home Visit */}
      <View style={styles.stageContainer}>
        <View style={[
          styles.stageIndicator,
          currentStage >= 3 ? styles.stageCompleted : styles.stagePending
        ]}>
          <Ionicons 
            name={currentStage >= 3 ? "checkmark" : "home-outline"} 
            size={22} 
            color={currentStage >= 3 ? "#fff" : "#aaa"} 
          />
        </View>
        <View style={styles.stageContent}>
          <Text style={[
            styles.stageTitle,
            currentStage >= 3 ? styles.stageTitleActive : styles.stageTitleInactive
          ]}>
            Home Visit
          </Text>
          <Text style={styles.stageDescription}>
            We're planning a visit to your home to ensure it's ready for {animal.name}.
          </Text>
        </View>
      </View>
      
      {/* Stage 5: Approved */}
      <View style={styles.stageContainer}>
        <View style={[
          styles.stageIndicator,
          currentStage >= 4 ? styles.stageCompleted : styles.stagePending
        ]}>
          <Ionicons 
            name={currentStage >= 4 ? "heart" : "heart-outline"} 
            size={22} 
            color={currentStage >= 4 ? "#fff" : "#aaa"} 
          />
        </View>
        <View style={styles.stageContent}>
          <Text style={[
            styles.stageTitle,
            currentStage >= 4 ? styles.stageTitleActive : styles.stageTitleInactive
          ]}>
            Approved & Ready for Adoption
          </Text>
          <Text style={styles.stageDescription}>
            Congratulations! Your application has been approved. We'll schedule pickup or delivery of {animal.name}.
          </Text>
        </View>
      </View>
    </View>
  );

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
          <Ionicons name="paw" size={50} color="#ffffff" />
          <Text style={styles.headerTitle}>Adoption Progress</Text>
          <Text style={styles.headerSubtitle}>
            Your journey to adopt {animal.name}
          </Text>
          
          <View style={[
            styles.statusBadge,
            status === 'approved' ? styles.approvedBadge :
            status === 'rejected' ? styles.rejectedBadge :
            styles.pendingBadge
          ]}>
            <Text style={[
              styles.statusText,
              status === 'approved' ? styles.approvedText :
              status === 'rejected' ? styles.rejectedText :
              styles.pendingText
            ]}>
              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </Text>
          </View>
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
            <Text style={styles.animalAge}>
              {animal.age} • {animal.gender}
            </Text>
          </View>
        </Animatable.View>

        {/* Progress Timeline */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={800} 
          delay={700}
          style={styles.timelineContainer}
        >
          <Text style={styles.sectionTitle}>Adoption Timeline</Text>
          {renderProgressIndicator()}
        </Animatable.View>

        {/* Next Steps */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={800} 
          delay={900}
          style={styles.nextStepsContainer}
        >
          <Text style={styles.sectionTitle}>What's Next?</Text>
          <Text style={styles.nextStepsDescription}>
            {currentStage === 0 ? 
              `We're currently processing your application. This typically takes 3-5 business days. We'll contact you once your application moves to the next stage.` :
            currentStage === 1 ? 
              `Your application is under review. Our team is checking your references and reviewing your application details. We'll contact you soon to schedule an interview.` :
            currentStage === 2 ? 
              `We've scheduled your interview. Please make sure you're available at the scheduled time. After the interview, we may schedule a home visit.` :
            currentStage === 3 ? 
              `We've scheduled a home visit. Please prepare your home for the visit. Make sure your home is pet-friendly and safe for ${animal.name}.` :
            currentStage === 4 ? 
              `Congratulations! Your application has been approved. We'll contact you to schedule pickup or delivery of ${animal.name}.` :
              `We're currently processing your application. Please check back later for updates.`
            }
          </Text>

          {/* Display additional details based on status */}
          {status === 'interview_scheduled' && applicationData.interviewDate && (
            <View style={styles.infoBox}>
              <Ionicons name="calendar" size={20} color="#8e74ae" />
              <Text style={styles.infoText}>
                Interview scheduled for: {new Date(applicationData.interviewDate).toLocaleDateString()} at {new Date(applicationData.interviewDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Text>
            </View>
          )}

          {status === 'home_visit_scheduled' && applicationData.homeVisitDate && (
            <View style={styles.infoBox}>
              <Ionicons name="calendar" size={20} color="#8e74ae" />
              <Text style={styles.infoText}>
                Home visit scheduled for: {new Date(applicationData.homeVisitDate).toLocaleDateString()} at {new Date(applicationData.homeVisitDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Text>
            </View>
          )}

          {status === 'approved' && applicationData.pickupDate && (
            <View style={styles.infoBox}>
              <Ionicons name="calendar" size={20} color="#8e74ae" />
              <Text style={styles.infoText}>
                Pickup scheduled for: {new Date(applicationData.pickupDate).toLocaleDateString()} at {new Date(applicationData.pickupDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Text>
            </View>
          )}
        </Animatable.View>

        {/* Preparation Tips */}
        {currentStage >= 3 && (
          <Animatable.View 
            animation="fadeInUp" 
            duration={800} 
            delay={1100}
            style={styles.tipsContainer}
          >
            <Text style={styles.sectionTitle}>Preparing for {animal.name}</Text>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Ionicons name="paw" size={24} color="#8e74ae" />
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Get Essential Supplies</Text>
                  <Text style={styles.tipDescription}>
                    {animal.species === 'Dog' ? 
                      'Food and water bowls, leash, collar, ID tag, bed, toys, and treats.' :
                    animal.species === 'Cat' ? 
                      'Litter box, litter, food and water bowls, carrier, bed, scratching post, and toys.' :
                      'Food and water bowls, appropriate habitat, bedding, and toys.'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.tipItem}>
                <Ionicons name="home" size={24} color="#8e74ae" />
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Pet-Proof Your Home</Text>
                  <Text style={styles.tipDescription}>
                    {animal.species === 'Dog' ? 
                      'Secure trash cans, remove toxic plants, and store chemicals out of reach.' :
                    animal.species === 'Cat' ? 
                      'Secure loose wires, remove toxic plants, and create vertical spaces.' :
                      'Create a safe, quiet space away from drafts and direct sunlight.'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.tipItem}>
                <Ionicons name="medkit" size={24} color="#8e74ae" />
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Find a Veterinarian</Text>
                  <Text style={styles.tipDescription}>
                    Research and choose a vet before bringing {animal.name} home. Schedule an initial check-up in the first week.
                  </Text>
                </View>
              </View>
            </View>
          </Animatable.View>
        )}
      </ScrollView>

      {/* Action buttons */}
      <Animatable.View 
        animation="fadeInUp" 
        duration={800} 
        delay={1200}
        style={styles.actionContainer}
      >
        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={handleViewApplicationDetails}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#f0eaf7', '#e8ddf2']}
            style={styles.secondaryButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="document-text" size={22} color="#8e74ae" />
            <Text style={styles.secondaryButtonText}>Application Details</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleContactShelter}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#a58fd8', '#8e74ae']}
            style={styles.primaryButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="call" size={22} color="#fff" />
            <Text style={styles.primaryButtonText}>Contact Shelter</Text>
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
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingBadge: {
    backgroundColor: '#FFF5E6',
  },
  approvedBadge: {
    backgroundColor: '#E7F5E8',
  },
  rejectedBadge: {
    backgroundColor: '#FEECEF',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pendingText: {
    color: '#FF9800',
  },
  approvedText: {
    color: '#4CAF50',
  },
  rejectedText: {
    color: '#F44336',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
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
    borderRadius: 10,
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
  animalAge: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  timelineContainer: {
    backgroundColor: '#ffffff',
    borderRadius: scaledSize(15),
    padding: scaledSize(20),
    marginTop: scaledSize(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressContainer: {
    position: 'relative',
    paddingLeft: 0,
  },
  progressLine: {
    position: 'absolute',
    left: scaledSize(17.5),
    top: scaledSize(25),
    bottom: 0,
    width: scaledSize(2),
    backgroundColor: '#e0e0e0',
    zIndex: 1,
  },
  stageContainer: {
    flexDirection: 'row',
    marginBottom: scaledSize(30),
    position: 'relative',
    zIndex: 2,
    alignItems: 'center',
  },
  stageIndicator: {
    width: scaledSize(36),
    height: scaledSize(36),
    borderRadius: scaledSize(18),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scaledSize(16),
    marginLeft: 0,
    borderWidth: 0,
    position: 'relative',
    zIndex: 3,
  },
  stagePending: {
    backgroundColor: '#f1f1f1',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  stageCompleted: {
    backgroundColor: '#8e74ae',
  },
  stageContent: {
    flex: 1,
    paddingTop: 3,
  },
  stageTitle: {
    fontSize: scaledSize(16),
    fontWeight: '600',
    marginBottom: scaledSize(4),
  },
  stageTitleActive: {
    color: '#333',
  },
  stageTitleInactive: {
    color: '#999',
  },
  stageDescription: {
    fontSize: scaledSize(14),
    color: '#666',
    lineHeight: scaledSize(20),
  },
  nextStepsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextStepsDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0eaf7',
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
    flex: 1,
  },
  tipsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsList: {
    marginTop: 5,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tipContent: {
    flex: 1,
    marginLeft: 16,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  tipDescription: {
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
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 25,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    flex: 1,
    marginLeft: 12,
    elevation: 3,
    shadowColor: '#a58fd8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  secondaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    flex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 15,
  },
  secondaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 15, 
  },
  primaryButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#8e74ae',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AdoptionProgressScreen; 