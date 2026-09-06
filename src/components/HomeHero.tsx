import React from 'react';
import { useApp } from '../context/AppContext';
import { Eye, BookOpen, ArrowRight, Star } from 'lucide-react';

// Bảng màu hồng phẳng đồng bộ với NovelCard / NovelGrid / Leaderboard / Navbar.
// Không dùng gradient cho nút chính.
const ACCENT = '#F6B9D2';
const ACCENT_DARK = '#F2B3C1';
const ACCENT_TEXT_DARK = '#2B222C';

export const HomeHero: React.FC = () => {
  const { novels, openReader, openNovelDetail, globalTheme } = useApp();
  const featuredNovel = novels.find((n) => n.featured) || novels[0];

  const isDark = globalTheme === 'dark';

  if (!featuredNovel) return null;

  return (
    <section className="relative overflow-hidden py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`relative rounded-[28px] p-5 sm:p-8 border transition-all duration-200 overflow-hidden ${
            isDark
              ? 'bg-[#2B222C] border-[#6B5261] text-[#F3EEF0]'
              : 'bg-[#FFF9FB] border-[#F5DFE7] text-[#574D4C]'
          }`}
          style={isDark ? undefined : {
            backgroundImage: 'linear-gradient(rgba(232, 160, 184, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(232, 160, 184, 0.06) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        >
          {/* Sparkle decoration góc trên phải — cùng ngôn ngữ trang trí với NovelCard/Leaderboard */}
          <div
            className={`pointer-events-none select-none absolute top-4 right-5 text-[10px] leading-[1.8] hidden sm:block ${
              isDark ? 'text-[#7A5869]/50' : 'text-[#F2C7DA]/70'
            }`}
          >
            ✧　　⋆<br />
            ⋆　　✿
          </div>

          {/* Top category indicator */}
          <div className="flex items-center justify-between border-b border-[#F0D9E3] dark:border-[#594352] pb-3 mb-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E8A0B8]" />
              <span className="text-xs uppercase tracking-[0.18em] font-semibold text-[#B5798D] dark:text-[#E8B8C5]">
                Truyện Nổi Bật
              </span>
              <span className="w-2 h-2 rounded-full bg-[#E8A0B8]" />
            </div>
            <span className="text-xs text-[#B79AA6] dark:text-[#D5CBD0]">
              {featuredNovel.genres.join(' • ')}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-3.5">
              <h1
                style={{ fontFamily: "'Vollkorn', serif" }}
                className="not-italic text-3xl sm:text-4xl font-semibold leading-tight text-[#6B4A57] dark:text-[#FAF5F6]"
              >
                {featuredNovel.title}
              </h1>

              {/* Metrics line icons */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#8F7D85] dark:text-[#D5CBD0]">
                <span>Tác giả: <strong className="text-[#6B4A57] dark:text-[#FAF5F6]">{featuredNovel.authorName}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5" style={{ color: isDark ? ACCENT_DARK : ACCENT }} />
                  <span>{featuredNovel.rating.toFixed(2)}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{featuredNovel.chaptersCount} chương</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{featuredNovel.totalViews.toLocaleString('vi-VN')}</span>
                </span>
              </div>

              <p className="font-lora text-xs sm:text-sm leading-relaxed whitespace-pre-line break-words text-[#5A4C52] dark:text-[#C4B8BF] line-clamp-3">
                {featuredNovel.synopsis}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {featuredNovel.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className={`text-[11px] px-3 py-1 rounded-full border transition-colors ${
                      isDark
                        ? 'border-[#6B5261] bg-[#352936] text-[#F2B3C1]'
                        : 'border-[#F5D2E0] bg-[#FFF5FA] text-[#B4587E]'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  id="hero-read-now-btn"
                  onClick={() => openReader(featuredNovel.id)}
                  className="min-h-[40px] px-5 py-2 rounded-full hover:opacity-90 transition-all text-xs uppercase tracking-wider font-semibold flex items-center gap-2"
                  style={{ background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Đọc ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  id="hero-view-details-btn"
                  onClick={() => openNovelDetail(featuredNovel.id)}
                  className="min-h-[40px] px-4 py-2 rounded-full border text-xs tracking-wider uppercase transition-all"
                  style={
                    isDark
                      ? { borderColor: '#6B5261', color: ACCENT_DARK }
                      : { borderColor: '#F0C7DE', color: '#B4587E', background: '#FFF6FB' }
                  }
                >
                  Chi tiết ({featuredNovel.chaptersCount} chương)
                </button>
              </div>
            </div>

            {/* Right Book Cover — khung "lồng khung" giống NovelCard */}
            <div className="lg:col-span-5 flex justify-center mt-2 lg:mt-0">
              <div
                className={`relative p-2 rounded-[26px] border ${
                  isDark
                    ? 'bg-gradient-to-b from-[#352936] to-[#2B222C] border-[#6B5261]'
                    : 'bg-gradient-to-b from-[#FFFAFD] to-white border-[#F5DFE7]'
                }`}
              >
                <div
                  className="cursor-pointer group relative w-40 sm:w-48 aspect-[2/3] rounded-[20px] overflow-hidden transition-transform duration-200 hover:scale-[1.02]"
                  onClick={() => openNovelDetail(featuredNovel.id)}
                >
                  <img
                    src={featuredNovel.coverImage}
                    alt={featuredNovel.title}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 text-white text-xs font-medium"
                    style={{ background: `linear-gradient(to top, ${isDark ? ACCENT_DARK : '#E58FB3'}D9, transparent 60%)` }}
                  >
                    Xem chi tiết tác phẩm →
                  </div>
                  {/* Dấu trang trí góc dưới ảnh — cùng ngôn ngữ NovelCard */}
                  <div className="pointer-events-none select-none absolute bottom-1.5 right-2 text-[14px] text-white/70">
                    𝜗𝜚
                  </div>
                </div>

                {/* Pill nổi đè viền khung — lấy cảm hứng từ pill "COVER"/"DREAMY" trong code WordPress */}
                <span
                  className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-[3px] rounded-full text-[8px] tracking-[2px] font-semibold border shadow-sm whitespace-nowrap ${
                    isDark
                      ? 'bg-[#352936] border-[#6B5261] text-[#E8B8C5]'
                      : 'bg-[#FFF0F7]/90 border-white text-[#D8A3BA]'
                  }`}
                >
                  𝜗𝜚 DREAMY 𝜗𝜚
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};