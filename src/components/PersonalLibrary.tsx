import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NovelCard } from './NovelCard';
import { ProfileModal } from './ProfileModal';
import { formatRelativeTime } from '../lib/formatTime';

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
    <div className={`py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 rounded-[26px] border ${
      isDark ? 'bg-[#211B22] border-[#594352]' : 'bg-[#FFF9FB] border-[#E7C3CE]'
    }`}>
      {/* Header — matches the centered style used on Bảng Xếp Hạng */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-[#B5798D] dark:text-[#E8B8C5]">
          <span className="w-2 h-2 rounded-full bg-[#E8A0B8]" />
          <span>Góc cá nhân</span>
          <span className="w-2 h-2 rounded-full bg-[#E8A0B8]" />
        </div>
        <h1 className="font-eb-garamond not-italic text-3xl sm:text-4xl font-medium text-[#574D4C] dark:text-[#FFFFFF]">
          Tủ Sách & Lịch Sử Đọc
        </h1>

        {currentUser && (
          <div className="flex items-center justify-center pt-2">
            <div className="flex items-center gap-3 p-2.5 rounded-xl border border-[#E7B6C5] dark:border-[#6B5261] bg-[#FFFFFF] dark:bg-[#2B222C]">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-xl object-cover border border-[#DAC8CE] dark:border-[#5A4E68]"
              />
              <div className="text-left pr-2">
                <span className="text-xs font-bold block text-[#1E1B1D] dark:text-[#FFFFFF] leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-[#8F7D85] block font-mono">
                  {currentUser.email}
                </span>
              </div>
              <button
                onClick={() => setIsProfileOpen(true)}
                className="px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-colors bg-[#FAF5F6] dark:bg-[#251E2B] border-[#DAC8CE] dark:border-[#4B3E52] text-[#1E1B1D] dark:text-[#FAF5F6] hover:border-[#1E1B1D] dark:hover:border-white shadow-2xs"
              >
                <span>Sửa hồ sơ</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border border-[#E7C3CE] dark:border-[#594352] bg-[#FFF1F5] dark:bg-[#2B222C] p-2 rounded-xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('bookshelf')}
          className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all border flex items-center gap-1.5 ${
            activeTab === 'bookshelf'
              ? 'bg-[#D985A2] text-white border-[#D985A2] dark:bg-[#F2B3C1] dark:text-[#2B222C] dark:border-[#F2B3C1]'
              : isDark
              ? 'border-[#4E4456] text-[#FAF5F6] hover:border-white'
              : 'border-[#DAC8CE] text-[#6E5D65] hover:border-[#1E1B1D]'
          }`}
        >
          <span>Tủ sách ({savedNovels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all border flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-[#D985A2] text-white border-[#D985A2] dark:bg-[#F2B3C1] dark:text-[#2B222C] dark:border-[#F2B3C1]'
              : isDark
              ? 'border-[#4E4456] text-[#FAF5F6] hover:border-white'
              : 'border-[#DAC8CE] text-[#6E5D65] hover:border-[#1E1B1D]'
          }`}
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
                className={`text-center py-12 rounded-2xl border-2 p-6 ${
                isDark ? 'bg-[#2B222C] border-[#6B5261]' : 'bg-[#FFF9FB] border-[#E7B6C5]'
              }`}
            >
              <span className="inline-block w-3 h-3 rounded-full bg-[#E8A0B8] mb-3" />
              <p className="font-eb-garamond text-xl font-medium text-[#574D4C] dark:text-[#FAF5F6]">Tủ sách đang trống</p>
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
                className="min-h-[32px] px-3 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 border border-[#DAC8CE] dark:border-[#38323D] text-[#8F7D85] dark:text-[#D5CBD0] hover:border-[#E0A8B6] hover:text-[#C97F91] dark:hover:text-[#E0A8B6] transition-colors"
              >
                <span>Xóa lịch sử</span>
              </button>
            )}
          </div>

          {readingHistory.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {readingHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`group rounded-xl border-2 p-3.5 flex items-center gap-3.5 transition-all ${
                    isDark
                      ? 'bg-[#2B222C] border-[#6B5261] hover:border-[#D79BAD]'
                      : 'bg-[#FFFFFF] border-[#E7B6C5] hover:border-[#D79BAD]'
                  }`}
                >
                  <img
                    src={item.novelCover}
                    alt={item.novelTitle}
                    className="w-12 h-16 object-cover rounded-lg border border-[#EADCE1] dark:border-[#38323D] shrink-0"
                  />

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="min-w-0">
                      <h4 className="font-playfair text-sm font-medium text-[#1E1B1D] dark:text-[#FAF5F6] truncate">
                        {item.novelTitle}
                      </h4>
                      <p className="text-[11px] text-[#8F7D85] dark:text-[#D5CBD0] truncate mt-0.5">
                        {item.chapterTitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-[#EADCE1] dark:bg-[#38323D] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#E0A8B6] transition-all"
                          style={{ width: `${item.progressPercent || 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[#8F7D85] dark:text-[#D5CBD0] shrink-0">
                        {item.progressPercent || 0}%
                      </span>
                    </div>

                    <p className="text-[10px] text-[#B3A3AA] dark:text-[#8F7D85] flex items-center gap-1">
                      <span>{formatRelativeTime(item.lastReadAt)}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => openReader(item.novelId, item.chapterId, item.paragraphIndex)}
                    aria-label="Đọc tiếp"
                    className="min-h-[34px] px-3 py-1.5 rounded-lg bg-[#D985A2] text-white dark:bg-[#F2B3C1] dark:text-[#2B222C] text-[11px] font-semibold whitespace-nowrap shrink-0 group-hover:opacity-90 transition-opacity"
                  >
                    Đọc tiếp
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div
                className={`text-center py-12 rounded-2xl border-2 p-6 ${
                isDark ? 'bg-[#2B222C] border-[#6B5261]' : 'bg-[#FFF9FB] border-[#E7B6C5]'
              }`}
            >
              <span className="inline-block w-3 h-3 rounded-full bg-[#E8A0B8] mb-3" />
              <p className="font-eb-garamond text-xl font-medium text-[#574D4C] dark:text-[#FAF5F6]">Chưa có lịch sử đọc</p>
              <p className="text-xs text-[#8F7D85] dark:text-[#D5CBD0] mt-1">Khi bạn đọc một chương truyện, lịch sử sẽ tự động ghi nhớ tại đây.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};