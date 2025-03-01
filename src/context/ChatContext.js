import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import chatService from '../services/chatService';
import { AuthContext } from './AuthContext';

// Initialize with null to ensure we can detect when it's not available
export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const authContext = useContext(AuthContext);
  // Safely access user from context
  const user = authContext?.user || null;
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  
  // Use a ref to track mounted state for avoiding updates on unmounted component
  const isMounted = useRef(true);

  // Load conversations when user is authenticated
  useEffect(() => {
    let isMounted = true;
    
    const initChat = async () => {
      try {
        if (user) {
          // Load conversations first
          await loadConversations();
          
          // Then set up subscription if the component is still mounted
          if (isMounted) {
            await subscribeToMessages();
          }
        }
      } catch (err) {
        console.error('Error initializing chat:', err);
        if (isMounted) {
          setError('Failed to initialize chat');
        }
      }
    };
    
    initChat();
    
    // Cleanup subscription and set mounted flag on unmount
    return () => {
      isMounted = false;
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (err) {
          console.error('Error unsubscribing:', err);
        }
      }
    };
  }, [user]);

  // Load messages when current conversation changes
  useEffect(() => {
    if (currentConversation && user) {
      loadMessages(currentConversation.id);
    }
  }, [currentConversation, user]);

  // Subscribe to real-time messages
  const subscribeToMessages = async () => {
    try {
      // First unsubscribe from any existing subscription
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (err) {
          console.error('Error unsubscribing from previous subscription:', err);
        }
      }
      
      // Only subscribe if the user is authenticated
      if (!user) return;
      
      const sub = chatService.subscribeToMessages((payload) => {
        try {
          // Safely handle payload
          if (!payload) return;
          
          const eventType = payload.eventType;
          const newMessage = payload.new;
          const oldMessage = payload.old;
          
          // Handle different event types
          if (eventType === 'INSERT' && newMessage) {
            handleNewMessage(newMessage);
          } else if (eventType === 'UPDATE' && newMessage && oldMessage) {
            handleUpdatedMessage(oldMessage, newMessage);
          } else if (eventType === 'DELETE' && oldMessage) {
            handleDeletedMessage(oldMessage);
          }
        } catch (err) {
          console.error('Error processing message payload:', err);
        }
      });
      
      if (sub) {
        setSubscription(sub);
      }
    } catch (error) {
      console.error('Error subscribing to messages:', error);
      setError('Failed to subscribe to messages');
    }
  };

  // Handle new message from real-time subscription
  const handleNewMessage = (newMessage) => {
    // Check if message is relevant to current user
    if (!user || (newMessage.sender_id !== user.id && newMessage.receiver_id !== user.id)) {
      return;
    }
    
    // Update conversation list
    loadConversations();
    
    // If in a conversation with the sender/receiver, add message to list
    if (currentConversation) {
      const otherUserId = currentConversation.id;
      if (newMessage.sender_id === otherUserId || newMessage.receiver_id === otherUserId) {
        // Mark message as read if current user is the receiver
        if (newMessage.receiver_id === user.id) {
          chatService.markMessagesAsRead(newMessage.sender_id);
        }
        
        // Add new message to list
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: newMessage.id,
            text: newMessage.content,
            time: new Date(newMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date(newMessage.created_at).toLocaleDateString(),
            isFromUser: newMessage.sender_id === user.id,
            read: newMessage.read || newMessage.sender_id === user.id,
          }
        ]);
      }
    }
  };

  // Handle updated message from real-time subscription
  const handleUpdatedMessage = (oldMessage, newMessage) => {
    // Check if message is relevant to current user
    if (!user || (newMessage.sender_id !== user.id && newMessage.receiver_id !== user.id)) {
      return;
    }
    
    // Update message in list if in the current conversation
    if (currentConversation) {
      setMessages(prevMessages => 
        prevMessages.map(message => 
          message.id === newMessage.id 
            ? {
                ...message,
                text: newMessage.content,
                read: newMessage.read,
              }
            : message
        )
      );
    }
    
    // Update conversation list
    loadConversations();
  };

  // Handle deleted message from real-time subscription
  const handleDeletedMessage = (oldMessage) => {
    // Check if message is relevant to current user
    if (!user || (oldMessage.sender_id !== user.id && oldMessage.receiver_id !== user.id)) {
      return;
    }
    
    // Remove message from list if in the current conversation
    if (currentConversation) {
      setMessages(prevMessages => 
        prevMessages.filter(message => message.id !== oldMessage.id)
      );
    }
    
    // Update conversation list
    loadConversations();
  };

  // Load all conversations for current user
  const loadConversations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await chatService.getConversations();
      setConversations(data);
      setError(null);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  // Load messages for a specific conversation
  const loadMessages = async (userId) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await chatService.getMessages(userId);
      setMessages(data);
      setError(null);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Send a new message
  const sendMessage = async (receiverId, content) => {
    if (!user) return;
    
    try {
      setLoading(true);
      await chatService.sendMessage(receiverId, content);
      // The new message will be added via the real-time subscription
      setError(null);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        setCurrentConversation,
        messages,
        loading,
        error,
        sendMessage,
        loadConversations,
        loadMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use the ChatContext
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 