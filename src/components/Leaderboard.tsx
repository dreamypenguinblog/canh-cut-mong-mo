import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, Heart } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const { novels, openNovelDetail, globalTheme } = useApp();
  const [tab, setTab] = useState<'novels' | 'trending'>('novels');

  const isDark = globalTheme === 'dark';

  // Sorted novels by views/hearts
  const topNovels = [...novels].sort((a, b) => b.totalViews - a.totalViews);
  const topLovedNovels = [...novels].sort((a, b) => b.totalHearts - a.totalHearts);

  return (
    <div className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="font-playfair italic text-2xl sm:text-4xl font-normal text-[#1E1B1D] dark:text-[#FFFFFF]">
          Tác Phẩm Được Yêu Thích Nhất
        </h1>

        {/* Tab switch */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setTab('novels')}
            className={`min-h-[36px] px-4 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-all border font-medium ${
              tab === 'novels'
                ? 'bg-[#1E1B1D] text-[#FAF5F6] border-[#1E1B1D] dark:bg-[#FAF5F6] dark:text-[#121113] shadow-xs'
                : isDark
                ? 'border-[#4E4456] text-[#E8DFE3] hover:border-white dark:hover:border-white'
                : 'border-[#DAC8CE] text-[#6E5D65] hover:border-[#1E1B1D]'
            }`}
          >
            Lượt đọc
          </button>
          <button
            onClick={() => setTab('trending')}
            className={`min-h-[36px] px-4 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-all border font-medium ${
              tab === 'trending'
                ? 'bg-[#1E1B1D] text-[#FAF5F6] border-[#1E1B1D] dark:bg-[#FAF5F6] dark:text-[#121113] shadow-xs'
                : isDark
                ? 'border-[#4E4456] text-[#E8DFE3] hover:border-white dark:hover:border-white'
                : 'border-[#DAC8CE] text-[#6E5D65] hover:border-[#1E1B1D]'
            }`}
          >
            Yêu thích nhất
          </button>
        </div>
      </div>

      {topNovels.length === 0 ? (
        <div
          className={`text-center py-12 rounded-2xl border p-6 ${
            isDark ? 'bg-[#18161B] border-[#2D2832]' : 'bg-[#FAF5F6] border-[#EADCE1]'
          }`}
        >
          <p className="font-playfair text-base font-medium text-[#1E1B1D] dark:text-[#FAF5F6]">Chưa có dữ liệu bảng xếp hạng</p>
          <p className="text-xs text-[#8F7D85] dark:text-[#D5CBD0] mt-1">Các tác phẩm mới được đăng sẽ tự động xuất hiện tại đây.</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Highlights for Novels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Rank 2 */}
            {(tab === 'novels' ? topNovels[1] : topLovedNovels[1]) && (
              <div
                className={`rounded-xl border p-4 text-center space-y-2.5 relative order-2 md:order-1 transition-all ${
                  isDark ? 'bg-[#18161B] border-[#383040] text-[#FFFFFF]' : 'bg-[#FFFFFF] border-[#EADCE1] text-[#1E1B1D]'
                }`}
              >
                <div className="w-7 h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-200 font-bold text-xs mx-auto flex items-center justify-center border border-neutral-200 dark:border-neutral-700">
                  #2
                </div>
                <img
                  src={(tab === 'novels' ? topNovels[1] : topLovedNovels[1]).coverImage}
                  alt=""
                  onClick={() => openNovelDetail((tab === 'novels' ? topNovels[1] : topLovedNovels[1]).id)}
                  className="w-20 aspect-[2/3] mx-auto object-cover rounded-lg shadow-xs border border-[#EADCE1] dark:border-[#4E4456] cursor-pointer hover:opacity-90"
                />
                <h4
                  onClick={() => openNovelDetail((tab === 'novels' ? topNovels[1] : topLovedNovels[1]).id)}
                  className="font-playfair italic font-medium text-sm line-clamp-1 cursor-pointer hover:underline text-[#1E1B1D] dark:text-[#FFFFFF]"
                >
                  {(tab === 'novels' ? topNovels[1] : topLovedNovels[1]).title}
                </h4>
                <p className="text-xs text-[#8F7D85] dark:text-[#D5CBD0]">{(tab === 'novels' ? topNovels[1] : topLovedNovels[1]).authorName}</p>
                <div className="text-xs text-[#8F7D85] dark:text-[#D5CBD0] font-medium flex items-center justify-center gap-1.5">
                  {tab === 'novels' ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>{(tab === 'novels' ? topNovels[1] : topLovedNovels[1]).totalViews.toLocaleString('vi-VN')} lượt đọc</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-3.5 h-3.5 text-[#E0A8B6]" />
                      <span>{(tab === 'novels' ? topNovels[1] : topLovedNovels[1]).totalHearts.toLocaleString('vi-VN')} yêu thích</span>
                    </>
                  )}
                </div>
                <div className="pt-1">
                  <button
                    onClick={() => openNovelDetail((tab === 'novels' ? topNovels[1] : topLovedNovels[1]).id)}
                    className="w-full min-h-[34px] py-1 rounded-lg bg-[#1E1B1D] text-white dark:bg-[#FAF5F6] dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    Đọc ngay
                  </button>
                </div>
              </div>
            )}

            {/* Rank 1 */}
            {(tab === 'novels' ? topNovels[0] : topLovedNovels[0]) && (
              <div
                className={`rounded-xl border p-5 text-center space-y-3 relative order-1 md:order-2 shadow-xs transition-all ${
                  isDark ? 'bg-[#1A171E] border-[#4E4456] text-[#FFFFFF]' : 'bg-[#FFFFFF] border-[#DAC8CE] text-[#1E1B1D]'
                }`}
              >
                <div className="w-8 h-8 rounded-md bg-[#1E1B1D] text-white dark:bg-[#FAF5F6] dark:text-black font-bold text-sm mx-auto flex items-center justify-center border border-transparent">
                  #1
                </div>
                <img
                  src={(tab === 'novels' ? topNovels[0] : topLovedNovels[0]).coverImage}
                  alt=""
                  onClick={() => openNovelDetail((tab === 'novels' ? topNovels[0] : topLovedNovels[0]).id)}
                  className="w-24 aspect-[2/3] mx-auto object-cover rounded-lg shadow-sm border border-[#DAC8CE] dark:border-[#5A4E68] cursor-pointer hover:opacity-90"
                />
                <div>
                  <h4
                    onClick={() => openNovelDetail((tab === 'novels' ? topNovels[0] : topLovedNovels[0]).id)}
                    className="font-playfair italic font-semibold text-base line-clamp-1 cursor-pointer hover:underline text-[#1E1B1D] dark:text-[#FFFFFF]"
                  >
                    {(tab === 'novels' ? topNovels[0] : topLovedNovels[0]).title}
                  </h4>
                  <p className="text-xs text-[#8F7D85] dark:text-[#D5CBD0] mt-0.5">
                    Tác giả: {(tab === 'novels' ? topNovels[0] : topLovedNovels[0]).authorName}
                  </p>
                </div>
                <div className="text-xs text-[#8F7D85] dark:text-[#D5CBD0] font-medium flex items-center justify-center gap-1.5">
                  {tab === 'novels' ? (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>{(tab === 'novels' ? topNovels[0] : topLovedNovels[0]).totalViews.toLocaleString('vi-VN')} lượt đọc</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 text-[#E0A8B6]" />
                      <span>{(tab === 'novels' ? topNovels[0] : topLovedNovels[0]).totalHearts.toLocaleString('vi-VN')} yêu thích</span>
                    </>
                  )}
                </div>
                <div className="pt-1">
                  <button
                    onClick={() => openNovelDetail((tab === 'novels' ? topNovels[0] : topLovedNovels[0]).id)}
                    className="w-full min-h-[38px] py-1.5 rounded-lg bg-[#1E1B1D] text-[#FAF5F6] dark:bg-[#FAF5F6] dark:text-[#121113] text-xs uppercase tracking-wider font-semibold shadow-xs hover:opacity-90 transition-opacity"
                  >
                    Đọc ngay
                  </button>
                </div>
              </div>
            )}

            {/* Rank 3 */}
            {(tab === 'novels' ? topNovels[2] : topLovedNovels[2]) && (
              <div
                className={`rounded-xl border p-4 text-center space-y-2.5 relative order-3 transition-all ${
                  isDark ? 'bg-[#18161B] border-[#383040] text-[#FFFFFF]' : 'bg-[#FFFFFF] border-[#EADCE1] text-[#1E1B1D]'
                }`}
              >
                <div className="w-7 h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-200 font-bold text-xs mx-auto flex items-center justify-center border border-neutral-200 dark:border-neutral-700">
                  #3
                </div>
                <img
                  src={(tab === 'novels' ? topNovels[2] : topLovedNovels[2]).coverImage}
                  alt=""
                  onClick={() => openNovelDetail((tab === 'novels' ? topNovels[2] : topLovedNovels[2]).id)}
                  className="w-20 aspect-[2/3] mx-auto object-cover rounded-lg shadow-xs border border-[#EADCE1] dark:border-[#4E4456] cursor-pointer hover:opacity-90"
                />
                <h4
                  onClick={() => openNovelDetail((tab === 'novels' ? topNovels[2] : topLovedNovels[2]).id)}
                  className="font-playfair italic font-medium text-sm line-clamp-1 cursor-pointer hover:underline text-[#1E1B1D] dark:text-[#FFFFFF]"
                >
                  {(tab === 'novels' ? topNovels[2] : topLovedNovels[2]).title}
                </h4>
                <p className="text-xs text-[#8F7D85] dark:text-[#D5CBD0]">{(tab === 'novels' ? topNovels[2] : topLovedNovels[2]).authorName}</p>
                <div className="text-xs text-[#8F7D85] dark:text-[#D5CBD0] font-medium flex items-center justify-center gap-1.5">
                  {tab === 'novels' ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>{(tab === 'novels' ? topNovels[2] : topLovedNovels[2]).totalViews.toLocaleString('vi-VN')} lượt đọc</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-3.5 h-3.5 text-[#E0A8B6]" />
                      <span>{(tab === 'novels' ? topNovels[2] : topLovedNovels[2]).totalHearts.toLocaleString('vi-VN')} yêu thích</span>
                    </>
                  )}
                </div>
                <div className="pt-1">
                  <button
                    onClick={() => openNovelDetail((tab === 'novels' ? topNovels[2] : topLovedNovels[2]).id)}
                    className="w-full min-h-[34px] py-1 rounded-lg bg-[#1E1B1D] text-white dark:bg-[#FAF5F6] dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    Đọc ngay
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Detailed List */}
          <div
            className={`rounded-2xl border overflow-hidden shadow-xs ${
              isDark ? 'bg-[#18161B] border-[#383040]' : 'bg-[#FFFFFF] border-[#EADCE1]'
            }`}
          >
            <div className="p-4 sm:p-5 border-b border-[#EADCE1] dark:border-[#383040] flex justify-between items-center">
              <h3 className="font-playfair text-base font-semibold text-[#1E1B1D] dark:text-[#FFFFFF]">
                Toàn Bộ Bảng Xếp Hạng
              </h3>
              <span className="text-xs text-[#8F7D85] dark:text-[#D5CBD0]">Cập nhật khi tải trang</span>
            </div>

            <div className="divide-y divide-[#EADCE1] dark:divide-[#383040]">
              {(tab === 'novels' ? topNovels : topLovedNovels).map((novel, idx) => (
                <div
                  key={novel.id}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#FAF4F6] dark:hover:bg-[#201C24] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-bold text-sm text-[#8F7D85] dark:text-[#FAF5F6]">
                      #{idx + 1}
                    </span>
                    <img
                      src={novel.coverImage}
                      alt=""
                      onClick={() => openNovelDetail(novel.id)}
                      className="w-10 h-14 object-cover rounded-md shadow-xs border border-[#EADCE1] dark:border-[#4E4456] cursor-pointer"
                    />
                    <div>
                      <h4
                        onClick={() => openNovelDetail(novel.id)}
                        className="font-playfair italic font-medium text-xs sm:text-base hover:underline cursor-pointer text-[#1E1B1D] dark:text-[#FFFFFF]"
                      >
                        {novel.title}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-[#8F7D85] dark:text-[#D5CBD0]">
                        Tác giả: {novel.authorName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-right hidden sm:block text-xs text-[#8F7D85] dark:text-[#D5CBD0]">
                      <div className="font-semibold flex items-center gap-1 justify-end text-[#1E1B1D] dark:text-[#FFFFFF]">
                        <Eye className="w-3 h-3 text-[#8F7D85] dark:text-[#D5CBD0]" />
                        <span>{novel.totalViews.toLocaleString('vi-VN')}</span>
                      </div>
                      <div className="text-[11px] flex items-center gap-1 justify-end">
                        <Heart className="w-3 h-3 text-[#E0A8B6]" />
                        <span>{novel.totalHearts.toLocaleString('vi-VN')}</span>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => openNovelDetail(novel.id)}
                        className="min-h-[34px] px-4 py-1 rounded-lg bg-[#1E1B1D] text-[#FAF5F6] dark:bg-[#FAF5F6] dark:text-[#121113] text-xs font-medium hover:opacity-90 transition-opacity"
                      >
                        Đọc
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

