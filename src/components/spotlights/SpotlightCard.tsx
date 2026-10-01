import React, { useRef, useState, useEffect } from 'react';
import { Post } from '../../types';
import { usePosts } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../ui/Avatar';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Play,
  Music,
  Plus,
  Check,
} from 'lucide-react';

interface SpotlightCardProps {
  post: Post;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  post,
  isActive,
  isMuted,
  onToggleMute,
}) => {
  const { toggleLike, toggleSave, openCommentsDrawer } = usePosts();
  const { user, openAuthModal } = useAuth();
  const { startDirectMessage } = useChat();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isHeartBurst, setIsHeartBurst] = useState(false);

  // Play/Pause active video using Intersection / Active index
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.muted = isMuted;
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay policy fallback: mute and retry
            video.muted = true;
            video.play().catch(() => {});
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive, isMuted]);

  const handleVideoTap = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
      setShowPlayIcon(false);
    } else {
      video.pause();
      setIsPlaying(false);
      setShowPlayIcon(true);
    }
  };

  const handleDoubleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (!post.isLikedByMe) {
      toggleLike(post.id);
    }
    setIsHeartBurst(true);
    setTimeout(() => setIsHeartBurst(false), 700);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal('login');
      return;
    }
    toggleLike(post.id);
    setIsHeartBurst(true);
    setTimeout(() => setIsHeartBurst(false), 600);
  };

  return (
    <div
      className="relative w-full h-[calc(100vh-68px)] md:h-[calc(100vh-40px)] max-w-[440px] mx-auto snap-start snap-always rounded-3xl overflow-hidden bg-black select-none shadow-2xl flex items-center justify-center my-2"
      onDoubleClick={handleDoubleTap}
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={post.mediaUrl}
        poster={post.thumbnailUrl}
        loop
        playsInline
        muted={isMuted}
        preload={isActive ? 'auto' : 'metadata'}
        onClick={handleVideoTap}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Measured Scrim Gradient for Contrast Legibility */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/80" />

      {/* Floating Play/Pause Visual Feedback */}
      {showPlayIcon && (
        <div
          onClick={handleVideoTap}
          className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-auto cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white scale-110 shadow-lg">
            <Play className="w-8 h-8 ml-1 fill-white" />
          </div>
        </div>
      )}

      {/* Double-tap Floating Heart Burst */}
      {isHeartBurst && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <Heart className="w-28 h-28 text-rose-500 fill-rose-500 animate-in zoom-in-50 fade-in duration-300 drop-shadow-2xl" />
        </div>
      )}

      {/* Top Left: Sound Mute/Unmute Toggle & Live Indicator */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <button
          onClick={onToggleMute}
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-rose-400" />}
        </button>
      </div>

      {/* Right-Hand Contextual Action Cluster */}
      <div className="absolute right-3 bottom-16 z-20 flex flex-col items-center gap-5">
        {/* Creator Avatar with Follow Button Badge */}
        <div className="relative group">
          <div className="p-0.5 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400">
            <Avatar src={post.user.avatarUrl} alt={post.user.fullName} size="md" />
          </div>
          {!isFollowing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFollowing(true);
              }}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
              aria-label="Follow creator"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          )}
        </div>

        {/* Like Button with Scale Animation */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleLikeClick}
            className={`w-12 h-12 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md transition-all active:scale-125 ${
              post.isLikedByMe ? 'text-rose-500' : 'text-white hover:text-rose-400'
            }`}
            aria-label="Like spotlight"
          >
            <Heart
              className={`w-7 h-7 transition-all ${
                post.isLikedByMe ? 'fill-rose-500 scale-110' : ''
              }`}
            />
          </button>
          <span className="text-white text-xs font-bold mt-1 tabular-nums drop-shadow-md">
            {post.likesCount.toLocaleString()}
          </span>
        </div>

        {/* Comment Drawer Trigger */}
        <div className="flex flex-col items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openCommentsDrawer(post.id);
            }}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md text-white hover:text-rose-400 transition-colors"
            aria-label="Open comments"
          >
            <MessageCircle className="w-7 h-7" />
          </button>
          <span className="text-white text-xs font-bold mt-1 tabular-nums drop-shadow-md">
            {post.commentsCount.toLocaleString()}
          </span>
        </div>

        {/* Bookmark / Save */}
        <div className="flex flex-col items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSave(post.id);
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md transition-colors ${
              post.isSavedByMe ? 'text-amber-400 fill-amber-400' : 'text-white hover:text-amber-300'
            }`}
            aria-label="Save spotlight"
          >
            <Bookmark className={`w-6 h-6 ${post.isSavedByMe ? 'fill-current' : ''}`} />
          </button>
          <span className="text-white text-xs font-bold mt-1 tabular-nums drop-shadow-md">
            {post.isSavedByMe ? 'Saved' : 'Save'}
          </span>
        </div>

        {/* Direct Message / Share Trigger */}
        <div className="flex flex-col items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (user && post.user.id !== user.id) {
                startDirectMessage(post.user);
              } else {
                navigator.clipboard?.writeText(window.location.href);
              }
            }}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md text-white hover:text-rose-400 transition-colors"
            aria-label="Share or message creator"
          >
            <Share2 className="w-6 h-6" />
          </button>
          <span className="text-white text-xs font-bold mt-1 tabular-nums drop-shadow-md">
            {post.sharesCount}
          </span>
        </div>

        {/* Spinning Vinyl Audio Disc Marquee */}
        <div className="mt-2">
          <div
            className={`w-11 h-11 rounded-full border-2 border-zinc-700 bg-zinc-900 p-1 flex items-center justify-center shadow-lg ${
              isPlaying ? 'animate-spin [animation-duration:4s]' : ''
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Metadata Cluster */}
      <div className="absolute left-4 bottom-5 right-20 z-20 text-white space-y-2 pointer-events-auto">
        {/* Creator Handle & Verified */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-white drop-shadow-md tracking-tight">
            @{post.user.username}
          </span>
          {post.user.verified && (
            <span className="w-3.5 h-3.5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[9px] font-bold">
              ✓
            </span>
          )}
        </div>

        {/* Caption */}
        <p className="text-xs text-zinc-100 line-clamp-2 drop-shadow-sm leading-relaxed">
          {post.caption}
        </p>

        {/* Audio Track Marquee Animation */}
        <div className="flex items-center gap-2 pt-1 text-xs text-zinc-200">
          <Music className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <div className="overflow-hidden w-48 whitespace-nowrap">
            <span className="inline-block animate-[marquee_12s_linear_infinite] drop-shadow-xs font-medium">
              {post.audioTrackTitle || 'Original Audio'} · {post.audioTrackArtist || post.user.fullName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
