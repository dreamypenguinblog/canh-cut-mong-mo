import React from 'react';
import { useApp } from '../context/AppContext';
import { X, BookOpen, Eye, Heart, MessageSquare } from 'lucide-react';

// Bảng màu hồng phẳng đồng bộ với NovelCard / NovelGrid / Leaderboard / NovelDetailView / Navbar.
const ACCENT = '#F0A8C8';
const ACCENT_DARK = '#EDA3B4';
const ACCENT_TEXT_DARK = '#2B222C';

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
  const isCompleted = novel.status === 'completed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#A45E78]/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border overflow-hidden transition-colors ${
          isDark
            ? 'bg-gradient-to-b from-[#2B222C] via-[#241D26] to-[#2B222C] border-[#6B5261] text-[#F3EEF0]'
            : 'bg-gradient-to-b from-white via-[#FFF8FB] to-white border-[#F5DFE7] text-[#574D4C]'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={closeDetailModal}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
          style={{ background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }}
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Top Banner / Details */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
            {/* Book Cover — khung lồng khung + sparkle như NovelCard/NovelDetailView */}
            <div className="sm:col-span-4 flex justify-center">
              <div
                className={`relative w-44 sm:w-full max-w-[220px] p-2 rounded-[22px] border ${
                  isDark
                    ? 'bg-gradient-to-b from-[#352936] to-[#2B222C] border-[#6B5261]'
                    : 'bg-gradient-to-b from-[#FFFAFD] to-white border-[#F5DFE7]'
                }`}
                style={{
                  boxShadow: isDark
                    ? '0 14px 30px -18px rgba(0,0,0,0.5)'
                    : '0 14px 30px -18px rgba(247,184,210,0.4)',
                }}
              >
                <div className="aspect-[2/3] rounded-2xl overflow-hidden">
                  <img src={novel.coverImage} alt={novel.title} className="w-full h-full object-cover" />
                </div>
                <span className="pointer-events-none select-none absolute bottom-2 right-3 text-sm text-white/70">
                  𝜗𝜚
                </span>
              </div>
            </div>

            {/* Info details */}
            <div className="sm:col-span-8 space-y-3">
              {novel.frenchSubtitle && (
                <span
                  className="font-pinyon text-2xl sm:text-3xl block leading-none"
                  style={{ color: isDark ? ACCENT_DARK : '#D8A3BA' }}
                >
                  {novel.frenchSubtitle}
                </span>
              )}

              <div className="flex items-center flex-wrap gap-2">
                <span className={`text-[9px] ${isDark ? 'text-[#7A5869]' : 'text-[#E9B8C2]'}`}>𝜗𝜚</span>
                {/* Badge trạng thái — pill gradient đồng bộ NovelCard/NovelDetailView */}
                <span
                  className={`text-[9px] uppercase font-semibold tracking-[1.2px] px-2.5 py-[3px] rounded-full border ${
                    isCompleted
                      ? isDark
                        ? 'bg-gradient-to-r from-[#3A2E3D] to-[#453547] text-[#DCC5DE] border-[#6E5578]'
                        : 'bg-gradient-to-r from-[#FFEAF3] to-[#F5EAFF] text-[#C48AA0] border-white'
                      : isDark
                      ? 'bg-gradient-to-r from-[#3A2935] to-[#4A363B] text-[#F2B3C1] border-[#7A5869]'
                      : 'bg-gradient-to-r from-[#FFF1F6] to-[#F9DBE7] text-[#C995AB] border-white'
                  }`}
                >
                  {isCompleted ? 'Hoàn thành' : 'Đang phát hành'}
                </span>
              </div>

              <h2
                style={{ fontFamily: "'Vollkorn', serif" }}
                className="not-italic text-3xl sm:text-4xl font-semibold leading-tight text-[#6B4A57] dark:text-white"
              >
                {novel.title}
              </h2>

              <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#8F7D85] dark:text-[#E0D8DC]">
                <span>
                  Bút danh:{' '}
                  <strong className="font-semibold" style={{ color: isDark ? ACCENT_DARK : '#B4587E' }}>
                    {novel.authorName}
                  </strong>
                </span>
                <span className={isDark ? 'text-[#7A5869]' : 'text-[#E9B8C2]'}>•</span>
                <span className="flex items-center gap-1" style={{ color: isDark ? ACCENT_DARK : ACCENT }}>
                  ★ {novel.rating.toFixed(2)}
                </span>
              </div>

              {/* Stats panel — pastel, số liệu Vollkorn đậm, đồng bộ NovelDetailView */}
              <div
                className={`grid grid-cols-3 gap-2 py-3.5 rounded-2xl border text-center my-3 ${
                  isDark ? 'bg-[#352936] border-[#6B5261]' : 'bg-[#FFF6FB] border-[#F5D2E0]'
                }`}
              >
                <div>
                  <span className="text-[10px] text-[#8F7D85] dark:text-[#D5CBD0] uppercase tracking-wider block">
                    Lượt đọc
                  </span>
                  <span
                    style={{ fontFamily: "'Vollkorn', serif" }}
                    className="not-italic text-base sm:text-lg font-semibold flex items-center justify-center gap-1 mt-0.5 text-[#A45E78] dark:text-white"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#8F7D85] dark:text-[#D5CBD0]" />
                    {novel.totalViews.toLocaleString('vi-VN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8F7D85] dark:text-[#D5CBD0] uppercase tracking-wider block">
                    Yêu thích
                  </span>
                  <span
                    style={{ fontFamily: "'Vollkorn', serif", color: isDark ? ACCENT_DARK : ACCENT }}
                    className="not-italic text-base sm:text-lg font-semibold flex items-center justify-center gap-1 mt-0.5"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    {novel.totalHearts.toLocaleString('vi-VN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8F7D85] dark:text-[#D5CBD0] uppercase tracking-wider block">
                    Số chương
                  </span>
                  <span
                    style={{ fontFamily: "'Vollkorn', serif" }}
                    className="not-italic text-base sm:text-lg font-semibold flex items-center justify-center gap-1 mt-0.5 text-[#A45E78] dark:text-white"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#8F7D85] dark:text-[#D5CBD0]" />
                    {novelChapters.length}
                  </span>
                </div>
              </div>

              {/* Genres — pill nhạt đồng bộ NovelCard/Leaderboard */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {novel.genres.map((g, idx) => (
                  <span
                    key={idx}
                    className={`text-[11px] px-3 py-1 rounded-full border ${
                      isDark
                        ? 'bg-[#2B222C] border-[#6B5261] text-[#D5CBD0]'
                        : 'bg-[#FFF5FA] border-[#F5D2E0] text-[#D88AB3]'
                    }`}
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Action Buttons — CTA chính nổi bật bằng nền ACCENT đặc */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={() => openReader(novel.id)}
                  className="min-h-[42px] px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
                  style={{ background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Đọc Từ Đầu</span>
                </button>

                <button
                  onClick={() => toggleLibraryNovel(novel.id)}
                  className="min-h-[42px] px-5 py-2.5 rounded-full border text-xs uppercase tracking-wider font-medium flex items-center gap-1.5 transition-colors"
                  style={
                    isSaved
                      ? { background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF', borderColor: isDark ? ACCENT_DARK : ACCENT }
                      : isDark
                      ? { borderColor: '#6B5261', color: '#FFFFFF' }
                      : { borderColor: '#F0C7DE', color: '#B4587E' }
                  }
                >
                  <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : 'stroke-[2]'}`} />
                  <span>{isSaved ? 'Đã Trong Tủ Sách' : 'Thêm Vào Thư Viện'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className={`space-y-2 border-t pt-6 ${isDark ? 'border-[#6B5261]' : 'border-[#F0D9E3]'}`}>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] ${isDark ? 'text-[#7A5869]' : 'text-[#E9B8C2]'}`}>𝜗𝜚</span>
              <h4 className="font-eb-garamond not-italic font-medium text-xl text-[#574D4C] dark:text-white">
                Tóm Tắt Tác Phẩm
              </h4>
            </div>
            <p className="font-lora text-sm leading-relaxed whitespace-pre-line break-words text-[#4A3E44] dark:text-[#E8DFE3]">
              {novel.synopsis}
            </p>
          </div>

          {/* Chapters Index List */}
          <div className={`space-y-3 border-t pt-6 ${isDark ? 'border-[#6B5261]' : 'border-[#F0D9E3]'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] ${isDark ? 'text-[#7A5869]' : 'text-[#E9B8C2]'}`}>𝜗𝜚</span>
                <h4 className="font-eb-garamond not-italic font-medium text-xl text-[#574D4C] dark:text-white">
                  Danh Sách Chương ({novelChapters.length})
                </h4>
              </div>
              <span className="text-[11px] text-[#B5798D] dark:text-[#E8B8C5]">Nhấn vào chương để bắt đầu đọc</span>
            </div>

            <div
              className={`divide-y rounded-2xl border overflow-hidden ${
                isDark ? 'divide-[#594352] border-[#6B5261]' : 'divide-[#F0D5DE] border-[#F0D9E3]'
              }`}
            >
              {novelChapters.map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => openReader(novel.id, ch.id)}
                  className="p-3.5 sm:p-4 flex items-center justify-between bg-white dark:bg-[#352936] hover:bg-[#FFF6FB] dark:hover:bg-[#412F3A] cursor-pointer transition-colors"
                >
                  <div className="space-y-0.5">
                    <span
                      style={{ fontFamily: "'Vollkorn', serif" }}
                      className="not-italic text-base sm:text-lg font-medium block text-[#574D4C] dark:text-white hover:underline"
                    >
                      {ch.title}
                    </span>
                    <span className="text-[11px] text-[#8F7D85] dark:text-[#D5CBD0] flex items-center gap-1.5">
                      <span>{ch.releaseDate} • {ch.wordCount.toLocaleString('vi-VN')} từ</span>
                      <span className="flex items-center gap-0.5">
                        <MessageSquare className="w-3 h-3" />
                        {ch.commentsCount}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className="text-xs flex items-center gap-1"
                      style={{ color: isDark ? ACCENT_DARK : ACCENT }}
                    >
                      <Heart className="w-3.5 h-3.5" />
                      {ch.hearts.toLocaleString('vi-VN')}
                    </span>
                    <span
                      className="text-xs font-semibold uppercase"
                      style={{ color: isDark ? ACCENT_DARK : '#B4587E' }}
                    >
                      Đọc →
                    </span>
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