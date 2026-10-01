import React, { useState } from 'react';
import { Post } from '../../types';
import { usePosts } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../ui/Avatar';
import { Heart, MessageCircle, Send, Bookmark, Music, MoreHorizontal, Check } from 'lucide-react';

interface FeedCardProps {
  post: Post;
  onSelectTag?: (tag: string) => void;
  onNavigateToSpotlights?: () => void;
}

export const FeedCard: React.FC<FeedCardProps> = ({ post, onSelectTag, onNavigateToSpotlights }) => {
  const { toggleLike, toggleSave, openCommentsDrawer } = usePosts();
  const { user, openAuthModal } = useAuth();
  const { startDirectMessage } = useChat();

  const [isHeartPopping, setIsHeartPopping] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleLike = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    toggleLike(post.id);
    setIsHeartPopping(true);
    setTimeout(() => setIsHeartPopping(false), 600);
  };

  const handleDoubleTap = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (!post.isLikedByMe) {
      toggleLike(post.id);
    }
    setIsHeartPopping(true);
    setTimeout(() => setIsHeartPopping(false), 700);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Determine aspect ratio class
  const aspectClass =
    post.aspectRatio === '9:16'
      ? 'aspect-[9/16]'
      : post.aspectRatio === '16:9'
      ? 'aspect-[16/9]'
      : 'aspect-square';

  return (
    <article className="w-full max-w-[480px] mx-auto bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden mb-6 transition-all hover:border-slate-300 dark:hover:border-zinc-700/80">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50 dark:border-zinc-900">
        <div className="flex items-center gap-3">
          <Avatar
            src={post.user.avatarUrl}
            alt={post.user.fullName}
            size="md"
            showPresence
            isOnline={post.user.status === 'online'}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 hover:underline cursor-pointer">
                {post.user.username}
              </span>
              {post.user.verified && (
                <span className="w-3.5 h-3.5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[9px] font-bold">
                  ✓
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500">{post.user.fullName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 dark:text-zinc-500">
            {new Date(post.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <button
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
            aria-label="More options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Media Container with Double-Tap Like & Heart Burst */}
      <div
        className={`relative ${aspectClass} bg-slate-900 flex items-center justify-center cursor-pointer select-none overflow-hidden group`}
        onDoubleClick={handleDoubleTap}
      >
        {post.type === 'spotlight_reel' ? (
          <div className="relative w-full h-full">
            <video
              src={post.mediaUrl}
              poster={post.thumbnailUrl}
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              onMouseEnter={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
              onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()}
            />
            {/* Spotlight Pill Badge on Card */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToSpotlights?.();
              }}
              className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5 hover:bg-rose-600 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Vertical Spotlight
            </div>
          </div>
        ) : (
          <img
            src={post.mediaUrl}
            alt={post.caption || 'Post image'}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        )}

        {/* Double-tap Floating Animated Heart */}
        {isHeartPopping && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart className="w-24 h-24 text-rose-500 fill-rose-500 animate-in zoom-in-50 fade-in duration-300 drop-shadow-2xl" />
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Like Engine */}
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs font-semibold transition-transform active:scale-125 ${
              post.isLikedByMe
                ? 'text-rose-500 dark:text-rose-400'
                : 'text-slate-700 dark:text-zinc-300 hover:text-rose-500'
            }`}
            aria-label="Like post"
          >
            <Heart
              className={`w-6 h-6 transition-all ${
                post.isLikedByMe ? 'fill-rose-500 text-rose-500 scale-110' : ''
              }`}
            />
          </button>

          {/* Comment Drawer Trigger */}
          <button
            type="button"
            onClick={() => openCommentsDrawer(post.id)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            aria-label="View comments"
          >
            <MessageCircle className="w-6 h-6" />
          </button>

          {/* Direct Message Creator / Share Trigger */}
          <button
            type="button"
            onClick={() => {
              if (user && post.user.id !== user.id) {
                startDirectMessage(post.user);
              } else {
                handleShare();
              }
            }}
            className="text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            aria-label="Direct message creator"
          >
            <Send className="w-5 h-5 -rotate-12" />
          </button>
        </div>

        {/* Bookmark / Save */}
        <div className="flex items-center gap-2">
          {copiedLink && (
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> Copied Link
            </span>
          )}
          <button
            type="button"
            onClick={() => toggleSave(post.id)}
            className={`p-1 transition-colors ${
              post.isSavedByMe
                ? 'text-slate-900 dark:text-white fill-slate-900 dark:fill-white'
                : 'text-slate-700 dark:text-zinc-300 hover:text-slate-900'
            }`}
            aria-label="Save post"
          >
            <Bookmark className={`w-5 h-5 ${post.isSavedByMe ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row: Tabular Numerals */}
      <div className="px-4 py-1 text-xs font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
        {post.likesCount.toLocaleString()} {post.likesCount === 1 ? 'like' : 'likes'}
      </div>

      {/* Caption & Clean Unboxed Metadata */}
      <div className="px-4 pt-1 pb-3 text-xs leading-relaxed space-y-1.5">
        <p className="text-slate-800 dark:text-zinc-200">
          <span className="font-bold text-slate-900 dark:text-white mr-1.5">
            {post.user.username}
          </span>
          {post.caption}
        </p>

        {/* Audio Track Marquee Attribution if present */}
        {post.audioTrackTitle && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400 pt-0.5">
            <Music className="w-3 h-3 text-rose-500 shrink-0" />
            <span className="truncate">
              {post.audioTrackTitle} · {post.audioTrackArtist || 'Original Audio'}
            </span>
          </div>
        )}

        {/* Inline Tag Chips */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSelectTag?.(tag)}
                className="text-[11px] text-rose-500 dark:text-rose-400 hover:underline font-medium"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Comment Drawer Prompt */}
        {post.commentsCount > 0 && (
          <button
            type="button"
            onClick={() => openCommentsDrawer(post.id)}
            className="block text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 text-[11px] pt-1"
          >
            View all {post.commentsCount} comments
          </button>
        )}
      </div>
    </article>
  );
};
