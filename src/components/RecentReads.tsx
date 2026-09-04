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
            ? 'bg-[#211B22] border-[#594352] text-[#FFFFFF] shadow-[0_8px_24px_rgba(0,0,0,0.16)]'
            : 'bg-[#FFF9FB] border-[#E7C3CE] shadow-[0_8px_24px_rgba(205,145,164,0.16)] text-[#574D4C]'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#E7C3CE] dark:border-[#594352] pb-3 mb-3.5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#E8A0B8]" />
              <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#B5798D] dark:text-[#E8B8C5]">
                Nhật ký
              </span>
            </div>
            <h2 className="font-eb-garamond not-italic text-lg sm:text-xl font-medium text-[#574D4C] dark:text-[#FFFFFF]">
              Đọc Gần Đây
            </h2>
          </div>
          <span className="text-[10px] sm:text-[11px] text-right text-[#B58B98] dark:text-[#D5CBD0]">
            Tiến độ đọc của bạn
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentItems.map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                isDark
                  ? 'bg-[#2B222C] border-[#6B5261] hover:border-[#B07B91]'
                  : 'bg-[#FFFDFB] border-[#E8C8D2] hover:border-[#D79BAD]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={item.novelCover}
                  alt={item.novelTitle}
                  className="w-12 h-16 object-cover rounded-lg border-2 border-[#F0C5D2] dark:border-[#6B5261] shrink-0 shadow-sm"
                />
                <div className="min-w-0">
                  <h3 className="font-playfair text-xs sm:text-sm font-semibold text-[#574D4C] dark:text-[#FFFFFF] truncate">
                    {item.novelTitle}
                  </h3>
                  <p className="text-[11px] text-[#8F7D85] dark:text-[#E0D8DC] truncate mt-0.5">
                    {item.chapterTitle}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-16 h-1.5 rounded-full bg-[#F3DDE4] dark:bg-[#594352] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#D985A2] dark:bg-[#F2B3C1]"
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
                className="min-h-[32px] px-2.5 py-1 rounded-full bg-[#D985A2] text-white dark:bg-[#F2B3C1] dark:text-[#2B222C] text-[11px] font-semibold flex items-center gap-1 shrink-0 hover:opacity-90 transition-opacity shadow-sm"
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
