import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sun,
  Moon,
  User,
  LogOut,
  Menu,
  X,
  UserCog,
  Search,
  Bookmark,
  Trophy,
  MessageSquare,
  Compass,
  Shield,
  ChevronDown,
  BookOpen,
  Sparkles,
} from 'lucide-react';

// Bảng màu hồng phẳng đồng bộ với NovelCard / NovelGrid / Leaderboard.
// Không dùng gradient cho trạng thái active / nút chính.
const ACCENT = '#F6B9D2';
const ACCENT_DARK = '#F2B3C1';
const ACCENT_TEXT_DARK = '#2B222C';

export const Navbar: React.FC<{ onOpenAuth: () => void; onOpenProfile?: () => void }> = ({
  onOpenAuth,
  onOpenProfile,
}) => {
  const {
    currentUser,
    logout,
    activeView,
    setActiveView,
    globalTheme,
    toggleGlobalTheme,
    canManageNovels,
    libraryNovelIds,
    novels,
    openNovelDetail,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  const isDark = globalTheme === 'dark';

  // Navigation Items
  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: Compass },
    { id: 'leaderboard', label: 'Bảng xếp hạng', icon: Trophy },
    { id: 'community', label: 'Bình luận', icon: MessageSquare },
    {
      id: 'library',
      label: 'Tủ sách',
      icon: Bookmark,
      badge: libraryNovelIds.length > 0 ? libraryNovelIds.length : undefined,
    },
  ];

  // Search Results for Quick Laptop Search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return novels
      .filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.authorName.toLowerCase().includes(query) ||
          n.genres.some((g) => g.toLowerCase().includes(query))
      )
      .slice(0, 5);
  }, [searchQuery, novels]);

  // Click outside listener for dropdown and search popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchFocused(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setUserDropdownOpen(false);
        setSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectSearchResult = (novelId: string) => {
    openNovelDetail(novelId);
    setSearchQuery('');
    setSearchFocused(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-all duration-300 ${
        isDark
          ? 'bg-[#2B222C]/95 border-[#6B5261] text-[#FAF5F6]'
          : 'bg-[#FFF9FB]/95 border-[#F5DFE7] text-[#574D4C]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[72px] gap-3 lg:gap-6">
          {/* 1. Brand Logo */}
          <div
            className="relative cursor-pointer select-none group flex items-center gap-3 shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 -mx-3 -my-1.5 sm:-mx-4 sm:-my-2 rounded-2xl border border-transparent hover:border-[#F5DFE7] dark:hover:border-[#6B5261] transition-colors"
            onClick={() => {
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            {/* Sparkle decoration góc trên phải — cùng ngôn ngữ trang trí với NovelCard/Leaderboard */}
            <div
              className={`pointer-events-none select-none absolute -top-1.5 -right-2 text-[8px] leading-[1.6] hidden sm:block ${
                isDark ? 'text-[#7A5869]/60' : 'text-[#F2C7DA]/80'
              }`}
            >
              ✧　⋆
            </div>
            {/* Sparkle decoration góc dưới trái — đối xứng */}
            <div
              className={`pointer-events-none select-none absolute -bottom-1 -left-1.5 text-[8px] leading-[1.6] hidden sm:block ${
                isDark ? 'text-[#7A5869]/50' : 'text-[#F3D0DF]/70'
              }`}
            >
              ⋆　✿
            </div>

            <div className="text-left">
              <span
                style={{ fontFamily: "'Vollkorn', serif" }}
                className="not-italic text-xl sm:text-2xl lg:text-[28px] font-semibold text-[#E58FB3] dark:text-[#F2B3C1] leading-none tracking-wide group-hover:scale-[1.02] transition-transform inline-flex items-baseline gap-1.5"
              >
                Dreamy Penguin
                <span className="text-sm sm:text-base font-normal text-[#E9B8C2] dark:text-[#7A5869]">𝜗𝜚</span>
              </span>
              <div className="mt-1">
                <span
                  style={{ fontFamily: "'Vollkorn', serif" }}
                  className="italic text-sm sm:text-base tracking-wide font-medium lowercase block text-[#A45E78] dark:text-[#F2B3C1]"
                >
                  kissmemissme
                </span>
              </div>
            </div>
          </div>

          {/* 2. Laptop Search Bar (Visible on laptop screens lg+) */}
          <div
            ref={searchContainerRef}
            className="hidden lg:block relative flex-1 max-w-xs xl:max-w-sm"
          >
            <div
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all ${
                searchFocused
                  ? isDark
                    ? 'border-[#F2B3C1] bg-[#352936] ring-2 ring-[#F2B3C1]/15'
                    : 'border-[#E7B6C5] bg-white ring-2 ring-[#F6B9D2]/20'
                  : isDark
                  ? 'border-[#6B5261] bg-[#352936]/80 hover:border-[#D79BAD]'
                  : 'border-[#F5DFE7] bg-[#FFFFFF]/80 hover:border-[#E7B6C5]'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-[#D88AB3] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Tìm truyện, tác giả, thể loại..."
                className="w-full text-xs bg-transparent focus:outline-none placeholder-[#B79AA6] font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-[#B79AA6] hover:text-[#A45E78] dark:hover:text-white"
                  title="Xóa từ khóa"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Popup on Laptop */}
            {searchFocused && searchQuery.trim() && (
              <div
                className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border overflow-hidden z-50 animate-in fade-in-50 duration-150 ${
                  isDark
                    ? 'bg-[#2B222C] border-[#6B5261] text-[#FAF5F6]'
                    : 'bg-white border-[#F5DFE7] text-[#574D4C]'
                }`}
              >
                <div className="p-2.5 border-b border-inherit bg-[#FFF6FB]/60 dark:bg-[#352936]/60 flex items-center justify-between text-[11px] text-[#B79AA6] dark:text-[#D5CBD0]">
                  <span className="font-semibold uppercase tracking-wider">
                    Kết quả tìm kiếm ({searchResults.length})
                  </span>
                  <span>Nhấn Esc để đóng</span>
                </div>

                {searchResults.length > 0 ? (
                  <div className="max-h-72 overflow-y-auto divide-y divide-inherit">
                    {searchResults.map((novel) => (
                      <button
                        key={novel.id}
                        onClick={() => handleSelectSearchResult(novel.id)}
                        className="w-full p-3 text-left flex items-center gap-3 hover:bg-[#FFF1F6] dark:hover:bg-[#3A2935] transition-colors group"
                      >
                        <img
                          src={novel.coverUrl}
                          alt={novel.title}
                          className="w-10 h-14 rounded-lg object-cover border border-[#F5DFE7] dark:border-[#6B5261] shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="flex-1 min-w-0">
                          <h4
                            style={{ fontFamily: "'Vollkorn', serif" }}
                            className="not-italic text-xs font-semibold truncate text-[#6B4A57] dark:text-white"
                          >
                            {novel.title}
                          </h4>
                          <p className="text-[11px] text-[#B79AA6] dark:text-[#D5CBD0] truncate mt-0.5">
                            Tác giả: <span className="font-medium">{novel.authorName}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-[#B79AA6] dark:text-[#D5CBD0]">
                            <span>{novel.chaptersCount || 0} chương</span>
                            <span>•</span>
                            <span className="capitalize">{novel.status === 'completed' ? 'Hoàn thành' : 'Đang ra'}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-[#B79AA6] dark:text-[#D5CBD0]">
                    Không tìm thấy tác phẩm nào khớp với "<strong>{searchQuery}</strong>"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Desktop / Laptop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 xl:gap-1.5">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id as any);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="relative min-h-[40px] px-3.5 lg:px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5"
                  style={
                    isActive
                      ? { background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }
                      : isDark
                      ? { color: '#E8DFE3' }
                      : { color: '#8B5D71' }
                  }
                >
                  <span>{item.label}</span>

                  {item.badge !== undefined && (
                    <span
                      className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold"
                      style={
                        isActive
                          ? { background: isDark ? ACCENT_TEXT_DARK : '#FFFFFF', color: isDark ? ACCENT_DARK : ACCENT }
                          : isDark
                          ? { background: '#3A2E3D', color: '#E8DFE3' }
                          : { background: '#FFF0F7', color: '#D88AB3' }
                      }
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Author Dashboard Tab on Laptop */}
            {canManageNovels && (
              <button
                onClick={() => {
                  setActiveView('author_dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="min-h-[40px] px-3.5 lg:px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 border text-center"
                style={
                  activeView === 'author_dashboard'
                    ? { background: isDark ? ACCENT_DARK : ACCENT, borderColor: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }
                    : isDark
                    ? { borderColor: '#6B5261', color: '#E8DFE3' }
                    : { borderColor: '#F5DFE7', color: '#8B5D71', background: '#FFF9FB' }
                }
              >
                <span>Quản trị</span>
              </button>
            )}
          </nav>

          {/* 4. Actions & Utilities (Theme & User Dropdown) */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Quick Dark/Light Theme Toggle */}
            <button
              onClick={toggleGlobalTheme}
              className={`min-h-[38px] min-w-[38px] p-2 rounded-full border transition-all duration-200 flex items-center justify-center ${
                isDark
                  ? 'border-[#6B5261] bg-[#352936] text-[#FAF5F6] hover:border-[#D79BAD]'
                  : 'border-[#F5DFE7] bg-white text-[#8B5D71] hover:border-[#E7B6C5]'
              }`}
              title={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
              aria-label="Chuyển chế độ giao diện"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-300 animate-in spin-in-180 duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-[#8B5D71] animate-in spin-in-180 duration-300" />
              )}
            </button>

            {/* Laptop User Dropdown Menu */}
            {currentUser ? (
              <div ref={userDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-full border transition-all duration-200 ${
                    userDropdownOpen
                      ? isDark
                        ? 'border-[#F2B3C1] bg-[#3A2935]'
                        : 'border-[#E7B6C5] bg-[#FFF1F5]'
                      : isDark
                      ? 'border-[#6B5261] bg-[#352936] hover:border-[#D79BAD]'
                      : 'border-[#F5DFE7] bg-white hover:border-[#E7B6C5]'
                  }`}
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                  title="Mở menu tài khoản"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[#F5DFE7] dark:border-[#6B5261]"
                  />
                  <div className="hidden lg:block text-left">
                    <span className="text-xs font-bold block leading-tight truncate max-w-[110px] text-[#6B4A57] dark:text-white">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-[#B79AA6] dark:text-[#D5CBD0] block">
                      {currentUser.role === 'admin'
                        ? 'Quản trị viên'
                        : currentUser.canPublish
                        ? 'Tác giả'
                        : 'Độc giả'}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#B79AA6] transition-transform duration-200 ${
                      userDropdownOpen ? 'rotate-180 text-[#A45E78] dark:text-white' : ''
                    }`}
                  />
                </button>

                {/* Popover Dropdown on Laptop */}
                {userDropdownOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-64 rounded-2xl border overflow-visible z-50 animate-in fade-in-50 zoom-in-95 duration-150 ${
                      isDark
                        ? 'bg-[#2B222C] border-[#6B5261] text-[#FAF5F6]'
                        : 'bg-[#FFF9FB] border-[#F5DFE7] text-[#574D4C]'
                    }`}
                  >
                    {/* Sparkle decoration góc trên phải */}
                    <div
                      className={`pointer-events-none select-none absolute -top-2 right-4 text-[9px] leading-[1.7] ${
                        isDark ? 'text-[#7A5869]/60' : 'text-[#F2C7DA]/80'
                      }`}
                    >
                      ✧　⋆
                    </div>

                    {/* User Summary Header */}
                    <div className="p-4 rounded-t-2xl border-b border-[#F0D9E3] dark:border-[#594352] bg-[#FFF1F5] dark:bg-[#352936]">
                      <div className="flex items-center gap-3">
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-[#7A5869]"
                        />
                        <div className="min-w-0 flex-1">
                          <h4
                            style={{ fontFamily: "'Vollkorn', serif" }}
                            className="not-italic text-xs font-semibold truncate text-[#6B4A57] dark:text-white"
                          >
                            {currentUser.name}
                          </h4>
                          <p className="text-[11px] text-[#B79AA6] dark:text-[#D5CBD0] truncate mt-0.5">
                            {currentUser.email}
                          </p>
                          <div className="mt-1.5">
                            {currentUser.role === 'admin' ? (
                              <span
                                className="inline-flex items-center gap-1 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border"
                                style={{ background: '#FFFFFF', borderColor: '#F0D9E3', color: '#B4587E' }}
                              >
                                <Shield className="w-2.5 h-2.5" />
                                Quản Trị Viên
                              </span>
                            ) : (
                              <span
                                className="inline-block text-[9px] uppercase font-semibold px-2 py-0.5 rounded-full border"
                                style={{ background: '#FFFFFF', borderColor: '#F0D9E3', color: '#B4587E' }}
                              >
                                Độc Giả Thân Thiết
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Options */}
                    <div className="p-2 space-y-1 text-xs">
                      {onOpenProfile && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenProfile();
                          }}
                          className="w-full px-3 py-2 rounded-full flex items-center text-[#A45E78] dark:text-[#F2B3C1] hover:bg-[#FCEEF3] dark:hover:bg-[#3A2935] transition-colors text-left font-medium"
                        >
                          <span>Chỉnh sửa hồ sơ (Tên & Avatar)</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setActiveView('library');
                        }}
                        className="w-full px-3 py-2 rounded-full flex items-center gap-2.5 text-[#A45E78] dark:text-[#F2B3C1] hover:bg-[#FCEEF3] dark:hover:bg-[#3A2935] transition-colors text-left font-medium"
                      >
                        <Bookmark className="w-4 h-4 text-[#D88AB3]" />
                        <span>Tủ sách cá nhân ({libraryNovelIds.length})</span>
                      </button>

                      {canManageNovels && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setActiveView('author_dashboard');
                          }}
                          className="w-full px-3 py-2 rounded-full flex items-center gap-2.5 text-[#A45E78] dark:text-[#F2B3C1] hover:bg-[#FCEEF3] dark:hover:bg-[#3A2935] transition-colors text-left font-medium"
                        >
                          <BookOpen className="w-4 h-4 text-[#D88AB3]" />
                          <span>Bảng điều khiển tác giả</span>
                        </button>
                      )}
                    </div>

                    {/* Footer: Logout */}
                    <div className="p-2 rounded-b-2xl border-t border-[#F0D9E3] dark:border-[#594352] bg-[#FFF6FB]/70 dark:bg-[#352936]/70">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full px-3 py-2 rounded-full flex items-center gap-2.5 text-[#A45E78] dark:text-[#F2B3C1] hover:bg-[#F7D9E5] dark:hover:bg-[#4A2F3D] transition-colors text-left font-semibold text-xs"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất tài khoản</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="login-btn"
                onClick={onOpenAuth}
                className="min-h-[38px] px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border transition-colors hover:opacity-90"
                style={{
                  background: isDark ? ACCENT_DARK : ACCENT,
                  color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF',
                  borderColor: isDark ? ACCENT_DARK : ACCENT,
                }}
              >
                <User className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden min-h-[38px] min-w-[38px] p-2 rounded-full border ${
                isDark
                  ? 'border-[#6B5261] text-[#FAF5F6] bg-[#352936]'
                  : 'border-[#F5DFE7] text-[#8B5D71] bg-white'
              }`}
              aria-label="Mở menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer — khung planner pastel, viền hồng, trang trí kiểu WordPress */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden relative mb-4 rounded-[24px] border overflow-hidden animate-in slide-in-from-top-2 duration-150 ${
              isDark ? 'border-[#6B5261] bg-[#2B222C]' : 'border-[#F5DFE7] bg-[#FFFDFD]'
            }`}
          >
            {/* Sparkle decoration góc trên phải khung */}
            <div
              className={`pointer-events-none select-none absolute top-2 right-3 text-[9px] leading-[1.7] z-10 ${
                isDark ? 'text-[#7A5869]/60' : 'text-[#F2C7DA]/70'
              }`}
            >
              ✧　⋆<br />
              ⋆　✿
            </div>

            <div className="p-3 space-y-2">
              {/* Mobile Search input */}
              <div
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full border ${
                  isDark ? 'border-[#6B5261] bg-[#352936]' : 'border-[#F5DFE7] bg-white'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-[#D88AB3]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm truyện, tác giả..."
                  className="w-full text-xs bg-transparent focus:outline-none placeholder-[#B79AA6]"
                />
              </div>
              {searchQuery.trim() && searchResults.length > 0 && (
                <div
                  className={`rounded-2xl border p-2 space-y-1 ${
                    isDark ? 'border-[#6B5261] bg-[#352936]' : 'border-[#F5DFE7] bg-white'
                  }`}
                >
                  {searchResults.map((novel) => (
                    <button
                      key={novel.id}
                      onClick={() => {
                        handleSelectSearchResult(novel.id);
                        setMobileMenuOpen(false);
                      }}
                      style={{ fontFamily: "'Vollkorn', serif" }}
                      className="w-full p-2 text-left text-xs not-italic font-semibold truncate hover:bg-[#FFF1F6] dark:hover:bg-[#3A2935] rounded-xl block text-[#6B4A57] dark:text-white"
                    >
                      {novel.title}
                    </button>
                  ))}
                </div>
              )}

              {/* Dải phân cách trang trí — cùng kiểu 𝜗𝜚 như code WordPress */}
              <div className="flex items-center justify-center py-1">
                <div
                  className={`flex-1 h-px ${isDark ? 'bg-gradient-to-r from-transparent to-[#6B5261]' : 'bg-gradient-to-r from-transparent to-[#F3C6DD]'}`}
                />
                <span className="mx-2 text-[11px] text-[#E9B8C2] dark:text-[#7A5869]">𝜗𝜚</span>
                <div
                  className={`flex-1 h-px ${isDark ? 'bg-gradient-to-l from-transparent to-[#6B5261]' : 'bg-gradient-to-l from-transparent to-[#F3C6DD]'}`}
                />
              </div>

              {/* Nav items dạng pill xếp dọc */}
              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id as any);
                        setMobileMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide flex items-center justify-between transition-colors"
                      style={
                        isActive
                          ? { background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }
                          : isDark
                          ? { color: '#E8DFE3', background: '#352936' }
                          : { color: '#8B5D71', background: '#FFF6FB' }
                      }
                    >
                      <span>{item.label}</span>
                      {item.badge !== undefined && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={
                            isActive
                              ? { background: isDark ? ACCENT_TEXT_DARK : '#FFFFFF', color: isDark ? ACCENT_DARK : ACCENT }
                              : { background: isDark ? '#3A2E3D' : '#FFF0F7', color: isDark ? '#E8DFE3' : '#D88AB3' }
                          }
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {(canManageNovels || (currentUser && onOpenProfile)) && (
                <div className="flex items-center justify-center py-1">
                  <div
                    className={`flex-1 h-px ${isDark ? 'bg-gradient-to-r from-transparent to-[#6B5261]' : 'bg-gradient-to-r from-transparent to-[#F3C6DD]'}`}
                  />
                  <span className="mx-2 text-[11px] text-[#E9B8C2] dark:text-[#7A5869]">𝜗𝜚</span>
                  <div
                    className={`flex-1 h-px ${isDark ? 'bg-gradient-to-l from-transparent to-[#6B5261]' : 'bg-gradient-to-l from-transparent to-[#F3C6DD]'}`}
                  />
                </div>
              )}

              {canManageNovels && (
                <button
                  onClick={() => {
                    setActiveView('author_dashboard');
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide block text-left border"
                  style={
                    activeView === 'author_dashboard'
                      ? { background: isDark ? ACCENT_DARK : ACCENT, borderColor: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }
                      : isDark
                      ? { borderColor: '#6B5261', color: '#E8DFE3', background: '#352936' }
                      : { borderColor: '#F5DFE7', color: '#8B5D71', background: '#FFF6FB' }
                  }
                >
                  <span>Quản trị tác giả</span>
                </button>
              )}

              {currentUser && onOpenProfile && (
                <button
                  onClick={() => {
                    onOpenProfile();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide block text-left border"
                  style={
                    isDark
                      ? { borderColor: '#6B5261', color: '#E8DFE3', background: '#352936' }
                      : { borderColor: '#F5DFE7', color: '#8B5D71', background: '#FFF6FB' }
                  }
                >
                  <span>Chỉnh sửa hồ sơ (Tên & Avatar)</span>
                </button>
              )}
            </div>

            {/* Sparkle góc dưới khung */}
            <div
              className={`pointer-events-none select-none absolute bottom-2 left-3 text-[9px] leading-[1.7] ${
                isDark ? 'text-[#7A5869]/50' : 'text-[#F3D0DF]/70'
              }`}
            >
              ⋆　✧
            </div>
          </div>
        )}
      </div>
    </header>
  );
};