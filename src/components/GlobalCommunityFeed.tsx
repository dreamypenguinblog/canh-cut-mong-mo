import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Heart, ArrowRight, Trash2, ChevronDown } from 'lucide-react';
import { auth } from '../lib/firebase';
import { formatRelativeTime } from '../lib/formatTime';

// Bảng màu hồng phẳng đồng bộ với NovelCard / NovelGrid / Leaderboard / Navbar / HomeHero.
const ACCENT = '#F0A8C8';
const ACCENT_DARK = '#EDA3B4';
const ACCENT_TEXT_DARK = '#2B222C';

export const GlobalCommunityFeed: React.FC = () => {
  const { comments, novels, likeComment, deleteComment, openReader, globalTheme, currentUser, loadAllComments, loadMoreAllComments, hasMoreAllComments } = useApp();
  useEffect(() => {
    void loadAllComments();
  }, []);
  const [filterNovelId, setFilterNovelId] = useState<string>('all');

  const isDark = globalTheme === 'dark';

  const filteredComments = comments.filter((c) => {
    if (filterNovelId !== 'all' && c.novelId !== filterNovelId) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header — tiêu đề đơn giản, không thêm trang trí */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1
          style={{ fontFamily: "'Vollkorn', serif" }}
          className="not-italic text-2xl sm:text-3xl font-medium text-[#8B5D71] dark:text-[#F7E4EC]"
        >
          Bình Luận Đoạn
        </h1>

        {/* Filter controls — dạng pill có mũi tên, đồng bộ với khung sắp xếp trong Danh Sách Truyện */}
        <div className="flex items-center justify-center pt-1">
          <div className="relative">
            <select
              value={filterNovelId}
              onChange={(e) => setFilterNovelId(e.target.value)}
              className={`min-h-[36px] pl-4 pr-8 py-1.5 text-xs rounded-full border focus:outline-none font-medium appearance-none transition-colors ${
                isDark
                  ? 'bg-[#2B222C] border-[#6B5261] text-[#E8DFE3] focus:border-[#D79BAD]'
                  : 'bg-[#FFF5FA] border-[#F5D2E0] text-[#B4587E] focus:border-[#E7B6C5]'
              }`}
            >
              <option value="all">Tất cả tác phẩm</option>
              {novels.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.title}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#D88AB3]" />
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3 max-w-4xl mx-auto">
        {filteredComments.length > 0 ? (
          filteredComments.map((comment) => {
            const novel = novels.find((n) => n.id === comment.novelId);
            const viewerId = currentUser?.id || auth.currentUser?.uid;
            const isLiked = !!viewerId && comment.likedBy?.includes(viewerId);

            return (
              <div
                key={comment.id}
                className={`relative rounded-2xl border p-4 sm:p-5 transition-all overflow-visible ${
                  isDark ? 'bg-[#2B222C] border-[#6B5261]' : 'bg-white border-[#F5DFE7]'
                }`}
              >
                {/* Sparkle decoration góc trên phải khung bình luận — cùng ngôn ngữ trang trí với NovelCard/Leaderboard */}
                <div
                  className={`pointer-events-none select-none absolute top-2.5 right-3 text-[8px] leading-[1.6] hidden sm:block ${
                    isDark ? 'text-[#7A5869]/50' : 'text-[#F2C7DA]/70'
                  }`}
                >
                  ✧　⋆
                </div>

                {/* Header: Novel and chapter meta */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0D9E3] dark:border-[#594352] pb-2.5 mb-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      style={{ fontFamily: "'Vollkorn', serif" }}
                      className="not-italic font-semibold text-[#6B4A57] dark:text-white"
                    >
                      {novel?.title || comment.novelTitle || 'Tiểu Thuyết'}
                    </span>
                    <span className="text-[#B79AA6] dark:text-[#D5CBD0]">•</span>
                    <span className="text-[#B79AA6] dark:text-[#D5CBD0]">
                      {comment.chapterTitle || 'Chương truyện'} (Đoạn #{comment.paragraphIndex + 1})
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openReader(comment.novelId, comment.chapterId, comment.paragraphIndex)}
                      className="min-h-[30px] px-2.5 rounded-full text-[11px] text-[#A45E78] dark:text-[#F2B3C1] hover:bg-[#FFF1F6] dark:hover:bg-[#3A2935] flex items-center gap-1 font-medium transition-colors"
                    >
                      <span>Xem đoạn văn</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    {currentUser?.role === 'admin' && (
                      <button
                        onClick={() => {
                          if (confirm('Xóa bình luận này?')) void deleteComment(comment.id);
                        }}
                        className="min-h-[30px] min-w-[30px] rounded-full flex items-center justify-center text-[#B79AA6] hover:text-rose-500 hover:bg-[#FFF1F6] dark:hover:bg-[#3A2935] transition-colors"
                        title="Xóa bình luận (quản trị)"
                        aria-label="Xóa bình luận"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Excerpt Quote block — nền mềm có dấu ngoặc kép lớn trang trí ở góc,
                    đồng bộ với khung trích dẫn/quote trong ReaderView */}
                {comment.paragraphExcerpt && (
                  <div
                    className={`relative px-4 py-3 rounded-xl mb-3 ${
                      isDark ? 'bg-[#352936]' : 'bg-[#FFF1F5]'
                    }`}
                  >
                    <span
                      style={{ fontFamily: "'Vollkorn', serif" }}
                      className={`pointer-events-none select-none absolute top-1 left-2 text-2xl leading-none ${
                        isDark ? 'text-[#5E4148]' : 'text-[#F2C7DA]'
                      }`}
                    >
                      "
                    </span>
                    <p
                      className={`font-lora italic text-xs leading-relaxed pl-3 ${
                        isDark ? 'text-[#FAF5F6]' : 'text-[#6E5660]'
                      }`}
                    >
                      {comment.paragraphExcerpt}
                    </p>
                    <span className="pointer-events-none select-none absolute bottom-1.5 right-2.5 text-[10px] text-[#E9B8C2]/80 dark:text-[#7A5869]/80">
                      𝜗𝜚
                    </span>
                  </div>
                )}

                {/* User Content & Bio */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Avatar bọc khung "lồng khung" nhỏ — cùng ngôn ngữ với khung bìa truyện của NovelCard */}
                    <div
                      className={`relative p-0.5 rounded-full border shrink-0 ${
                        isDark
                          ? 'bg-gradient-to-b from-[#352936] to-[#2B222C] border-[#6B5261]'
                          : 'bg-gradient-to-b from-[#FFFAFD] to-white border-[#F5DFE7]'
                      }`}
                    >
                      {comment.userAvatar ? (
                        <img
                          src={comment.userAvatar}
                          alt={comment.userName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-transparent" aria-hidden="true" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          style={{ fontFamily: "'Vollkorn', serif" }}
                          className="not-italic text-xs font-semibold text-[#6B4A57] dark:text-white"
                        >
                          {comment.userName}
                        </span>
                        {comment.userRole === 'admin' && (
                          <span
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border"
                            style={
                              isDark
                                ? { background: '#3A2935', color: '#F2B3C1', borderColor: '#7A5869' }
                                : { background: '#FFF0F7', color: '#B4587E', borderColor: '#F0C7DE' }
                            }
                          >
                            Admin
                          </span>
                        )}
                        {comment.userRole === 'author' && (
                          <span
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border"
                            style={
                              isDark
                                ? { background: '#3A2935', color: '#F2B3C1', borderColor: '#7A5869' }
                                : { background: '#FFF0F7', color: '#B4587E', borderColor: '#F0C7DE' }
                            }
                          >
                            Tác Giả
                          </span>
                        )}
                        <span className="text-[10px] text-[#B79AA6] dark:text-[#D5CBD0]">{formatRelativeTime(comment.createdAt)}</span>
                      </div>
                      <p className="font-lora text-xs sm:text-sm leading-relaxed text-[#574D4C] dark:text-[#FAF5F6]">
                        {comment.content}
                      </p>
                    </div>
                  </div>

                  {/* Heart / Like button */}
                  <button
                    onClick={() => likeComment(comment.id)}
                    className="min-h-[32px] shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors border"
                    style={
                      isLiked
                        ? { background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF', borderColor: isDark ? ACCENT_DARK : ACCENT }
                        : isDark
                        ? { borderColor: '#6B5261', color: '#D5CBD0' }
                        : { borderColor: '#F0D9E3', color: '#8F7D85', background: '#FFF9FB' }
                    }
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : 'text-[#E0A8B6]'}`} />
                    <span>{comment.likes}</span>
                  </button>
                </div>

                {/* Dấu trang trí góc dưới khung — cùng ngôn ngữ NovelCard/Leaderboard */}
                <span className="pointer-events-none select-none absolute -bottom-1 -right-1 text-[11px] text-[#E9B8C2] dark:text-[#7A5869]">
                  𝜗𝜚
                </span>
              </div>
            );
          })
        ) : (
          <div
            className={`relative text-center py-12 rounded-2xl border p-6 overflow-visible ${
              isDark ? 'bg-[#2B222C] border-[#6B5261]' : 'bg-white border-[#F0D9E3]'
            }`}
          >
            {/* Sparkle trang trí — đồng bộ với các khung trạng thái rỗng khác trong site */}
            <div
              className={`pointer-events-none select-none absolute top-3 right-4 text-[9px] leading-[1.7] hidden sm:block ${
                isDark ? 'text-[#7A5869]/60' : 'text-[#F2C7DA]/70'
              }`}
            >
              ✧　⋆<br />
              ⋆　✿
            </div>
            <span className="inline-block w-3 h-3 rounded-full bg-[#E8A0B8] mb-3" />
            <p
              style={{ fontFamily: "'Vollkorn', serif" }}
              className="not-italic text-xl font-medium text-[#574D4C] dark:text-[#FAF5F6]"
            >
              Chưa có bình luận nào
            </p>
            <p className="text-xs text-[#8F7D85] dark:text-[#D5CBD0] mt-1">
              Hãy đọc truyện và chia sẻ cảm nghĩ về từng đoạn văn nhé!
            </p>
          </div>
        )}
      </div>

      {hasMoreAllComments && (
        <div className="max-w-4xl mx-auto pt-2 text-center">
          <button
            type="button"
            onClick={() => void loadMoreAllComments()}
            className="min-h-[38px] px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors border"
            style={
              isDark
                ? { background: '#352936', borderColor: '#6B5261', color: '#F2B3C1' }
                : { background: '#FFF6FB', borderColor: '#F0C7DE', color: '#B4587E' }
            }
          >
            Xem thêm bình luận
          </button>
        </div>
      )}
    </div>
  );
};