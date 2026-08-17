import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { NovelCard } from './NovelCard';

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
    <section className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#ECE0E4] dark:border-[#2E2833] pb-4 mb-6 gap-4">
        <div>
          <div className="text-xs">
            <span className="tracking-wider uppercase font-semibold text-[#8F7D85] dark:text-[#E0D8DC]">
              Danh Mục Truyện
            </span>
          </div>
          <h2 className="font-playfair italic text-2xl sm:text-3xl font-normal text-[#1E1B1D] dark:text-[#FFFFFF] mt-1">
            Danh Sách Tiểu Thuyết
          </h2>
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8F7D85] dark:text-[#E8DFE3] font-medium hidden sm:inline">Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={`min-h-[38px] px-3.5 py-1.5 text-xs rounded-lg border focus:outline-none focus:border-[#1E1B1D] dark:focus:border-white cursor-pointer font-medium ${
              isDark ? 'bg-[#1A171E] border-[#4E4456] text-[#FAF5F6]' : 'bg-[#FFFFFF] border-[#DAC8CE] text-[#1E1B1D]'
            }`}
          >
            <option value="views">Lượt xem nhiều nhất</option>
            <option value="hearts">Yêu thích nhất</option>
            <option value="updated">Mới cập nhật</option>
          </select>
        </div>
      </div>

      {/* Genre Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 no-scrollbar">
        {allGenres.map((genre) => {
          const isActive = selectedGenre === genre;
          return (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`min-h-[34px] px-3.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all border font-medium ${
                isActive
                  ? 'bg-[#1E1B1D] text-[#FAF5F6] border-[#1E1B1D] dark:bg-[#FAF5F6] dark:text-[#121113] shadow-xs'
                  : isDark
                  ? 'border-[#4E4456] text-[#E8DFE3] hover:border-white hover:text-white'
                  : 'border-[#E2D4D9] text-[#6E5D65] hover:border-[#1E1B1D] hover:text-[#1E1B1D]'
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>

      {/* Novels Grid */}
      {filteredNovels.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 lg:gap-6">
          {filteredNovels.map((novel) => (
            <NovelCard key={novel.id} novel={novel} />
          ))}
        </div>
      ) : (
        <div
          className={`text-center py-12 rounded-2xl border p-6 ${
            isDark ? 'bg-[#18161B] border-[#2D2832]' : 'bg-[#FAF5F6] border-[#EADCE1]'
          }`}
        >
          <p className="font-playfair text-base font-medium text-[#1E1B1D] dark:text-[#FAF5F6]">
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
              className="mt-4 px-4 py-1.5 rounded-lg text-xs border border-[#1E1B1D] dark:border-[#FAF5F6] hover:bg-[#1E1B1D] hover:text-white dark:hover:bg-[#FAF5F6] dark:hover:text-black transition-colors"
            >
              Xem tất cả truyện
            </button>
          )}
        </div>
      )}
    </section>
  );
};
