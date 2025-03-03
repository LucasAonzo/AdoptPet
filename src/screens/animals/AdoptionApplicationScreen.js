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
  InteractionManager,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useSubmitAdoptionApplication } from '../../hooks/useAdoptionMutations';
import { OptimizedImage, SkeletonLoader } from '../../components/common';
import * as Animatable from 'react-native-animatable';
import { 
  addBreadcrumb, 
  safeExecute,
  logErrorToFile,
  flushMemoryLogs
} from '../../utils/debugUtils';

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
    try {
      addBreadcrumb('Submit button pressed', { animal: animal.id });
      
      // Validate form first
      if (!validateStep(currentStep)) {
        addBreadcrumb('Form validation failed', { step: currentStep, errors });
        return;
      }
      
      addBreadcrumb('Form validation passed', { step: currentStep });
      
      // No need to set isSubmitting, it will be handled by the React Query hook
      
      // Prepare application data
      const applicationData = {
        animalId: animal.id,
        form: form,
      };
      
      addBreadcrumb('Application data prepared', { animalId: animal.id });
      await flushMemoryLogs();
      
      // 1. FIRST: Submit the application data
      try {
        addBreadcrumb('Beginning submission to database');
        
        // Use safeExecute to prevent crashes during submission
        await safeExecute(async () => {
          return new Promise((resolve, reject) => {
            submitApplication(applicationData, {
              onSuccess: (data) => {
                addBreadcrumb('Application submitted successfully', { id: data?.id });
                console.log('Application submitted successfully', data);
                resolve(data);
              },
              onError: (error) => {
                addBreadcrumb('Error submitting application', { error: error?.message });
                console.error('Error submitting application:', error);
                reject(error);
              }
            });
          });
        }, 'application_submission');
        
        addBreadcrumb('Database submission completed successfully');
        await flushMemoryLogs();
        
        // 2. SECOND: Show success alert
        addBreadcrumb('Showing success alert');
        
        // Wait for alert to be acknowledged
        await new Promise(resolve => {
          Alert.alert(
            'Application Submitted',
            `Thank you for applying to adopt ${animal.name}. Our team will review your application shortly.`,
            [{ 
              text: 'OK',
              onPress: () => {
                addBreadcrumb('Alert OK button pressed');
                resolve();
              } 
            }],
            { cancelable: false } // Prevent dismissing by tapping outside
          );
        });
        
        addBreadcrumb('Alert acknowledged, proceeding to navigation');
        await flushMemoryLogs();
        
        // 3. THIRD: Navigate to home screen
        addBreadcrumb('Attempting navigation');
        
        // Wait for any pending interactions to complete
        await new Promise(resolve => {
          InteractionManager.runAfterInteractions(() => {
            resolve();
          });
        });
        
        navigation.navigate('Home');
        addBreadcrumb('Navigation completed');
        
      } catch (submitError) {
        // Handle submission errors
        addBreadcrumb('Error in submission process', { error: submitError?.message });
        console.error('Error in submission process:', submitError);
        
        await logErrorToFile({
          type: 'submission_error',
          message: submitError?.message || 'Unknown submission error',
          stack: submitError?.stack,
          timestamp: new Date().toISOString()
        });
        
        // Show error alert and stay on current screen
        Alert.alert(
          'Submission Error',
          'There was a problem submitting your application. Please try again later.',
          [{ text: 'OK' }]
        );
      } finally {
        // No need to manually set isSubmitting since React Query handles it
        await flushMemoryLogs();
      }
      
    } catch (error) {
      // Handle general errors in the submission flow
      addBreadcrumb('General error in handleSubmit', { error: error?.message });
      console.error('General error in handleSubmit:', error);
      
      await logErrorToFile({
        type: 'general_submission_error',
        message: error?.message || 'Unknown general error',
        stack: error?.stack,
        timestamp: new Date().toISOString()
      });
      
      // No need to manually set isSubmitting since React Query handles it
      
      // Show general error alert
      try {
        Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
      } catch (alertError) {
        console.error('Failed to show error alert:', alertError);
      }
      
      // Force log flush on error
      await flushMemoryLogs().catch(err => {
        console.error('Failed to flush logs after error:', err);
      });
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
      <Text style={styles.sectionTitle}>Agreement</Text>
      <Text style={styles.sectionDescription}>
        Please review and agree to the following terms to complete your application.
      </Text>
      
      <View style={styles.formGroup}>
        <View style={styles.checkboxContainer}>
          <Switch
            value={form.agreeToTerms}
            onValueChange={(value) => handleChange('agreeToTerms', value)}
            trackColor={{ false: '#d1d1d1', true: '#4CAF50' }}
            thumbColor={form.agreeToTerms ? '#fff' : '#f4f3f4'}
            ios_backgroundColor="#d1d1d1"
          />
          <Text style={styles.checkboxLabel}>
            I agree to the terms and conditions of the adoption process.
          </Text>
        </View>
        {errors.agreeToTerms && <Text style={styles.errorText}>{errors.agreeToTerms}</Text>}
      </View>
      
      <View style={styles.formGroup}>
        <View style={styles.checkboxContainer}>
          <Switch
            value={form.agreeToHomeVisit}
            onValueChange={(value) => handleChange('agreeToHomeVisit', value)}
            trackColor={{ false: '#d1d1d1', true: '#4CAF50' }}
            thumbColor={form.agreeToHomeVisit ? '#fff' : '#f4f3f4'}
            ios_backgroundColor="#d1d1d1"
          />
          <Text style={styles.checkboxLabel}>
            I agree to a home visit as part of the adoption process.
          </Text>
        </View>
        {errors.agreeToHomeVisit && <Text style={styles.errorText}>{errors.agreeToHomeVisit}</Text>}
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxLabel: {
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#8e74ae',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
    backgroundColor: '#666',
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
});

export default AdoptionApplicationScreen; 