import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, BookOpen, Eye, MessageSquare } from 'lucide-react';

export const NovelDetailView: React.FC = () => {
  const {
    selectedNovelId,
    novels,
    chapters,
    openReader,
    isInLibrary,
    toggleLibraryNovel,
    setActiveView,
    globalTheme,
  } = useApp();

  const isDark = globalTheme === 'dark';
  const novel = novels.find((n) => n.id === selectedNovelId) || novels[0];

  if (!novel) {
    return (
      <div className="py-16 text-center max-w-xl mx-auto px-4">
        <p className="font-playfair text-lg text-[#8F7D85]">Không tìm thấy thông tin tác phẩm</p>
        <button
          onClick={() => setActiveView('home')}
          className="mt-4 px-5 py-2 rounded-lg bg-[#1E1B1D] text-[#FAF5F6] dark:bg-[#FAF5F6] dark:text-[#121113] text-xs uppercase tracking-wider font-medium"
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  const novelChapters = chapters
    .filter((c) => c.novelId === novel.id)
    .sort((a, b) => a.chapterNumber - b.chapterNumber);

  const isSaved = isInLibrary(novel.id);

  return (
    <div className="py-6 sm:py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Back Button */}
      <div>
        <button
          onClick={() => setActiveView('home')}
          className={`min-h-[38px] px-3.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
            isDark
              ? 'border-[#5A4E68] bg-[#1E1926] text-[#FFFFFF] hover:border-white'
              : 'border-[#DAC8CE] bg-white text-[#5C4F55] hover:border-[#1E1B1D]'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại trang chủ</span>
        </button>
      </div>

      {/* Main Novel Hero Card */}
      <div
        className={`rounded-2xl border p-5 sm:p-8 transition-colors shadow-xs ${
          isDark ? 'bg-[#18161B] border-[#383040]' : 'bg-[#FFFFFF] border-[#EADCE1]'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Cover image */}
          <div className="md:col-span-4 flex justify-center">
            <div className="w-48 sm:w-full max-w-[240px] aspect-[2/3] rounded-xl overflow-hidden shadow-md border border-[#EADCE1] dark:border-[#4E4456]">
              <img src={novel.coverImage} alt={novel.title} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-md border ${
                    novel.status === 'completed'
                      ? 'bg-[#FAF5F6] dark:bg-[#282230] text-[#1E1B1D] dark:text-[#FFFFFF] border-[#DAC8CE] dark:border-[#5A4E68]'
                      : 'bg-[#FAF0F3] dark:bg-[#201B28] text-[#8F7D85] dark:text-[#E8DFE3] border-[#EADCE1] dark:border-[#4E4456]'
                  }`}
                >
                  {novel.status === 'completed' ? 'Đã hoàn thành' : 'Đang ra chương'}
                </span>
              </div>
              <h1 className="font-playfair italic text-2xl sm:text-3xl font-normal leading-tight text-[#1E1B1D] dark:text-[#FFFFFF]">
                {novel.title}
              </h1>
            </div>

            {/* Author and metadata */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs text-[#8F7D85] dark:text-[#E0D8DC]">
              <span>Tác giả: <strong className="text-[#1E1B1D] dark:text-[#FFFFFF] font-medium">{novel.authorName}</strong></span>
              <span>•</span>
              <span>{novelChapters.length} chương</span>
            </div>

            {/* Metrics stats */}
            <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#EADCE1] dark:border-[#383040] text-center">
              <div>
                <span className="text-[10px] text-[#8F7D85] dark:text-[#D5CBD0] uppercase tracking-wider block">Lượt đọc</span>
                <span className="text-sm font-semibold text-[#1E1B1D] dark:text-[#FFFFFF] flex items-center justify-center gap-1 mt-0.5">
                  <Eye className="w-3.5 h-3.5 text-[#8F7D85] dark:text-[#D5CBD0]" />
                  {novel.totalViews.toLocaleString('vi-VN')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8F7D85] dark:text-[#D5CBD0] uppercase tracking-wider block">Yêu thích</span>
                <span className="text-sm font-semibold text-[#E0A8B6] mt-0.5 block">
                  {novel.totalHearts.toLocaleString('vi-VN')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8F7D85] dark:text-[#D5CBD0] uppercase tracking-wider block">Bình luận</span>
                <span className="text-sm font-semibold text-[#1E1B1D] dark:text-[#FFFFFF] flex items-center justify-center gap-1 mt-0.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#8F7D85] dark:text-[#D5CBD0]" />
                  {novel.totalComments}
                </span>
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-1.5">
              {novel.genres.map((g, idx) => (
                <span
                  key={idx}
                  className={`text-[11px] px-2.5 py-0.5 rounded-md border ${
                    isDark ? 'border-[#4E4456] bg-[#221C2A] text-[#FFFFFF]' : 'border-[#EADCE1] bg-[#FAF5F6] text-[#5C4F55]'
                  }`}
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => openReader(novel.id)}
                className="min-h-[40px] px-6 py-2 rounded-lg bg-[#1E1B1D] text-[#FAF5F6] dark:bg-[#FAF5F6] dark:text-[#121113] hover:opacity-90 transition-opacity text-xs uppercase tracking-wider font-semibold shadow-xs flex items-center gap-2"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Đọc từ đầu</span>
              </button>

              <button
                onClick={() => toggleLibraryNovel(novel.id)}
                className={`min-h-[40px] px-5 py-2 rounded-lg border text-xs uppercase tracking-wider font-medium transition-colors ${
                  isSaved
                    ? 'bg-[#1E1B1D] text-[#FAF5F6] dark:bg-[#FAF5F6] dark:text-[#121113] border-[#1E1B1D] dark:border-white'
                    : isDark
                    ? 'border-[#4E4456] text-[#FFFFFF] hover:border-white'
                    : 'border-[#DAC8CE] text-[#1E1B1D] hover:border-[#1E1B1D]'
                }`}
              >
                {isSaved ? 'Đã có trong tủ sách' : 'Thêm vào tủ sách'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Synopsis Section */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 space-y-3 shadow-xs ${
          isDark ? 'bg-[#18161B] border-[#383040]' : 'bg-[#FFFFFF] border-[#EADCE1]'
        }`}
      >
        <h2 className="font-playfair text-base font-semibold uppercase tracking-wider text-[#1E1B1D] dark:text-[#FFFFFF]">
          Tóm Tắt Tác Phẩm
        </h2>
        <p className="font-lora text-sm leading-relaxed whitespace-pre-line break-words text-justify text-[#4A3E44] dark:text-[#E8DFE3]">
          {novel.synopsis}
        </p>
      </div>

      {/* Chapter List Section */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 space-y-4 shadow-xs ${
          isDark ? 'bg-[#18161B] border-[#383040]' : 'bg-[#FFFFFF] border-[#EADCE1]'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#EADCE1] dark:border-[#383040] pb-3">
          <h2 className="font-playfair text-base font-semibold uppercase tracking-wider text-[#1E1B1D] dark:text-[#FFFFFF]">
            Danh Sách Chương ({novelChapters.length})
          </h2>
          <span className="text-xs text-[#8F7D85] dark:text-[#D5CBD0]">Nhấn chương để đọc</span>
        </div>

        {novelChapters.length > 0 ? (
          <div className="divide-y divide-[#EADCE1] dark:divide-[#383040] rounded-xl border border-[#EADCE1] dark:border-[#383040] overflow-hidden">
            {novelChapters.map((ch) => (
              <div
                key={ch.id}
                onClick={() => openReader(novel.id, ch.id)}
                className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-[#FAF5F6] dark:hover:bg-[#221D29] cursor-pointer transition-colors"
              >
                <div className="space-y-0.5">
                  <span className="font-playfair text-xs sm:text-sm font-medium block text-[#1E1B1D] dark:text-[#FFFFFF] hover:underline">
                    {ch.title}
                  </span>
                  <span className="text-[11px] text-[#8F7D85] dark:text-[#D5CBD0]">
                    {ch.releaseDate} • {ch.wordCount.toLocaleString('vi-VN')} chữ • {ch.views.toLocaleString('vi-VN')} lượt xem
                  </span>
                </div>

                <div className="text-xs font-semibold text-[#8F7D85] hover:text-[#1E1B1D] dark:text-[#D5CBD0] dark:hover:text-white flex items-center gap-1">
                  <span>Đọc</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#8F7D85] dark:text-[#D5CBD0]">
            Chưa có chương nào được xuất bản.
          </div>
        )}
      </div>
    </div>
  );
};
