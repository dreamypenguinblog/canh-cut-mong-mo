import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, Heart } from 'lucide-react';

// New palette trial (approved page 1 of N): "Màu Sữa" cream as the base and
// "Màu Hồng" as the primary accent, replacing the old blush/ink combo on
// this page only. Kept as local constants so it's easy to find/replace when
// the rest of the site is migrated later — nothing else on this page
// changed except colors + the flat list becoming a card grid.
const MILK = '#FFF1F5';
const MILK_SOFT = '#FFF9FB';
const PINK = '#EC88A6';
const PINK_DEEP = '#D9698A';
const INK = '#241B1E';
const INK_SOFT = '#8C7268';

export const Leaderboard: React.FC = () => {
  const { novels, openNovelDetail, globalTheme } = useApp();
  const [tab, setTab] = useState<'novels' | 'trending'>('novels');

  const isDark = globalTheme === 'dark';

  // Sorted novels by views/hearts
  const topNovels = [...novels].sort((a, b) => b.totalViews - a.totalViews);
  const topLovedNovels = [...novels].sort((a, b) => b.totalHearts - a.totalHearts);
  const ranked = tab === 'novels' ? topNovels : topLovedNovels;

  return (
    <div
      className={`min-h-full py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 rounded-[28px] border-2 ${
        isDark ? 'border-[#6B5261] bg-[#2B222C]' : 'border-[#E8B8C5]'
      }`}
      style={{ background: isDark ? undefined : MILK }}
    >
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 pt-2">
        <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold" style={{ color: isDark ? '#E8B8C5' : PINK_DEEP }}>
          <span className="w-2 h-2 rounded-full" style={{ background: PINK }} />
          <span>Bảng thành tích</span>
          <span className="w-2 h-2 rounded-full" style={{ background: PINK }} />
        </div>
        <h1
          className="font-eb-garamond not-italic text-3xl sm:text-4xl font-medium"
          style={{ color: isDark ? '#FFFFFF' : INK }}
        >
          Tác Phẩm Được Yêu Thích Nhất
        </h1>

        {/* Tab switch */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 p-2 rounded-2xl border border-[#E8B8C5] dark:border-[#6B5261] bg-[#FFF9FB] dark:bg-[#352936]">
          <button
            onClick={() => setTab('novels')}
            className="min-h-[36px] px-5 py-1.5 rounded-full text-xs uppercase tracking-wider transition-all border font-medium"
            style={
              tab === 'novels'
                ? { background: PINK, borderColor: PINK, color: '#FFFFFF' }
                : isDark
                ? { borderColor: '#4E4456', color: '#E8DFE3' }
                : { borderColor: '#E7D9CC', color: INK_SOFT, background: '#FFFFFF' }
            }
          >
            Lượt đọc
          </button>
          <button
            onClick={() => setTab('trending')}
            className="min-h-[36px] px-5 py-1.5 rounded-full text-xs uppercase tracking-wider transition-all border font-medium"
            style={
              tab === 'trending'
                ? { background: PINK, borderColor: PINK, color: '#FFFFFF' }
                : isDark
                ? { borderColor: '#4E4456', color: '#E8DFE3' }
                : { borderColor: '#E7D9CC', color: INK_SOFT, background: '#FFFFFF' }
            }
          >
            Yêu thích nhất
          </button>
        </div>
      </div>

      {topNovels.length === 0 ? (
        <div
          className={`text-center py-12 rounded-2xl border p-6 ${
            isDark ? 'bg-[#18161B] border-[#2D2832]' : 'border-[#E7D9CC]'
          }`}
          style={isDark ? undefined : { background: '#FFFFFF' }}
        >
          <p className="font-playfair text-base font-medium" style={{ color: isDark ? '#FAF5F6' : INK }}>Chưa có dữ liệu bảng xếp hạng</p>
          <p className="text-xs mt-1" style={{ color: isDark ? '#D5CBD0' : INK_SOFT }}>Các tác phẩm mới được đăng sẽ tự động xuất hiện tại đây.</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {/* Rank 2 */}
            {ranked[1] && (
              <div
                  className={`rounded-2xl border p-5 text-center space-y-2.5 relative order-2 md:order-1 transition-all overflow-hidden ${
                  isDark ? 'bg-[#2B222C] border-[#6B5261] text-[#FFFFFF]' : ''
                }`}
                style={isDark ? { background: 'linear-gradient(145deg, #2B222C 0%, #352936 100%)', color: '#FFFFFF' } : { background: 'linear-gradient(145deg, #FFFFFF 0%, #FFF4F7 100%)', borderColor: '#E8C8D2', color: INK }}
              >
                <div
                  className="w-7 h-7 rounded-full font-bold text-[11px] mx-auto flex items-center justify-center border"
                  style={{ background: isDark ? '#594352' : '#FCEEF3', color: isDark ? '#F2B3C1' : PINK_DEEP, borderColor: isDark ? '#7A5869' : '#E8C8D2' }}
                >
                  #2
                </div>
                <img
                  src={ranked[1].coverImage}
                  alt=""
                  onClick={() => openNovelDetail(ranked[1].id)}
                  className="w-20 aspect-[2/3] mx-auto object-cover rounded-lg cursor-pointer hover:opacity-90 border"
                  style={isDark ? undefined : { borderColor: '#E7D9CC' }}
                />
                <h4
                  onClick={() => openNovelDetail(ranked[1].id)}
                  className="font-eb-garamond font-medium text-lg line-clamp-1 cursor-pointer hover:underline"
                  style={isDark ? undefined : { color: INK }}
                >
                  {ranked[1].title}
                </h4>
                <p className="text-xs" style={{ color: isDark ? '#D5CBD0' : INK_SOFT }}>{ranked[1].authorName}</p>
                <div className="text-xs font-medium flex items-center justify-center gap-1.5" style={{ color: isDark ? '#D5CBD0' : INK_SOFT }}>
                  {tab === 'novels' ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>{ranked[1].totalViews.toLocaleString('vi-VN')} lượt đọc</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-3.5 h-3.5" style={{ color: PINK }} />
                      <span>{ranked[1].totalHearts.toLocaleString('vi-VN')} yêu thích</span>
                    </>
                  )}
                </div>
                <div className="pt-1">
                  <button
                    onClick={() => openNovelDetail(ranked[1].id)}
                    className="w-full min-h-[34px] py-1 rounded-full text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                    style={{ background: isDark ? undefined : PINK_DEEP }}
                  >
                    Đọc ngay
                  </button>
                </div>
              </div>
            )}

            {/* Rank 1 */}
            {ranked[0] && (
              <div
                  className={`rounded-2xl border p-5 sm:p-6 text-center space-y-3 relative order-1 md:order-2 transition-all overflow-hidden md:-translate-y-1 ${
                  isDark ? 'bg-[#352936] border-[#C47A94] text-[#FFFFFF]' : ''
                }`}
                style={isDark ? { background: 'linear-gradient(145deg, #352936 0%, #432B38 100%)', borderColor: '#C47A94', color: '#FFFFFF' } : { background: 'linear-gradient(145deg, #FFFFFF 0%, #FCE4EC 100%)', borderColor: PINK, color: INK }}
              >
                <div
                  className="w-9 h-9 rounded-full text-white font-bold text-sm mx-auto flex items-center justify-center border-4 border-[#FCE4EC] dark:border-[#594352]"
                  style={{ background: isDark ? '#C47A94' : PINK }}
                >
                  #1
                </div>
                <img
                  src={ranked[0].coverImage}
                  alt=""
                  onClick={() => openNovelDetail(ranked[0].id)}
                  className="w-24 aspect-[2/3] mx-auto object-cover rounded-xl cursor-pointer hover:opacity-90 border-2"
                  style={{ borderColor: isDark ? '#C47A94' : PINK }}
                />
                <div>
                  <h4
                    onClick={() => openNovelDetail(ranked[0].id)}
                    className="font-eb-garamond font-semibold text-xl line-clamp-1 cursor-pointer hover:underline"
                    style={isDark ? undefined : { color: INK }}
                  >
                    {ranked[0].title}
                  </h4>
                  <p className="text-xs mt-0.5" style={{ color: isDark ? '#D5CBD0' : INK_SOFT }}>
                    Tác giả: {ranked[0].authorName}
                  </p>
                </div>
                <div className="text-xs font-medium flex items-center justify-center gap-1.5" style={{ color: isDark ? '#D5CBD0' : INK_SOFT }}>
                  {tab === 'novels' ? (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>{ranked[0].totalViews.toLocaleString('vi-VN')} lượt đọc</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" style={{ color: PINK }} />
                      <span>{ranked[0].totalHearts.toLocaleString('vi-VN')} yêu thích</span>
                    </>
                  )}
                </div>
                <div className="pt-1">
                  <button
                    onClick={() => openNovelDetail(ranked[0].id)}
                    className="w-full min-h-[38px] py-1.5 rounded-full text-white text-xs uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity"
                    style={{ background: isDark ? '#C47A94' : PINK }}
                  >
                    Đọc ngay
                  </button>
                </div>
              </div>
            )}

            {/* Rank 3 */}
            {ranked[2] && (
              <div
                  className={`rounded-2xl border p-5 text-center space-y-2.5 relative order-3 transition-all overflow-hidden ${
                  isDark ? 'bg-[#2B222C] border-[#6B5261] text-[#FFFFFF]' : ''
                }`}
                style={isDark ? { background: 'linear-gradient(145deg, #2B222C 0%, #352936 100%)', color: '#FFFFFF' } : { background: 'linear-gradient(145deg, #FFFFFF 0%, #FFF4F7 100%)', borderColor: '#E8C8D2', color: INK }}
              >
                <div
                  className="w-7 h-7 rounded-full font-bold text-[11px] mx-auto flex items-center justify-center border"
                  style={{ background: isDark ? '#594352' : '#FCEEF3', color: isDark ? '#F2B3C1' : PINK_DEEP, borderColor: isDark ? '#7A5869' : '#E8C8D2' }}
                >
                  #3
                </div>
                <img
                  src={ranked[2].coverImage}
                  alt=""
                  onClick={() => openNovelDetail(ranked[2].id)}
                  className="w-20 aspect-[2/3] mx-auto object-cover rounded-lg cursor-pointer hover:opacity-90 border"
                  style={isDark ? undefined : { borderColor: '#E7D9CC' }}
                />
                <h4
                  onClick={() => openNovelDetail(ranked[2].id)}
                  className="font-eb-garamond font-medium text-lg line-clamp-1 cursor-pointer hover:underline"
                  style={isDark ? undefined : { color: INK }}
                >
                  {ranked[2].title}
                </h4>
                <p className="text-xs" style={{ color: isDark ? '#D5CBD0' : INK_SOFT }}>{ranked[2].authorName}</p>
                <div className="text-xs font-medium flex items-center justify-center gap-1.5" style={{ color: isDark ? '#D5CBD0' : INK_SOFT }}>
                  {tab === 'novels' ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>{ranked[2].totalViews.toLocaleString('vi-VN')} lượt đọc</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-3.5 h-3.5" style={{ color: PINK }} />
                      <span>{ranked[2].totalHearts.toLocaleString('vi-VN')} yêu thích</span>
                    </>
                  )}
                </div>
                <div className="pt-1">
                  <button
                    onClick={() => openNovelDetail(ranked[2].id)}
                    className="w-full min-h-[34px] py-1 rounded-full text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                    style={{ background: isDark ? undefined : PINK_DEEP }}
                  >
                    Đọc ngay
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Full ranking — grid of cards instead of a stacked list */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-playfair text-base font-semibold" style={{ color: isDark ? '#FFFFFF' : INK }}>
                Toàn Bộ Bảng Xếp Hạng
              </h3>
              <span className="text-xs" style={{ color: isDark ? '#D5CBD0' : INK_SOFT }}>Cập nhật khi tải trang</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
              {ranked.map((novel, idx) => (
                <div
                  key={novel.id}
                  className={`rounded-2xl border p-3 flex flex-col transition-all hover:-translate-y-0.5 ${
                    isDark ? 'bg-[#18161B] border-[#383040] hover:border-[#5A4E68]' : ''
                  }`}
                  style={isDark ? undefined : { background: '#FFFFFF', borderColor: '#E7D9CC' }}
                >
                  <div className="relative mb-2.5">
                    <img
                      src={novel.coverImage}
                      alt=""
                      onClick={() => openNovelDetail(novel.id)}
                      className="w-full aspect-[2/3] object-cover rounded-xl cursor-pointer border"
                      style={isDark ? undefined : { borderColor: '#E7D9CC' }}
                    />
                    <span
                      className="absolute top-2 left-2 min-w-[24px] h-6 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center text-white"
                      style={{ background: isDark ? '#5A4E68' : (idx < 3 ? PINK : PINK_DEEP) }}
                    >
                      #{idx + 1}
                    </span>
                  </div>

                  <h4
                    onClick={() => openNovelDetail(novel.id)}
                    className="font-playfair not-italic font-medium text-xs sm:text-sm line-clamp-2 cursor-pointer hover:underline leading-snug"
                    style={{ color: isDark ? '#FFFFFF' : INK }}
                  >
                    {novel.title}
                  </h4>
                  <p className="text-[10.5px] sm:text-[11px] mt-0.5 line-clamp-1" style={{ color: isDark ? '#D5CBD0' : INK_SOFT }}>
                    {novel.authorName}
                  </p>

                  <div className="flex items-center gap-2.5 mt-2 text-[10.5px] sm:text-[11px]" style={{ color: isDark ? '#D5CBD0' : INK_SOFT }}>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {novel.totalViews.toLocaleString('vi-VN')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" style={{ color: PINK }} />
                      {novel.totalHearts.toLocaleString('vi-VN')}
                    </span>
                  </div>

                  <button
                    onClick={() => openNovelDetail(novel.id)}
                    className="mt-auto pt-2.5 w-full min-h-[32px] py-1 rounded-full text-[11px] font-medium transition-opacity hover:opacity-90 border"
                    style={
                      isDark
                        ? { borderColor: '#4E4456', color: '#FFFFFF' }
                        : { borderColor: PINK, color: PINK_DEEP, background: MILK_SOFT }
                    }
                  >
                    Đọc
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};