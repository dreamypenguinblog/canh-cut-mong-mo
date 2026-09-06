import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NovelCard } from './NovelCard';
import { Trash2, ArrowRight } from 'lucide-react';
import { ProfileModal } from './ProfileModal';
import { formatRelativeTime } from '../lib/formatTime';

// Bảng màu hồng phẳng đồng bộ với NovelCard / NovelGrid / Leaderboard / Navbar / HomeHero.
const ACCENT = '#F6B9D2';
const ACCENT_DARK = '#F2B3C1';
const ACCENT_TEXT_DARK = '#2B222C';

export const PersonalLibrary: React.FC = () => {
  const {
    currentUser,
    libraryNovelIds,
    novels,
    readingHistory,
    openReader,
    clearHistory,
    globalTheme,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'bookshelf' | 'history'>('bookshelf');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isDark = globalTheme === 'dark';

  // Saved novels in library
  const savedNovels = novels.filter((n) => libraryNovelIds.includes(n.id));

  return (
    <div className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header — tiêu đề Vollkorn có sparkle trang trí 2 bên, cùng ngôn ngữ NovelCard/Leaderboard */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1
          style={{ fontFamily: "'Vollkorn', serif" }}
          className="not-italic text-2xl sm:text-4xl font-medium text-[#8B5D71] dark:text-[#F7E4EC] flex items-center justify-center gap-3"
        >
          <span className="text-base sm:text-lg text-[#F2C7DA] dark:text-[#7A5869]">✧⋆</span>
          <span>Tủ Sách & Lịch Sử Đọc</span>
          <span className="text-base sm:text-lg text-[#F2C7DA] dark:text-[#7A5869]">⋆✧</span>
        </h1>

        {currentUser && (
          <div className="flex items-center justify-center pt-2">
            <div
              className={`flex items-center gap-3 p-2.5 rounded-2xl border ${
                isDark ? 'border-[#6B5261] bg-[#2B222C]' : 'border-[#F5DFE7] bg-white'
              }`}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover border border-[#F5DFE7] dark:border-[#6B5261]"
              />
              <div className="text-left pr-2">
                <span className="text-xs font-bold block text-[#6B4A57] dark:text-[#FAF5F6] leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-[#B79AA6] dark:text-[#D5CBD0] block font-mono">
                  {currentUser.email}
                </span>
              </div>
              <button
                onClick={() => setIsProfileOpen(true)}
                className="px-3.5 py-1.5 rounded-full border text-[11px] font-medium transition-colors"
                style={
                  isDark
                    ? { background: '#352936', borderColor: '#6B5261', color: '#F2B3C1' }
                    : { background: '#FFF6FB', borderColor: '#F0C7DE', color: '#B4587E' }
                }
              >
                <span>Sửa hồ sơ</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Navigation Tabs — dạng pill phẳng, không icon, không viền đen */}
      <div
        className={`inline-flex items-center gap-1 rounded-full border p-1 mx-auto flex ${
          isDark ? 'border-[#6B5261] bg-[#2B222C]' : 'border-[#F5D2E0] bg-[#FFF5FA]'
        }`}
        style={{ width: 'fit-content' }}
      >
        <button
          onClick={() => setActiveTab('bookshelf')}
          className="min-h-[36px] px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all"
          style={
            activeTab === 'bookshelf'
              ? { background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }
              : isDark
              ? { color: '#E8DFE3' }
              : { color: '#B4587E' }
          }
        >
          <span>Tủ sách ({savedNovels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className="min-h-[36px] px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all"
          style={
            activeTab === 'history'
              ? { background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }
              : isDark
              ? { color: '#E8DFE3' }
              : { color: '#B4587E' }
          }
        >
          <span>Lịch sử đọc ({readingHistory.length})</span>
        </button>
      </div>

      {/* Tab 1: Bookshelf */}
      {activeTab === 'bookshelf' && (
        <div>
          {savedNovels.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 lg:gap-6">
              {savedNovels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>
          ) : (
            <div
              className={`text-center py-12 rounded-2xl border p-6 ${
                isDark ? 'bg-[#2B222C] border-[#6B5261]' : 'bg-white border-[#F0D9E3]'
              }`}
            >
              <span className="inline-block w-3 h-3 rounded-full bg-[#E8A0B8] mb-3" />
              <p
                style={{ fontFamily: "'Vollkorn', serif" }}
                className="not-italic text-base font-medium text-[#574D4C] dark:text-[#FAF5F6]"
              >
                Tủ sách đang trống
              </p>
              <p className="text-xs text-[#8F7D85] dark:text-[#D5CBD0] mt-1">
                Nhấn vào nút lưu trên bìa truyện để thêm vào tủ sách cá nhân.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Reading History */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-[#8F7D85] dark:text-[#D5CBD0]">Tiến độ đọc gần nhất</span>
            {readingHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className={`min-h-[32px] px-3.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 border transition-colors ${
                  isDark
                    ? 'border-[#6B5261] text-[#D5CBD0] hover:border-[#F2B3C1] hover:text-[#F2B3C1]'
                    : 'border-[#F0D9E3] text-[#8F7D85] hover:border-[#E7B6C5] hover:text-[#B4587E]'
                }`}
              >
                <Trash2 className="w-3 h-3" />
                <span>Xóa lịch sử</span>
              </button>
            )}
          </div>

          {readingHistory.length > 0 ? (
            <div className="relative max-w-2xl mx-auto pl-7 sm:pl-9">
              {/* Đường kẻ dọc timeline — mờ dần về cuối */}
              <div
                className={`absolute top-1 bottom-1 left-[9px] sm:left-[11px] w-px ${
                  isDark
                    ? 'bg-gradient-to-b from-[#6B5261] via-[#6B5261] to-transparent'
                    : 'bg-gradient-to-b from-[#F0C7DE] via-[#F0C7DE] to-transparent'
                }`}
              />

              <div className="space-y-5">
                {readingHistory.map((item, idx) => {
                  const isLatest = idx === 0;
                  return (
                    <div key={idx} className="relative">
                      {/* Mốc thời gian — mốc gần nhất nổi bật, viền trắng để nổi trên đường kẻ */}
                      <span
                        className="absolute -left-7 sm:-left-9 top-4 w-3 h-3 rounded-full border-2 z-10"
                        style={{
                          background: isLatest ? (isDark ? ACCENT_DARK : ACCENT) : isDark ? '#594352' : '#F5DFE7',
                          borderColor: isDark ? '#2B222C' : '#FFFDFD',
                        }}
                      />

                      <div
                        className={`relative overflow-visible group rounded-2xl border p-3.5 flex items-center gap-3.5 transition-all ${
                          isDark
                            ? 'bg-gradient-to-b from-[#2B222C] via-[#241D26] to-[#2B222C] border-[#6B5261] hover:border-[#D79BAD]'
                            : 'bg-gradient-to-b from-white via-[#FFFAFD] to-white border-[#F5DFE7] hover:border-[#E7B6C5]'
                        }`}
                      >
                        {/* Pill nổi "ĐANG ĐỌC" cho mục gần nhất — cùng ngôn ngữ pill trong Leaderboard/WordPress */}
                        {isLatest && (
                          <span
                            className={`absolute -top-2.5 left-5 px-2.5 py-[3px] rounded-full text-[8px] tracking-[1.5px] font-semibold border shadow-sm whitespace-nowrap z-10 ${
                              isDark
                                ? 'bg-[#352936] border-[#6B5261] text-[#E8B8C5]'
                                : 'bg-[#FFF0F7]/90 border-white text-[#D8A3BA]'
                            }`}
                          >
                            𝜗𝜚 ĐANG ĐỌC 𝜗𝜚
                          </span>
                        )}

                        {/* Sparkle decoration góc trên phải — cùng ngôn ngữ NovelCard */}
                        <div
                          className={`pointer-events-none select-none absolute top-2 right-3 text-[8px] leading-[1.6] ${
                            isDark ? 'text-[#7A5869]/50' : 'text-[#F2C7DA]/70'
                          }`}
                        >
                          ✧　⋆
                        </div>

                        <div
                          className={`relative p-1 rounded-xl border shrink-0 ${
                            isDark
                              ? 'bg-gradient-to-b from-[#352936] to-[#2B222C] border-[#6B5261]'
                              : 'bg-gradient-to-b from-[#FFFAFD] to-white border-[#F5DFE7]'
                          }`}
                        >
                          <img
                            src={item.novelCover}
                            alt={item.novelTitle}
                            className="w-11 h-14 object-cover rounded-lg"
                          />
                          {/* Dấu trang trí góc ảnh bìa — cùng ngôn ngữ NovelCard */}
                          <span className="pointer-events-none select-none absolute -bottom-0.5 -right-0.5 text-[9px] text-[#E9B8C2] dark:text-[#7A5869]">
                            𝜗𝜚
                          </span>
                        </div>

                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h4
                                style={{ fontFamily: "'Vollkorn', serif" }}
                                className="not-italic text-sm font-semibold text-[#6B4A57] dark:text-[#FAF5F6] truncate"
                              >
                                {item.novelTitle}
                              </h4>
                              <p className="text-[11px] text-[#B79AA6] dark:text-[#D5CBD0] truncate mt-0.5">
                                {item.chapterTitle}
                              </p>
                            </div>
                            <span className="text-[10px] text-[#B79AA6] dark:text-[#D5CBD0] shrink-0 whitespace-nowrap pt-0.5">
                              {formatRelativeTime(item.lastReadAt)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-[#F5DFE7] dark:bg-[#6B5261] overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${item.progressPercent || 0}%`, background: isDark ? ACCENT_DARK : ACCENT }}
                              />
                            </div>
                            <span className="text-[10px] text-[#B79AA6] dark:text-[#D5CBD0] shrink-0">
                              {item.progressPercent || 0}%
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => openReader(item.novelId, item.chapterId, item.paragraphIndex)}
                          aria-label="Đọc tiếp"
                          className="min-h-[34px] px-3.5 rounded-full flex items-center gap-1.5 shrink-0 text-[11px] font-semibold uppercase tracking-wider transition-transform group-hover:scale-[1.03]"
                          style={{ background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }}
                        >
                          <span className="hidden sm:inline">Đọc tiếp</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div
              className={`text-center py-12 rounded-2xl border p-6 ${
                isDark ? 'bg-[#2B222C] border-[#6B5261]' : 'bg-white border-[#F0D9E3]'
              }`}
            >
              <span className="inline-block w-3 h-3 rounded-full bg-[#E8A0B8] mb-3" />
              <p
                style={{ fontFamily: "'Vollkorn', serif" }}
                className="not-italic text-base font-medium text-[#574D4C] dark:text-[#FAF5F6]"
              >
                Chưa có lịch sử đọc
              </p>
              <p className="text-xs text-[#8F7D85] dark:text-[#D5CBD0] mt-1">
                Khi bạn đọc một chương truyện, lịch sử sẽ tự động ghi nhớ tại đây.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};