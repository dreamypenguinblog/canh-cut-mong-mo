import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight } from 'lucide-react';

export const RecentReads: React.FC = () => {
  const { readingHistory, openReader, globalTheme } = useApp();
  const isDark = globalTheme === 'dark';

  if (!readingHistory || readingHistory.length === 0) {
    return null;
  }

  // Show top 2-3 most recent reads
  const recentItems = readingHistory.slice(0, 3);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div
        className={`rounded-2xl border p-4 sm:p-5 transition-colors ${
          isDark
            ? 'bg-[#18161B] border-[#383040] text-[#FFFFFF]'
            : 'bg-[#FFFFFF] border-[#ECE0E4] shadow-2xs text-[#1E1B1D]'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#ECE0E4] dark:border-[#383040] pb-3 mb-3.5">
          <div>
            <h2 className="font-playfair italic text-base sm:text-lg font-medium text-[#1E1B1D] dark:text-[#FFFFFF]">
              Đọc Gần Đây
            </h2>
          </div>
          <span className="text-[11px] text-[#8F7D85] dark:text-[#D5CBD0]">
            Tiến độ đọc của bạn
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentItems.map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                isDark
                  ? 'bg-[#221D29] border-[#4E4456] hover:border-neutral-400'
                  : 'bg-[#FAF5F6] border-[#EADCE1] hover:border-[#DAC8CE]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={item.novelCover}
                  alt={item.novelTitle}
                  className="w-11 h-14 object-cover rounded-md border border-[#EADCE1] dark:border-[#4E4456] shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-playfair text-xs sm:text-sm font-medium text-[#1E1B1D] dark:text-[#FFFFFF] truncate">
                    {item.novelTitle}
                  </h3>
                  <p className="text-[11px] text-[#8F7D85] dark:text-[#E0D8DC] truncate mt-0.5">
                    {item.chapterTitle}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-16 h-1 rounded-full bg-[#EADCE1] dark:bg-[#4E4456] overflow-hidden">
                      <div
                        className="h-full bg-[#1E1B1D] dark:bg-[#FFFFFF]"
                        style={{ width: `${item.progressPercent || 50}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[#8F7D85] dark:text-[#E0D8DC]">
                      {item.progressPercent || 50}%
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => openReader(item.novelId, item.chapterId, item.paragraphIndex)}
                className="min-h-[32px] px-2.5 py-1 rounded-lg bg-[#1E1B1D] text-[#FAF5F6] dark:bg-[#FAF5F6] dark:text-[#121113] text-[11px] font-semibold flex items-center gap-1 shrink-0 hover:opacity-90 transition-opacity"
              >
                <span>Đọc tiếp</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
