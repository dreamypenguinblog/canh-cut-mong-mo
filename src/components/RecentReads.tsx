import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight } from 'lucide-react';

// Bảng màu hồng phẳng đồng bộ với NovelCard / NovelGrid / Leaderboard / Navbar.
const ACCENT = '#F0A8C8';
const ACCENT_DARK = '#EDA3B4';
const ACCENT_TEXT_DARK = '#2B222C';

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
        className={`relative overflow-visible rounded-[26px] border p-4 sm:p-6 transition-colors ${
          isDark
            ? 'bg-gradient-to-b from-[#2B222C] via-[#241D26] to-[#2B222C] border-[#6B5261]'
            : 'bg-gradient-to-b from-white via-[#FFF8FB] to-white border-[#F5DFE7]'
        }`}
      >
        {/* Sparkle decoration – góc trên phải khung tổng, cùng ngôn ngữ trang trí với NovelCard */}
        <div
          className={`pointer-events-none select-none absolute top-3 right-4 text-[10px] leading-[1.7] z-10 hidden sm:block ${
            isDark ? 'text-[#7A5869]/60' : 'text-[#F2C7DA]/70'
          }`}
        >
          ✧　⋆<br />
          ⋆　✿
        </div>

        <div className="flex items-center justify-between border-b border-[#F0D9E3] dark:border-[#6B5261] pb-3 mb-3.5">
          <h2
            style={{ fontFamily: "'Vollkorn', serif" }}
            className="not-italic text-lg sm:text-xl font-semibold tracking-wide text-[#6B4A57] dark:text-white"
          >
            Đọc Gần Đây
          </h2>
          <span className="text-[10px] sm:text-[11px] text-right text-[#B58B98] dark:text-[#D5CBD0]">
            Tiến độ đọc của bạn
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentItems.map((item, idx) => {
            const isLatest = idx === 0;
            return (
              <div
                key={idx}
                className={`relative p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all hover:-translate-y-0.5 ${
                  isDark
                    ? 'bg-[#352936] border-[#6B5261] hover:border-[#D79BAD]'
                    : 'bg-white border-[#F5DFE7] hover:border-[#E7B6C5]'
                }`}
              >
                {/* Pill nổi "ĐANG ĐỌC" cho mục gần nhất */}
                {isLatest && (
                  <span
                    className={`absolute -top-2.5 left-4 px-2.5 py-[3px] rounded-full text-[8px] tracking-normal font-semibold border shadow-sm whitespace-nowrap z-10 ${
                      isDark
                        ? 'bg-[#2B222C] border-[#6B5261] text-[#E8B8C5]'
                        : 'bg-[#FFF0F7] border-white text-[#D8A3BA]'
                    }`}
                  >
                    𝜗𝜚 ĐANG ĐỌC 𝜗𝜚
                  </span>
                )}

                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Bìa — khung lồng khung như NovelCard, ảnh nổi bật hơn hẳn bản cũ */}
                  <div
                    className={`relative flex-shrink-0 p-1 rounded-xl border ${
                      isDark
                        ? 'bg-gradient-to-b from-[#2B222C] to-[#241D26] border-[#6B5261]'
                        : 'bg-gradient-to-b from-[#FFFAFD] to-white border-[#F5DFE7]'
                    }`}
                  >
                    <img
                      src={item.novelCover}
                      alt={item.novelTitle}
                      className="w-12 h-16 object-cover rounded-lg"
                    />
                    <span className="pointer-events-none select-none absolute -bottom-0.5 -right-0.5 text-[9px] text-[#E9B8C2] dark:text-[#7A5869]">
                      𝜗𝜚
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h3
                      style={{ fontFamily: "'Vollkorn', serif" }}
                      className="not-italic text-xs sm:text-sm font-semibold text-[#574D4C] dark:text-white truncate"
                    >
                      {item.novelTitle}
                    </h3>
                    <p className="text-[11px] text-[#8F7D85] dark:text-[#D5CBD0] truncate mt-0.5">
                      {item.chapterTitle}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-16 h-1.5 rounded-full bg-[#F5DFE7] dark:bg-[#6B5261] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${item.progressPercent || 50}%`, background: isDark ? ACCENT_DARK : ACCENT }}
                        />
                      </div>
                      <span className="text-[10px] text-[#8F7D85] dark:text-[#D5CBD0]">
                        {item.progressPercent || 50}%
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => openReader(item.novelId, item.chapterId, item.paragraphIndex)}
                  className="min-h-[32px] px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 shrink-0 hover:opacity-90 transition-opacity"
                  style={{ background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }}
                >
                  <span>Đọc tiếp</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};