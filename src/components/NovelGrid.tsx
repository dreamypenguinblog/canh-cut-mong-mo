import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { NovelCard } from './NovelCard';
import { ChevronDown } from 'lucide-react';

// Màu hồng phẳng đồng bộ với NovelCard/Leaderboard — không dùng gradient nữa.
// Đậm hơn một chút so với bản trước (#F6B9D2 → #F0A8C8) nhưng vẫn giữ vibe pastel.
const ACCENT = '#F0A8C8';
const ACCENT_DARK = '#EDA3B4';
const ACCENT_TEXT_DARK = '#2B222C';

const SORT_OPTIONS: { key: 'views' | 'hearts' | 'updated'; label: string }[] = [
  { key: 'views', label: 'Lượt xem nhiều nhất' },
  { key: 'hearts', label: 'Yêu thích nhất' },
  { key: 'updated', label: 'Mới cập nhật' },
];

export const NovelGrid: React.FC = () => {
  const { novels, globalTheme } = useApp();
  const [selectedGenre, setSelectedGenre] = useState<string>('Tất cả');
  const [sortBy, setSortBy] = useState<'views' | 'hearts' | 'updated'>('views');
  const [statusFilter] = useState<'all' | 'ongoing' | 'completed'>('all');
  const [showGenres, setShowGenres] = useState(false);

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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header — căn giữa, cùng kiểu với header Bảng xếp hạng / Tủ sách để đồng bộ toàn site */}
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-6 sm:mb-8">
        <h2
          style={{ fontFamily: "'Vollkorn', serif" }}
          className="not-italic text-2xl sm:text-3xl font-medium text-[#8B5D71] dark:text-[#F7E4EC]"
        >
          Danh Sách Truyện
        </h2>

        {/* Sắp xếp — khung 3 nút segmented control, nút đang chọn dùng ACCENT phẳng */}
        <div
          className={`inline-flex items-center gap-1 rounded-full border p-1 overflow-x-auto no-scrollbar max-w-full ${
            isDark ? 'border-[#6B5261] bg-[#2B222C]' : 'border-[#F5D2E0] bg-[#FFF5FA]'
          }`}
        >
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className="min-h-[32px] px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all"
              style={
                sortBy === opt.key
                  ? { background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }
                  : isDark
                  ? { color: '#E8DFE3' }
                  : { color: '#B4587E' }
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Genre Filter — thu gọn, bấm nút mũi tên mới xổ ra toàn bộ thể loại */}
      <div className="mb-6">
        <button
          onClick={() => setShowGenres((v) => !v)}
          className={`flex items-center gap-2 min-h-[36px] px-4 py-1.5 rounded-full border text-xs font-medium transition-colors ${
            isDark
              ? 'border-[#6B5261] bg-[#2B222C] text-[#E8DFE3] hover:border-[#D79BAD]'
              : 'border-[#F5D2E0] bg-[#FFF5FA] text-[#B4587E] hover:border-[#E7B6C5]'
          }`}
        >
          <span>
            Thể loại: <span className="font-semibold">{selectedGenre}</span>
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${showGenres ? 'rotate-180' : ''}`}
          />
        </button>

        {showGenres && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            {allGenres.map((genre) => {
              const isActive = selectedGenre === genre;
              return (
                <button
                  key={genre}
                  onClick={() => {
                    setSelectedGenre(genre);
                    setShowGenres(false);
                  }}
                  className="min-h-[34px] px-3.5 py-1 rounded-full text-xs whitespace-nowrap transition-all border font-medium"
                  style={
                    isActive
                      ? {
                          background: isDark ? ACCENT_DARK : ACCENT,
                          borderColor: isDark ? ACCENT_DARK : '#FFFFFF',
                          color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF',
                        }
                      : isDark
                      ? { borderColor: '#6B5261', background: '#2B222C', color: '#E8DFE3' }
                      : { borderColor: '#F5D2E0', background: '#FFF5FA', color: '#D88AB3' }
                  }
                >
                  {genre}
                </button>
              );
            })}
          </div>
        )}
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
          className={`text-center py-12 rounded-2xl border p-6 ${
            isDark ? 'bg-[#2B222C] border-[#6B5261]' : 'bg-white border-[#F0D9E3]'
          }`}
        >
          <span className="inline-block w-3 h-3 rounded-full bg-[#E8A0B8] mb-3" />
          <p
            style={{ fontFamily: "'Vollkorn', serif" }}
            className="text-xl font-medium text-[#574D4C] dark:text-[#FAF5F6]"
          >
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
              className="mt-4 px-4 py-1.5 rounded-full text-xs transition-colors font-semibold"
              style={{ background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }}
            >
              Xem tất cả truyện
            </button>
          )}
        </div>
      )}
    </section>
  );
};