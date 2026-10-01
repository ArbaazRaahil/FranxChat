import React, { useState, useEffect } from 'react';
import { usePosts } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { FeedCard } from './FeedCard';
import { FeedPostSkeleton } from '../ui/Skeleton';
import { INITIAL_CREATORS } from '../../services/seedData';
import { Avatar } from '../ui/Avatar';
import { TabType, Post } from '../../types';
import { Sparkles, TrendingUp, Compass, Plus, Film } from 'lucide-react';

interface FeedViewProps {
  onNavigateToTab: (tab: TabType) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({ onNavigateToTab }) => {
  const { posts, openUploadWizard } = usePosts();
  const { user, openAuthModal } = useAuth();
  const { startDirectMessage } = useChat();

  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'spotlights' | 'photos'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    // Initial fetch skeleton simulation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredPosts = posts.filter((p) => {
    if (selectedTag && !p.tags?.includes(selectedTag)) return false;
    if (filter === 'spotlights') return p.type === 'spotlight_reel';
    if (filter === 'photos') return p.type === 'standard';
    return true;
  });

  // Extract all unique trending tags
  const trendingTags = Array.from(
    new Set(posts.flatMap((p) => p.tags || []))
  ).slice(0, 6);

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 flex gap-8 justify-center">
      {/* Centered Main Feed Column */}
      <main className="w-full max-w-[500px] shrink-0">
        {/* Creator Stories / Spotlights Quick Carousel */}
        <div className="bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-3.5 mb-6 shadow-2xs overflow-hidden">
          <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1">
            {/* My Story / Upload Slot */}
            <div
              onClick={() => {
                if (!user) openAuthModal('login');
                else openUploadWizard('spotlight_reel');
              }}
              className="flex flex-col items-center gap-1 cursor-pointer shrink-0 select-none group"
            >
              <div className="relative">
                <Avatar src={user?.avatarUrl} alt={user?.fullName || 'You'} size="md" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold group-hover:scale-110 transition-transform">
                  <Plus className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                Your Story
              </span>
            </div>

            {/* Featured Creators */}
            {INITIAL_CREATORS.slice(1).map((creator) => (
              <div
                key={creator.id}
                onClick={() => onNavigateToTab('spotlights')}
                className="flex flex-col items-center gap-1 cursor-pointer shrink-0 select-none group"
              >
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-violet-600 group-hover:scale-105 transition-transform shadow-2xs">
                  <Avatar src={creator.avatarUrl} alt={creator.fullName} size="md" />
                </div>
                <span className="text-[11px] text-slate-700 dark:text-zinc-300 font-medium truncate max-w-[64px]">
                  {creator.username}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex items-center justify-between gap-2 mb-4 px-1">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl text-xs font-semibold">
            <button
              onClick={() => {
                setFilter('all');
                setSelectedTag(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filter === 'all' && !selectedTag
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              All Posts
            </button>
            <button
              onClick={() => {
                setFilter('spotlights');
                setSelectedTag(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                filter === 'spotlights'
                  ? 'bg-white dark:bg-zinc-800 text-rose-500 shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              Spotlights
            </button>
            <button
              onClick={() => {
                setFilter('photos');
                setSelectedTag(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filter === 'photos'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Photos
            </button>
          </div>

          {selectedTag && (
            <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg">
              <span>#{selectedTag}</span>
              <button
                onClick={() => setSelectedTag(null)}
                className="hover:text-rose-700 text-xs font-bold"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Skeleton Loaders or Live Feed Stream */}
        {isLoading ? (
          <div className="space-y-4">
            <FeedPostSkeleton />
            <FeedPostSkeleton />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-zinc-500 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6">
            <Sparkles className="w-8 h-8 mx-auto text-rose-500 mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
              No posts found
            </p>
            <p className="text-xs mt-1">Try resetting the filter or publishing a new post!</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <FeedCard
              key={post.id}
              post={post}
              onSelectTag={(tag) => setSelectedTag(tag)}
              onNavigateToSpotlights={() => onNavigateToTab('spotlights')}
            />
          ))
        )}
      </main>

      {/* Right-Hand Desktop Sidebar: Suggestions & Trending Topics (Desktop baseline 1440px presence) */}
      <aside className="hidden lg:block w-72 shrink-0 space-y-5">
        {/* Suggested Creators Card */}
        <div className="bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Creators to Follow
            </h3>
          </div>

          <div className="space-y-3">
            {INITIAL_CREATORS.slice(1).map((creator) => (
              <div key={creator.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar
                    src={creator.avatarUrl}
                    alt={creator.fullName}
                    size="sm"
                    showPresence
                    isOnline={creator.status === 'online'}
                  />
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                      {creator.username}
                    </span>
                    <span className="block text-[11px] text-slate-400 truncate">
                      {creator.followersCount.toLocaleString()} followers
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => startDirectMessage(creator)}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600 whitespace-nowrap"
                >
                  Message
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Tags Widget */}
        <div className="bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
            <span>Trending on Spotlight</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                  selectedTag === tag
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Clean Editorial Footer */}
        <div className="text-[11px] text-slate-400 dark:text-zinc-500 leading-relaxed px-1">
          <p>© 2026 Spotlight Social Inc. · Privacy · Terms · API</p>
          <p className="mt-1">Crafted for creators & vertical video storytellers.</p>
        </div>
      </aside>
    </div>
  );
};
