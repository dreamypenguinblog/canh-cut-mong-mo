import React from 'react';
import { Novel } from '../types';
import { useApp } from '../context/AppContext';
import { Eye, Heart, MessageSquare } from 'lucide-react';

export const NovelCard: React.FC<{ novel: Novel }> = ({ novel }) => {
  const { openNovelDetail, openReader, isInLibrary, toggleLibraryNovel, globalTheme } = useApp();
  const isDark = globalTheme === 'dark';
  const isSaved = isInLibrary(novel.id);
  const isCompleted = novel.status === 'completed';

  return (
    <div
      className={`group relative h-full rounded-[26px] border transition-all duration-300 flex flex-col justify-between overflow-visible hover:-translate-y-1 ${
        isDark
          ? 'bg-gradient-to-b from-[#2B222C] via-[#241D26] to-[#2B222C] border-[#6B5261] shadow-[0_18px_34px_-22px_rgba(0,0,0,0.55)] hover:border-[#D79BAD] hover:shadow-[0_22px_40px_-18px_rgba(0,0,0,0.6)]'
          : 'bg-gradient-to-b from-white via-[#FFF8FB] to-white border-[#F5DFE7] shadow-[0_18px_34px_-22px_rgba(247,184,210,0.35)] hover:border-[#E7B6C5] hover:shadow-[0_22px_40px_-18px_rgba(247,184,210,0.45)]'
      }`}
    >
      {/* Sparkle decoration – góc trên phải khung tổng */}
      <div
        className={`pointer-events-none select-none absolute top-2.5 right-3 text-[9px] leading-[1.7] z-10 ${
          isDark ? 'text-[#7A5869]/60' : 'text-[#F2C7DA]/70'
        }`}
      >
        ✧　⋆<br />
        ⋆　✿
      </div>

      {/* Header nhỏ: avatar + tên thương hiệu (font Alegreya) */}
      <div className="flex items-center gap-1.5 sm:gap-2 mx-2.5 sm:mx-3 mt-3 mb-1">
        <div
          className={`w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-full flex items-center justify-center text-[8px] sm:text-[9px] flex-shrink-0 ${
            isDark
              ? 'bg-gradient-to-br from-[#5E4148] to-[#7A5869] text-[#F7D9E5]'
              : 'bg-gradient-to-br from-[#F5C9DE] to-[#E79FC3] text-white'
          }`}
        >
          𐙚
        </div>
        <p
          style={{ fontFamily: "'Alegreya', serif" }}
          className={`text-[10px] sm:text-[11px] tracking-wider font-semibold ${
            isDark ? 'text-[#DCC0CB]' : 'text-[#C77B9F]'
          }`}
        >
          dreamypenguin
        </p>
        <span
          className={`ml-auto text-[9px] sm:text-[10px] ${
            isDark ? 'text-[#7A5869]' : 'text-[#E9B8C2]'
          }`}
        >
          𝜗𝜚
        </span>
      </div>

      {/* Khung trong – bọc ảnh bìa, giữ nguyên kiểu "khung lồng khung" */}
      <div
        className={`relative mx-2.5 sm:mx-3 mt-1 p-1.5 sm:p-2 rounded-[20px] border ${
          isDark
            ? 'bg-gradient-to-b from-[#352936] to-[#2B222C] border-[#6B5261]'
            : 'bg-gradient-to-b from-[#FFFAFD] to-white border-[#F5DFE7]'
        }`}
        style={{ boxShadow: isDark ? '0 10px 22px -14px rgba(0,0,0,0.5)' : '0 10px 22px -14px rgba(247,184,210,0.3)' }}
      >
        <div
          className={`relative aspect-[3/4] overflow-hidden cursor-pointer rounded-2xl ${
            isDark ? 'bg-[#352936]' : 'bg-[#FCEEF3]'
          }`}
          onClick={() => openNovelDetail(novel.id)}
        >
          <img
            src={novel.coverImage}
            alt={novel.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />

          {/* Hàng trên cùng: tag trạng thái (trái) + nút lưu truyện (phải), cùng hàng */}
          <div className="absolute inset-x-1.5 sm:inset-x-2 top-1.5 sm:top-2 flex items-center justify-between z-10">
            <span
              className={`text-[8px] sm:text-[9px] uppercase font-semibold tracking-[1.5px] px-2.5 sm:px-3 py-[3px] sm:py-1 rounded-full border ${
                isCompleted
                  ? isDark
                    ? 'bg-gradient-to-r from-[#3A2E3D] to-[#453547] text-[#DCC5DE] border-[#6E5578] shadow-[0_6px_12px_-4px_rgba(0,0,0,0.45)]'
                    : 'bg-gradient-to-r from-[#FFEAF3] to-[#F5EAFF] text-[#C48AA0] border-white shadow-[0_6px_12px_-4px_rgba(200,160,180,0.22)]'
                  : isDark
                  ? 'bg-gradient-to-r from-[#3A2935] to-[#4A363B] text-[#F2B3C1] border-[#7A5869] shadow-[0_6px_12px_-4px_rgba(0,0,0,0.45)]'
                  : 'bg-gradient-to-r from-[#FFF1F6] to-[#F9DBE7] text-[#C995AB] border-white shadow-[0_6px_12px_-4px_rgba(247,184,210,0.22)]'
              }`}
            >
              {isCompleted ? 'Hoàn thành' : 'Đang ra'}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLibraryNovel(novel.id);
              }}
              className={`min-h-[26px] min-w-[26px] sm:min-h-[30px] sm:min-w-[30px] rounded-full backdrop-blur-md border flex items-center justify-center transition-all flex-shrink-0 ${
                isSaved
                  ? 'bg-gradient-to-br from-[#F6B9D2] to-[#E58FB3] text-white border-white shadow-[0_4px_10px_-2px_rgba(229,143,179,0.6)] dark:from-[#F2B3C1] dark:to-[#E7A3B8] dark:text-[#2B222C] dark:border-[#F7D9E5]'
                  : 'bg-white/90 text-[#E58FB3] border-[#F2C7DA] hover:bg-[#FFF1F6] dark:bg-[#352936]/90 dark:text-[#F2B3C1] dark:border-[#7A5869] dark:hover:bg-[#4A2F3D]'
              }`}
              title={isSaved ? 'Đã lưu trong tủ sách' : 'Lưu vào tủ sách'}
              aria-label="Lưu vào tủ sách"
            >
              <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isSaved ? 'fill-current' : 'stroke-[2]'}`} />
            </button>
          </div>

          {/* Bottom image overlay stats — gradient hồng, không dùng đen */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#E79FC3]/85 via-[#E79FC3]/30 to-transparent flex items-end p-2 sm:p-3">
            <div className="flex items-center justify-between w-full text-[10px] sm:text-[11px] text-white font-medium">
              <span>{novel.chaptersCount} chương</span>
            </div>
          </div>

          {/* Sparkle nhỏ ở góc dưới bìa */}
          <div className="pointer-events-none select-none absolute bottom-1 right-2 text-[13px] text-white/70">
            𝜗𝜚
          </div>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-2.5 sm:p-4 pt-2.5 sm:pt-3 flex-1 h-full flex flex-col justify-between space-y-2.5 sm:space-y-3">
        <div className="space-y-1">
          {/* Title — font Alegreya, màu mauve ấm hợp tone pastel */}
          <h3
            onClick={() => openNovelDetail(novel.id)}
            style={{ fontFamily: "'Alegreya', serif" }}
            className={`not-italic font-semibold text-xs sm:text-base line-clamp-2 hover:underline cursor-pointer transition-colors leading-snug ${
              isDark ? 'text-white' : 'text-[#6B4A57]'
            }`}
          >
            {novel.title}
          </h3>

          {/* Author — nằm ở phần thông tin phía dưới, cạnh tiêu đề */}
          <p className={`uppercase text-[9px] sm:text-[10px] tracking-wider ${isDark ? 'text-[#D5CBD0]' : 'text-[#D88AB3]'}`}>
            tác giả · <span className="font-semibold">{novel.authorName}</span>
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
                  : 'border-[#F0C7DE] bg-[#FFF6FB] text-[#B4587E] hover:border-[#E79FC3] hover:bg-[#FFEEF6]'
              }`}
            >
              Chi tiết
            </button>
            <button
              onClick={() => openReader(novel.id)}
              className="min-h-[32px] sm:min-h-[36px] py-1 sm:py-1.5 px-1.5 sm:px-2 rounded-full text-[10px] sm:text-xs uppercase tracking-wider text-center bg-gradient-to-r from-[#F6B9D2] to-[#E58FB3] text-white dark:from-[#F2B3C1] dark:to-[#E7A3B8] dark:text-[#2B222C] hover:from-[#EDA3C2] hover:to-[#D97996] dark:hover:from-[#F7C5D2] dark:hover:to-[#F2B3C1] transition-colors font-semibold shadow-[0_6px_14px_-6px_rgba(229,143,179,0.6)]"
            >
              Đọc
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};