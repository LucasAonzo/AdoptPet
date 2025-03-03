import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getErrorLogs, getBreadcrumbs, clearErrorLogs, clearBreadcrumbs } from '../../utils/debugUtils';

const SimpleDebugScreen = () => {
  const [errorLogs, setErrorLogs] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // Get the error logs from the file system
      const logs = await getErrorLogs();
      setErrorLogs(logs);
      
      // Get the current in-memory breadcrumbs (now async)
      const crumbs = await getBreadcrumbs();
      setBreadcrumbs(crumbs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      Alert.alert('Error', 'Failed to fetch debug logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const clearLogs = async () => {
    Alert.alert(
      'Clear Logs',
      'Are you sure you want to clear all error logs and breadcrumbs?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearErrorLogs();
              clearBreadcrumbs();
              setErrorLogs([]);
              setBreadcrumbs([]);
              Alert.alert('Success', 'All logs have been cleared');
            } catch (error) {
              console.error('Error clearing logs:', error);
              Alert.alert('Error', 'Failed to clear logs');
            }
          }
        }
      ]
    );
  };

  const shareLogsAsText = async () => {
    try {
      const errorLogsText = JSON.stringify(errorLogs, null, 2);
      const breadcrumbsText = JSON.stringify(breadcrumbs, null, 2);
      
      const text = `--- ERROR LOGS ---\n${errorLogsText}\n\n--- BREADCRUMBS ---\n${breadcrumbsText}`;
      
      await Share.share({
        message: text,
        title: 'AdoptMe Debug Logs',
      });
    } catch (error) {
      console.error('Error sharing logs:', error);
      Alert.alert('Error', 'Failed to share logs');
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8e74ae" />
        <Text style={styles.loadingText}>Loading debug logs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#7f67be', '#5b4a9e']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Debug Logs</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={shareLogsAsText} style={styles.headerButton}>
            <Ionicons name="share-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={clearLogs} style={styles.headerButton}>
            <Ionicons name="trash-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8e74ae']}
          />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Breadcrumbs ({breadcrumbs.length})</Text>
          {breadcrumbs.length === 0 ? (
            <Text style={styles.emptyText}>No breadcrumbs available</Text>
          ) : (
            breadcrumbs.map((crumb, index) => (
              <View
                key={index}
                style={styles.logItem}
              >
                <Text style={styles.timestamp}>{crumb.timestamp}</Text>
                <Text style={styles.logMessage}>{crumb.message}</Text>
                {Object.keys(crumb.data).length > 0 && (
                  <Text style={styles.logData}>
                    {JSON.stringify(crumb.data, null, 2)}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Error Logs ({errorLogs.length})</Text>
          {errorLogs.length === 0 ? (
            <Text style={styles.emptyText}>No error logs available</Text>
          ) : (
            errorLogs.map((log, index) => (
              <View
                key={index}
                style={styles.logItem}
              >
                <Text style={styles.timestamp}>{log.timestamp}</Text>
                <Text style={styles.errorType}>{log.type}</Text>
                <Text style={styles.logMessage}>{log.message}</Text>
                {log.stack && (
                  <View style={styles.stackContainer}>
                    <Text style={styles.stackTitle}>Stack Trace:</Text>
                    <Text style={styles.stackTrace}>{log.stack}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  logItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  errorType: {
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 5,
  },
  logMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  logData: {
    fontSize: 12,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 4,
  },
  stackContainer: {
    marginTop: 5,
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 4,
  },
  stackTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  stackTrace: {
    fontSize: 11,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

export default SimpleDebugScreen; 