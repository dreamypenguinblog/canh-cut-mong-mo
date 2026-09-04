import React from 'react';
import { useApp } from '../context/AppContext';

export const NovelDetailModal: React.FC = () => {
  const {
    modalNovelId,
    closeDetailModal,
    novels,
    chapters,
    openReader,
    isInLibrary,
    toggleLibraryNovel,
    globalTheme,
  } = useApp();

  if (!modalNovelId) return null;

  const isDark = globalTheme === 'dark';

  const novel = novels.find((n) => n.id === modalNovelId);
  if (!novel) return null;

  const novelChapters = chapters
    .filter((c) => c.novelId === novel.id)
    .sort((a, b) => a.chapterNumber - b.chapterNumber);

  const isSaved = isInLibrary(novel.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#A45E78]/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border-2 overflow-hidden transition-colors ${
          isDark ? 'bg-[#2B222C] border-[#6B5261] text-[#F3EEF0]' : 'bg-[#FFF9FB] border-[#E7B6C5] text-[#574D4C]'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={closeDetailModal}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[#D985A2] text-white flex items-center justify-center text-sm backdrop-blur-md hover:bg-[#C87594]"
        >
          ✕
        </button>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Top Banner / Details */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
            {/* Book Cover */}
            <div className="sm:col-span-4 flex justify-center">
              <div className="w-44 sm:w-full aspect-[2/3] rounded-2xl overflow-hidden border-2 border-[#E8B8C5] dark:border-[#7A5869]">
                <img src={novel.coverImage} alt={novel.title} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Info details */}
            <div className="sm:col-span-8 space-y-3">
              {novel.frenchSubtitle && (
                <span className="font-pinyon text-2xl sm:text-3xl text-[#D4AF37] block leading-none">
                  {novel.frenchSubtitle}
                </span>
              )}
              <h2 className="font-eb-garamond text-3xl sm:text-4xl font-medium leading-tight text-[#574D4C] dark:text-[#FAF5F6]">
                {novel.title}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#8F7D85]">
                <span>Bút danh: <strong className="text-[#1E1B1D] dark:text-[#FAF5F6]">{novel.authorName}</strong></span>
                <span>•</span>
                <span className="text-[#D985A2]">★ {novel.rating.toFixed(2)}</span>
                <span>•</span>
                <span>{novel.status === 'completed' ? 'Hoàn thành' : 'Đang phát hành'}</span>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-4 text-xs border-y border-[#E7C3CE] dark:border-[#594352] py-2.5 my-3 bg-[#FFF1F5] dark:bg-[#352936] rounded-lg px-3">
                <div>
                  <span className="text-[#8F7D85] block text-[10px] uppercase">Lượt đọc</span>
                  <span className="font-semibold">{novel.totalViews.toLocaleString('vi-VN')}</span>
                </div>
                <div className="h-6 w-px bg-current opacity-20" />
                <div>
                  <span className="text-[#8F7D85] block text-[10px] uppercase">Yêu thích</span>
                  <span className="font-semibold text-[#E36888]">♡ {novel.totalHearts.toLocaleString('vi-VN')}</span>
                </div>
                <div className="h-6 w-px bg-current opacity-20" />
                <div>
                  <span className="text-[#8F7D85] block text-[10px] uppercase">Số chương</span>
                  <span className="font-semibold">{novelChapters.length}</span>
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {novel.genres.map((g, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2.5 py-0.5 rounded-full border border-[#DAC8CE] dark:border-[#38323D]"
                  >
                    ✧ {g}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  onClick={() => openReader(novel.id)}
                  className="px-6 py-2.5 rounded-full bg-[#D985A2] text-white dark:bg-[#F2B3C1] dark:text-[#2B222C] text-xs uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity"
                >
                  ✦ Đọc Từ Đầu
                </button>

                <button
                  onClick={() => toggleLibraryNovel(novel.id)}
                  className={`px-5 py-2.5 rounded-full border text-xs font-playfair uppercase tracking-wider transition-colors ${
                    isSaved
                      ? 'bg-[#D985A2] text-white border-[#D985A2]'
                      : 'border-[#E8B8C5] text-[#A45E78] hover:border-[#D985A2]'
                  }`}
                >
                  {isSaved ? '♥ Đã Trong Tủ Sách' : '♡ Thêm Vào Thư Viện'}
                </button>
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className="space-y-2 border-t border-[#E7C3CE] dark:border-[#594352] pt-6">
            <h4 className="font-eb-garamond font-medium text-xl text-[#A45E78] dark:text-[#F2B3C1]">
              ✦ Tóm Tắt Tác Phẩm
            </h4>
            <p className="font-lora text-sm leading-relaxed whitespace-pre-line break-words text-[#4A3E44] dark:text-[#C5B9C0]">
              {novel.synopsis}
            </p>
          </div>

          {/* Chapters Index List */}
          <div className="space-y-3 border-t border-[#E7C3CE] dark:border-[#594352] pt-6">
            <div className="flex items-center justify-between">
              <h4 className="font-eb-garamond font-medium text-xl text-[#A45E78] dark:text-[#F2B3C1]">
                ✧ Danh Sách Chương ({novelChapters.length})
              </h4>
              <span className="text-xs text-[#8F7D85]">Nhấn vào chương để bắt đầu đọc</span>
            </div>

            <div className="divide-y divide-[#F0D5DE] dark:divide-[#594352] rounded-2xl border border-[#E8B8C5] dark:border-[#6B5261] overflow-hidden">
              {novelChapters.map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => openReader(novel.id, ch.id)}
                  className="p-3.5 sm:p-4 flex items-center justify-between bg-[#FFFFFF] dark:bg-[#352936] hover:bg-[#FFF1F5] dark:hover:bg-[#412F3A] cursor-pointer transition-colors"
                >
                  <div>
                    <span className="font-eb-garamond font-medium text-lg block hover:text-[#D985A2]">
                      {ch.title}
                    </span>
                    <span className="text-[11px] text-[#8F7D85]">
                      {ch.releaseDate} • {ch.wordCount.toLocaleString('vi-VN')} từ • ✧ {ch.commentsCount} bình luận
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#E36888]">♡ {ch.hearts.toLocaleString('vi-VN')}</span>
                    <span className="text-xs uppercase text-[#D985A2]">Đọc →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
