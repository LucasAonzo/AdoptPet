import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import supabase from '../../config/supabase';
import * as Animatable from 'react-native-animatable';

const AdoptionApplicationScreen = ({ route, navigation }) => {
  const { animal } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    fullName: user?.user_metadata?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    
    // Step 2: Housing Information
    housingType: 'apartment',
    hasYard: false,
    ownOrRent: 'rent',
    landlordApproval: false,
    
    // Step 3: Lifestyle Information
    hoursAway: '',
    hasChildren: false,
    hasOtherPets: false,
    otherPetsDescription: '',
    
    // Step 4: Experience & Planning
    hasPetExperience: false,
    experienceDescription: '',
    reasonForAdoption: '',
    veterinarianInfo: '',
    emergencyPlan: '',
    
    // Step 5: Agreement
    agreeToTerms: false,
    agreeToHomeVisit: false
  });
  
  // Form validation
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Validate current step
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
    }
    
    if (step === 2) {
      if (formData.ownOrRent === 'rent' && !formData.landlordApproval) {
        newErrors.landlordApproval = 'Landlord approval is required for renting';
      }
    }
    
    if (step === 3) {
      if (!formData.hoursAway.trim()) newErrors.hoursAway = 'This field is required';
      if (formData.hasOtherPets && !formData.otherPetsDescription.trim()) {
        newErrors.otherPetsDescription = 'Please describe your other pets';
      }
    }
    
    if (step === 4) {
      if (!formData.reasonForAdoption.trim()) newErrors.reasonForAdoption = 'This field is required';
      if (!formData.emergencyPlan.trim()) newErrors.emergencyPlan = 'Emergency plan is required';
    }
    
    if (step === 5) {
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
      if (!formData.agreeToHomeVisit) newErrors.agreeToHomeVisit = 'You must agree to a home visit';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Next step handler
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  // Previous step handler
  const handlePreviousStep = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(currentStep - 1);
      setIsTransitioning(false);
    }, 300);
  };

  // Form submission handler
  const handleSubmit = async () => {
    if (!validateStep(5)) {
      return;
    }
    
    setLoading(true);
    console.log('Starting submission process...');
    console.log('User ID:', user?.id);
    console.log('Animal ID:', animal?.id);
    
    try {
      // Prepare the data to be saved
      const applicationData = {
        user_id: user.id,
        animal_id: animal.id,
        status: 'pending',
        application_data: {
          ...formData,
          submittedAt: new Date().toISOString(),
          animalName: animal.name
        }
      };
      
      console.log('Application data prepared:', JSON.stringify(applicationData));
      
      // Save to Supabase
      console.log('Sending request to Supabase...');
      const { data, error } = await supabase
        .from('adoption_applications')
        .insert(applicationData)
        .select();
        
      if (error) {
        console.error('Error submitting application:', error);
        console.error('Error details:', JSON.stringify(error));
        Alert.alert(
          'Submission Error', 
          `There was a problem saving your application: ${error.message || 'Unknown error'}`
        );
      } else {
        console.log('Application submitted successfully:', data);
        // Navigate to success screen
        navigation.navigate('AdoptionSuccess', {
          animal: animal
        });
      }
    } catch (error) {
      console.error('Exception during submission:', error);
      console.error('Error stack:', error.stack);
      Alert.alert(
        'Submission Error', 
        `An unexpected error occurred: ${error.message || 'Unknown error'}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Render different form sections based on current step
  const renderForm = () => {
    switch (currentStep) {
      case 1: return renderPersonalInfoForm();
      case 2: return renderHousingInfoForm();
      case 3: return renderLifestyleForm();
      case 4: return renderExperienceForm();
      case 5: return renderAgreementForm();
      default: return null;
    }
  };

  // Render personal information form (Step 1)
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
          value={formData.fullName}
          onChangeText={(value) => handleInputChange('fullName', value)}
          placeholder="Enter your full name"
        />
        {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
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
          value={formData.phone}
          onChangeText={(value) => handleInputChange('phone', value)}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={[styles.input, errors.address && styles.inputError]}
          value={formData.address}
          onChangeText={(value) => handleInputChange('address', value)}
          placeholder="Enter your address"
          multiline
          numberOfLines={3}
        />
        {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
      </View>
    </Animatable.View>
  );

  // Render housing information form (Step 2)
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
              formData.housingType === 'apartment' && styles.radioButtonSelected
            ]}
            onPress={() => handleInputChange('housingType', 'apartment')}
          >
            <Text style={styles.radioButtonText}>Apartment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.radioButton,
              formData.housingType === 'house' && styles.radioButtonSelected
            ]}
            onPress={() => handleInputChange('housingType', 'house')}
          >
            <Text style={styles.radioButtonText}>House</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.radioButton,
              formData.housingType === 'other' && styles.radioButtonSelected
            ]}
            onPress={() => handleInputChange('housingType', 'other')}
          >
            <Text style={styles.radioButtonText}>Other</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Do you have a yard?</Text>
          <Switch
            value={formData.hasYard}
            onValueChange={(value) => handleInputChange('hasYard', value)}
            trackColor={{ false: '#d1d1d1', true: '#a58fd8' }}
            thumbColor={formData.hasYard ? '#8e74ae' : '#f4f3f4'}
          />
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Do you own or rent your home?</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={[
              styles.radioButton,
              formData.ownOrRent === 'own' && styles.radioButtonSelected
            ]}
            onPress={() => handleInputChange('ownOrRent', 'own')}
          >
            <Text style={styles.radioButtonText}>Own</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.radioButton,
              formData.ownOrRent === 'rent' && styles.radioButtonSelected
            ]}
            onPress={() => handleInputChange('ownOrRent', 'rent')}
          >
            <Text style={styles.radioButtonText}>Rent</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {formData.ownOrRent === 'rent' && (
        <View style={styles.formGroup}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Do you have landlord approval for pets?</Text>
            <Switch
              value={formData.landlordApproval}
              onValueChange={(value) => handleInputChange('landlordApproval', value)}
              trackColor={{ false: '#d1d1d1', true: '#a58fd8' }}
              thumbColor={formData.landlordApproval ? '#8e74ae' : '#f4f3f4'}
            />
          </View>
          {errors.landlordApproval && <Text style={styles.errorText}>{errors.landlordApproval}</Text>}
        </View>
      )}
    </Animatable.View>
  );

  // Render lifestyle information form (Step 3)
  const renderLifestyleForm = () => (
    <Animatable.View
      animation={isTransitioning ? "fadeOutLeft" : "fadeInRight"}
      duration={300}
      style={styles.formSection}
    >
      <Text style={styles.sectionTitle}>Lifestyle Information</Text>
      <Text style={styles.sectionDescription}>
        Help us understand your daily routine and household situation.
      </Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>How many hours per day will the pet be left alone?</Text>
        <TextInput
          style={[styles.input, errors.hoursAway && styles.inputError]}
          value={formData.hoursAway}
          onChangeText={(value) => handleInputChange('hoursAway', value)}
          placeholder="e.g., 4-6 hours"
          keyboardType="number-pad"
        />
        {errors.hoursAway && <Text style={styles.errorText}>{errors.hoursAway}</Text>}
      </View>
      
      <View style={styles.formGroup}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Do you have children in your home?</Text>
          <Switch
            value={formData.hasChildren}
            onValueChange={(value) => handleInputChange('hasChildren', value)}
            trackColor={{ false: '#d1d1d1', true: '#a58fd8' }}
            thumbColor={formData.hasChildren ? '#8e74ae' : '#f4f3f4'}
          />
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Do you have other pets?</Text>
          <Switch
            value={formData.hasOtherPets}
            onValueChange={(value) => handleInputChange('hasOtherPets', value)}
            trackColor={{ false: '#d1d1d1', true: '#a58fd8' }}
            thumbColor={formData.hasOtherPets ? '#8e74ae' : '#f4f3f4'}
          />
        </View>
      </View>
      
      {formData.hasOtherPets && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Please describe your other pets</Text>
          <TextInput
            style={[styles.input, errors.otherPetsDescription && styles.inputError]}
            value={formData.otherPetsDescription}
            onChangeText={(value) => handleInputChange('otherPetsDescription', value)}
            placeholder="Types, ages, temperament, etc."
            multiline
            numberOfLines={3}
          />
          {errors.otherPetsDescription && <Text style={styles.errorText}>{errors.otherPetsDescription}</Text>}
        </View>
      )}
    </Animatable.View>
  );

  // Render experience and planning form (Step 4)
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
            value={formData.hasPetExperience}
            onValueChange={(value) => handleInputChange('hasPetExperience', value)}
            trackColor={{ false: '#d1d1d1', true: '#a58fd8' }}
            thumbColor={formData.hasPetExperience ? '#8e74ae' : '#f4f3f4'}
          />
        </View>
      </View>
      
      {formData.hasPetExperience && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Please describe your experience</Text>
          <TextInput
            style={styles.input}
            value={formData.experienceDescription}
            onChangeText={(value) => handleInputChange('experienceDescription', value)}
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
          value={formData.reasonForAdoption}
          onChangeText={(value) => handleInputChange('reasonForAdoption', value)}
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
          value={formData.veterinarianInfo}
          onChangeText={(value) => handleInputChange('veterinarianInfo', value)}
          placeholder="Name and contact information of your veterinarian"
          multiline
          numberOfLines={2}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Emergency Plan</Text>
        <TextInput
          style={[styles.input, errors.emergencyPlan && styles.inputError]}
          value={formData.emergencyPlan}
          onChangeText={(value) => handleInputChange('emergencyPlan', value)}
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

  // Render agreement form (Step 5)
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
            value={formData.agreeToTerms}
            onValueChange={(value) => handleInputChange('agreeToTerms', value)}
            trackColor={{ false: '#d1d1d1', true: '#4CAF50' }}
            thumbColor={formData.agreeToTerms ? '#fff' : '#f4f3f4'}
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
            value={formData.agreeToHomeVisit}
            onValueChange={(value) => handleInputChange('agreeToHomeVisit', value)}
            trackColor={{ false: '#d1d1d1', true: '#4CAF50' }}
            thumbColor={formData.agreeToHomeVisit ? '#fff' : '#f4f3f4'}
          />
          <Text style={styles.checkboxLabel}>
            I agree to a home visit as part of the adoption process.
          </Text>
        </View>
        {errors.agreeToHomeVisit && <Text style={styles.errorText}>{errors.agreeToHomeVisit}</Text>}
      </View>
      
      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By submitting this application, I confirm that all information provided is truthful and accurate. 
          I understand that providing false information may result in my application being rejected. 
          The shelter reserves the right to deny any application based on the best interest of the animal.
        </Text>
      </View>
    </Animatable.View>
  );

  // Set navigation options
  useEffect(() => {
    navigation.setOptions({
      title: 'Adoption Application',
      headerShown: true,
      headerStyle: {
        backgroundColor: '#9370db',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 18,
      },
      headerLeft: () => (
        <TouchableOpacity
          style={{ marginLeft: 16 }}
          onPress={() => navigation.goBack()}
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
      <StatusBar style="light" backgroundColor="#9370db" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Animal summary */}
        <View style={styles.animalSummary}>
          <Image
            source={{ uri: animal.image_url || 'https://via.placeholder.com/150' }}
            style={styles.animalImage}
          />
          <View style={styles.animalInfo}>
            <Text style={styles.animalName}>{animal.name}</Text>
            <Text style={styles.animalSpecies}>{animal.type} • {animal.breed}</Text>
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

        {/* Dynamic Form Content */}
        {renderForm()}

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={currentStep === 1 ? () => navigation.goBack() : handlePreviousStep}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Text>
          </TouchableOpacity>
          
          {currentStep < 5 ? (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNextStep}
              disabled={loading}
            >
              <LinearGradient
                colors={['#a58fd8', '#9370db']}
                style={styles.nextButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.nextButtonText}>Next</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={['#a58fd8', '#9370db']}
                style={styles.submitButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Submit Application</Text>
                    <Ionicons name="paper-plane" size={16} color="#fff" />
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
    backgroundColor: '#9370db',
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
    backgroundColor: '#9370db',
    borderColor: '#9370db',
  },
  radioButtonText: {
    fontSize: 14,
    color: '#333',
  },
  radioButtonTextSelected: {
    color: '#fff',
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
  termsContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
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
    borderColor: '#9370db',
  },
  backButtonText: {
    color: '#9370db',
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
    paddingVertical: 10,
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  }
});

export default AdoptionApplicationScreen; 