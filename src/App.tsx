/**
 * Spotlight - Next-Generation Social Video & Photo Platform
 * Production-ready MVP mirroring Instagram & TikTok architectures
 */
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PostProvider } from './context/PostContext';
import { ChatProvider } from './context/ChatContext';
import { TabType } from './types';
import { TopHeader } from './components/navigation/TopHeader';
import { BottomNav } from './components/navigation/BottomNav';
import { SidebarNav } from './components/navigation/SidebarNav';
import { FeedView } from './components/feed/FeedView';
import { SpotlightFeed } from './components/spotlights/SpotlightFeed';
import { DirectMessages } from './components/messages/DirectMessages';
import { ProfileView } from './components/profile/ProfileView';
import { CommentDrawer } from './components/feed/CommentDrawer';
import { MediaUploadWizard } from './components/feed/MediaUploadWizard';
import { AuthModal } from './components/auth/AuthModal';
import { realtimeClient } from './services/realtimeClient';

const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabType>('feed');

  // Initialize real-time synchronization engine
  useEffect(() => {
    realtimeClient.init(user?.id);
    return () => {
      realtimeClient.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 flex flex-col lg:flex-row antialiased transition-colors">
      {/* Desktop Left Sidebar (1440px baseline architecture) */}
      <SidebarNav currentTab={currentTab} onTabChange={(tab) => setCurrentTab(tab)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Mobile & Tablet Top Bar (Adhering to Top Bar Contract) */}
        <div className="lg:hidden">
          <TopHeader currentTab={currentTab} onTabChange={(tab) => setCurrentTab(tab)} />
        </div>

        {/* View Switcher */}
        <div className="flex-1 min-h-0">
          {currentTab === 'feed' && (
            <FeedView onNavigateToTab={(tab) => setCurrentTab(tab)} />
          )}

          {currentTab === 'spotlights' && <SpotlightFeed />}

          {currentTab === 'messages' && <DirectMessages />}

          {currentTab === 'profile' && <ProfileView />}
        </div>

        {/* Mobile Fixed Bottom Navigation Bar (Thumb-Zone Ergonomics) */}
        <BottomNav currentTab={currentTab} onTabChange={(tab) => setCurrentTab(tab)} />
      </div>

      {/* Global Interactive Overlays */}
      <CommentDrawer />
      <MediaUploadWizard />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PostProvider>
        <ChatProvider>
          <MainLayout />
        </ChatProvider>
      </PostProvider>
    </AuthProvider>
  );
}
