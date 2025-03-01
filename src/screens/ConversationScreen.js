import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MessageBubble from '../components/chat/MessageBubble';
import MessageInput from '../components/chat/MessageInput';
import { useChat } from '../context/ChatContext';
import { defaultAvatarBase64 } from '../../assets/defaultAvatar';

const ConversationScreen = ({ navigation, route }) => {
  const { 
    currentConversation, 
    messages, 
    loading, 
    error, 
    sendMessage 
  } = useChat();
  
  const flatListRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);

  // Format messages by date
  const formatMessages = () => {
    const formatted = [];
    let currentDate = null;
    
    messages.forEach(message => {
      if (message.date !== currentDate) {
        formatted.push({
          id: `date-${message.date}`,
          isDateSeparator: true,
          date: message.date
        });
        currentDate = message.date;
      }
      formatted.push(message);
    });
    
    return formatted;
  };

  // Handle sending a message
  const handleSendMessage = (text) => {
    if (currentConversation) {
      sendMessage(currentConversation.id, text);
    }
  };

  // Render item based on type
  const renderItem = ({ item }) => {
    if (item.isDateSeparator) {
      return (
        <View style={styles.dateSeparator}>
          <Text style={styles.dateSeparatorText}>{item.date}</Text>
        </View>
      );
    }
    return <MessageBubble message={item} />;
  };

  if (!currentConversation) {
    navigation.goBack();
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.profileContainer}
            onPress={() => navigation.navigate('ViewProfile', { userId: currentConversation.id })}
          >
            <Image 
              source={
                currentConversation.avatar 
                  ? { uri: currentConversation.avatar } 
                  : { uri: defaultAvatarBase64 }
              } 
              style={styles.avatar} 
            />
            <View>
              <Text style={styles.name}>{currentConversation.name}</Text>
              <Text style={styles.onlineStatus}>Online</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionsButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        {loading && messages.length === 0 ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#8e74ae" />
          </View>
        ) : error && messages.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={formatMessages()}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.messagesContainer}
            onContentSizeChange={() => 
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
        )}
        
        <MessageInput onSend={handleSendMessage} />
      </KeyboardAvoidingView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 5,
  },
  profileContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  onlineStatus: {
    fontSize: 12,
    color: '#5BC236',
  },
  optionsButton: {
    padding: 5,
  },
  messagesContainer: {
    flexGrow: 1,
    padding: 10,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 10,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  errorText: {
    color: 'tomato',
    fontSize: 16,
  },
});

export default ConversationScreen; 