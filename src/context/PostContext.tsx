/**
 * Post & Spotlight Lifecycle Context
 * Implements:
 * - Real-time optimistic likes engine mapping to database counters
 * - High-throughput comment stream
 * - Upload wizard state and publishing pipeline
 * - Real-time listener synchronization
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Post, Comment, CreatePostPayload, PostType } from '../types';
import { INITIAL_POSTS, INITIAL_COMMENTS } from '../services/seedData';
import { useAuth } from './AuthContext';
import { realtimeClient } from '../services/realtimeClient';

interface PostContextType {
  posts: Post[];
  spotlights: Post[];
  comments: Record<string, Comment[]>;
  activeCommentPostId: string | null;
  openCommentsDrawer: (postId: string) => void;
  closeCommentsDrawer: () => void;
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  createPost: (payload: CreatePostPayload) => Promise<Post>;
  isUploadWizardOpen: boolean;
  openUploadWizard: (defaultType?: PostType) => void;
  closeUploadWizard: () => void;
  uploadWizardDefaultType: PostType;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

const POSTS_STORAGE_KEY = 'spotlight_posts_data';
const COMMENTS_STORAGE_KEY = 'spotlight_comments_data';

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem(POSTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_POSTS;
  });

  const [comments, setComments] = useState<Record<string, Comment[]>>(() => {
    try {
      const saved = localStorage.getItem(COMMENTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_COMMENTS;
  });

  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [isUploadWizardOpen, setIsUploadWizardOpen] = useState(false);
  const [uploadWizardDefaultType, setUploadWizardDefaultType] = useState<PostType>('standard');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
  }, [comments]);

  // Real-time listener for optimistic likes, comments, and posts
  useEffect(() => {
    const unsubLike = realtimeClient.subscribe<{ postId: string; likesCount: number; isLiked: boolean; userId: string }>(
      'post:liked',
      (payload) => {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === payload.postId) {
              return {
                ...p,
                likesCount: payload.likesCount,
                isLikedByMe: user?.id === payload.userId ? payload.isLiked : p.isLikedByMe,
              };
            }
            return p;
          })
        );
      }
    );

    const unsubComment = realtimeClient.subscribe<{ postId: string; comment: Comment }>(
      'comment:created',
      (payload) => {
        setComments((prev) => {
          const list = prev[payload.postId] || [];
          if (list.some((c) => c.id === payload.comment.id)) return prev;
          return {
            ...prev,
            [payload.postId]: [...list, payload.comment],
          };
        });

        setPosts((prev) =>
          prev.map((p) => (p.id === payload.postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
        );
      }
    );

    const unsubNewPost = realtimeClient.subscribe<Post>('post:created', (newPost) => {
      setPosts((prev) => {
        if (prev.some((p) => p.id === newPost.id)) return prev;
        return [newPost, ...prev];
      });
    });

    return () => {
      unsubLike();
      unsubComment();
      unsubNewPost();
    };
  }, [user]);

  /**
   * Optimistic Like Engine
   */
  const toggleLike = (postId: string) => {
    setPosts((prev) => {
      const target = prev.find((p) => p.id === postId);
      if (!target) return prev;

      const newIsLiked = !target.isLikedByMe;
      const newCount = newIsLiked ? target.likesCount + 1 : Math.max(0, target.likesCount - 1);

      // Broadcast optimistic update
      realtimeClient.send('post:liked', {
        postId,
        likesCount: newCount,
        isLiked: newIsLiked,
        userId: user?.id || 'guest',
      });

      return prev.map((p) =>
        p.id === postId ? { ...p, isLikedByMe: newIsLiked, likesCount: newCount } : p
      );
    });
  };

  /**
   * Toggle Bookmark / Save
   */
  const toggleSave = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isSavedByMe: !p.isSavedByMe } : p))
    );
  };

  /**
   * Real-time Add Comment
   */
  const addComment = (postId: string, content: string) => {
    if (!content.trim() || !user) return;

    const newComment: Comment = {
      id: `cmt_${Date.now()}`,
      postId,
      userId: user.id,
      user,
      content: content.trim(),
      likesCount: 0,
      isLikedByMe: false,
      createdAt: 'Just now',
    };

    // Optimistic local state update
    setComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
    }));

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
    );

    // Broadcast over real-time channel
    realtimeClient.send('comment:created', { postId, comment: newComment });
  };

  /**
   * Media Upload Pipeline
   */
  const createPost = async (payload: CreatePostPayload): Promise<Post> => {
    if (!user) throw new Error('Authentication required to create a post');

    const newPost: Post = {
      id: `post_${Date.now()}`,
      userId: user.id,
      user,
      type: payload.type,
      mediaUrl: payload.mediaUrl,
      thumbnailUrl: payload.thumbnailUrl || payload.mediaUrl,
      caption: payload.caption,
      tags: payload.tags,
      audioTrackTitle: payload.audioTrackTitle,
      audioTrackArtist: payload.audioTrackArtist,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      aspectRatio: payload.aspectRatio || (payload.type === 'spotlight_reel' ? '9:16' : '1:1'),
      isLikedByMe: false,
      isSavedByMe: false,
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) => [newPost, ...prev]);

    // Broadcast new post
    realtimeClient.send('post:created', newPost);

    return newPost;
  };

  const openCommentsDrawer = (postId: string) => {
    setActiveCommentPostId(postId);
  };

  const closeCommentsDrawer = () => {
    setActiveCommentPostId(null);
  };

  const openUploadWizard = (defaultType: PostType = 'standard') => {
    setUploadWizardDefaultType(defaultType);
    setIsUploadWizardOpen(true);
  };

  const closeUploadWizard = () => {
    setIsUploadWizardOpen(false);
  };

  const spotlights = posts.filter((p) => p.type === 'spotlight_reel');

  return (
    <PostContext.Provider
      value={{
        posts,
        spotlights,
        comments,
        activeCommentPostId,
        openCommentsDrawer,
        closeCommentsDrawer,
        toggleLike,
        toggleSave,
        addComment,
        createPost,
        isUploadWizardOpen,
        openUploadWizard,
        closeUploadWizard,
        uploadWizardDefaultType,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};
