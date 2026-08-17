import React from 'react';
import { Novel } from '../types';
import { useApp } from '../context/AppContext';
import { Eye, Heart, MessageSquare, Bookmark } from 'lucide-react';

export const NovelCard: React.FC<{ novel: Novel }> = ({ novel }) => {
  const { openNovelDetail, openReader, isInLibrary, toggleLibraryNovel, globalTheme } = useApp();
  const isDark = globalTheme === 'dark';
  const isSaved = isInLibrary(novel.id);

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
        isDark
          ? 'bg-[#18161B] border-[#2A2530] hover:border-neutral-500'
          : 'bg-[#FFFFFF] border-[#ECE0E4] hover:border-neutral-400'
      }`}
    >
      {/* Top Cover Image */}
      <div
        className="relative aspect-[3/4] overflow-hidden cursor-pointer bg-neutral-900"
        onClick={() => openNovelDetail(novel.id)}
      >
        <img
          src={novel.coverImage}
          alt={novel.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Status Badge */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5">
          <span
            className={`text-[9px] sm:text-[10px] uppercase font-semibold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md backdrop-blur-md border shadow-2xs ${
              novel.status === 'completed'
                ? 'bg-[#FAF5F6]/95 dark:bg-[#1E1B24]/95 text-[#1E1B1D] dark:text-[#FAF5F6] border-[#DAC8CE] dark:border-[#38323D]'
                : 'bg-black/60 text-white/95 border-white/20'
            }`}
          >
            {novel.status === 'completed' ? 'Hoàn thành' : 'Đang ra'}
          </span>
        </div>

        {/* Quick Bookmark Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLibraryNovel(novel.id);
          }}
          className={`min-h-[30px] min-w-[30px] sm:min-h-[34px] sm:min-w-[34px] absolute top-2 right-2 sm:top-2.5 sm:right-2.5 rounded-lg backdrop-blur-md border flex items-center justify-center transition-all ${
            isSaved
              ? 'bg-[#1E1B1D] text-white border-white/40'
              : 'bg-black/50 text-white border-white/20 hover:bg-black/80'
          }`}
          title={isSaved ? 'Đã lưu trong tủ sách' : 'Lưu vào tủ sách'}
          aria-label="Lưu vào tủ sách"
        >
          <Bookmark className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Bottom image overlay stats */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end p-2 sm:p-3">
          <div className="flex items-center justify-between w-full text-[10px] sm:text-[11px] text-white font-medium">
            <span>{novel.chaptersCount} chương</span>
          </div>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-3">
        <div className="space-y-1">
          {/* Title */}
          <h3
            onClick={() => openNovelDetail(novel.id)}
            className="font-playfair italic font-medium text-xs sm:text-base text-[#1E1B1D] dark:text-[#FFFFFF] line-clamp-2 hover:underline cursor-pointer transition-colors leading-snug"
          >
            {novel.title}
          </h3>

          {/* Author */}
          <p className="text-[10px] sm:text-xs text-[#8F7D85] dark:text-[#D5CBD0] truncate">
            Tác giả: <span className="text-[#1E1B1D] dark:text-[#FFFFFF] font-medium">{novel.authorName}</span>
          </p>

          {/* Synopsis */}
          <p className="font-lora text-[11px] sm:text-xs text-[#5E5158] dark:text-[#E8DFE3] whitespace-pre-line break-words line-clamp-2 text-justify leading-relaxed pt-0.5">
            {novel.synopsis}
          </p>
        </div>

        {/* Stats and Action */}
        <div className="pt-2 border-t border-[#ECE0E4] dark:border-[#383040] space-y-2">
          {/* Line Icons for Metrics */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#7A6E74] dark:text-[#FAF5F6]">
            <span className="flex items-center gap-0.5 sm:gap-1">
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[1.6]" />
              <span>{novel.totalViews.toLocaleString('vi-VN')}</span>
            </span>
            <span className="flex items-center gap-0.5 sm:gap-1 text-[#E0A8B6]">
              <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[1.6]" />
              <span>{novel.totalHearts.toLocaleString('vi-VN')}</span>
            </span>
            <span className="flex items-center gap-0.5 sm:gap-1">
              <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[1.6]" />
              <span>{novel.totalComments}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <button
              onClick={() => openNovelDetail(novel.id)}
              className={`min-h-[32px] sm:min-h-[36px] py-1 sm:py-1.5 px-1.5 sm:px-2 rounded-lg text-[10px] sm:text-xs uppercase tracking-wider text-center border transition-colors ${
                isDark
                  ? 'border-[#5A4E68] bg-[#221D29] text-[#FFFFFF] hover:border-white hover:text-white'
                  : 'border-[#DAC8CE] text-[#5C4D54] hover:border-[#1E1B1D] hover:text-[#1E1B1D]'
              }`}
            >
              Chi tiết
            </button>
            <button
              onClick={() => openReader(novel.id)}
              className="min-h-[32px] sm:min-h-[36px] py-1 sm:py-1.5 px-1.5 sm:px-2 rounded-lg text-[10px] sm:text-xs uppercase tracking-wider text-center bg-[#1E1B1D] text-[#FAF5F6] dark:bg-[#FAF5F6] dark:text-[#121113] hover:opacity-90 transition-opacity font-semibold"
            >
              Đọc ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
