import React from 'react';
import { TabType } from '../../types';
import { usePosts } from '../../context/PostContext';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Home, Film, PlusCircle, MessageCircle, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const { openUploadWizard } = usePosts();
  const { conversations } = useChat();
  const { user, openAuthModal } = useAuth();

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-around px-2"
    >
      {/* Feed Tab */}
      <button
        onClick={() => onTabChange('feed')}
        className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
          currentTab === 'feed'
            ? 'text-rose-500 font-bold'
            : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700'
        }`}
        aria-label="Feed"
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Feed</span>
      </button>

      {/* Spotlights Tab */}
      <button
        onClick={() => onTabChange('spotlights')}
        className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
          currentTab === 'spotlights'
            ? 'text-rose-500 font-bold'
            : 'text-slate-400 dark:text-zinc-500 hover:text-rose-400'
        }`}
        aria-label="Spotlights"
      >
        <Film className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Spotlights</span>
      </button>

      {/* Create Button (Upload Wizard) */}
      <button
        onClick={() => {
          if (!user) {
            openAuthModal('login');
          } else {
            openUploadWizard('standard');
          }
        }}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center text-rose-500 hover:scale-105 active:scale-95 transition-transform"
        aria-label="Create Post or Spotlight"
      >
        <PlusCircle className="w-8 h-8 fill-rose-500/10" />
      </button>

      {/* Messages Tab */}
      <button
        onClick={() => onTabChange('messages')}
        className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center relative transition-colors ${
          currentTab === 'messages'
            ? 'text-rose-500 font-bold'
            : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700'
        }`}
        aria-label="Direct Messages"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
              {totalUnread}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-0.5">Messages</span>
      </button>

      {/* Profile Tab */}
      <button
        onClick={() => onTabChange('profile')}
        className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
          currentTab === 'profile'
            ? 'text-rose-500 font-bold'
            : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700'
        }`}
        aria-label="Profile"
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Profile</span>
      </button>
    </nav>
  );
};
