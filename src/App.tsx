import React, { Suspense, lazy, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const ProfileModal = lazy(() => import('./components/ProfileModal').then(m => ({ default: m.ProfileModal })));

const RecentReads = lazy(() => import('./plugins/reader/RecentReadsPlugin'));
const NovelGrid = lazy(() => import('./plugins/reader/NovelGridPlugin'));
const Leaderboard = lazy(() => import('./plugins/reader/LeaderboardPlugin'));
const GlobalCommunityFeed = lazy(() => import('./plugins/reader/CommunityPlugin'));
const PersonalLibrary = lazy(() => import('./plugins/reader/LibraryPlugin'));
const ReaderView = lazy(() => import('./plugins/reader/ReaderPlugin'));
const NovelDetailView = lazy(() => import('./plugins/reader/NovelDetailPlugin'));
const SiteViewStats = lazy(() => import('./plugins/reader/SiteStatsPlugin'));
const AuthorDashboard = lazy(() => import('./plugins/author/AuthorDashboardPlugin'));

const MainLayout: React.FC = () => {
  const { activeView, globalTheme } = useApp();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isDark = globalTheme === 'dark';

  // If in Reader view, reader has its own dedicated reading interface
  if (activeView === 'reader') {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm opacity-70">Đang mở trình đọc...</div>}>
        <div className={isDark ? 'dark' : ''}>
          <ReaderView />
        </div>
      </Suspense>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDark
          ? 'dark bg-[#121113] text-[#F3EEF0]'
          : 'bg-[#FAF5F6] text-[#1E1B1D]'
      }`}
    >
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 pb-10">
        <Suspense fallback={<div className="min-h-[240px] flex items-center justify-center text-sm opacity-70">Đang tải...</div>}>
        {activeView === 'home' && (
          <main className="space-y-6 pt-4">
            <RecentReads />
            <NovelGrid />
            <Leaderboard />
          </main>
        )}

        {activeView === 'novel_detail' && (
          <main>
            <NovelDetailView />
          </main>
        )}

        {activeView === 'leaderboard' && (
          <main>
            <Leaderboard />
          </main>
        )}

        {activeView === 'community' && (
          <main>
            <GlobalCommunityFeed />
          </main>
        )}

        {activeView === 'library' && (
          <main>
            <PersonalLibrary />
          </main>
        )}

        {activeView === 'author_dashboard' && (
          <main>
            <AuthorDashboard />
          </main>
        )}
        </Suspense>
      </div>

      {/* Footer with Site-wide View Statistics */}
      <footer
        className={`border-t transition-colors mt-12 py-8 text-center ${
          isDark
            ? 'bg-[#161418] border-[#2E2833] text-[#A69B9E]'
            : 'bg-[#F7EDF0] border-[#E8DCE1] text-[#6E5D65]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="space-y-1">
            <p className="font-playfair text-sm tracking-wide text-[#1E1B1D] dark:text-[#FAF5F6]">
              Cánh Cụt Mộng Mơ
            </p>
            <p className="font-pinyon text-xl text-[#8F7D85] dark:text-[#E8DFE3]">
              Dreamy Penguin
            </p>
          </div>

          <SiteViewStats />
        </div>
      </footer>

      {/* Global Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
