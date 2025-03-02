import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { useCancelApplication } from '../../hooks/useAdoptionMutations';
import { OptimizedImage } from '../../components/common';

const ApplicationDetailScreen = ({ route }) => {
  const { application } = route.params;
  const navigation = useNavigation();
  const animal = application.animals;
  const applicationData = application.application_data;
  
  const { mutate: cancelApplication, isPending: isCancelling } = useCancelApplication();
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    housing: false,
    lifestyle: false,
    experience: false,
    agreement: false,
  });

  // Handle toggle section
  const toggleSection = (sectionName) => {
    setExpandedSections({
      ...expandedSections,
      [sectionName]: !expandedSections[sectionName],
    });
  };

  // Set navigation options
  useEffect(() => {
    navigation.setOptions({
      title: 'Application Details',
      headerShown: true,
      headerStyle: {
        backgroundColor: '#8e74ae',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 18,
      },
    });
  }, [navigation]);

  // Handle cancel application
  const handleCancelApplication = () => {
    Alert.alert(
      'Cancel Application',
      'Are you sure you want to cancel your application? This action cannot be undone.',
      [
        {
          text: 'No, Keep Application',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel Application',
          style: 'destructive',
          onPress: () => {
            cancelApplication(application.id, {
              onSuccess: () => {
                navigation.goBack();
              },
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Format status text for display
  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Get status badge style based on application status
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'pending':
        return styles.pendingBadge;
      case 'approved':
        return styles.approvedBadge;
      case 'rejected':
        return styles.rejectedBadge;
      case 'cancelled':
        return styles.cancelledBadge;
      default:
        return styles.pendingBadge;
    }
  };

  // Get status badge text style based on application status
  const getStatusTextStyle = (status) => {
    switch (status) {
      case 'pending':
        return styles.pendingText;
      case 'approved':
        return styles.approvedText;
      case 'rejected':
        return styles.rejectedText;
      case 'cancelled':
        return styles.cancelledText;
      default:
        return styles.pendingText;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy • h:mm a');
    } catch (error) {
      return 'Unknown date';
    }
  };

  // Render section header
  const renderSectionHeader = (title, sectionName) => (
    <TouchableOpacity
      style={styles.sectionHeader}
      onPress={() => toggleSection(sectionName)}
    >
      <Text style={styles.sectionTitle}>{title}</Text>
      <Ionicons
        name={expandedSections[sectionName] ? 'chevron-up' : 'chevron-down'}
        size={20}
        color="#666"
      />
    </TouchableOpacity>
  );

  // Render text field
  const renderTextField = (label, value) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value || 'Not provided'}</Text>
    </View>
  );

  // Render boolean field
  const renderBooleanField = (label, value) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.booleanValue}>
        <Ionicons
          name={value ? 'checkmark-circle' : 'close-circle'}
          size={22}
          color={value ? '#4CAF50' : '#F44336'}
        />
        <Text style={[styles.fieldValue, { marginLeft: 8 }]}>
          {value ? 'Yes' : 'No'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#8e74ae" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Animal information */}
        <View style={styles.animalCard}>
          <OptimizedImage
            source={animal.image_url}
            style={styles.animalImage}
            contentFit="cover"
            transitionDuration={300}
          />
          <View style={styles.animalInfo}>
            <Text style={styles.animalName}>{animal.name}</Text>
            <Text style={styles.animalSpecies}>{animal.species} • {animal.breed}</Text>
            <View style={getStatusBadgeStyle(application.status)}>
              <Text style={getStatusTextStyle(application.status)}>
                {formatStatus(application.status)}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Application summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Application ID</Text>
            <Text style={styles.summaryValue}>#{application.id}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Submitted</Text>
            <Text style={styles.summaryValue}>{formatDate(application.created_at)}</Text>
          </View>
        </View>
        
        {/* Application details */}
        <View style={styles.detailsContainer}>
          {/* Personal Information */}
          {renderSectionHeader('Personal Information', 'personal')}
          {expandedSections.personal && (
            <View style={styles.sectionContent}>
              {renderTextField('Full Name', applicationData.fullName)}
              {renderTextField('Email', applicationData.email)}
              {renderTextField('Phone', applicationData.phone)}
              {renderTextField('Address', applicationData.address)}
            </View>
          )}
          
          {/* Housing Information */}
          {renderSectionHeader('Housing Information', 'housing')}
          {expandedSections.housing && (
            <View style={styles.sectionContent}>
              {renderTextField('Housing Type', applicationData.housingType)}
              {renderBooleanField('Has Yard', applicationData.hasYard)}
              {renderTextField('Own or Rent', applicationData.ownOrRent)}
              {applicationData.ownOrRent === 'rent' &&
                renderBooleanField('Landlord Approval', applicationData.landlordApproval)}
            </View>
          )}
          
          {/* Lifestyle Information */}
          {renderSectionHeader('Lifestyle Information', 'lifestyle')}
          {expandedSections.lifestyle && (
            <View style={styles.sectionContent}>
              {renderTextField('Hours Away from Home', applicationData.hoursAway)}
              {renderBooleanField('Has Children', applicationData.hasChildren)}
              {renderBooleanField('Has Other Pets', applicationData.hasOtherPets)}
              {applicationData.hasOtherPets &&
                renderTextField('Other Pets Description', applicationData.otherPetsDescription)}
            </View>
          )}
          
          {/* Experience & Planning */}
          {renderSectionHeader('Experience & Planning', 'experience')}
          {expandedSections.experience && (
            <View style={styles.sectionContent}>
              {renderBooleanField('Has Pet Experience', applicationData.hasPetExperience)}
              {applicationData.hasPetExperience &&
                renderTextField('Experience Description', applicationData.experienceDescription)}
              {renderTextField('Reason for Adoption', applicationData.reasonForAdoption)}
              {renderTextField('Veterinarian Info', applicationData.veterinarianInfo)}
              {renderTextField('Emergency Plan', applicationData.emergencyPlan)}
            </View>
          )}
          
          {/* Agreements */}
          {renderSectionHeader('Agreements', 'agreement')}
          {expandedSections.agreement && (
            <View style={styles.sectionContent}>
              {renderBooleanField('Agreed to Terms', applicationData.agreeToTerms)}
              {renderBooleanField('Agreed to Home Visit', applicationData.agreeToHomeVisit)}
            </View>
          )}
        </View>
        
        {/* Notes/Status updates for rejected/approved applications */}
        {(application.status === 'rejected' || application.status === 'approved') && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesTitle}>
              {application.status === 'approved' ? 'Approval Notes' : 'Rejection Reason'}
            </Text>
            <Text style={styles.notesContent}>
              {application.admin_notes || 
                (application.status === 'approved' 
                  ? 'Congratulations! Your application has been approved. Our team will contact you soon to discuss next steps.'
                  : 'We appreciate your interest, but we are unable to proceed with your application at this time. Please contact us for more information.')
              }
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* Actions */}
      {application.status === 'pending' && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelApplication}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <ActivityIndicator size="small" color="#f44336" />
            ) : (
              <>
                <Ionicons name="close-circle" size={20} color="#f44336" />
                <Text style={styles.cancelButtonText}>Cancel Application</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => navigation.navigate('ContactScreen', { animalId: animal.id })}
          >
            <LinearGradient
              colors={['#a58fd8', '#8e74ae']}
              style={styles.contactButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
              <Text style={styles.contactButtonText}>Contact Shelter</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  animalCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  animalImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  animalInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  animalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  animalSpecies: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  pendingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFF5E6',
    alignSelf: 'flex-start',
  },
  pendingText: {
    color: '#FF9800',
    fontSize: 12,
    fontWeight: '600',
  },
  approvedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E7F5E8',
    alignSelf: 'flex-start',
  },
  approvedText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  rejectedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FEEBEB',
    alignSelf: 'flex-start',
  },
  rejectedText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: '600',
  },
  cancelledBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#EEEEEE',
    alignSelf: 'flex-start',
  },
  cancelledText: {
    color: '#757575',
    fontSize: 12,
    fontWeight: '600',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryItem: {
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sectionContent: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#fafafa',
  },
  fieldContainer: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
  },
  booleanValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notesContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  notesContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f44336',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  contactButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  contactButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ApplicationDetailScreen; 