import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { NovelCard } from './NovelCard';
import { ChevronDown } from 'lucide-react';

export const NovelGrid: React.FC = () => {
  const { novels, globalTheme } = useApp();
  const [selectedGenre, setSelectedGenre] = useState<string>('Tất cả');
  const [sortBy, setSortBy] = useState<'views' | 'hearts' | 'updated'>('views');
  const [statusFilter] = useState<'all' | 'ongoing' | 'completed'>('all');

  const isDark = globalTheme === 'dark';

  // Extract all unique genres
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    novels.forEach((n) => n.genres.forEach((g) => set.add(g)));
    return ['Tất cả', ...Array.from(set)];
  }, [novels]);

  // Filtered and sorted novels
  const filteredNovels = useMemo(() => {
    return novels
      .filter((n) => {
        // Genre check
        if (selectedGenre !== 'Tất cả' && !n.genres.includes(selectedGenre)) {
          return false;
        }
        // Status check
        if (statusFilter !== 'all' && n.status !== statusFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'views') return b.totalViews - a.totalViews;
        if (sortBy === 'hearts') return b.totalHearts - a.totalHearts;
        if (sortBy === 'updated') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        return 0;
      });
  }, [novels, selectedGenre, statusFilter, sortBy]);

  return (
    <section
      className={`py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 rounded-[26px] border-2 overflow-hidden ${
        isDark ? 'border-[#594352] bg-[#211B22]' : 'border-[#E7C3CE] bg-[#FFF9FB]'
      }`}
      style={
        isDark
          ? undefined
          : {
              backgroundImage:
                'linear-gradient(rgba(232, 160, 184, 0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(232, 160, 184, 0.09) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }
      }
    >
      {/* Section Header */}
      <div className={`flex flex-col sm:flex-row sm:items-end justify-between border rounded-2xl px-4 py-4 sm:px-5 sm:py-5 pb-4 mb-6 gap-4 ${
        isDark
          ? 'border-[#594352] bg-[#211B22]'
          : 'border-[#E7C3CE] bg-[#FFF9FB]'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-xs mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#E8A0B8]" />
            <span className="tracking-[0.18em] uppercase font-semibold text-[#B5798D] dark:text-[#E8B8C5]">
              Danh Mục Truyện
            </span>
          </div>
          <h2 className="font-eb-garamond not-italic text-2xl sm:text-3xl font-medium text-[#574D4C] dark:text-[#FFFFFF]">
            Danh Sách Tiểu Thuyết
          </h2>
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8F7D85] dark:text-[#E8DFE3] font-medium hidden sm:inline">Sắp xếp:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`min-h-[38px] appearance-none pl-3.5 pr-9 py-1.5 text-xs rounded-full border focus:outline-none focus:border-[#D79BAD] dark:focus:border-[#D79BAD] cursor-pointer font-medium ${
                isDark ? 'bg-[#2B222C] border-[#6B5261] text-[#FAF5F6]' : 'bg-[#FFFDFB] border-[#E8C8D2] text-[#574D4C]'
              }`}
            >
              <option value="views">Lượt xem nhiều nhất</option>
              <option value="hearts">Yêu thích nhất</option>
              <option value="updated">Mới cập nhật</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#B5798D] dark:text-[#F2B3C1]" />
          </div>
        </div>
      </div>

      {/* Genre Filter */}
      <div className={`flex items-center gap-1.5 overflow-x-auto p-2.5 rounded-2xl mb-6 no-scrollbar border ${
        isDark ? 'bg-[#211B22] border-[#594352]' : 'bg-[#FFF9FB] border-[#F0D5DE]'
      }`}>
        {allGenres.map((genre) => {
          const isActive = selectedGenre === genre;
          return (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`min-h-[34px] px-3.5 py-1 rounded-full text-xs whitespace-nowrap transition-all border font-medium ${
                isActive
                  ? 'bg-[#D985A2] text-white border-[#D985A2] dark:bg-[#F2B3C1] dark:text-[#2B222C] dark:border-[#F2B3C1]'
                  : isDark
                  ? 'border-[#6B5261] bg-[#2B222C] text-[#E8DFE3] hover:border-[#D79BAD] hover:text-white'
                  : 'border-[#E8C8D2] bg-[#FFFDFB] text-[#8B6873] hover:border-[#D79BAD] hover:text-[#A45E78]'
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>

      {/* Novels Grid */}
      {filteredNovels.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
          {filteredNovels.map((novel) => (
            <NovelCard key={novel.id} novel={novel} />
          ))}
        </div>
      ) : (
        <div
          className={`text-center py-12 rounded-2xl border-2 p-6 ${
            isDark ? 'bg-[#2B222C] border-[#6B5261]' : 'bg-[#FFF9FB] border-[#E7B6C5]'
          }`}
        >
          <span className="inline-block w-3 h-3 rounded-full bg-[#E8A0B8] mb-3" />
          <p className="font-eb-garamond text-xl font-medium text-[#574D4C] dark:text-[#FAF5F6]">
            {novels.length === 0 ? 'Chưa có tác phẩm nào được đăng tải' : 'Không tìm thấy truyện phù hợp'}
          </p>
          <p className="text-xs text-[#8F7D85] dark:text-[#D5CBD0] mt-1">
            {novels.length === 0
              ? 'Tác giả có thể vào mục Quản trị tác giả để thêm tiểu thuyết và chương truyện đầu tiên.'
              : 'Vui lòng chọn thể loại khác'}
          </p>
          {novels.length > 0 && (
            <button
              onClick={() => {
                setSelectedGenre('Tất cả');
              }}
              className="mt-4 px-4 py-1.5 rounded-full text-xs border border-[#1E1B1D] dark:border-[#FAF5F6] hover:bg-[#1E1B1D] hover:text-white dark:hover:bg-[#FAF5F6] dark:hover:text-black transition-colors"
            >
              Xem tất cả truyện
            </button>
          )}
        </div>
      )}
    </section>
  );
};
