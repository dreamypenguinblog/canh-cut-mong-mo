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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border overflow-hidden transition-colors ${
          isDark ? 'bg-[#18161B] border-[#38323D] text-[#F3EEF0]' : 'bg-[#FFFFFF] border-[#ECE0E4] text-[#1E1B1D]'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={closeDetailModal}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center text-sm backdrop-blur-md hover:bg-black/60"
        >
          ✕
        </button>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Top Banner / Details */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
            {/* Book Cover */}
            <div className="sm:col-span-4 flex justify-center">
              <div className="w-44 sm:w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-[#D4AF37]/40 ring-4 ring-black/5">
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
              <h2 className="font-playfair italic text-2xl sm:text-3xl font-semibold leading-tight">
                {novel.title}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#8F7D85]">
                <span>Bút danh: <strong className="text-[#1E1B1D] dark:text-[#FAF5F6]">{novel.authorName}</strong></span>
                <span>•</span>
                <span className="text-[#D4AF37]">★ {novel.rating.toFixed(2)}</span>
                <span>•</span>
                <span>{novel.status === 'completed' ? 'Hoàn thành' : 'Đang phát hành'}</span>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-4 text-xs border-y border-[#ECE0E4] dark:border-[#2E2833] py-2.5 my-3">
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
                  className="px-6 py-2.5 rounded-full bg-[#1E1B1D] text-[#FAF5F6] dark:bg-[#FAF5F6] dark:text-[#121113] font-playfair text-xs uppercase tracking-wider font-semibold shadow hover:opacity-90 transition-opacity"
                >
                  ✦ Đọc Từ Đầu
                </button>

                <button
                  onClick={() => toggleLibraryNovel(novel.id)}
                  className={`px-5 py-2.5 rounded-full border text-xs font-playfair uppercase tracking-wider transition-colors ${
                    isSaved
                      ? 'bg-[#E36888] text-white border-[#E36888]'
                      : 'border-current hover:border-[#D4AF37]'
                  }`}
                >
                  {isSaved ? '♥ Đã Trong Tủ Sách' : '♡ Thêm Vào Thư Viện'}
                </button>
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className="space-y-2 border-t border-[#ECE0E4] dark:border-[#2E2833] pt-6">
            <h4 className="font-playfair font-semibold text-sm uppercase tracking-wider text-[#D4AF37]">
              ✦ Tóm Tắt Tác Phẩm
            </h4>
            <p className="font-lora text-sm leading-relaxed whitespace-pre-line break-words text-[#4A3E44] dark:text-[#C5B9C0]">
              {novel.synopsis}
            </p>
          </div>

          {/* Chapters Index List */}
          <div className="space-y-3 border-t border-[#ECE0E4] dark:border-[#2E2833] pt-6">
            <div className="flex items-center justify-between">
              <h4 className="font-playfair font-semibold text-sm uppercase tracking-wider text-[#D4AF37]">
                ✧ Danh Sách Chương ({novelChapters.length})
              </h4>
              <span className="text-xs text-[#8F7D85]">Nhấn vào chương để bắt đầu đọc</span>
            </div>

            <div className="divide-y divide-[#ECE0E4] dark:divide-[#2E2833] rounded-2xl border overflow-hidden">
              {novelChapters.map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => openReader(novel.id, ch.id)}
                  className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-[#FAF4F6] dark:hover:bg-[#201C24] cursor-pointer transition-colors"
                >
                  <div>
                    <span className="font-playfair font-medium text-sm block hover:text-[#D4AF37]">
                      {ch.title}
                    </span>
                    <span className="text-[11px] text-[#8F7D85]">
                      {ch.releaseDate} • {ch.wordCount.toLocaleString('vi-VN')} từ • ✧ {ch.commentsCount} bình luận
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#E36888]">♡ {ch.hearts.toLocaleString('vi-VN')}</span>
                    <span className="text-xs font-playfair uppercase text-[#D4AF37]">Đọc →</span>
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
