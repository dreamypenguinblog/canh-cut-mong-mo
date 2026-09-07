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

  // If in Reader view, reader has its own dedicated reading interface.
  // Trang đọc TÁCH BIỆT khỏi darkmode toàn site theo yêu cầu — không còn bọc
  // trong class "dark" theo globalTheme, màu sắc trang đọc luôn cố định.
  if (activeView === 'reader') {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FFF7FB] text-[#A45E78]"><div className="flex flex-col items-center gap-3"><span className="w-10 h-10 rounded-full border-2 border-[#E8B8C5] border-t-[#D985A2] animate-spin" /><span className="font-eb-garamond text-xl">Đang mở trình đọc...</span></div></div>}>
        <ReaderView />
      </Suspense>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDark
          ? 'dark bg-[#2B222C] text-[#F3EEF0]'
          : 'bg-[#FFF7FB] text-[#1E1B1D]'
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

      {/* Footer with Site-wide View Statistics — đồng bộ font Vollkorn và bảng màu
          pastel/ACCENT đang dùng xuyên suốt site (Navbar/NovelGrid/Leaderboard) */}
      <footer
        className={`border-t transition-colors mt-12 py-8 text-center ${
          isDark
            ? 'bg-[#2B222C] border-[#6B5261] text-[#D5CBD0]'
            : 'bg-[#FFF6FB] border-[#F0D9E3] text-[#8B6873]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="relative inline-flex flex-col items-center gap-1">
            <span
              className={`pointer-events-none select-none text-[10px] leading-none ${
                isDark ? 'text-[#7A5869]/60' : 'text-[#F2C7DA]/80'
              }`}
            >
              ✧　⋆
            </span>
            <p className="font-pinyon text-3xl sm:text-4xl text-[#D88AB3] dark:text-[#F2B3C1]">
              Dreamy Penguin
            </p>
            <p
              style={{ fontFamily: "'Vollkorn', serif" }}
              className="not-italic text-xs uppercase tracking-[0.2em] text-[#8B5D71] dark:text-[#F7E4EC]"
            >
              Cánh Cụt Mộng Mơ
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