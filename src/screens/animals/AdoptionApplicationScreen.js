import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useSubmitAdoptionApplication } from '../../hooks/useAdoptionMutations';
import { OptimizedImage, SkeletonLoader } from '../../components/common';
import * as Animatable from 'react-native-animatable';

const AdoptionApplicationScreen = ({ route }) => {
  const { animal } = route.params;
  const navigation = useNavigation();
  const { user } = useAuth();
  const { mutate: submitApplication, isPending: isSubmitting } = useSubmitAdoptionApplication();
  
  // Animation and transition states
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    // Personal Information
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    
    // Housing Information
    housingType: 'apartment', // apartment, house, other
    hasYard: false,
    ownOrRent: 'rent', // own, rent
    landlordApproval: false,
    
    // Lifestyle
    hoursAway: '',
    hasChildren: false,
    hasOtherPets: false,
    otherPetsDescription: '',
    
    // Experience
    hasPetExperience: false,
    experienceDescription: '',
    
    // Other
    reasonForAdoption: '',
    veterinarianInfo: '',
    emergencyPlan: '',
    
    // Agreement
    agreeToTerms: false,
    agreeToHomeVisit: false,
  });
  
  // Form validation
  const [errors, setErrors] = useState({});
  
  // Validate current step
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!form.email.trim()) newErrors.email = 'Email is required';
      if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Email is invalid';
      if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!form.address.trim()) newErrors.address = 'Address is required';
    }
    
    if (step === 2) {
      if (form.ownOrRent === 'rent' && !form.landlordApproval) {
        newErrors.landlordApproval = 'Landlord approval is required for renting';
      }
    }
    
    if (step === 3) {
      if (!form.hoursAway.trim()) newErrors.hoursAway = 'This field is required';
      if (form.hasOtherPets && !form.otherPetsDescription.trim()) {
        newErrors.otherPetsDescription = 'Please describe your other pets';
      }
    }
    
    if (step === 4) {
      if (!form.reasonForAdoption.trim()) newErrors.reasonForAdoption = 'This field is required';
      if (!form.emergencyPlan.trim()) newErrors.emergencyPlan = 'Emergency plan is required';
    }
    
    if (step === 5) {
      if (!form.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
      if (!form.agreeToHomeVisit) newErrors.agreeToHomeVisit = 'You must agree to a home visit';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsTransitioning(false);
      }, 300);
    }
  };
  
  // Handle previous step
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsTransitioning(false);
      }, 300);
    } else {
      navigation.goBack();
    }
  };
  
  // Handle form field changes
  const handleChange = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      try {
        const applicationData = {
          animalId: animal.id,
          form,
          status: 'pending',
          created_at: new Date().toISOString(),
        };

        // Show a simple success message first
        Alert.alert(
          'Application Submitted',
          `Thank you for applying to adopt ${animal.name}. Our team will review your application shortly.`,
          [{ text: 'OK' }]
        );

        // Navigate to the Home tab immediately
        try {
          navigation.navigate('Home');
        } catch (navError) {
          console.error('Navigation error:', navError);
          // Try alternative navigation if the first attempt fails
          try {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          } catch (resetError) {
            console.error('Navigation reset error:', resetError);
          }
        }
        
        // Submit the application in the background after navigation
        setTimeout(() => {
          try {
            submitApplication(applicationData, {
              onSuccess: () => {
                console.log('Application submitted successfully');
              },
              onError: (error) => {
                console.error('Error submitting application:', error);
              }
            });
          } catch (submitError) {
            console.error('Submission error:', submitError);
          }
        }, 500);
      } catch (error) {
        console.error('General error in handleSubmit:', error);
        Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
      }
    }
  };
  
  // Render form based on current step
  const renderForm = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfoForm();
      case 2:
        return renderHousingInfoForm();
      case 3:
        return renderLifestyleForm();
      case 4:
        return renderExperienceForm();
      case 5:
        return renderAgreementForm();
      default:
        return null;
    }
  };
  
  // Render personal information form
  const renderPersonalInfoForm = () => (
    <Animatable.View 
      animation={isTransitioning ? "fadeOutLeft" : "fadeInRight"}
      duration={300}
      style={styles.formSection}
    >
      <Text style={styles.sectionTitle}>Personal Information</Text>
      <Text style={styles.sectionDescription}>
        Please provide your contact information so we can reach you about your application.
      </Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={[styles.input, errors.fullName && styles.inputError]}
          value={form.fullName}
          onChangeText={(value) => handleChange('fullName', value)}
          placeholder="Enter your full name"
        />
        {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={form.email}
          onChangeText={(value) => handleChange('email', value)}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={[styles.input, errors.phone && styles.inputError]}
          value={form.phone}
          onChangeText={(value) => handleChange('phone', value)}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={[styles.input, errors.address && styles.inputError]}
          value={form.address}
          onChangeText={(value) => handleChange('address', value)}
          placeholder="Enter your address"
          multiline
          numberOfLines={3}
        />
        {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
      </View>
    </Animatable.View>
  );
  
  // Render housing information form
  const renderHousingInfoForm = () => (
    <Animatable.View 
      animation={isTransitioning ? "fadeOutLeft" : "fadeInRight"}
      duration={300}
      style={styles.formSection}
    >
      <Text style={styles.sectionTitle}>Housing Information</Text>
      <Text style={styles.sectionDescription}>
        Help us understand your living situation to ensure it's suitable for {animal.name}.
      </Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Housing Type</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={[
              styles.radioButton,
              form.housingType === 'apartment' && styles.radioButtonSelected
            ]}
            onPress={() => handleChange('housingType', 'apartment')}
          >
            <Text style={styles.radioButtonText}>Apartment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.radioButton,
              form.housingType === 'house' && styles.radioButtonSelected
            ]}
            onPress={() => handleChange('housingType', 'house')}
          >
            <Text style={styles.radioButtonText}>House</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.radioButton,
              form.housingType === 'other' && styles.radioButtonSelected
            ]}
            onPress={() => handleChange('housingType', 'other')}
          >
            <Text style={styles.radioButtonText}>Other</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Do you have a yard?</Text>
          <Switch
            value={form.hasYard}
            onValueChange={(value) => handleChange('hasYard', value)}
            trackColor={{ false: '#d1d1d1', true: '#a58fd8' }}
            thumbColor={form.hasYard ? '#8e74ae' : '#f4f3f4'}
          />
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Do you own or rent your home?</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={[
              styles.radioButton,
              form.ownOrRent === 'own' && styles.radioButtonSelected
            ]}
            onPress={() => handleChange('ownOrRent', 'own')}
          >
            <Text style={styles.radioButtonText}>Own</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.radioButton,
              form.ownOrRent === 'rent' && styles.radioButtonSelected
            ]}
            onPress={() => handleChange('ownOrRent', 'rent')}
          >
            <Text style={styles.radioButtonText}>Rent</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {form.ownOrRent === 'rent' && (
        <View style={styles.formGroup}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Do you have landlord approval for pets?</Text>
            <Switch
              value={form.landlordApproval}
              onValueChange={(value) => handleChange('landlordApproval', value)}
              trackColor={{ false: '#d1d1d1', true: '#a58fd8' }}
              thumbColor={form.landlordApproval ? '#8e74ae' : '#f4f3f4'}
            />
          </View>
          {errors.landlordApproval && (
            <Text style={styles.errorText}>{errors.landlordApproval}</Text>
          )}
        </View>
      )}
    </Animatable.View>
  );
  
  // Render lifestyle form
  const renderLifestyleForm = () => (
    <Animatable.View 
      animation={isTransitioning ? "fadeOutLeft" : "fadeInRight"}
      duration={300}
      style={styles.formSection}
    >
      <Text style={styles.sectionTitle}>Lifestyle Information</Text>
      <Text style={styles.sectionDescription}>
        Help us understand your daily routine and household to find the perfect match.
      </Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>How many hours are you away from home on average?</Text>
        <TextInput
          style={[styles.input, errors.hoursAway && styles.inputError]}
          value={form.hoursAway}
          onChangeText={(value) => handleChange('hoursAway', value)}
          placeholder="e.g., 8 hours"
          keyboardType="number-pad"
        />
        {errors.hoursAway && <Text style={styles.errorText}>{errors.hoursAway}</Text>}
      </View>
      
      <View style={styles.formGroup}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Do you have children in your home?</Text>
          <Switch
            value={form.hasChildren}
            onValueChange={(value) => handleChange('hasChildren', value)}
            trackColor={{ false: '#d1d1d1', true: '#a58fd8' }}
            thumbColor={form.hasChildren ? '#8e74ae' : '#f4f3f4'}
          />
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Do you have other pets?</Text>
          <Switch
            value={form.hasOtherPets}
            onValueChange={(value) => handleChange('hasOtherPets', value)}
            trackColor={{ false: '#d1d1d1', true: '#a58fd8' }}
            thumbColor={form.hasOtherPets ? '#8e74ae' : '#f4f3f4'}
          />
        </View>
      </View>
      
      {form.hasOtherPets && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Please describe your other pets</Text>
          <TextInput
            style={[styles.input, errors.otherPetsDescription && styles.inputError]}
            value={form.otherPetsDescription}
            onChangeText={(value) => handleChange('otherPetsDescription', value)}
            placeholder="Type, breed, age, temperament, etc."
            multiline
            numberOfLines={3}
          />
          {errors.otherPetsDescription && (
            <Text style={styles.errorText}>{errors.otherPetsDescription}</Text>
          )}
        </View>
      )}
    </Animatable.View>
  );
  
  // Render experience form
  const renderExperienceForm = () => (
    <Animatable.View 
      animation={isTransitioning ? "fadeOutLeft" : "fadeInRight"}
      duration={300}
      style={styles.formSection}
    >
      <Text style={styles.sectionTitle}>Experience & Planning</Text>
      <Text style={styles.sectionDescription}>
        Tell us about your experience with pets and your plans for {animal.name}.
      </Text>
      
      <View style={styles.formGroup}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Do you have experience with pets?</Text>
          <Switch
            value={form.hasPetExperience}
            onValueChange={(value) => handleChange('hasPetExperience', value)}
            trackColor={{ false: '#d1d1d1', true: '#a58fd8' }}
            thumbColor={form.hasPetExperience ? '#8e74ae' : '#f4f3f4'}
          />
        </View>
      </View>
      
      {form.hasPetExperience && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Please describe your experience</Text>
          <TextInput
            style={styles.input}
            value={form.experienceDescription}
            onChangeText={(value) => handleChange('experienceDescription', value)}
            placeholder="Past pets, experience with this breed/species, etc."
            multiline
            numberOfLines={3}
          />
        </View>
      )}
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Why do you want to adopt {animal.name}?</Text>
        <TextInput
          style={[styles.input, errors.reasonForAdoption && styles.inputError]}
          value={form.reasonForAdoption}
          onChangeText={(value) => handleChange('reasonForAdoption', value)}
          placeholder="Tell us your reasons for wanting to adopt"
          multiline
          numberOfLines={3}
        />
        {errors.reasonForAdoption && (
          <Text style={styles.errorText}>{errors.reasonForAdoption}</Text>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Veterinarian Information (if any)</Text>
        <TextInput
          style={styles.input}
          value={form.veterinarianInfo}
          onChangeText={(value) => handleChange('veterinarianInfo', value)}
          placeholder="Name and contact information of your veterinarian"
          multiline
          numberOfLines={2}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Emergency Plan</Text>
        <TextInput
          style={[styles.input, errors.emergencyPlan && styles.inputError]}
          value={form.emergencyPlan}
          onChangeText={(value) => handleChange('emergencyPlan', value)}
          placeholder="What's your plan in case of emergency or if you can no longer care for the pet?"
          multiline
          numberOfLines={3}
        />
        {errors.emergencyPlan && (
          <Text style={styles.errorText}>{errors.emergencyPlan}</Text>
        )}
      </View>
    </Animatable.View>
  );
  
  // Render agreement form
  const renderAgreementForm = () => (
    <Animatable.View 
      animation={isTransitioning ? "fadeOutLeft" : "fadeInRight"}
      duration={300}
      style={styles.formSection}
    >
      <Text style={styles.sectionTitle}>Agreements</Text>
      <Text style={styles.sectionDescription}>
        Please review and agree to the following terms to complete your application.
      </Text>
      
      <View style={styles.agreementContainer}>
        <ScrollView style={styles.agreementScroll}>
          <Text style={styles.agreementText}>
            By submitting this application, I confirm that all information provided is accurate and truthful. I understand that:
            
            1. Submitting an application does not guarantee approval for adoption.
            
            2. The shelter reserves the right to deny any application without specifying a reason.
            
            3. I will be responsible for all costs associated with the pet's care including food, supplies, and veterinary care.
            
            4. I will provide a safe and loving environment for the pet.
            
            5. I agree to follow-up visits from the shelter to ensure the pet's well-being.
            
            6. If at any time I cannot keep the pet, I will contact the shelter first before rehoming.
            
            7. I am at least 18 years of age.
            
            8. The adoption fee is non-refundable once the adoption is finalized.
            
            9. All members of my household are aware of and have agreed to this adoption.
            
            10. I agree to comply with all local laws and regulations regarding pet ownership.
          </Text>
        </ScrollView>
      </View>
      
      <View style={styles.formGroup}>
        <View style={styles.checkboxRow}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => handleChange('agreeToTerms', !form.agreeToTerms)}
          >
            {form.agreeToTerms ? (
              <Ionicons name="checkmark-circle" size={24} color="#8e74ae" />
            ) : (
              <Ionicons name="ellipse-outline" size={24} color="#cccccc" />
            )}
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>
            I agree to all terms and conditions stated above
          </Text>
        </View>
        {errors.agreeToTerms && (
          <Text style={styles.errorText}>{errors.agreeToTerms}</Text>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <View style={styles.checkboxRow}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => handleChange('agreeToHomeVisit', !form.agreeToHomeVisit)}
          >
            {form.agreeToHomeVisit ? (
              <Ionicons name="checkmark-circle" size={24} color="#8e74ae" />
            ) : (
              <Ionicons name="ellipse-outline" size={24} color="#cccccc" />
            )}
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>
            I agree to a home visit if required as part of the adoption process
          </Text>
        </View>
        {errors.agreeToHomeVisit && (
          <Text style={styles.errorText}>{errors.agreeToHomeVisit}</Text>
        )}
      </View>
    </Animatable.View>
  );
  
  // Set navigation options on mount
  useEffect(() => {
    navigation.setOptions({
      title: 'Adoption Application',
      headerShown: true,
      headerStyle: {
        backgroundColor: '#8e74ae',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 18,
      },
      headerLeft: () => (
        <TouchableOpacity
          style={{ marginLeft: 16 }}
          onPress={handlePreviousStep}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar style="light" backgroundColor="#8e74ae" />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Animal summary */}
        <View style={styles.animalSummary}>
          <OptimizedImage
            source={animal.image_url}
            style={styles.animalImage}
            contentFit="cover"
            transitionDuration={300}
          />
          <View style={styles.animalInfo}>
            <Text style={styles.animalName}>{animal.name}</Text>
            <Text style={styles.animalSpecies}>{animal.species} • {animal.breed}</Text>
          </View>
        </View>
        
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(currentStep / 5) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>Step {currentStep} of 5</Text>
        </View>
        
        {/* Form sections based on current step */}
        {renderForm()}
        
        {/* Navigation buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handlePreviousStep}
            disabled={isSubmitting}
          >
            <Text style={styles.backButtonText}>
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Text>
          </TouchableOpacity>
          
          {currentStep < 5 ? (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNextStep}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={['#a58fd8', '#8e74ae']}
                style={styles.nextButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.nextButtonText}>Next</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={['#a58fd8', '#8e74ae']}
                style={styles.submitButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Submit Application</Text>
                    <Ionicons name="paper-plane" size={20} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  animalSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  animalImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  animalInfo: {
    flex: 1,
  },
  animalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  animalSpecies: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8e74ae',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  formSection: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 5,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  radioButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    marginBottom: 10,
  },
  radioButtonSelected: {
    backgroundColor: '#8e74ae',
    borderColor: '#8e74ae',
  },
  radioButtonText: {
    fontSize: 14,
    color: '#333',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  agreementContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    height: 180,
    padding: 10,
  },
  agreementScroll: {
    flex: 1,
  },
  agreementText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8e74ae',
  },
  backButtonText: {
    color: '#8e74ae',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  submitButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
});

export default AdoptionApplicationScreen; 