/**
 * Core Domain Types for Spotlight Web Application
 * Strict type safety for Social Graph, Video/Photo Posts, and Real-Time Messaging
 */

export type UserStatus = 'online' | 'offline' | 'away';

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  phone?: string;
  status: UserStatus;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  verified: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type PostType = 'standard' | 'spotlight_reel';

export interface Post {
  id: string;
  userId: string;
  user: User;
  type: PostType;
  mediaUrl: string;
  thumbnailUrl?: string;
  caption: string;
  tags: string[];
  audioTrackTitle?: string;
  audioTrackArtist?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:5';
  isLikedByMe: boolean;
  isSavedByMe: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: User;
  content: string;
  likesCount: number;
  isLikedByMe?: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  text: string;
  mediaUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantOneId: string;
  participantTwoId: string;
  otherUser: User;
  lastMessageText: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface AuthSession {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type TabType = 'feed' | 'spotlights' | 'messages' | 'explore' | 'profile';

export type ProfileTab = 'posts' | 'spotlights' | 'saved' | 'liked';

export interface CreatePostPayload {
  type: PostType;
  mediaUrl: string;
  thumbnailUrl?: string;
  caption: string;
  tags: string[];
  audioTrackTitle?: string;
  audioTrackArtist?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:5';
}

export type RealtimeEventType =
  | 'post:liked'
  | 'post:unliked'
  | 'post:created'
  | 'comment:created'
  | 'comment:deleted'
  | 'message:sent'
  | 'presence:heartbeat'
  | 'user:status';

export interface RealtimePayload<T = unknown> {
  type: RealtimeEventType;
  payload: T;
  timestamp: string;
  senderId?: string;
}
