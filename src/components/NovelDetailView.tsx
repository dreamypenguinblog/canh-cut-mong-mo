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
    initializing,
  } = useApp();

  const isDark = globalTheme === 'dark';
  const novel = novels.find((n) => n.id === selectedNovelId) || novels[0];

  if (!novel) {
    if (initializing) {
      return (
        <div className="py-16 text-center max-w-xl mx-auto px-4">
          <p className="text-sm text-[#8F7D85] opacity-70">Đang tải...</p>
        </div>
      );
    }
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

  // Prefer the lightweight chapterIndex (title/date/word count only, no
  // content) already carried on the novel doc — zero extra reads since the
  // novel itself is already loaded. Falls back to whatever's cached in
  // `chapters` for novels that predate this feature (or haven't been
  // backfilled via "Làm mới danh sách chương" yet).
  const hasLightweightIndex = (novel.chapterIndex?.length || 0) === novel.chaptersCount && novel.chaptersCount > 0;
  const chapterListItems = hasLightweightIndex
    ? [...novel.chapterIndex!].sort((a, b) => a.chapterNumber - b.chapterNumber)
    : novelChapters.map((c) => ({
        id: c.id,
        chapterNumber: c.chapterNumber,
        title: c.title,
        releaseDate: c.releaseDate,
        wordCount: c.wordCount,
      }));

  const isSaved = isInLibrary(novel.id);

  return (
    <div className="py-6 sm:py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Back Button */}
      <div>
        <button
          onClick={() => setActiveView('home')}
          className={`min-h-[38px] px-3.5 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-colors ${
            isDark
              ? 'border-[#6B5261] bg-[#2B222C] text-[#FFFFFF] hover:border-[#F2B3C1]'
                : 'border-[#E8B8C5] bg-[#FFF9FB] text-[#A45E78] hover:border-[#D985A2]'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại trang chủ</span>
        </button>
      </div>

      {/* Main Novel Hero Card */}
      <div
        className={`rounded-2xl border-2 p-5 sm:p-8 transition-colors ${
          isDark ? 'bg-[#2B222C] border-[#6B5261]' : 'bg-[#FFF9FB] border-[#E7B6C5]'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Cover image */}
          <div className="md:col-span-4 flex justify-center">
            <div className="w-48 sm:w-full max-w-[240px] aspect-[2/3] rounded-xl overflow-hidden border-2 border-[#E7B6C5] dark:border-[#6B5261]">
              <img src={novel.coverImage} alt={novel.title} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#E8A0B8]" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#B5798D] dark:text-[#E8B8C5]">
                  Thông tin tác phẩm
                </span>
                <span
                  className={`text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-md border ${
                    novel.status === 'completed'
                      ? 'bg-[#FCEEF3] dark:bg-[#3A2935] text-[#A45E78] dark:text-[#F2B3C1] border-[#E8B8C5] dark:border-[#7A5869]'
                      : 'bg-[#F7D9E5] dark:bg-[#4A2F3D] text-[#A45E78] dark:text-[#F2B3C1] border-[#E8B8C5] dark:border-[#7A5869]'
                  }`}
                >
                  {novel.status === 'completed' ? 'Đã hoàn thành' : 'Đang ra chương'}
                </span>
              </div>
              <h1 className="font-eb-garamond text-3xl sm:text-4xl font-medium leading-tight text-[#574D4C] dark:text-[#FFFFFF]">
                {novel.title}
              </h1>
            </div>

            {/* Author and metadata */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs text-[#8F7D85] dark:text-[#E0D8DC]">
              <span>Tác giả: <strong className="text-[#A45E78] dark:text-[#F2B3C1] font-medium">{novel.authorName}</strong></span>
              <span>•</span>
              <span>{novel.chaptersCount} chương</span>
            </div>

            {/* Metrics stats */}
            <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#E7C3CE] dark:border-[#594352] text-center bg-[#FFF1F5] dark:bg-[#352936] rounded-lg">
              <div>
                <span className="text-[10px] text-[#8F7D85] dark:text-[#D5CBD0] uppercase tracking-wider block">Lượt đọc</span>
                  <span className="text-sm font-semibold text-[#A45E78] dark:text-[#FFFFFF] flex items-center justify-center gap-1 mt-0.5">
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
                  <span className="text-sm font-semibold text-[#A45E78] dark:text-[#FFFFFF] flex items-center justify-center gap-1 mt-0.5">
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
                    className={`text-[11px] px-3 py-1 rounded-full border ${
                    isDark ? 'border-[#6B5261] bg-[#352936] text-[#FFFFFF]' : 'border-[#E8C8D2] bg-[#FFF9FB] text-[#A45E78]'
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
                className="min-h-[40px] px-6 py-2 rounded-full bg-[#D985A2] text-white dark:bg-[#F2B3C1] dark:text-[#2B222C] hover:opacity-90 transition-opacity text-xs uppercase tracking-wider font-semibold flex items-center gap-2"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Đọc từ đầu</span>
              </button>

              <button
                onClick={() => toggleLibraryNovel(novel.id)}
                className={`min-h-[40px] px-5 py-2 rounded-full border text-xs uppercase tracking-wider font-medium transition-colors ${
                  isSaved
                    ? 'bg-[#D985A2] text-white dark:bg-[#F2B3C1] dark:text-[#2B222C] border-[#D985A2] dark:border-[#F2B3C1]'
                    : isDark
                    ? 'border-[#6B5261] text-[#FFFFFF] hover:border-[#F2B3C1]'
                    : 'border-[#E8B8C5] text-[#A45E78] hover:border-[#D985A2]'
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
        className={`rounded-2xl border-2 p-5 sm:p-6 space-y-3 ${
          isDark ? 'bg-[#2B222C] border-[#6B5261]' : 'bg-[#FFF9FB] border-[#E7B6C5]'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E8A0B8]" />
          <h2 className="font-eb-garamond text-xl font-medium tracking-wide text-[#574D4C] dark:text-[#FFFFFF]">
            Tóm Tắt Tác Phẩm
          </h2>
        </div>
        <p className="font-lora text-sm leading-relaxed whitespace-pre-line break-words text-justify text-[#4A3E44] dark:text-[#E8DFE3]">
          {novel.synopsis}
        </p>
      </div>

      {/* Chapter List Section */}
      <div
        className={`rounded-2xl border-2 p-5 sm:p-6 space-y-4 ${
          isDark ? 'bg-[#2B222C] border-[#6B5261]' : 'bg-[#FFF9FB] border-[#E7B6C5]'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#E7C3CE] dark:border-[#594352] pb-3">
          <h2 className="font-eb-garamond text-xl font-medium tracking-wide text-[#574D4C] dark:text-[#FFFFFF]">
            Danh Sách Chương ({chapterListItems.length})
          </h2>
          <span className="text-[11px] text-[#B5798D] dark:text-[#E8B8C5]">Nhấn chương để đọc</span>
        </div>

        {chapterListItems.length > 0 ? (
          <div className="divide-y divide-[#F0D5DE] dark:divide-[#594352] rounded-xl border border-[#E8C8D2] dark:border-[#6B5261] overflow-hidden">
            {chapterListItems.map((ch) => (
              <div
                key={ch.id}
                onClick={() => openReader(novel.id, ch.id)}
                className="p-3.5 sm:p-4 flex items-center justify-between bg-[#FFFFFF] dark:bg-[#352936] hover:bg-[#FFF1F5] dark:hover:bg-[#412F3A] cursor-pointer transition-colors"
              >
                <div className="space-y-0.5">
                  <span className="font-eb-garamond text-base sm:text-lg font-medium block text-[#574D4C] dark:text-[#FFFFFF] hover:underline">
                    {ch.title}
                  </span>
                  <span className="text-[11px] text-[#8F7D85] dark:text-[#D5CBD0]">
                    {ch.releaseDate} • {ch.wordCount.toLocaleString('vi-VN')} chữ
                  </span>
                </div>

                <div className="text-xs font-semibold text-[#B5798D] hover:text-[#A45E78] dark:text-[#F2B3C1] dark:hover:text-white flex items-center gap-1">
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