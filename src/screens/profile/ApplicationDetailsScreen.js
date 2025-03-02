import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as Animatable from 'react-native-animatable';
import { useApplicationDetails } from '../../hooks/useAdoptionMutations';
import { OptimizedImage, SkeletonLoader } from '../../components/common';
import { LinearGradient } from 'expo-linear-gradient';

const ApplicationDetailsScreen = ({ route }) => {
  const { applicationId } = route.params;
  const navigation = useNavigation();
  const { data: application, isLoading, refetch } = useApplicationDetails(applicationId);
  const [expandedSections, setExpandedSections] = useState({
    personalInfo: true,
    housingInfo: true,
    lifestyle: true,
    experience: true,
    agreement: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: ['#f39c12', '#e67e22'],
      approved: ['#2ecc71', '#27ae60'],
      rejected: ['#e74c3c', '#c0392b'],
      in_process: ['#3498db', '#2980b9'],
    };
    return colors[status] || ['#95a5a6', '#7f8c8d'];
  };

  const renderSectionHeader = (title, section) => (
    <TouchableOpacity
      style={styles.sectionHeader}
      onPress={() => toggleSection(section)}
    >
      <Text style={styles.sectionTitle}>{title}</Text>
      <Ionicons
        name={expandedSections[section] ? 'chevron-up' : 'chevron-down'}
        size={24}
        color="#666"
      />
    </TouchableOpacity>
  );

  const renderApplicationInfo = () => (
    <View style={styles.applicationInfo}>
      <LinearGradient
        colors={getStatusColor(application.status)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.statusContainer}
      >
        <Text style={styles.statusLabel}>Status</Text>
        <Text style={styles.statusValue}>
          {application.status.replace('_', ' ').toUpperCase()}
        </Text>
      </LinearGradient>
      
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Application ID</Text>
          <Text style={styles.infoValue}>{application.id.substring(0, 8)}...</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Submitted</Text>
          <Text style={styles.infoValue}>{application.submitted_at_formatted}</Text>
        </View>
      </View>

      {application.updated_at && (
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Last Updated</Text>
          <Text style={styles.infoValue}>
            {new Date(application.updated_at).toLocaleDateString()}
          </Text>
        </View>
      )}

      {application.admin_notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Shelter Notes:</Text>
          <Text style={styles.notesText}>{application.admin_notes}</Text>
        </View>
      )}
    </View>
  );

  const renderAnimalInfo = () => (
    <Animatable.View animation="fadeIn" duration={500} style={styles.animalContainer}>
      <View style={styles.animalCard}>
        <View style={styles.animalImageContainer}>
          {application.animals?.image_url ? (
            <OptimizedImage
              source={{ uri: application.animals.image_url }}
              style={styles.animalImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.animalImage, styles.placeholderImage]}>
              <Ionicons name="paw" size={40} color="#ddd" />
            </View>
          )}
        </View>
        <View style={styles.animalInfo}>
          <Text style={styles.animalName}>{application.animals?.name}</Text>
          <Text style={styles.animalBreed}>
            {application.animals?.breed || 'Unknown breed'}
          </Text>
          <Text style={styles.animalAge}>
            {application.animals?.age || 'Unknown'} years old
          </Text>
          <TouchableOpacity
            style={styles.viewAnimalButton}
            onPress={() =>
              navigation.navigate('AnimalDetail', { animalId: application.animal_id })
            }
          >
            <Text style={styles.viewAnimalButtonText}>View Animal</Text>
            <Ionicons name="arrow-forward" size={16} color="#6a4c93" />
          </TouchableOpacity>
        </View>
      </View>
    </Animatable.View>
  );

  const renderFormSection = (title, section, formData) => (
    <Animatable.View animation="fadeIn" duration={500} style={styles.formSection}>
      {renderSectionHeader(title, section)}
      {expandedSections[section] && (
        <Animatable.View animation="fadeIn" duration={300} style={styles.formContent}>
          {Object.entries(formData).map(([key, value]) => (
            <View key={key} style={styles.formItem}>
              <Text style={styles.formLabel}>
                {key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())
                  .replace(/([a-z])([A-Z])/g, '$1 $2')}
              </Text>
              <Text style={styles.formValue}>
                {typeof value === 'boolean'
                  ? value
                    ? 'Yes'
                    : 'No'
                  : value || 'Not provided'}
              </Text>
            </View>
          ))}
        </Animatable.View>
      )}
    </Animatable.View>
  );

  if (isLoading || !application) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6a4c93" />
        <Text style={styles.loadingText}>Loading application details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <LinearGradient
        colors={['#6a4c93', '#8a65c9']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Application Details</Text>
        <TouchableOpacity style={styles.actionButton} onPress={refetch}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderApplicationInfo()}
        {renderAnimalInfo()}
        
        <View style={styles.formContainer}>
          {renderFormSection('Personal Information', 'personalInfo', application.application_data.personalInfo || {})}
          {renderFormSection('Housing Information', 'housingInfo', application.application_data.housingInfo || {})}
          {renderFormSection('Lifestyle', 'lifestyle', application.application_data.lifestyle || {})}
          {renderFormSection('Experience with Animals', 'experience', application.application_data.experience || {})}
          {renderFormSection('Agreements', 'agreement', application.application_data.agreement || {})}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  actionButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  applicationInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statusContainer: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  statusLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  statusValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f7ff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6a4c93',
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  animalContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  animalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  animalImageContainer: {
    width: 120,
  },
  animalImage: {
    width: '100%',
    height: 140,
  },
  placeholderImage: {
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animalInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  animalName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  animalBreed: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  animalAge: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  viewAnimalButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAnimalButtonText: {
    color: '#6a4c93',
    fontWeight: '500',
    marginRight: 4,
  },
  formContainer: {
    marginHorizontal: 16,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  formContent: {
    padding: 16,
  },
  formItem: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  formValue: {
    fontSize: 16,
    color: '#333',
  },
});

export default ApplicationDetailsScreen; 