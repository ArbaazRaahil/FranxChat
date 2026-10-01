import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../context/PostContext';
import { Avatar } from '../ui/Avatar';
import { ProfileTab, Post } from '../../types';
import { Grid, Film, Bookmark, Heart, Edit3, Check, Settings } from 'lucide-react';

export const ProfileView: React.FC<{ onSelectPost?: (post: Post) => void }> = ({ onSelectPost }) => {
  const { user, updateProfile, openAuthModal } = useAuth();
  const { posts, spotlights } = usePosts();

  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(user?.bio || '');
  const [fullNameInput, setFullNameInput] = useState(user?.fullName || '');

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center px-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile Login Required</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          Sign in or create an account to view and manage your Spotlight profile.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-full bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-colors"
        >
          Sign In / Sign Up
        </button>
      </div>
    );
  }

  const userPosts = posts.filter((p) => p.userId === user.id && p.type === 'standard');
  const userSpotlights = spotlights.filter((p) => p.userId === user.id);
  const savedPosts = posts.filter((p) => p.isSavedByMe);
  const likedPosts = posts.filter((p) => p.isLikedByMe);

  const handleSaveBio = () => {
    updateProfile({ bio: bioInput.trim(), fullName: fullNameInput.trim() });
    setIsEditingBio(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 mb-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
          {/* Circular High-Res Avatar with Verified Ring */}
          <div className="relative">
            <div className="p-1 rounded-full bg-gradient-to-tr from-rose-500 via-violet-600 to-amber-400 shadow-md">
              <Avatar src={user.avatarUrl} alt={user.fullName} size="2xl" />
            </div>
            {user.verified && (
              <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-zinc-950">
                ✓
              </span>
            )}
          </div>

          {/* User Bio and Metrics */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {user.fullName}
                </h1>
                <p className="text-xs font-semibold text-rose-500 dark:text-rose-400">
                  @{user.username}
                </p>
              </div>

              {/* Edit Bio Button */}
              <div>
                {!isEditingBio ? (
                  <button
                    onClick={() => {
                      setBioInput(user.bio);
                      setFullNameInput(user.fullName);
                      setIsEditingBio(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={handleSaveBio}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-semibold transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save Changes
                  </button>
                )}
              </div>
            </div>

            {/* Metrics Counters (Posts, Followers, Following) with Tabular Figures */}
            <div className="flex items-center justify-center sm:justify-start gap-6 py-2 border-y border-slate-100 dark:border-zinc-800/80 my-3">
              <div className="text-center sm:text-left">
                <span className="block text-base font-bold text-slate-900 dark:text-white tabular-nums">
                  {userPosts.length + userSpotlights.length}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-zinc-500">Posts</span>
              </div>
              <div className="text-center sm:text-left">
                <span className="block text-base font-bold text-slate-900 dark:text-white tabular-nums">
                  {user.followersCount.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-zinc-500">Followers</span>
              </div>
              <div className="text-center sm:text-left">
                <span className="block text-base font-bold text-slate-900 dark:text-white tabular-nums">
                  {user.followingCount.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-zinc-500">Following</span>
              </div>
            </div>

            {/* Inline Editable Biography */}
            {isEditingBio ? (
              <div className="space-y-2 mt-3">
                <input
                  type="text"
                  value={fullNameInput}
                  onChange={(e) => setFullNameInput(e.target.value)}
                  placeholder="Full Name"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
                />
                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  rows={3}
                  placeholder="Write your bio..."
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none resize-none leading-relaxed"
                />
              </div>
            ) : (
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed max-w-xl">
                {user.bio || 'No biography written yet.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabbed UI: Posts vs Spotlights vs Saved vs Liked */}
      <div className="flex items-center justify-center border-b border-slate-200 dark:border-zinc-800 mb-6">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 py-3 px-5 text-xs font-semibold transition-all border-b-2 ${
            activeTab === 'posts'
              ? 'border-rose-500 text-slate-900 dark:text-white'
              : 'border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-700'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Posts ({userPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('spotlights')}
          className={`flex items-center gap-2 py-3 px-5 text-xs font-semibold transition-all border-b-2 ${
            activeTab === 'spotlights'
              ? 'border-rose-500 text-slate-900 dark:text-white'
              : 'border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-700'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Spotlights ({userSpotlights.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 py-3 px-5 text-xs font-semibold transition-all border-b-2 ${
            activeTab === 'saved'
              ? 'border-rose-500 text-slate-900 dark:text-white'
              : 'border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-700'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved ({savedPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('liked')}
          className={`flex items-center gap-2 py-3 px-5 text-xs font-semibold transition-all border-b-2 ${
            activeTab === 'liked'
              ? 'border-rose-500 text-slate-900 dark:text-white'
              : 'border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-700'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Liked ({likedPosts.length})</span>
        </button>
      </div>

      {/* Media Grid */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {userPosts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-slate-400">
              No square posts published yet.
            </div>
          ) : (
            userPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => onSelectPost?.(post)}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-900 cursor-pointer shadow-xs"
              >
                <img
                  src={post.mediaUrl}
                  alt={post.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-xs font-bold">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 fill-white" />
                    <span>{post.likesCount}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'spotlights' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {userSpotlights.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-slate-400">
              No vertical Spotlights uploaded yet.
            </div>
          ) : (
            userSpotlights.map((reel) => (
              <div
                key={reel.id}
                onClick={() => onSelectPost?.(reel)}
                className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 cursor-pointer shadow-xs"
              >
                <video
                  src={reel.mediaUrl}
                  poster={reel.thumbnailUrl}
                  muted
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-[11px] font-semibold drop-shadow-md">
                  <Film className="w-3 h-3 text-rose-400" />
                  <span>{reel.likesCount}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {savedPosts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-slate-400">
              No saved posts or spotlights.
            </div>
          ) : (
            savedPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => onSelectPost?.(post)}
                className={`group relative ${
                  post.type === 'spotlight_reel' ? 'aspect-[9/16]' : 'aspect-square'
                } rounded-2xl overflow-hidden bg-slate-900 cursor-pointer shadow-xs`}
              >
                <img
                  src={post.thumbnailUrl || post.mediaUrl}
                  alt={post.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-amber-400">
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'liked' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {likedPosts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-slate-400">
              No liked posts.
            </div>
          ) : (
            likedPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => onSelectPost?.(post)}
                className={`group relative ${
                  post.type === 'spotlight_reel' ? 'aspect-[9/16]' : 'aspect-square'
                } rounded-2xl overflow-hidden bg-slate-900 cursor-pointer shadow-xs`}
              >
                <img
                  src={post.thumbnailUrl || post.mediaUrl}
                  alt={post.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-rose-500">
                  <Heart className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
