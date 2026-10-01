import React from 'react';
import { TabType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../context/PostContext';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../ui/Avatar';
import {
  Home,
  Film,
  MessageCircle,
  PlusSquare,
  User,
  Compass,
  Radio,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { isSupabaseConfigured } from '../../services/supabaseClient';

interface SidebarNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ currentTab, onTabChange }) => {
  const { user, openAuthModal, logout } = useAuth();
  const { openUploadWizard } = usePosts();
  const { conversations, onlineUserIds } = useChat();

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-5 select-none shrink-0 z-30">
      {/* Brand Title */}
      <button
        onClick={() => onTabChange('feed')}
        className="flex items-center gap-2.5 text-left mb-8 group"
      >
        <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-violet-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
          S
        </span>
        <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-950 via-rose-600 to-violet-600 dark:from-white dark:via-rose-400 dark:to-violet-400 bg-clip-text text-transparent">
          Spotlight
        </span>
      </button>

      {/* Primary Navigation Menu */}
      <nav className="flex-1 space-y-1.5 text-sm font-semibold">
        <button
          onClick={() => onTabChange('feed')}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all ${
            currentTab === 'feed'
              ? 'bg-slate-100 dark:bg-zinc-900 text-slate-950 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900/60 hover:text-slate-900'
          }`}
        >
          <Home className={`w-5 h-5 ${currentTab === 'feed' ? 'text-rose-500' : ''}`} />
          <span>Feed</span>
        </button>

        <button
          onClick={() => onTabChange('spotlights')}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all ${
            currentTab === 'spotlights'
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900/60 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <Film className="w-5 h-5 text-rose-500" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          </div>
          <span className="flex-1 text-left">Spotlights</span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 bg-rose-100 dark:bg-rose-950/60 px-1.5 py-0.5 rounded">
            Hot
          </span>
        </button>

        <button
          onClick={() => onTabChange('messages')}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all ${
            currentTab === 'messages'
              ? 'bg-slate-100 dark:bg-zinc-900 text-slate-950 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900/60 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <MessageCircle className={`w-5 h-5 ${currentTab === 'messages' ? 'text-rose-500' : ''}`} />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
                {totalUnread}
              </span>
            )}
          </div>
          <span className="flex-1 text-left">Direct Messages</span>
        </button>

        <button
          onClick={() => onTabChange('profile')}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all ${
            currentTab === 'profile'
              ? 'bg-slate-100 dark:bg-zinc-900 text-slate-950 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900/60 hover:text-slate-900'
          }`}
        >
          <User className={`w-5 h-5 ${currentTab === 'profile' ? 'text-rose-500' : ''}`} />
          <span>Profile</span>
        </button>

        {/* Create Post Button */}
        <div className="pt-4">
          <button
            onClick={() => {
              if (!user) {
                openAuthModal('login');
              } else {
                openUploadWizard('standard');
              }
            }}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-violet-600 hover:from-rose-600 hover:to-violet-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 active:scale-[0.99] transition-transform"
          >
            <PlusSquare className="w-4 h-4" />
            <span>Create Post</span>
          </button>
        </div>
      </nav>

      {/* Real-Time Sync Indicator */}
      <div className="p-3 mb-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-100 dark:border-zinc-800 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-800 dark:text-zinc-200">
            Real-Time Engine
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
          {isSupabaseConfigured ? 'Supabase Postgres + Realtime' : 'WebSocket Server + Broadcast'}
        </p>
      </div>

      {/* User Footer Card */}
      {user ? (
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div
            onClick={() => onTabChange('profile')}
            className="flex items-center gap-2.5 cursor-pointer min-w-0"
          >
            <Avatar
              src={user.avatarUrl}
              alt={user.fullName}
              size="sm"
              showPresence
              isOnline={user.status === 'online'}
            />
            <div className="min-w-0">
              <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                {user.fullName}
              </span>
              <span className="block text-[11px] text-slate-400 truncate">
                @{user.username}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => openAuthModal('login')}
          className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
        >
          Sign In / Register
        </button>
      )}
    </aside>
  );
};
