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
          className={`relative rounded-2xl p-5 sm:p-8 border transition-all duration-200 shadow-xs overflow-hidden ${
            isDark
              ? 'bg-[#18151C] border-[#2F2935] text-[#F3EEF0]'
              : 'bg-[#FCF7F9] border-[#EADCE1] text-[#1E1B1D]'
          }`}
        >
          {/* Top category indicator */}
          <div className="flex items-center justify-between border-b border-[#EADCE1]/70 dark:border-[#2F2935] pb-3 mb-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E0A8B6]" />
              <span className="text-xs uppercase tracking-wider font-semibold text-[#8F7D85]">
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
              <h1 className="font-playfair italic text-2xl sm:text-4xl font-normal leading-tight text-[#1E1B1D] dark:text-[#FAF5F6]">
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
                        ? 'border-[#38323D] bg-[#201C25] text-[#C2B6BD]'
                        : 'border-[#E2D4DA] bg-[#FFFFFF] text-[#6E5D65]'
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
                  className="min-h-[40px] px-5 py-2 rounded-lg bg-[#1E1B1D] text-[#FAF5F6] dark:bg-[#FAF5F6] dark:text-[#121113] hover:opacity-90 transition-all text-xs uppercase tracking-wider font-semibold shadow-xs flex items-center gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Đọc ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  id="hero-view-details-btn"
                  onClick={() => openNovelDetail(featuredNovel.id)}
                  className={`min-h-[40px] px-4 py-2 rounded-lg border text-xs tracking-wider uppercase transition-all ${
                    isDark
                      ? 'border-[#3E3845] hover:border-white text-[#FAF5F6]'
                      : 'border-[#DAC8CE] hover:border-[#1E1B1D] text-[#1E1B1D]'
                  }`}
                >
                  Chi tiết ({featuredNovel.chaptersCount} chương)
                </button>
              </div>
            </div>

            {/* Right Book Cover */}
            <div className="lg:col-span-5 flex justify-center mt-2 lg:mt-0">
              <div
                className="cursor-pointer group relative w-44 sm:w-52 aspect-[2/3] rounded-xl overflow-hidden shadow-md border border-[#E5D7DC] dark:border-[#38323D] transition-transform duration-200 hover:scale-[1.02]"
                onClick={() => openNovelDetail(featuredNovel.id)}
              >
                <img
                  src={featuredNovel.coverImage}
                  alt={featuredNovel.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 text-white text-xs font-medium">
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
