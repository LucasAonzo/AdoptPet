import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ConversationItem from '../components/chat/ConversationItem';
import { useChat } from '../context/ChatContext';

const ChatScreen = ({ navigation }) => {
  const { 
    conversations, 
    loadConversations, 
    setCurrentConversation, 
    loading, 
    error 
  } = useChat();

  useEffect(() => {
    loadConversations();
    
    // Set up a focus listener to refresh data when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      loadConversations();
    });

    return unsubscribe;
  }, [navigation]);

  // Handle selecting a conversation
  const handleSelectConversation = (conversation) => {
    setCurrentConversation(conversation);
    navigation.navigate('Conversation', { name: conversation.name });
  };

  if (loading && conversations.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8e74ae" />
      </View>
    );
  }

  if (error && conversations.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={loadConversations}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('UserSearch')}
        >
          <Ionicons name="search" size={24} color="#444" />
        </TouchableOpacity>
      </View>
      
      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubText}>
            Start chatting with other pet owners and shelters
          </Text>
          <TouchableOpacity 
            style={styles.newChatButton}
            onPress={() => navigation.navigate('UserSearch')}
          >
            <Text style={styles.newChatButtonText}>Start a new chat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ConversationItem 
              conversation={item} 
              onPress={() => handleSelectConversation(item)} 
            />
          )}
          refreshing={loading}
          onRefresh={loadConversations}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  newChatButton: {
    backgroundColor: '#8e74ae',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  newChatButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: 'tomato',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#8e74ae',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatScreen; 