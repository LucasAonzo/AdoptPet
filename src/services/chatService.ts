import supabase from '../config/supabase';

// Define TypeScript interfaces for the chat service
interface User {
  id: string;
  name: string;
  profile_picture?: string;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  read: boolean;
  users?: User;
}

interface FormattedMessage {
  id: string;
  text: string;
  time: string;
  date: string;
  isFromUser: boolean;
  sender: string;
  avatar: string | null;
  read: boolean;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string | null;
  lastMessage: string;
  time: string;
  date: string;
  unreadCount: number;
  isLastMessageFromUser: boolean;
}

interface ConversationPartner {
  userId: string;
  lastMessageDate: string;
}

interface SubscriptionStatus {
  status: string;
}

interface SupabasePayload {
  new: any;
  old: any;
  eventType: string;
  [key: string]: any;
}

type MessageCallback = (payload: SupabasePayload) => void;

/**
 * Service for chat-related functionality using Supabase
 */
class ChatService {
  /**
   * Subscribe to messages in a channel
   * @param {MessageCallback} callback - Function to call when new messages arrive
   * @returns {object | null} - Subscription object with unsubscribe method
   */
  subscribeToMessages(callback: MessageCallback): any | null {
    try {
      if (!callback || typeof callback !== 'function') {
        console.error('Invalid callback provided to subscribeToMessages');
        return null;
      }

      // Create a channel and subscribe to changes
      const channel = supabase.channel('public:messages');

      // Set up the subscription with error handling
      const subscription = channel
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            try {
              callback(payload);
            } catch (err) {
              console.error('Error in message callback:', err);
            }
          }
        )
        .subscribe((status) => {
          if (status !== 'SUBSCRIBED') {
            console.warn('Supabase subscription status:', status);
          }
        });

      return subscription;
    } catch (error) {
      console.error('Error creating Supabase subscription:', error);
      return null;
    }
  }

  /**
   * Get conversations for the current user
   * @returns {Promise<Conversation[]>} - Promise resolving to an array of conversation objects
   */
  async getConversations(): Promise<Conversation[]> {
    const { data: currentUser } = await supabase.auth.getUser();

    if (!currentUser?.user?.id) {
      throw new Error('User not authenticated');
    }

    const userId = currentUser.user.id;

    // Get all unique users the current user has chatted with
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        receiver_id,
        created_at
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Extract unique conversation partners
    const conversationPartners = new Map<string, ConversationPartner>();

    for (const message of data) {
      const partnerId = message.sender_id === userId
        ? message.receiver_id
        : message.sender_id;

      if (!conversationPartners.has(partnerId)) {
        conversationPartners.set(partnerId, {
          userId: partnerId,
          lastMessageDate: message.created_at
        });
      }
    }

    // Fetch user details for all conversation partners
    const partnerIds = Array.from(conversationPartners.keys());

    if (partnerIds.length === 0) {
      return [];
    }

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, profile_picture')
      .in('id', partnerIds);

    if (usersError) {
      throw usersError;
    }

    // Fetch the last message for each conversation
    const conversations: Conversation[] = [];

    for (const user of users) {
      const { data: lastMessages, error: lastMessageError } = await supabase
        .from('messages')
        .select('id, content, created_at, sender_id, read')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${user.id}),and(sender_id.eq.${user.id},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (lastMessageError) {
        throw lastMessageError;
      }

      if (lastMessages && lastMessages.length > 0) {
        const lastMessage = lastMessages[0];

        // Count unread messages
        const { count, error: countError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', user.id)
          .eq('receiver_id', userId)
          .eq('read', false);

        if (countError) {
          throw countError;
        }

        conversations.push({
          id: user.id,
          name: user.name,
          avatar: user.profile_picture || null,
          lastMessage: lastMessage.content,
          time: new Date(lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(lastMessage.created_at).toLocaleDateString(),
          unreadCount: count || 0,
          isLastMessageFromUser: lastMessage.sender_id === userId,
        });
      }
    }

    // Sort conversations by last message date (newest first)
    return conversations.sort((a, b) => {
      return new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime();
    });
  }

  /**
   * Get messages between the current user and another user
   * @param {string} otherUserId - ID of the other user in the conversation
   * @returns {Promise<FormattedMessage[]>} - Promise resolving to an array of message objects
   */
  async getMessages(otherUserId: string): Promise<FormattedMessage[]> {
    const { data: currentUser } = await supabase.auth.getUser();

    if (!currentUser?.user?.id) {
      throw new Error('User not authenticated');
    }

    const userId = currentUser.user.id;

    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        sender_id,
        receiver_id,
        read,
        users!sender_id(name, profile_picture)
      `)
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    // Mark messages as read
    await this.markMessagesAsRead(otherUserId);

    // Format messages for the UI
    return data.map(message => ({
      id: message.id,
      text: message.content,
      time: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(message.created_at).toLocaleDateString(),
      isFromUser: message.sender_id === userId,
      sender: message.users && message.users[0]?.name || 'Unknown User',
      avatar: message.users && message.users[0]?.profile_picture || null,
      read: message.read,
    }));
  }

  /**
   * Send a message to another user
   * @param {string} receiverId - ID of the message recipient
   * @param {string} content - Content of the message
   * @returns {Promise<Message>} - Promise resolving to the sent message
   */
  async sendMessage(receiverId: string, content: string): Promise<Message> {
    const { data: currentUser } = await supabase.auth.getUser();

    if (!currentUser?.user?.id) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUser.user.id,
        receiver_id: receiverId,
        content,
      })
      .select();

    if (error) {
      throw error;
    }

    return data[0];
  }

  /**
   * Mark messages from a specific user as read
   * @param {string} senderId - ID of the message sender
   * @returns {Promise<void>} - Promise resolving when messages are marked as read
   */
  async markMessagesAsRead(senderId: string): Promise<void> {
    const { data: currentUser } = await supabase.auth.getUser();

    if (!currentUser?.user?.id) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('sender_id', senderId)
      .eq('receiver_id', currentUser.user.id)
      .eq('read', false);

    if (error) {
      throw error;
    }
  }
}

export default new ChatService(); 