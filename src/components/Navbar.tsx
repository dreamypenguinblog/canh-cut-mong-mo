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
          ? 'bg-[#141218]/92 border-[#382F42] text-[#FAF5F6] shadow-[0_4px_25px_-4px_rgba(0,0,0,0.5)]'
          : 'bg-[#FAF5F6]/92 border-[#EADCE1] text-[#1E1B1D] shadow-[0_4px_20px_-4px_rgba(234,220,225,0.45)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[72px] gap-3 lg:gap-6">
          {/* 1. Brand Logo */}
          <div
            className="cursor-pointer select-none group flex items-center gap-3 shrink-0"
            onClick={() => {
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="text-left">
              <span className="font-pinyon text-2xl sm:text-3xl lg:text-[32px] text-[#1E1B1D] dark:text-[#FFFFFF] block leading-none tracking-wide group-hover:scale-[1.02] transition-transform">
                Cánh Cụt Mộng Mơ
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="font-playfair italic text-[11px] sm:text-xs text-[#8F7D85] dark:text-[#E8DFE3] block tracking-widest uppercase font-medium">
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
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all ${
                searchFocused
                  ? isDark
                    ? 'border-white bg-[#1F1B26] shadow-sm ring-2 ring-white/10'
                    : 'border-[#1E1B1D] bg-white shadow-sm ring-2 ring-[#1E1B1D]/10'
                  : isDark
                  ? 'border-[#382F42] bg-[#1B1822]/80 hover:border-[#5A4E68]'
                  : 'border-[#EADCE1] bg-[#FFFFFF]/70 hover:border-[#DAC8CE]'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-[#8F7D85] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Tìm truyện, tác giả, thể loại..."
                className="w-full text-xs bg-transparent focus:outline-none placeholder-[#8F7D85] font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-[#8F7D85] hover:text-[#1E1B1D] dark:hover:text-white"
                  title="Xóa từ khóa"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Popup on Laptop */}
            {searchFocused && searchQuery.trim() && (
              <div
                className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border shadow-2xl overflow-hidden z-50 animate-in fade-in-50 duration-150 ${
                  isDark
                    ? 'bg-[#18151F] border-[#3E3547] text-[#FAF5F6]'
                    : 'bg-[#FFFFFF] border-[#EADCE1] text-[#1E1B1D]'
                }`}
              >
                <div className="p-2.5 border-b border-inherit bg-[#FAF5F6]/40 dark:bg-[#121016]/40 flex items-center justify-between text-[11px] text-[#8F7D85]">
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
                        className="w-full p-3 text-left flex items-center gap-3 hover:bg-[#FAF0F3]/60 dark:hover:bg-[#251E2B] transition-colors group"
                      >
                        <img
                          src={novel.coverUrl}
                          alt={novel.title}
                          className="w-10 h-14 rounded-lg object-cover shadow-xs border border-inherit shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold font-playfair truncate group-hover:text-[#1E1B1D] dark:group-hover:text-white">
                            {novel.title}
                          </h4>
                          <p className="text-[11px] text-[#8F7D85] truncate mt-0.5">
                            Tác giả: <span className="font-medium">{novel.authorName}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-[#8F7D85]">
                            <span>{novel.chaptersCount || 0} chương</span>
                            <span>•</span>
                            <span className="capitalize">{novel.status === 'completed' ? 'Hoàn thành' : 'Đang ra'}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-[#8F7D85]">
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
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id as any);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`relative min-h-[40px] px-3.5 lg:px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-200 flex items-center gap-1.5 ${
                    isDark
                      ? isActive
                        ? 'bg-[#FAF5F6] text-[#121113] font-bold shadow-md'
                        : 'text-[#FAF5F6] hover:bg-[#251E2B] hover:text-white'
                      : isActive
                      ? 'bg-[#1E1B1D] text-[#FAF5F6] shadow-sm'
                      : 'text-[#5A4D53] hover:bg-[#FAF0F3] hover:text-[#1E1B1D]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
                  <span>{item.label}</span>

                  {item.badge !== undefined && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive
                          ? isDark
                            ? 'bg-[#121113] text-white'
                            : 'bg-white text-[#1E1B1D]'
                          : isDark
                          ? 'bg-[#382F42] text-white'
                          : 'bg-[#EADCE1] text-[#1E1B1D]'
                      }`}
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
                className={`min-h-[40px] px-3.5 lg:px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-200 border text-center ${
                  isDark
                    ? activeView === 'author_dashboard'
                      ? 'bg-[#FAF5F6] text-[#121113] font-bold border-white shadow-md'
                      : 'border-[#4B3E57] text-[#FAF5F6] hover:border-white hover:bg-[#251E2B]'
                    : activeView === 'author_dashboard'
                    ? 'bg-[#1E1B1D] text-white border-[#1E1B1D] shadow-sm'
                    : 'border-[#DAC8CE] text-[#5A4D53] hover:border-[#1E1B1D] hover:bg-[#FAF0F3] hover:text-[#1E1B1D]'
                }`}
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
              className={`min-h-[38px] min-w-[38px] p-2 rounded-xl border transition-all duration-200 flex items-center justify-center ${
                isDark
                  ? 'border-[#382F42] bg-[#1E1A26] text-[#FAF5F6] hover:border-white hover:bg-[#2A2336] shadow-xs'
                  : 'border-[#DAC8CE] bg-white text-[#5C4E55] hover:border-[#1E1B1D] hover:bg-[#FAF0F3] shadow-2xs'
              }`}
              title={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
              aria-label="Chuyển chế độ giao diện"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-300 animate-in spin-in-180 duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-[#5C4E55] animate-in spin-in-180 duration-300" />
              )}
            </button>

            {/* Laptop User Dropdown Menu */}
            {currentUser ? (
              <div ref={userDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border transition-all duration-200 ${
                    userDropdownOpen
                      ? isDark
                        ? 'border-white bg-[#251E2B]'
                        : 'border-[#1E1B1D] bg-[#FAF0F3]'
                      : isDark
                      ? 'border-[#382F42] bg-[#1E1A26] hover:border-[#5A4E68]'
                      : 'border-[#EADCE1] bg-white hover:border-[#DAC8CE]'
                  }`}
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                  title="Mở menu tài khoản"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-[#EADCE1] dark:border-[#5A4E68] shadow-2xs"
                  />
                  <div className="hidden lg:block text-left">
                    <span className="text-xs font-bold block leading-tight truncate max-w-[110px] text-[#1E1B1D] dark:text-[#FFFFFF]">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-[#8F7D85] dark:text-[#D5CBD0] block">
                      {currentUser.role === 'admin'
                        ? 'Quản trị viên'
                        : currentUser.canPublish
                        ? 'Tác giả'
                        : 'Độc giả'}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#8F7D85] transition-transform duration-200 ${
                      userDropdownOpen ? 'rotate-180 text-[#1E1B1D] dark:text-white' : ''
                    }`}
                  />
                </button>

                {/* Popover Dropdown on Laptop */}
                {userDropdownOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-2xl overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-150 ${
                      isDark
                        ? 'bg-[#18151F] border-[#3E3547] text-[#FAF5F6]'
                        : 'bg-[#FFFFFF] border-[#EADCE1] text-[#1E1B1D]'
                    }`}
                  >
                    {/* User Summary Header */}
                    <div className="p-4 border-b border-inherit bg-[#FAF5F6]/50 dark:bg-[#121016]/50">
                      <div className="flex items-center gap-3">
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-10 h-10 rounded-xl object-cover border-2 border-inherit"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold truncate">{currentUser.name}</h4>
                          <p className="text-[11px] text-[#8F7D85] truncate font-mono mt-0.5">
                            {currentUser.email}
                          </p>
                          <div className="mt-1">
                            {currentUser.role === 'admin' ? (
                              <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#FAF0F3] dark:bg-[#251E28] border border-[#DAC8CE] dark:border-[#4B3E52] text-[#8F7D85] dark:text-[#F2B3C1]">
                                <Shield className="w-2.5 h-2.5" />
                                Quản Trị Viên
                              </span>
                            ) : (
                              <span className="inline-block text-[9px] uppercase font-semibold px-2 py-0.5 rounded-full border border-inherit text-[#8F7D85]">
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
                          className="w-full px-3 py-2 rounded-xl flex items-center hover:bg-[#FAF0F3] dark:hover:bg-[#251E2B] transition-colors text-left font-medium"
                        >
                          <span>Chỉnh sửa hồ sơ (Tên & Avatar)</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setActiveView('library');
                        }}
                        className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-[#FAF0F3] dark:hover:bg-[#251E2B] transition-colors text-left font-medium"
                      >
                        <Bookmark className="w-4 h-4 text-[#8F7D85]" />
                        <span>Tủ sách cá nhân ({libraryNovelIds.length})</span>
                      </button>

                      {canManageNovels && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setActiveView('author_dashboard');
                          }}
                          className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-[#FAF0F3] dark:hover:bg-[#251E2B] transition-colors text-left font-medium"
                        >
                          <BookOpen className="w-4 h-4 text-[#8F7D85]" />
                          <span>Bảng điều khiển tác giả</span>
                        </button>
                      )}
                    </div>

                    {/* Footer: Logout */}
                    <div className="p-2 border-t border-inherit bg-[#FAF5F6]/30 dark:bg-[#121016]/30">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left font-semibold text-xs"
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
                className={`min-h-[38px] px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] ${
                  isDark
                    ? 'bg-[#FAF5F6] text-[#121113] hover:bg-white'
                    : 'bg-[#1E1B1D] text-[#FAF5F6] hover:bg-black'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden min-h-[38px] min-w-[38px] p-2 rounded-xl border ${
                isDark
                  ? 'border-[#382F42] text-[#FFFFFF] bg-[#1E1A26]'
                  : 'border-[#DAC8CE] text-[#5C4E55] bg-white'
              }`}
              aria-label="Mở menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden py-4 border-t space-y-2 animate-in slide-in-from-top-2 duration-150 ${
              isDark ? 'border-[#382F42] bg-[#141218]' : 'border-[#EADCE1] bg-[#FAF5F6]'
            }`}
          >
            {/* Mobile Search input */}
            <div className="px-2 pb-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-inherit bg-white dark:bg-[#1E1A26]">
                <Search className="w-3.5 h-3.5 text-[#8F7D85]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm truyện, tác giả..."
                  className="w-full text-xs bg-transparent focus:outline-none placeholder-[#8F7D85]"
                />
              </div>
              {searchQuery.trim() && searchResults.length > 0 && (
                <div className="mt-2 rounded-xl border border-inherit p-2 space-y-1 bg-white dark:bg-[#1E1A26]">
                  {searchResults.map((novel) => (
                    <button
                      key={novel.id}
                      onClick={() => {
                        handleSelectSearchResult(novel.id);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full p-2 text-left text-xs font-semibold truncate hover:bg-[#FAF0F3] dark:hover:bg-[#251E2B] rounded-lg block"
                    >
                      {novel.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {navItems.map((item) => {
              const isActive = activeView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id as any);
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors ${
                    isDark
                      ? isActive
                        ? 'bg-[#FAF5F6] text-[#121113]'
                        : 'text-[#FFFFFF] hover:bg-[#251E2B]'
                      : isActive
                      ? 'bg-[#1E1B1D] text-[#FAF5F6]'
                      : 'text-[#5A4D53] hover:bg-[#FAF0F3]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {canManageNovels && (
              <button
                onClick={() => {
                  setActiveView('author_dashboard');
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider block text-left border ${
                  isDark
                    ? activeView === 'author_dashboard'
                      ? 'bg-white text-black border-white'
                      : 'border-[#4B3E57] text-[#FAF5F6] hover:bg-[#251E2B]'
                    : activeView === 'author_dashboard'
                    ? 'bg-[#1E1B1D] text-white border-[#1E1B1D]'
                    : 'border-[#DAC8CE] text-[#5A4D53] hover:bg-[#FAF0F3]'
                }`}
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
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider block text-left border ${
                  isDark
                    ? 'border-[#4B3E57] text-[#FAF5F6] hover:bg-[#251E2B]'
                    : 'border-[#DAC8CE] text-[#1E1B1D] hover:bg-[#FAF0F3]'
                }`}
              >
                <span>Chỉnh sửa hồ sơ (Tên & Avatar)</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
