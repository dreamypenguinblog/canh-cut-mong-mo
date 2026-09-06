import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, Heart } from 'lucide-react';

// Màu hồng phẳng đồng bộ với NovelGrid/NovelCard — không dùng gradient cho nút/badge.
const ACCENT = '#F6B9D2';
const ACCENT_DARK = '#F2B3C1';
const ACCENT_TEXT_DARK = '#2B222C';

// Sắc độ riêng cho từng hạng Top 3 — vẫn trong tông hồng, chỉ đậm nhạt khác nhau,
// dùng cho viền/overlay gradient dưới ảnh bìa (gradient chỉ dùng cho lớp phủ ảnh, giống NovelCard).
const RANK_TONE: Record<number, string> = {
  1: '#E58FB3',
  2: '#EFA9C6',
  3: '#F6C4D9',
};

export const Leaderboard: React.FC = () => {
  const { novels, openNovelDetail, openReader, isInLibrary, toggleLibraryNovel, globalTheme } = useApp();
  const [tab, setTab] = useState<'novels' | 'trending'>('novels');

  const isDark = globalTheme === 'dark';

  // Sorted novels by views/hearts — giữ nguyên cách tính như cũ
  const topNovels = [...novels].sort((a, b) => b.totalViews - a.totalViews);
  const topLovedNovels = [...novels].sort((a, b) => b.totalHearts - a.totalHearts);
  const ranked = tab === 'novels' ? topNovels : topLovedNovels;

  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header — chỉ còn tiêu đề chính */}
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-6 sm:mb-8">
        <h2
          style={{ fontFamily: "'Vollkorn', serif" }}
          className="not-italic text-2xl sm:text-3xl font-medium text-[#8B5D71] dark:text-[#F7E4EC]"
        >
          Tác Phẩm Được Yêu Thích Nhất
        </h2>

        {/* Tab chuyển Lượt đọc / Yêu thích — segmented control màu phẳng, không gradient */}
        <div
          className={`inline-flex items-center gap-1 rounded-full border p-1 ${
            isDark ? 'border-[#6B5261] bg-[#2B222C]' : 'border-[#F5D2E0] bg-[#FFF5FA]'
          }`}
        >
          <button
            onClick={() => setTab('novels')}
            className="min-h-[32px] px-4 py-1 rounded-full text-[11px] font-medium transition-all"
            style={
              tab === 'novels'
                ? { background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }
                : isDark
                ? { color: '#E8DFE3' }
                : { color: '#B4587E' }
            }
          >
            Lượt đọc
          </button>
          <button
            onClick={() => setTab('trending')}
            className="min-h-[32px] px-4 py-1 rounded-full text-[11px] font-medium transition-all"
            style={
              tab === 'trending'
                ? { background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }
                : isDark
                ? { color: '#E8DFE3' }
                : { color: '#B4587E' }
            }
          >
            Yêu thích nhất
          </button>
        </div>
      </div>

      {topNovels.length === 0 ? (
        // Trạng thái rỗng — đồng bộ với trạng thái rỗng của NovelGrid
        <div
          className={`text-center py-12 rounded-2xl border p-6 ${
            isDark ? 'bg-[#2B222C] border-[#6B5261]' : 'bg-white border-[#F0D9E3]'
          }`}
        >
          <span className="inline-block w-3 h-3 rounded-full bg-[#E8A0B8] mb-3" />
          <p
            style={{ fontFamily: "'Vollkorn', serif" }}
            className="text-xl font-medium text-[#574D4C] dark:text-[#FAF5F6]"
          >
            Chưa có dữ liệu bảng xếp hạng
          </p>
          <p className="text-xs text-[#8F7D85] dark:text-[#D5CBD0] mt-1">
            Các tác phẩm mới được đăng sẽ tự động xuất hiện tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* TOP 3 — card dọc theo "chất" NovelCard, thu nhỏ trên desktop + pill trang trí kiểu WordPress */}
          {top3.length > 0 && (
            <div className="grid grid-cols-3 gap-2.5 sm:gap-5 max-w-md sm:max-w-2xl mx-auto">
              {top3.map((novel, idx) => {
                const rank = idx + 1;
                const tone = RANK_TONE[rank];
                const isSaved = isInLibrary(novel.id);
                const previewGenres = novel.genres?.slice(0, 2) ?? [];

                return (
                  <div
                    key={novel.id}
                    className={`group relative rounded-[18px] sm:rounded-[22px] border transition-all duration-300 overflow-visible hover:-translate-y-1 ${
                      isDark
                        ? 'bg-gradient-to-b from-[#2B222C] via-[#241D26] to-[#2B222C] border-[#6B5261]'
                        : 'bg-gradient-to-b from-white via-[#FFF8FB] to-white border-[#F5DFE7]'
                    }`}
                  >
                    {/* Sparkle decoration góc trên phải — cùng ngôn ngữ trang trí với NovelCard */}
                    <div
                      className={`pointer-events-none select-none absolute top-1.5 right-2 text-[6px] sm:text-[8px] leading-[1.6] z-10 ${
                        isDark ? 'text-[#7A5869]/60' : 'text-[#F2C7DA]/70'
                      }`}
                    >
                      ✧　⋆
                    </div>

                    {/* Huy hiệu hạng */}
                    <span
                      className="absolute -top-2 -left-2 z-20 min-w-[22px] h-[22px] sm:min-w-[24px] sm:h-[24px] px-1 rounded-full text-[9px] sm:text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-[#2B222C] shadow-[0_6px_14px_-6px_rgba(229,143,179,0.55)]"
                      style={{ background: tone, color: '#FFFFFF' }}
                    >
                      #{rank}
                    </span>

                    {/* Khung trong – bọc ảnh bìa, kiểu "khung lồng khung" như NovelCard */}
                    <div
                      className={`relative mx-2 sm:mx-2.5 mt-3 p-1 sm:p-1.5 rounded-[14px] sm:rounded-[16px] border ${
                        isDark
                          ? 'bg-gradient-to-b from-[#352936] to-[#2B222C] border-[#6B5261]'
                          : 'bg-gradient-to-b from-[#FFFAFD] to-white border-[#F5DFE7]'
                      }`}
                    >
                      {/* Pill nổi "TOP" đè lên viền khung — lấy cảm hứng từ pill "COVER"/"DREAMY" trong code WordPress */}
                      <span
                        className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 sm:px-2.5 py-[2px] sm:py-[3px] rounded-full text-[6px] sm:text-[7px] tracking-[1.5px] font-semibold z-10 border shadow-sm whitespace-nowrap ${
                          isDark
                            ? 'bg-[#352936] border-[#6B5261] text-[#E8B8C5]'
                            : 'bg-[#FFF0F7]/90 border-white text-[#D8A3BA]'
                        }`}
                      >
                        𝜗𝜚 TOP {rank} 𝜗𝜚
                      </span>

                      <div
                        className={`relative aspect-[3/4] overflow-hidden cursor-pointer rounded-[10px] sm:rounded-xl ${
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

                        {/* Nút lưu tủ sách — góc trên phải ảnh */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLibraryNovel(novel.id);
                          }}
                          className="absolute top-1.5 right-1.5 z-10 min-h-[20px] min-w-[20px] sm:min-h-[22px] sm:min-w-[22px] rounded-full backdrop-blur-md border flex items-center justify-center transition-all"
                          style={
                            isSaved
                              ? { background: tone, color: '#FFFFFF', borderColor: '#FFFFFF' }
                              : isDark
                              ? { background: 'rgba(53,41,54,0.9)', color: ACCENT_DARK, borderColor: '#7A5869' }
                              : { background: 'rgba(255,255,255,0.9)', color: ACCENT, borderColor: '#F2C7DA' }
                          }
                          aria-label="Lưu vào tủ sách"
                        >
                          <Heart className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${isSaved ? 'fill-current' : 'stroke-[2]'}`} />
                        </button>

                        {/* Overlay gradient dưới ảnh — cùng kiểu với NovelCard, không dùng đen */}
                        <div
                          className="absolute inset-x-0 bottom-0 h-1/3 flex items-end p-1.5 sm:p-2"
                          style={{ background: `linear-gradient(to top, ${tone}D9, ${tone}4D, transparent)` }}
                        >
                          <span className="text-[8px] sm:text-[10px] text-white font-medium">
                            {tab === 'novels'
                              ? `${novel.totalViews.toLocaleString('vi-VN')} lượt đọc`
                              : `${novel.totalHearts.toLocaleString('vi-VN')} yêu thích`}
                          </span>
                        </div>

                        <div className="pointer-events-none select-none absolute bottom-1 right-1 text-[9px] sm:text-[11px] text-white/70">
                          𝜗𝜚
                        </div>
                      </div>
                    </div>

                    {/* Thông tin */}
                    <div className="p-1.5 sm:p-2.5 space-y-1 sm:space-y-1.5">
                      <h4
                        onClick={() => openNovelDetail(novel.id)}
                        style={{ fontFamily: "'Vollkorn', serif" }}
                        className={`not-italic font-semibold text-[10px] sm:text-xs line-clamp-2 hover:underline cursor-pointer leading-snug ${
                          isDark ? 'text-white' : 'text-[#6B4A57]'
                        }`}
                      >
                        {novel.title}
                      </h4>
                      <p className="uppercase text-[7px] sm:text-[9px] tracking-wider text-[#D88AB3] dark:text-[#D5CBD0] line-clamp-1">
                        {novel.authorName}
                      </p>

                      {/* Pill thể loại nhỏ — cùng kiểu tag "Hiện đại / Đồng niên" trong code WordPress */}
                      {previewGenres.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {previewGenres.map((g) => (
                            <span
                              key={g}
                              className={`px-1.5 py-[1px] rounded-full text-[6px] sm:text-[7px] border ${
                                isDark
                                  ? 'bg-[#2B222C] border-[#6B5261] text-[#D5CBD0]'
                                  : 'bg-[#FFF5FA] border-[#F5D2E0] text-[#D88AB3]'
                              }`}
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => openReader(novel.id)}
                        className="w-full min-h-[22px] sm:min-h-[26px] mt-1 rounded-full text-[8px] sm:text-[9px] uppercase tracking-wider font-semibold transition-colors"
                        style={{ background: tone, color: '#FFFFFF' }}
                      >
                        Đọc ngay
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Phần còn lại — card ngang, thu nhỏ "khung lồng khung" của NovelCard cho ảnh bìa */}
          {rest.length > 0 && (
            <div className="flex flex-col gap-2.5 sm:gap-3">
              {rest.map((novel, idx) => {
                const rank = idx + 4;
                const isSaved = isInLibrary(novel.id);

                return (
                  <div
                    key={novel.id}
                    className={`flex items-center gap-3 sm:gap-4 rounded-2xl border p-2.5 sm:p-3 transition-all hover:-translate-y-0.5 ${
                      isDark ? 'bg-[#2B222C] border-[#6B5261]' : 'bg-white border-[#F5DFE7]'
                    }`}
                  >
                    {/* Huy hiệu hạng */}
                    <span
                      className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full text-[11px] sm:text-xs font-bold flex items-center justify-center ${
                        isDark ? 'bg-[#3A2E3D] text-[#E8DFE3]' : 'bg-[#FFF5FA] text-[#B4587E]'
                      }`}
                    >
                      {rank}
                    </span>

                    {/* Khung lồng khung thu nhỏ quanh bìa — cùng ngôn ngữ NovelCard */}
                    <div
                      className={`relative flex-shrink-0 p-1 rounded-xl border ${
                        isDark ? 'bg-gradient-to-b from-[#352936] to-[#2B222C] border-[#6B5261]' : 'bg-gradient-to-b from-[#FFFAFD] to-white border-[#F5DFE7]'
                      }`}
                    >
                      <img
                        src={novel.coverImage}
                        alt={novel.title}
                        onClick={() => openNovelDetail(novel.id)}
                        className="w-11 h-14 sm:w-14 sm:h-[74px] object-cover rounded-lg cursor-pointer"
                      />
                      <span className="pointer-events-none select-none absolute -bottom-0.5 -right-0.5 text-[9px] text-[#E9B8C2] dark:text-[#7A5869]">
                        𝜗𝜚
                      </span>
                    </div>

                    {/* Thông tin truyện */}
                    <div className="flex-1 min-w-0">
                      <h4
                        onClick={() => openNovelDetail(novel.id)}
                        style={{ fontFamily: "'Vollkorn', serif" }}
                        className="not-italic font-medium text-sm sm:text-base line-clamp-1 cursor-pointer hover:underline leading-snug text-[#574D4C] dark:text-white"
                      >
                        {novel.title}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#D88AB3] dark:text-[#D5CBD0] mt-0.5 line-clamp-1">
                        {novel.authorName}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[10.5px] sm:text-[11px] text-[#8F7D85] dark:text-[#D5CBD0]">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {novel.totalViews.toLocaleString('vi-VN')}
                        </span>
                        <span className="flex items-center gap-1" style={{ color: isDark ? ACCENT_DARK : ACCENT }}>
                          <Heart className="w-3 h-3" />
                          {novel.totalHearts.toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    {/* Nút hành động */}
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLibraryNovel(novel.id);
                        }}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center transition-all"
                        style={
                          isSaved
                            ? { background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF', borderColor: isDark ? ACCENT_DARK : ACCENT }
                            : isDark
                            ? { background: '#2B222C', color: ACCENT_DARK, borderColor: '#7A5869' }
                            : { background: '#FFF6FB', color: ACCENT, borderColor: '#F2C7DA' }
                        }
                        aria-label="Lưu vào tủ sách"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : 'stroke-[2]'}`} />
                      </button>
                      <button
                        onClick={() => openReader(novel.id)}
                        className="min-h-[28px] sm:min-h-[32px] px-3 sm:px-4 rounded-full text-[10px] sm:text-xs uppercase tracking-wider font-semibold transition-colors"
                        style={{ background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }}
                      >
                        Đọc
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
};