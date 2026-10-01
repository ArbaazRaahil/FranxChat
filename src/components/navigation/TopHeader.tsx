import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../context/PostContext';
import { useChat } from '../../context/ChatContext';
import { TabType } from '../../types';
import { Avatar } from '../ui/Avatar';
import { PlusSquare, MessageCircle, LogIn, Sparkles } from 'lucide-react';

interface TopHeaderProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ currentTab, onTabChange }) => {
  const { user, openAuthModal, logout } = useAuth();
  const { openUploadWizard } = usePosts();
  const { conversations } = useChat();

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <header className="sticky top-0 z-40 w-full h-14 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark (Single text element in display face) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTabChange('feed')}
            className="flex items-center gap-2 text-left group"
          >
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-violet-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm group-hover:scale-105 transition-transform">
              S
            </span>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-rose-600 to-violet-600 dark:from-white dark:via-rose-400 dark:to-violet-400 bg-clip-text text-transparent">
              Spotlight
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Text with active underlines) */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold">
          <button
            onClick={() => onTabChange('feed')}
            className={`py-1 transition-colors relative ${
              currentTab === 'feed'
                ? 'text-slate-900 dark:text-white font-bold'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Feed
            {currentTab === 'feed' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onTabChange('spotlights')}
            className={`py-1 flex items-center gap-1.5 transition-colors relative ${
              currentTab === 'spotlights'
                ? 'text-rose-500 font-bold'
                : 'text-slate-500 dark:text-zinc-400 hover:text-rose-500'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            Spotlights
            {currentTab === 'spotlights' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onTabChange('messages')}
            className={`py-1 transition-colors relative flex items-center gap-1.5 ${
              currentTab === 'messages'
                ? 'text-slate-900 dark:text-white font-bold'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Direct Messages
            {totalUnread > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold tabular-nums">
                {totalUnread}
              </span>
            )}
            {currentTab === 'messages' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onTabChange('profile')}
            className={`py-1 transition-colors relative ${
              currentTab === 'profile'
                ? 'text-slate-900 dark:text-white font-bold'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Profile
            {currentTab === 'profile' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => openUploadWizard('standard')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-semibold hover:bg-slate-800 dark:hover:bg-zinc-100 transition-colors shadow-2xs whitespace-nowrap"
          >
            <PlusSquare className="w-4 h-4" />
            <span>Create</span>
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onTabChange('profile')}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-rose-500/30 transition-all"
                aria-label="View user profile"
              >
                <Avatar
                  src={user.avatarUrl}
                  alt={user.fullName}
                  size="sm"
                  showPresence
                  isOnline={user.status === 'online'}
                />
              </button>
              <button
                onClick={logout}
                className="text-xs font-medium text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hidden sm:block"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 text-white text-xs font-semibold hover:from-rose-600 hover:to-violet-700 transition-all shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
