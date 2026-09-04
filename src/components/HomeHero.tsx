import React from 'react';
import { useApp } from '../context/AppContext';
import { Eye, BookOpen, ArrowRight, Star } from 'lucide-react';

export const HomeHero: React.FC = () => {
  const { novels, openReader, openNovelDetail, globalTheme } = useApp();
  const featuredNovel = novels.find((n) => n.featured) || novels[0];

  const isDark = globalTheme === 'dark';

  if (!featuredNovel) return null;

  return (
    <section className="relative overflow-hidden py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`relative rounded-2xl p-5 sm:p-8 border-2 transition-all duration-200 overflow-hidden ${
            isDark
              ? 'bg-[#2B222C] border-[#6B5261] text-[#F3EEF0]'
              : 'bg-[#FFF9FB] border-[#E7B6C5] text-[#574D4C]'
          }`}
          style={isDark ? undefined : {
            backgroundImage: 'linear-gradient(rgba(232, 160, 184, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(232, 160, 184, 0.07) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        >
          {/* Top category indicator */}
          <div className="flex items-center justify-between border-b border-[#E7C3CE] dark:border-[#594352] pb-3 mb-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E0A8B6]" />
              <span className="text-xs uppercase tracking-[0.18em] font-semibold text-[#B5798D] dark:text-[#E8B8C5]">
                Truyện Nổi Bật
              </span>
            </div>
            <span className="text-xs text-[#8F7D85]">
              {featuredNovel.genres.join(' • ')}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-3.5">
              <h1 className="font-eb-garamond text-3xl sm:text-4xl font-medium leading-tight text-[#574D4C] dark:text-[#FAF5F6]">
                {featuredNovel.title}
              </h1>

              {/* Metrics line icons */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#7A6E74] dark:text-[#A69B9E]">
                <span>Tác giả: <strong className="text-[#1E1B1D] dark:text-[#FAF5F6]">{featuredNovel.authorName}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-[#E0A8B6]" />
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

              <p className="font-lora text-xs sm:text-sm leading-relaxed whitespace-pre-line break-words text-[#4A3F45] dark:text-[#C4B8BF] line-clamp-3">
                {featuredNovel.synopsis}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {featuredNovel.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className={`text-[11px] px-2.5 py-0.5 rounded-md border transition-colors ${
                      isDark
                        ? 'border-[#6B5261] bg-[#352936] text-[#F2B3C1]'
                        : 'border-[#E8B8C5] bg-[#FFFFFF] text-[#A45E78]'
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
                  className="min-h-[40px] px-5 py-2 rounded-full bg-[#D985A2] text-white dark:bg-[#F2B3C1] dark:text-[#2B222C] hover:opacity-90 transition-all text-xs uppercase tracking-wider font-semibold flex items-center gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Đọc ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  id="hero-view-details-btn"
                  onClick={() => openNovelDetail(featuredNovel.id)}
                  className={`min-h-[40px] px-4 py-2 rounded-full border text-xs tracking-wider uppercase transition-all ${
                    isDark
                      ? 'border-[#6B5261] hover:border-[#F2B3C1] text-[#F2B3C1]'
                      : 'border-[#E8B8C5] hover:border-[#D985A2] text-[#A45E78]'
                  }`}
                >
                  Chi tiết ({featuredNovel.chaptersCount} chương)
                </button>
              </div>
            </div>

            {/* Right Book Cover */}
            <div className="lg:col-span-5 flex justify-center mt-2 lg:mt-0">
              <div
                className="cursor-pointer group relative w-44 sm:w-52 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-[#E8B8C5] dark:border-[#6B5261] transition-transform duration-200 hover:scale-[1.02]"
                onClick={() => openNovelDetail(featuredNovel.id)}
              >
                <img
                  src={featuredNovel.coverImage}
                  alt={featuredNovel.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#A45E78]/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 text-white text-xs font-medium">
                  Xem chi tiết tác phẩm →
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
