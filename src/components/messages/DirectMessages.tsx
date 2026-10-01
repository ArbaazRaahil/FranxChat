import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import {
  Send,
  ArrowLeft,
  Search,
  MessageSquare,
  Sparkles,
  Phone,
  Video,
  Info,
} from 'lucide-react';

export const DirectMessages: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    activeConversation,
    messages,
    selectConversation,
    sendMessage,
    onlineUserIds,
  } = useChat();

  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom on new message payload
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, activeConversationId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  const filteredConversations = conversations.filter((c) =>
    c.otherUser.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-5xl mx-auto h-[calc(100vh-80px)] md:h-[calc(100vh-48px)] my-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row">
      {/* Column 1: Conversations List (Hidden on mobile if conversation is selected) */}
      <div
        className={`w-full md:w-80 md:border-r border-slate-100 dark:border-zinc-800 flex flex-col ${
          activeConversationId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* User DM Header */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Messages</h2>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 text-xs font-semibold tabular-nums">
              {conversations.length}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Conversation Rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-zinc-900">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 dark:text-zinc-500">
              No conversations found
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isOnline = onlineUserIds.has(conv.otherUser.id);
              const isSelected = activeConversationId === conv.id;

              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors ${
                    isSelected
                      ? 'bg-rose-50/60 dark:bg-rose-950/20'
                      : 'hover:bg-slate-50 dark:hover:bg-zinc-900/50'
                  }`}
                >
                  <Avatar
                    src={conv.otherUser.avatarUrl}
                    alt={conv.otherUser.fullName}
                    size="md"
                    showPresence
                    isOnline={isOnline}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {conv.otherUser.fullName}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 shrink-0">
                        {conv.lastMessageAt}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                        {conv.lastMessageText}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 ml-1.5 tabular-nums">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Column 2: Active Chat View (Hidden on mobile if no conversation is selected) */}
      <div
        className={`flex-1 flex flex-col bg-slate-50/40 dark:bg-zinc-950/40 ${
          activeConversationId ? 'flex' : 'hidden md:flex'
        }`}
      >
        {activeConversation ? (
          <>
            {/* Chat Thread Header */}
            <div className="h-16 px-4 bg-white dark:bg-zinc-950 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => selectConversation(null)}
                  className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <Avatar
                  src={activeConversation.otherUser.avatarUrl}
                  alt={activeConversation.otherUser.fullName}
                  size="sm"
                  showPresence
                  isOnline={onlineUserIds.has(activeConversation.otherUser.id)}
                />

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {activeConversation.otherUser.fullName}
                    </span>
                    {activeConversation.otherUser.verified && (
                      <span className="w-3.5 h-3.5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[9px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                    {onlineUserIds.has(activeConversation.otherUser.id)
                      ? 'Active now'
                      : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Chat Actions */}
              <div className="flex items-center gap-1">
                <button
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-900"
                  aria-label="Voice call"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-900"
                  aria-label="Video call"
                >
                  <Video className="w-4 h-4" />
                </button>
                <button
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-900"
                  aria-label="Details"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isMe = msg.senderId === user?.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <Avatar
                        src={activeConversation.otherUser.avatarUrl}
                        alt={activeConversation.otherUser.fullName}
                        size="xs"
                      />
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        isMe
                          ? 'bg-rose-500 text-white rounded-br-xs'
                          : 'bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 border border-slate-200/80 dark:border-zinc-800 rounded-bl-xs shadow-2xs'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span
                        className={`text-[9px] block text-right mt-1 opacity-70 ${
                          isMe ? 'text-white' : 'text-slate-400 dark:text-zinc-500'
                        }`}
                      >
                        {msg.createdAt}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Composer */}
            <form
              onSubmit={handleSend}
              className="p-3 bg-white dark:bg-zinc-950 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${activeConversation.otherUser.fullName}...`}
                className="flex-1 h-11 px-4 rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-11 h-11 rounded-full flex items-center justify-center bg-rose-500 hover:bg-rose-600 disabled:bg-slate-200 dark:disabled:bg-zinc-800 text-white disabled:text-slate-400 transition-colors shadow-sm"
                aria-label="Send message"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 dark:text-zinc-500">
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Your Direct Messages</h3>
            <p className="text-xs max-w-sm mt-1 mb-4">
              Send private photos, videos, and real-time messages to creators on Spotlight.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Real-Time Bi-Directional WebSocket Sync</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
