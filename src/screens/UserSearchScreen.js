import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import supabase from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { defaultAvatarBase64 } from '../../assets/defaultAvatar';

const UserSearchScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { setCurrentConversation } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers();
    } else {
      // If search is empty, show recently active users
      fetchRecentUsers();
    }
  }, [searchQuery]);

  const fetchRecentUsers = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get recently active users (excluding current user)
      const { data, error } = await supabase
        .from('users')
        .select('id, name, profile_picture, bio')
        .neq('id', user.id)
        .order('updated_at', { ascending: false })
        .limit(20);
        
      if (error) {
        throw error;
      }
      
      setUsers(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching recent users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!user || !searchQuery.trim()) return;
    
    try {
      setLoading(true);
      
      // Search users by name (excluding current user)
      const { data, error } = await supabase
        .from('users')
        .select('id, name, profile_picture, bio')
        .neq('id', user.id)
        .ilike('name', `%${searchQuery}%`)
        .limit(20);
        
      if (error) {
        throw error;
      }
      
      setUsers(data || []);
      setError(null);
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (selectedUser) => {
    // Format user data to match conversation format
    const conversation = {
      id: selectedUser.id,
      name: selectedUser.name,
      avatar: selectedUser.profile_picture,
    };
    
    setCurrentConversation(conversation);
    navigation.navigate('Conversation', { name: selectedUser.name });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#8e74ae" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : users.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.noResultsText}>
            {searchQuery.trim() ? 'No users found' : 'No recent users'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.userItem} 
              onPress={() => handleSelectUser(item)}
            >
              <Image 
                source={
                  item.profile_picture 
                    ? { uri: item.profile_picture } 
                    : { uri: defaultAvatarBase64 }
                } 
                style={styles.avatar} 
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                {item.bio && (
                  <Text style={styles.userBio} numberOfLines={1}>
                    {item.bio}
                  </Text>
                )}
              </View>
              <Ionicons name="chatbubble-outline" size={24} color="#8e74ae" />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userBio: {
    fontSize: 14,
    color: '#666',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: 'tomato',
    textAlign: 'center',
  },
});

export default UserSearchScreen; 