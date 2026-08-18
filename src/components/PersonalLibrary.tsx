import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NovelCard } from './NovelCard';
import { Bookmark, Clock, Trash2, ArrowRight, UserCog } from 'lucide-react';
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
    <div className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header — matches the centered style used on Bảng Xếp Hạng */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="font-playfair italic text-2xl sm:text-4xl font-normal text-[#1E1B1D] dark:text-[#FFFFFF]">
          Tủ Sách & Lịch Sử Đọc
        </h1>

        {currentUser && (
          <div className="flex items-center justify-center pt-2">
            <div className="flex items-center gap-3 p-2.5 rounded-xl border border-[#ECE0E4] dark:border-[#383040] bg-[#FFFFFF]/60 dark:bg-[#1A1720]/60">
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
      <div className="flex items-center gap-2 border-b border-[#ECE0E4] dark:border-[#383040] pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('bookshelf')}
          className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all border flex items-center gap-1.5 ${
            activeTab === 'bookshelf'
              ? 'bg-[#1E1B1D] text-[#FAF5F6] border-[#1E1B1D] dark:bg-[#FAF5F6] dark:text-[#121113] shadow-xs'
              : isDark
              ? 'border-[#4E4456] text-[#FAF5F6] hover:border-white'
              : 'border-[#DAC8CE] text-[#6E5D65] hover:border-[#1E1B1D]'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Tủ sách ({savedNovels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all border flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-[#1E1B1D] text-[#FAF5F6] border-[#1E1B1D] dark:bg-[#FAF5F6] dark:text-[#121113] shadow-xs'
              : isDark
              ? 'border-[#4E4456] text-[#FAF5F6] hover:border-white'
              : 'border-[#DAC8CE] text-[#6E5D65] hover:border-[#1E1B1D]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
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
                isDark ? 'bg-[#18161B] border-[#2D2832]' : 'bg-[#FAF5F6] border-[#EADCE1]'
              }`}
            >
              <p className="font-playfair text-base font-medium text-[#1E1B1D] dark:text-[#FAF5F6]">Tủ sách đang trống</p>
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
                <Trash2 className="w-3 h-3" />
                <span>Xóa lịch sử</span>
              </button>
            )}
          </div>

          {readingHistory.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {readingHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`group rounded-2xl border p-3.5 flex items-center gap-3.5 transition-all ${
                    isDark
                      ? 'bg-[#18161B] border-[#2E2833] hover:border-[#4E4456]'
                      : 'bg-[#FFFFFF] border-[#ECE0E4] shadow-2xs hover:border-[#DAC8CE] hover:shadow-xs'
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
                      <Clock className="w-2.5 h-2.5" />
                      <span>{formatRelativeTime(item.lastReadAt)}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => openReader(item.novelId, item.chapterId, item.paragraphIndex)}
                    aria-label="Đọc tiếp"
                    className="w-9 h-9 rounded-full bg-[#1E1B1D] text-[#FAF5F6] dark:bg-[#FAF5F6] dark:text-[#121113] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`text-center py-12 rounded-2xl border p-6 ${
                isDark ? 'bg-[#18161B] border-[#2D2832]' : 'bg-[#FAF5F6] border-[#EADCE1]'
              }`}
            >
              <p className="font-playfair text-base font-medium text-[#1E1B1D] dark:text-[#FAF5F6]">Chưa có lịch sử đọc</p>
              <p className="text-xs text-[#8F7D85] dark:text-[#D5CBD0] mt-1">Khi bạn đọc một chương truyện, lịch sử sẽ tự động ghi nhớ tại đây.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};