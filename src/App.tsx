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
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FFF1F5] dark:bg-[#211B22] text-[#A45E78] dark:text-[#F2B3C1]"><div className="flex flex-col items-center gap-3"><span className="w-10 h-10 rounded-full border-2 border-[#E8B8C5] border-t-[#D985A2] animate-spin" /><span className="font-eb-garamond text-xl">Đang mở trình đọc...</span></div></div>}>
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
          : 'bg-[#FFF1F5] text-[#1E1B1D]'
      }`}
    >
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 pb-10">
        <Suspense fallback={<div className="min-h-[240px] flex items-center justify-center text-[#A45E78] dark:text-[#F2B3C1]"><div className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-[#D985A2] animate-pulse" /><span className="font-eb-garamond text-lg">Đang tải...</span></div></div>}>
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
        className={`border-t-2 transition-colors mt-12 py-8 text-center ${
          isDark
            ? 'bg-[#2B222C] border-[#6B5261] text-[#D5CBD0]'
            : 'bg-[#FCE4EC] border-[#E8B8C5] text-[#8B6873]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="space-y-1 rounded-2xl border border-[#E8B8C5] dark:border-[#6B5261] bg-[#FFF9FB]/70 dark:bg-[#352936]/70 px-5 py-4">
            <p className="font-eb-garamond text-lg font-medium tracking-wide text-[#574D4C] dark:text-[#FAF5F6]">
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
