/**
 * Real-Time Distributed Messaging (Direct Messages) & Presence Tracking Context
 * Dual-column desktop / isolated mobile stack
 * Global presence heartbeat tracking
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Conversation, Message, User } from '../types';
import { INITIAL_CONVERSATIONS, INITIAL_MESSAGES, INITIAL_CREATORS } from '../services/seedData';
import { useAuth } from './AuthContext';
import { realtimeClient } from '../services/realtimeClient';

interface ChatContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  messages: Message[];
  selectConversation: (convId: string | null) => void;
  sendMessage: (text: string) => void;
  startDirectMessage: (targetUser: User) => void;
  onlineUserIds: Set<string>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const CHAT_STORAGE_KEY = 'spotlight_chats_data';
const MSGS_STORAGE_KEY = 'spotlight_messages_data';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CONVERSATIONS;
  });

  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(() => {
    try {
      const saved = localStorage.getItem(MSGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_MESSAGES;
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(
    new Set(['usr_me_01', 'usr_maya_02', 'usr_kenji_03'])
  );

  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem(MSGS_STORAGE_KEY, JSON.stringify(messagesMap));
  }, [messagesMap]);

  // Real-time listeners for incoming messages and presence
  useEffect(() => {
    const unsubMessage = realtimeClient.subscribe<{ conversationId: string; message: Message }>(
      'message:sent',
      ({ conversationId, message }) => {
        setMessagesMap((prev) => {
          const list = prev[conversationId] || [];
          if (list.some((m) => m.id === message.id)) return prev;
          return {
            ...prev,
            [conversationId]: [...list, message],
          };
        });

        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessageText: message.text,
                  lastMessageAt: 'Just now',
                  unreadCount: activeConversationId === conversationId ? 0 : c.unreadCount + 1,
                }
              : c
          )
        );
      }
    );

    const unsubPresence = realtimeClient.subscribe<{ userId: string; status: string }>(
      'presence:heartbeat',
      ({ userId, status }) => {
        setOnlineUserIds((prev) => {
          const next = new Set(prev);
          if (status === 'online') {
            next.add(userId);
          } else {
            next.delete(userId);
          }
          return next;
        });
      }
    );

    return () => {
      unsubMessage();
      unsubPresence();
    };
  }, [activeConversationId]);

  const selectConversation = (convId: string | null) => {
    setActiveConversationId(convId);
    if (convId) {
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
      );
    }
  };

  const sendMessage = (text: string) => {
    if (!text.trim() || !activeConversationId || !user) return;

    const conv = conversations.find((c) => c.id === activeConversationId);
    if (!conv) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      conversationId: activeConversationId,
      senderId: user.id,
      recipientId: conv.otherUser.id,
      text: text.trim(),
      isRead: false,
      createdAt: 'Just now',
    };

    // Optimistic local state update
    setMessagesMap((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), newMessage],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              lastMessageText: newMessage.text,
              lastMessageAt: 'Just now',
            }
          : c
      )
    );

    // Broadcast message over real-time server
    realtimeClient.send('message:sent', {
      conversationId: activeConversationId,
      message: newMessage,
    });
  };

  const startDirectMessage = (targetUser: User) => {
    if (!user) return;
    const existing = conversations.find((c) => c.otherUser.id === targetUser.id);
    if (existing) {
      selectConversation(existing.id);
      return;
    }

    const newConvId = `conv_${targetUser.id.replace('usr_', '')}_${Date.now()}`;
    const newConv: Conversation = {
      id: newConvId,
      participantOneId: user.id,
      participantTwoId: targetUser.id,
      otherUser: targetUser,
      lastMessageText: 'Started a new conversation',
      lastMessageAt: 'Just now',
      unreadCount: 0,
    };

    setConversations((prev) => [newConv, ...prev]);
    setMessagesMap((prev) => ({
      ...prev,
      [newConvId]: [],
    }));
    setActiveConversationId(newConvId);
  };

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || null;
  const messages = activeConversationId ? messagesMap[activeConversationId] || [] : [];

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversationId,
        activeConversation,
        messages,
        selectConversation,
        sendMessage,
        startDirectMessage,
        onlineUserIds,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
