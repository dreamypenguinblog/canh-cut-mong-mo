import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, BookOpen, Eye, MessageSquare } from 'lucide-react';

// Bảng màu hồng phẳng đồng bộ với NovelCard / NovelGrid / Leaderboard / Navbar.
const ACCENT = '#F0A8C8';
const ACCENT_DARK = '#EDA3B4';
const ACCENT_TEXT_DARK = '#2B222C';

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
        <p style={{ fontFamily: "'Vollkorn', serif" }} className="not-italic text-lg text-[#8F7D85]">
          Không tìm thấy thông tin tác phẩm
        </p>
        <button
          onClick={() => setActiveView('home')}
          className="mt-4 px-5 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-colors"
          style={{ background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }}
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
  const isCompleted = novel.status === 'completed';

  return (
    <div className="py-6 sm:py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Back Button */}
      <div>
        <button
          onClick={() => setActiveView('home')}
          className={`min-h-[38px] px-3.5 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-colors ${
            isDark
              ? 'border-[#6B5261] bg-[#2B222C] text-[#FFFFFF] hover:border-[#F2B3C1]'
              : 'border-[#F0C7DE] bg-[#FFF6FB] text-[#B4587E] hover:border-[#E79FC3]'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại trang chủ</span>
        </button>
      </div>

      {/* Main Novel Hero Card */}
      <div
        className={`relative overflow-visible rounded-[28px] border p-5 sm:p-8 transition-colors ${
          isDark
            ? 'bg-gradient-to-b from-[#2B222C] via-[#241D26] to-[#2B222C] border-[#6B5261]'
            : 'bg-gradient-to-b from-white via-[#FFF8FB] to-white border-[#F5DFE7]'
        }`}
      >
        {/* Sparkle decoration – góc trên phải khung tổng, cùng ngôn ngữ trang trí với NovelCard */}
        <div
          className={`pointer-events-none select-none absolute top-4 right-5 text-[11px] leading-[1.7] z-10 hidden sm:block ${
            isDark ? 'text-[#7A5869]/60' : 'text-[#F2C7DA]/70'
          }`}
        >
          ✧　⋆<br />
          ⋆　✿
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Cover image — khung lồng khung như NovelCard, ảnh nổi bật hơn hẳn */}
          <div className="md:col-span-4 flex justify-center">
            <div
              className={`relative w-48 sm:w-full max-w-[240px] p-2 rounded-[24px] border ${
                isDark
                  ? 'bg-gradient-to-b from-[#352936] to-[#2B222C] border-[#6B5261]'
                  : 'bg-gradient-to-b from-[#FFFAFD] to-white border-[#F5DFE7]'
              }`}
              style={{
                boxShadow: isDark
                  ? '0 16px 32px -18px rgba(0,0,0,0.55)'
                  : '0 16px 32px -18px rgba(247,184,210,0.45)',
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

          {/* Details */}
          <div className="md:col-span-8 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center flex-wrap gap-2">
                <span className={`text-[9px] ${isDark ? 'text-[#7A5869]' : 'text-[#E9B8C2]'}`}>𝜗𝜚</span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#B5798D] dark:text-[#E8B8C5]">
                  Thông tin tác phẩm
                </span>
                {/* Badge trạng thái — pill gradient đồng bộ đúng badge trạng thái trong NovelCard */}
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
                  {isCompleted ? 'Đã hoàn thành' : 'Đang ra chương'}
                </span>
              </div>

              {/* Tiêu đề — chuyển sang Vollkorn đậm, to hơn hẳn để nổi bật ngay khi vào trang */}
              <h1
                style={{ fontFamily: "'Vollkorn', serif" }}
                className="not-italic text-3xl sm:text-[2.5rem] font-semibold leading-tight text-[#6B4A57] dark:text-white"
              >
                {novel.title}
              </h1>
            </div>

            {/* Author and metadata */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs text-[#8F7D85] dark:text-[#E0D8DC]">
              <span>
                Tác giả:{' '}
                <strong className="font-semibold" style={{ color: isDark ? ACCENT_DARK : '#B4587E' }}>
                  {novel.authorName}
                </strong>
              </span>
              <span className={isDark ? 'text-[#7A5869]' : 'text-[#E9B8C2]'}>•</span>
              <span>{novel.chaptersCount} chương</span>
            </div>

            {/* Metrics stats — panel pastel, số liệu dùng Vollkorn đậm cho dễ đọc và nổi bật */}
            <div
              className={`grid grid-cols-3 gap-2 py-3.5 rounded-2xl border text-center ${
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
                  className="not-italic text-base sm:text-lg font-semibold mt-0.5 block"
                >
                  {novel.totalHearts.toLocaleString('vi-VN')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8F7D85] dark:text-[#D5CBD0] uppercase tracking-wider block">
                  Bình luận
                </span>
                <span
                  style={{ fontFamily: "'Vollkorn', serif" }}
                  className="not-italic text-base sm:text-lg font-semibold flex items-center justify-center gap-1 mt-0.5 text-[#A45E78] dark:text-white"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#8F7D85] dark:text-[#D5CBD0]" />
                  {novel.totalComments}
                </span>
              </div>
            </div>

            {/* Genres — pill nhạt đồng bộ tag thể loại ở Leaderboard */}
            <div className="flex flex-wrap gap-1.5">
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

            {/* Action buttons — CTA chính nổi bật hẳn bằng nền ACCENT đặc */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => openReader(novel.id)}
                className="min-h-[42px] px-6 py-2 rounded-full hover:opacity-90 transition-opacity text-xs uppercase tracking-wider font-semibold flex items-center gap-2"
                style={{ background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Đọc từ đầu</span>
              </button>

              <button
                onClick={() => toggleLibraryNovel(novel.id)}
                className="min-h-[42px] px-5 py-2 rounded-full border text-xs uppercase tracking-wider font-medium transition-colors"
                style={
                  isSaved
                    ? { background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF', borderColor: isDark ? ACCENT_DARK : ACCENT }
                    : isDark
                    ? { borderColor: '#6B5261', color: '#FFFFFF' }
                    : { borderColor: '#F0C7DE', color: '#B4587E' }
                }
              >
                {isSaved ? 'Đã có trong tủ sách' : 'Thêm vào tủ sách'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Synopsis Section — nâng cấp đồng bộ khung gradient + sparkle như Hero Card,
          không đổi nguồn dữ liệu (vẫn novel.synopsis) */}
      <div
        className={`relative overflow-hidden rounded-[26px] border p-5 sm:p-7 space-y-3 transition-colors ${
          isDark
            ? 'bg-gradient-to-b from-[#2B222C] via-[#241D26] to-[#2B222C] border-[#6B5261]'
            : 'bg-gradient-to-b from-white via-[#FFF8FB] to-white border-[#F5DFE7]'
        }`}
      >
        <div
          className={`pointer-events-none select-none absolute top-3.5 right-5 text-[10px] leading-[1.7] hidden sm:block ${
            isDark ? 'text-[#7A5869]/60' : 'text-[#F2C7DA]/70'
          }`}
        >
          ✧　⋆
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[9px] ${isDark ? 'text-[#7A5869]' : 'text-[#E9B8C2]'}`}>𝜗𝜚</span>
          <h2
            style={{ fontFamily: "'Vollkorn', serif" }}
            className="not-italic text-xl sm:text-2xl font-semibold tracking-wide text-[#6B4A57] dark:text-white"
          >
            Tóm Tắt Tác Phẩm
          </h2>
        </div>
        <p className="font-lora text-sm sm:text-[15px] leading-relaxed whitespace-pre-line break-words text-justify text-[#4A3E44] dark:text-[#E8DFE3]">
          {novel.synopsis}
        </p>
      </div>

      {/* Chapter List Section — thêm huy hiệu số chương tròn (đồng bộ khung "Danh Sách Chương"
          trong ReaderView) + khung gradient/sparkle đồng bộ Hero Card. Vẫn dùng đúng chapterListItems,
          ch.id/chapterNumber/title/releaseDate/wordCount và openReader như cũ, không đổi dữ liệu. */}
      <div
        className={`relative overflow-hidden rounded-[26px] border p-5 sm:p-7 space-y-4 transition-colors ${
          isDark
            ? 'bg-gradient-to-b from-[#2B222C] via-[#241D26] to-[#2B222C] border-[#6B5261]'
            : 'bg-gradient-to-b from-white via-[#FFF8FB] to-white border-[#F5DFE7]'
        }`}
      >
        <div
          className={`pointer-events-none select-none absolute top-3.5 right-5 text-[10px] leading-[1.7] hidden sm:block ${
            isDark ? 'text-[#7A5869]/60' : 'text-[#F2C7DA]/70'
          }`}
        >
          ✧　⋆
        </div>

        <div className="flex items-center justify-between border-b pb-3 border-[#F0D9E3] dark:border-[#594352]">
          <div className="flex items-center gap-2">
            <span className={`text-[9px] ${isDark ? 'text-[#7A5869]' : 'text-[#E9B8C2]'}`}>𝜗𝜚</span>
            <h2
              style={{ fontFamily: "'Vollkorn', serif" }}
              className="not-italic text-xl sm:text-2xl font-semibold tracking-wide text-[#6B4A57] dark:text-white"
            >
              Danh Sách Chương ({chapterListItems.length})
            </h2>
          </div>
          <span className="text-[11px] text-[#B5798D] dark:text-[#E8B8C5] hidden sm:inline">Nhấn chương để đọc</span>
        </div>

        {chapterListItems.length > 0 ? (
          <div
            className={`divide-y rounded-2xl border overflow-hidden ${
              isDark ? 'divide-[#594352] border-[#6B5261]' : 'divide-[#F0D5DE] border-[#F0D9E3]'
            }`}
          >
            {chapterListItems.map((ch) => (
              <div
                key={ch.id}
                onClick={() => openReader(novel.id, ch.id)}
                className="p-3.5 sm:p-4 flex items-center gap-3 bg-white dark:bg-[#352936] hover:bg-[#FFF6FB] dark:hover:bg-[#412F3A] cursor-pointer transition-colors"
              >
                {/* Huy hiệu số chương — cùng ngôn ngữ với khung "Danh Sách Chương" trong ReaderView */}
                <span
                  className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{
                    background: isDark ? '#2B222C' : '#FFF5FA',
                    color: isDark ? ACCENT_DARK : '#D88AB3',
                  }}
                >
                  {ch.chapterNumber}
                </span>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <span
                    style={{ fontFamily: "'Vollkorn', serif" }}
                    className="not-italic text-base sm:text-lg font-medium block truncate text-[#574D4C] dark:text-white hover:underline"
                  >
                    {ch.title}
                  </span>
                  <span className="text-[11px] text-[#8F7D85] dark:text-[#D5CBD0]">
                    {ch.releaseDate} • {ch.wordCount.toLocaleString('vi-VN')} chữ
                  </span>
                </div>

                <div
                  className="shrink-0 text-xs font-semibold flex items-center gap-1"
                  style={{ color: isDark ? ACCENT_DARK : '#B4587E' }}
                >
                  <span>Đọc</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#8F7D85] dark:text-[#D5CBD0]">
            <span className="inline-block w-2 h-2 rounded-full bg-[#E8A0B8] mb-2" />
            <br />
            Chưa có chương nào được xuất bản.
          </div>
        )}
      </div>
    </div>
  );
};