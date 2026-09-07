import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NovelCard } from './NovelCard';
import { Trash2, ArrowRight, Heart } from 'lucide-react';
import { ProfileModal } from './ProfileModal';
import { formatRelativeTime } from '../lib/formatTime';

// Bảng màu hồng phẳng đồng bộ với NovelCard / NovelGrid / Leaderboard / Navbar / HomeHero.
// Đậm hơn một chút so với bản trước (#F6B9D2 → #F0A8C8) nhưng vẫn giữ vibe pastel.
const ACCENT = '#F0A8C8';
const ACCENT_DARK = '#EDA3B4';
const ACCENT_TEXT_DARK = '#2B222C';

export const PersonalLibrary: React.FC = () => {
  const {
    currentUser,
    libraryNovelIds,
    novels,
    readingHistory,
    openReader,
    openNovelDetail,
    isInLibrary,
    toggleLibraryNovel,
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
      {/* Header — căn giữa, KHÔNG dùng icon sao/sparkle nữa để đồng bộ với header các trang khác (Danh Sách Truyện, Bảng xếp hạng) */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1
          style={{ fontFamily: "'Vollkorn', serif" }}
          className="not-italic text-2xl sm:text-3xl font-medium text-[#8B5D71] dark:text-[#F7E4EC]"
        >
          Tủ Sách & Lịch Sử Đọc
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
                    ? { background: '#352936', borderColor: '#6B5261', color: ACCENT_DARK }
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

      {/* Tab 2: Reading History — dạng lưới 2 cột, card ngang lấy cảm hứng từ ảnh tham khảo */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto">
              {readingHistory.map((item, idx) => {
                const isLatest = idx === 0;
                const relatedNovel = novels.find((n) => n.id === item.novelId);
                const isSaved = relatedNovel ? isInLibrary(relatedNovel.id) : false;

                return (
                  <div
                    key={idx}
                    className={`relative flex gap-3 rounded-2xl border p-3 transition-all hover:-translate-y-0.5 ${
                      isDark
                        ? 'bg-gradient-to-b from-[#2B222C] via-[#241D26] to-[#2B222C] border-[#6B5261] hover:border-[#D79BAD]'
                        : 'bg-gradient-to-b from-white via-[#FFFAFD] to-white border-[#F5DFE7] hover:border-[#E7B6C5]'
                    }`}
                  >
                    {/* Pill nổi "ĐANG ĐỌC" cho mục gần nhất — tracking bình thường để icon nơ 𝜗𝜚 không bị vỡ */}
                    {isLatest && (
                      <span
                        className={`absolute -top-2.5 left-4 px-2.5 py-[3px] rounded-full text-[8px] tracking-normal font-semibold border shadow-sm whitespace-nowrap z-10 ${
                          isDark
                            ? 'bg-[#352936] border-[#6B5261] text-[#E8B8C5]'
                            : 'bg-[#FFF0F7]/90 border-white text-[#D8A3BA]'
                        }`}
                      >
                        𝜗𝜚 ĐANG ĐỌC 𝜗𝜚
                      </span>
                    )}

                    {/* Nút lưu tủ sách — góc trên phải card, chỉ hiện khi tìm được truyện tương ứng */}
                    {relatedNovel && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLibraryNovel(relatedNovel.id);
                        }}
                        className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full border flex items-center justify-center transition-all"
                        style={
                          isSaved
                            ? { background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF', borderColor: isDark ? ACCENT_DARK : ACCENT }
                            : isDark
                            ? { background: '#352936', color: ACCENT_DARK, borderColor: '#7A5869' }
                            : { background: '#FFF6FB', color: ACCENT, borderColor: '#F2C7DA' }
                        }
                        aria-label="Lưu vào tủ sách"
                      >
                        <Heart className={`w-3 h-3 ${isSaved ? 'fill-current' : 'stroke-[2]'}`} />
                      </button>
                    )}

                    {/* Ảnh bìa — to hơn trước, cùng cỡ với card trong Bảng xếp hạng */}
                    <div
                      className={`relative flex-shrink-0 p-1 rounded-xl border ${
                        isDark
                          ? 'bg-gradient-to-b from-[#352936] to-[#2B222C] border-[#6B5261]'
                          : 'bg-gradient-to-b from-[#FFFAFD] to-white border-[#F5DFE7]'
                      }`}
                    >
                      <img
                        src={item.novelCover}
                        alt={item.novelTitle}
                        onClick={() => relatedNovel && openNovelDetail(relatedNovel.id)}
                        className={`w-16 h-20 sm:w-20 sm:h-[104px] object-cover rounded-lg ${relatedNovel ? 'cursor-pointer' : ''}`}
                      />
                      {/* Dấu trang trí góc ảnh bìa — cùng ngôn ngữ NovelCard */}
                      <span className="pointer-events-none select-none absolute -bottom-0.5 -right-0.5 text-[9px] text-[#E9B8C2] dark:text-[#7A5869]">
                        𝜗𝜚
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div className="min-w-0">
                        <h4
                          onClick={() => relatedNovel && openNovelDetail(relatedNovel.id)}
                          style={{ fontFamily: "'Vollkorn', serif" }}
                          className={`not-italic text-sm font-semibold truncate text-[#6B4A57] dark:text-[#FAF5F6] ${relatedNovel ? 'cursor-pointer hover:underline' : ''}`}
                        >
                          {item.novelTitle}
                        </h4>
                        <p className="text-[11px] text-[#B79AA6] dark:text-[#D5CBD0] truncate mt-0.5">
                          {item.chapterTitle}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-1.5">
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

                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] text-[#B79AA6] dark:text-[#D5CBD0] whitespace-nowrap">
                          {formatRelativeTime(item.lastReadAt)}
                        </span>
                        <button
                          onClick={() => openReader(item.novelId, item.chapterId, item.paragraphIndex)}
                          aria-label="Đọc tiếp"
                          className="min-h-[26px] px-3 rounded-full flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider transition-colors"
                          style={{ background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }}
                        >
                          <span>Đọc tiếp</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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