import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useUserApplications } from '../../hooks/useAdoptionMutations';
import { SkeletonLoader, OptimizedImage } from '../../components/common';
import { StatusBar } from 'expo-status-bar';
import * as Animatable from 'react-native-animatable';

const ApplicationsScreen = () => {
  const navigation = useNavigation();
  const [activeStatus, setActiveStatus] = useState(null); // null means all applications
  const { data: applications, isLoading, refetch, isRefetching } = useUserApplications(activeStatus);

  const statusOptions = [
    { label: 'All', value: null },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'In Process', value: 'in_process' },
  ];

  const statusColors = {
    pending: '#f39c12',
    approved: '#2ecc71',
    rejected: '#e74c3c',
    in_process: '#3498db',
  };

  const renderStatusBadge = (status) => {
    return (
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: statusColors[status] || '#95a5a6' },
        ]}
      >
        <Text style={styles.statusText}>
          {status.replace('_', ' ').toUpperCase()}
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <Animatable.View animation="fadeIn" duration={500} style={styles.headerContainer}>
      <Text style={styles.headerTitle}>My Applications</Text>
      <View style={styles.filtersContainer}>
        <FlatList
          data={statusOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.value || 'all'}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterItem,
                activeStatus === item.value && styles.activeFilter,
              ]}
              onPress={() => setActiveStatus(item.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeStatus === item.value && styles.activeFilterText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filtersContent}
        />
      </View>
    </Animatable.View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Animatable.View animation="fadeIn" duration={800}>
        <Ionicons name="document-outline" size={80} color="#ccc" />
      </Animatable.View>
      <Animatable.Text animation="fadeIn" delay={300} style={styles.emptyText}>
        No applications found
      </Animatable.Text>
      <Animatable.Text animation="fadeIn" delay={500} style={styles.emptySubtext}>
        {activeStatus
          ? `You don't have any ${activeStatus.replace('_', ' ')} applications`
          : "You haven't submitted any adoption applications yet"}
      </Animatable.Text>
      <Animatable.View animation="fadeIn" delay={700}>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate('AnimalList')}
        >
          <Text style={styles.browseButtonText}>Browse Animals</Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );

  const renderItem = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      duration={300}
      style={styles.applicationCard}
    >
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => navigation.navigate('ApplicationDetails', { applicationId: item.id })}
      >
        <View style={styles.cardImageContainer}>
          {item.animals?.image_url ? (
            <OptimizedImage
              source={{ uri: item.animals.image_url }}
              style={styles.animalImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.animalImage, styles.placeholderImage]}>
              <Ionicons name="paw" size={30} color="#ddd" />
            </View>
          )}
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.animalName}>{item.animals?.name || 'Unknown Animal'}</Text>
          <Text style={styles.applicationDate}>
            Submitted: {item.submitted_at_formatted}
          </Text>
          {renderStatusBadge(item.status)}
        </View>
        <View style={styles.cardArrow}>
          <Ionicons name="chevron-forward" size={24} color="#aaa" />
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {renderHeader()}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <SkeletonLoader type="applications" count={3} />
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filtersContent: {
    paddingBottom: 8,
  },
  filterItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#6a4c93',
  },
  filterText: {
    fontSize: 14,
    color: '#555',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    padding: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  applicationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  cardImageContainer: {
    marginRight: 16,
  },
  animalImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  placeholderImage: {
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  animalName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  applicationDate: {
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardArrow: {
    paddingLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#555',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: '#6a4c93',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ApplicationsScreen; 