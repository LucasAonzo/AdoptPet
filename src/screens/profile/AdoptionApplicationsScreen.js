import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useUserAdoptionApplications } from '../../hooks/useAdoptionMutations';
import { OptimizedImage, EmptyState } from '../../components/common';
import { formatDistanceToNow } from 'date-fns';

const AdoptionApplicationsScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useUserAdoptionApplications();

  // Set navigation options
  useEffect(() => {
    navigation.setOptions({
      title: 'My Applications',
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

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Handle end reached (pagination)
  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Handle application press
  const handleApplicationPress = (application) => {
    navigation.navigate('ApplicationDetail', { application });
  };

  // Get all applications from all pages
  const getAllApplications = () => {
    if (!data || !data.pages) return [];
    return data.pages.flatMap(page => page.applications);
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

  // Format status text for display
  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Unknown date';
    }
  };

  // Render application item
  const renderApplicationItem = ({ item }) => {
    const animal = item.animals;
    if (!animal) return null;

    return (
      <TouchableOpacity
        style={styles.applicationCard}
        onPress={() => handleApplicationPress(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.animalInfo}>
            <OptimizedImage
              source={animal.image_url}
              style={styles.animalImage}
              contentFit="cover"
              transitionDuration={300}
            />
            <View style={styles.animalDetails}>
              <Text style={styles.animalName}>{animal.name}</Text>
              <Text style={styles.animalSpecies}>{animal.species} • {animal.breed}</Text>
            </View>
          </View>
          <View style={getStatusBadgeStyle(item.status)}>
            <Text style={getStatusTextStyle(item.status)}>
              {formatStatus(item.status)}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <Text style={styles.applicationDate}>
            Applied {formatDate(item.created_at)}
          </Text>
          <View style={styles.viewDetailsContainer}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#8e74ae" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render footer (loading indicator for pagination)
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#8e74ae" />
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8e74ae" />
        </View>
      );
    }

    if (isError) {
      return (
        <EmptyState
          icon="alert-circle"
          title="Oops, something went wrong"
          message={error?.message || "We couldn't load your applications. Please try again."}
          actionLabel="Try Again"
          onAction={refetch}
        />
      );
    }

    return (
      <EmptyState
        icon="document-text"
        title="No Applications Yet"
        message="You haven't submitted any adoption applications yet. Find your perfect companion and apply today!"
        actionLabel="Find Pets"
        onAction={() => navigation.navigate('AnimalListScreen')}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#8e74ae" />
      
      <FlatList
        data={getAllApplications()}
        renderItem={renderApplicationItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#8e74ae']}
            tintColor="#8e74ae"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  applicationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  animalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  animalImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  animalDetails: {
    flex: 1,
  },
  animalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  animalSpecies: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  pendingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFF5E6',
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
  },
  cancelledText: {
    color: '#757575',
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  applicationDate: {
    fontSize: 12,
    color: '#666666',
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#8e74ae',
    fontWeight: '500',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default AdoptionApplicationsScreen; 