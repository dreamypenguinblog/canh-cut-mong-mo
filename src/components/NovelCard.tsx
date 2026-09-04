import React from 'react';
import { Novel } from '../types';
import { useApp } from '../context/AppContext';
import { Eye, Heart, MessageSquare } from 'lucide-react';

export const NovelCard: React.FC<{ novel: Novel }> = ({ novel }) => {
  const { openNovelDetail, openReader, isInLibrary, toggleLibraryNovel, globalTheme } = useApp();
  const isDark = globalTheme === 'dark';
  const isSaved = isInLibrary(novel.id);

  return (
    <div
      className={`group relative h-full rounded-xl border-2 transition-all duration-200 flex flex-col justify-between overflow-hidden hover:-translate-y-1 ${
        isDark
          ? 'bg-[#2B222C] border-[#6B5261] hover:border-[#D79BAD]'
          : 'bg-[#FFFFFF] border-[#E7B6C5] hover:border-[#D985A2]'
      }`}
    >
      {/* Top Cover Image */}
      <div
        className="relative aspect-[3/4] overflow-hidden cursor-pointer bg-[#FCEEF3] dark:bg-[#352936]"
        onClick={() => openNovelDetail(novel.id)}
      >
        <img
          src={novel.coverImage}
          alt={novel.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />

        {/* Status Badge */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5">
          <span
            className={`text-[9px] sm:text-[10px] uppercase font-semibold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md backdrop-blur-md border ${
              novel.status === 'completed'
                ? 'bg-[#FCEEF3]/95 dark:bg-[#3A2935]/95 text-[#A45E78] dark:text-[#F2B3C1] border-[#E8B8C5] dark:border-[#7A5869]'
                : 'bg-[#F7D9E5]/95 text-[#A45E78] border-[#E8B8C5]'
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
          className={`min-h-[30px] min-w-[30px] sm:min-h-[34px] sm:min-w-[34px] absolute top-2 right-2 sm:top-2.5 sm:right-2.5 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${
            isSaved
              ? 'bg-[#D985A2] text-white border-[#F8DCE6] dark:bg-[#F2B3C1] dark:text-[#4A2F3D] dark:border-[#F7D9E5]'
              : 'bg-[#FFF9FB]/90 text-[#D985A2] border-[#E8B8C5] hover:bg-[#FCEEF3] dark:bg-[#352936]/90 dark:text-[#F2B3C1] dark:border-[#7A5869] dark:hover:bg-[#4A2F3D]'
          }`}
          title={isSaved ? 'Đã lưu trong tủ sách' : 'Lưu vào tủ sách'}
          aria-label="Lưu vào tủ sách"
        >
          <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isSaved ? 'fill-current' : 'stroke-[2]'}`} />
        </button>

        {/* Bottom image overlay stats */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#B96D89]/80 via-[#B96D89]/25 to-transparent flex items-end p-2 sm:p-3">
          <div className="flex items-center justify-between w-full text-[10px] sm:text-[11px] text-white font-medium">
            <span>{novel.chaptersCount} chương</span>
          </div>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-2.5 sm:p-4 flex-1 h-full flex flex-col justify-between space-y-2.5 sm:space-y-3">
        <div className="space-y-1">
          {/* Title */}
          <h3
            onClick={() => openNovelDetail(novel.id)}
            className="font-playfair not-italic font-medium text-xs sm:text-base text-[#574D4C] dark:text-[#FFFFFF] line-clamp-2 hover:underline cursor-pointer transition-colors leading-snug"
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
        <div className="mt-auto pt-2 border-t border-[#E8C8D2] dark:border-[#594352] space-y-2">
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
              className={`min-h-[32px] sm:min-h-[36px] py-1 sm:py-1.5 px-1.5 sm:px-2 rounded-full text-[10px] sm:text-xs uppercase tracking-wider text-center border transition-colors ${
                isDark
                  ? 'border-[#7A5869] bg-[#3A2935] text-[#F2B3C1] hover:border-[#F2B3C1] hover:text-white'
                  : 'border-[#E8B8C5] bg-[#FFF9FB] text-[#A45E78] hover:border-[#D985A2] hover:bg-[#FCEEF3]'
              }`}
            >
              Chi tiết
            </button>
            <button
              onClick={() => openReader(novel.id)}
              className="min-h-[32px] sm:min-h-[36px] py-1 sm:py-1.5 px-1.5 sm:px-2 rounded-full text-[10px] sm:text-xs uppercase tracking-wider text-center bg-[#D985A2] text-white dark:bg-[#F2B3C1] dark:text-[#2B222C] hover:bg-[#C87594] dark:hover:bg-[#F7C5D2] transition-colors font-semibold"
            >
              Đọc ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
