import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { auth } from '../lib/firebase';
import { MessageSquare, Heart, X, Send, Trash2 } from 'lucide-react';
import { formatRelativeTime } from '../lib/formatTime';

// Bảng màu hồng phẳng đồng bộ với NovelCard / NovelGrid / Leaderboard / GlobalCommunityFeed.
// Đợt chỉnh này đồng bộ lại TOÀN BỘ khung bình luận đoạn theo đúng ngôn ngữ thị giác
// đang dùng ở GlobalCommunityFeed: bỏ viền dày (border-2), bỏ các mã màu đen/xám
// trung tính (#1E1B1D, neutral-200/800) không khớp tông hồng của site, đổi nút tim
// từ nền đen sang nền ACCENT hồng khi đã thích, thêm sparkle trang trí + dải 𝜗𝜚 +
// font Vollkorn cho tên người dùng, đồng bộ badge Tác Giả/Admin theo đúng pill
// gradient đang dùng ở GlobalCommunityFeed. Thuần giao diện — không đổi cách tải,
// phân trang hay gửi bình luận.
const ACCENT = '#F0A8C8';
const ACCENT_DARK = '#EDA3B4';
const ACCENT_TEXT_DARK = '#2B222C';

interface ParagraphCommentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  novelId: string;
  chapterId: string;
  paragraphIndex: number;
  paragraphText: string;
}

export const ParagraphCommentDrawer: React.FC<ParagraphCommentDrawerProps> = ({
  isOpen,
  onClose,
  novelId,
  chapterId,
  paragraphIndex,
  paragraphText,
}) => {
  const { comments, addParagraphComment, likeComment, deleteComment, currentUser, globalTheme, loadCommentsForParagraph, loadMoreCommentsForParagraph, hasMoreCommentsForParagraph } = useApp();
  const [commentInput, setCommentInput] = useState('');
  const [guestName, setGuestName] = useState(() => {
    try { return localStorage.getItem('canhcut_guest_comment_name') || ''; } catch { return ''; }
  });

  // Loads comments scoped to exactly this paragraph (chapterId +
  // paragraphIndex), not "whatever page of the chapter happened to load
  // first" — fixes comments not showing up when a chapter has more than
  // one page's worth spread across different paragraphs.
  useEffect(() => {
    if (!isOpen || !chapterId) return;
    void loadCommentsForParagraph(chapterId, paragraphIndex);
  }, [isOpen, chapterId, paragraphIndex]);

  if (!isOpen) return null;

  const isDark = globalTheme === 'dark';

  // Filter comments for this exact paragraph
  const paragraphComments = comments.filter(
    (c) => c.novelId === novelId && c.chapterId === chapterId && c.paragraphIndex === paragraphIndex
  );
  const hasMore = hasMoreCommentsForParagraph(chapterId, paragraphIndex);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const trimmedName = guestName.trim();
    if (!currentUser && !trimmedName) return;
    if (!currentUser) {
      try { localStorage.setItem('canhcut_guest_comment_name', trimmedName); } catch {}
    }
    addParagraphComment(
      novelId,
      chapterId,
      paragraphIndex,
      paragraphText.slice(0, 120) + (paragraphText.length > 120 ? '...' : ''),
      commentInput.trim(),
      currentUser ? undefined : trimmedName
    );
    setCommentInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#A45E78]/20 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md h-full flex flex-col shadow-2xl border-l overflow-hidden transition-colors duration-200 ${
          isDark ? 'bg-[#2B222C] border-[#6B5261] text-[#F3EEF0]' : 'bg-[#FFF9FB] border-[#F5DFE7] text-[#574D4C]'
        }`}
      >
        {/* Drawer Header — đồng bộ gradient hồng nhạt + Vollkorn như header các khung khác */}
        <div
          className={`relative p-4 sm:p-5 border-b flex items-center justify-between ${
            isDark
              ? 'bg-gradient-to-b from-[#352936] to-[#2B222C] border-[#6B5261]'
              : 'bg-gradient-to-b from-[#FFF1F5] to-[#FFF6FB] border-[#F0D9E3]'
          }`}
        >
          <div
            className={`pointer-events-none select-none absolute top-2 right-14 text-[8px] leading-[1.6] hidden sm:block ${
              isDark ? 'text-[#7A5869]/60' : 'text-[#F2C7DA]/70'
            }`}
          >
            ✧　⋆
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#D985A2] dark:text-[#F2B3C1]" />
            <div>
              <h3
                style={{ fontFamily: "'Vollkorn', serif" }}
                className="not-italic font-semibold text-base text-[#6B4A57] dark:text-[#FAF5F6]"
              >
                Bình Luận Đoạn #{paragraphIndex + 1}
              </h3>
              <p className="text-[11px] text-[#8F7D85] dark:text-[#D5CBD0]">{paragraphComments.length} bình luận</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[28px] min-w-[28px] rounded-full flex items-center justify-center text-[#B79AA6] hover:text-[#A45E78] dark:hover:text-white transition-colors"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quoted Paragraph Box — cùng ngôn ngữ khung trích dẫn ở GlobalCommunityFeed:
            nền hồng phấn nhạt + dấu ngoặc kép lớn góc trên + nơ 𝜗𝜚 góc dưới */}
        <div className={`relative m-4 mb-0 px-4 py-3 rounded-xl ${isDark ? 'bg-[#3A2E3D]' : 'bg-[#FDF2F8]'}`}>
          <span
            style={{ fontFamily: "'Vollkorn', serif" }}
            className={`pointer-events-none select-none absolute top-1 left-2 text-2xl leading-none ${
              isDark ? 'text-[#5E4148]' : 'text-[#F2C7DA]'
            }`}
          >
            "
          </span>
          <p className={`font-lora italic text-xs leading-relaxed pl-3 line-clamp-4 ${isDark ? 'text-[#FAF5F6]' : 'text-[#6E5660]'}`}>
            {paragraphText}
          </p>
          <span className="pointer-events-none select-none absolute bottom-1.5 right-2.5 text-[10px] text-[#E9B8C2]/80 dark:text-[#7A5869]/80">
            𝜗𝜚
          </span>
        </div>

        {/* Comments Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {paragraphComments.length > 0 ? (
            paragraphComments.map((c) => {
              const viewerId = currentUser?.id || auth.currentUser?.uid;
              const isLiked = !!viewerId && c.likedBy?.includes(viewerId);
              return (
                <div
                  key={c.id}
                  className={`relative rounded-2xl border p-3.5 space-y-2 overflow-visible ${
                    isDark ? 'bg-[#352936] border-[#6B5261]' : 'bg-white border-[#F5DFE7]'
                  }`}
                >
                  {/* Sparkle trang trí góc — cùng ngôn ngữ NovelCard/GlobalCommunityFeed */}
                  <div
                    className={`pointer-events-none select-none absolute top-2 right-2.5 text-[7px] leading-[1.5] hidden sm:block ${
                      isDark ? 'text-[#7A5869]/50' : 'text-[#F2C7DA]/70'
                    }`}
                  >
                    ✧
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {c.userAvatar ? (
                        <img src={c.userAvatar} alt="" className="w-6 h-6 rounded-full object-cover border border-[#F0D9E3] dark:border-[#594352]" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-[#F0D9E3] dark:border-[#594352] bg-transparent" aria-hidden="true" />
                      )}
                      <span
                        style={{ fontFamily: "'Vollkorn', serif" }}
                        className="not-italic text-xs font-semibold text-[#6B4A57] dark:text-[#FAF5F6]"
                      >
                        {c.userName}
                      </span>
                      {c.userRole === 'admin' && (
                        <span
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border"
                          style={
                            isDark
                              ? { background: '#3A2E3D', color: '#F2B3C1', borderColor: '#6B5261' }
                              : { background: '#FCE9F2', color: '#A45E78', borderColor: '#F3D0E4' }
                          }
                        >
                          Admin
                        </span>
                      )}
                      {c.userRole === 'author' && (
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
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#B79AA6] dark:text-[#D5CBD0]">{formatRelativeTime(c.createdAt)}</span>
                      {currentUser?.role === 'admin' && (
                        <button
                          onClick={() => {
                            if (confirm('Xóa bình luận này?')) void deleteComment(c.id);
                          }}
                          className="p-1 rounded-md text-[#B79AA6] hover:text-rose-500 transition-colors"
                          title="Xóa bình luận (quản trị)"
                          aria-label="Xóa bình luận"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="font-lora text-xs leading-relaxed text-[#574D4C] dark:text-[#FAF5F6]">{c.content}</p>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => likeComment(c.id)}
                      className="min-h-[28px] text-[11px] flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors font-medium"
                      style={
                        isLiked
                          ? { background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF', borderColor: isDark ? ACCENT_DARK : ACCENT }
                          : isDark
                          ? { borderColor: '#6B5261', color: '#D5CBD0' }
                          : { borderColor: '#F0D9E3', color: '#8F7D85', background: '#FFF9FB' }
                      }
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : 'text-[#E0A8B6]'}`} />
                      <span>{c.likes}</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="relative text-center py-12 space-y-1 overflow-visible">
              <div
                className={`pointer-events-none select-none absolute top-0 right-6 text-[8px] leading-[1.6] hidden sm:block ${
                  isDark ? 'text-[#7A5869]/60' : 'text-[#F2C7DA]/70'
                }`}
              >
                ✧　⋆
              </div>
              <p
                style={{ fontFamily: "'Vollkorn', serif" }}
                className="not-italic text-sm font-medium text-[#6B4A57] dark:text-[#FAF5F6]"
              >
                Chưa có bình luận nào
              </p>
              <p className="text-xs text-[#8F7D85] dark:text-[#D5CBD0]">Hãy là người đầu tiên chia sẻ cảm nghĩ của bạn!</p>
            </div>
          )}
          {hasMore && (
            <button
              type="button"
              onClick={() => void loadMoreCommentsForParagraph(chapterId, paragraphIndex)}
              className={`w-full py-2.5 rounded-full border text-xs font-medium transition-colors ${
                isDark
                  ? 'border-[#6B5261] text-[#D5CBD0] hover:border-[#F2B3C1] hover:text-[#F2B3C1]'
                  : 'border-[#F0D9E3] text-[#8F7D85] hover:border-[#E7B6C5] hover:text-[#B4587E]'
              }`}
            >
              Xem thêm bình luận
            </button>
          )}
        </div>

        {/* New Comment Input Box */}
        <div
          className={`relative p-4 sm:p-5 border-t overflow-visible ${
            isDark
              ? 'border-[#594352] bg-gradient-to-b from-[#2B222C] to-[#352936]'
              : 'border-[#F0D9E3] bg-gradient-to-b from-[#FFF8FB] to-[#FFF1F5]'
          }`}
        >
          {/* Sparkle decoration — cùng ngôn ngữ trang trí với NovelCard/Leaderboard */}
          <div
            className={`pointer-events-none select-none absolute top-2 right-4 text-[8px] leading-[1.6] hidden sm:block ${
              isDark ? 'text-[#7A5869]/60' : 'text-[#F2C7DA]/70'
            }`}
          >
            ✧　⋆
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5">
            {!currentUser && (
              <input
                type="text"
                required
                maxLength={40}
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Tên hiển thị của bạn"
                style={{ fontFamily: "'Vollkorn', serif" }}
                className={`not-italic w-full min-h-[38px] px-3.5 text-xs font-medium rounded-full border focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-[#2B222C] border-[#6B5261] text-[#FAF5F6] placeholder:text-[#8F7D85] placeholder:font-normal focus:border-[#F2B3C1]'
                    : 'bg-white border-[#F0D9E3] text-[#4A3E44] placeholder:text-[#B5A0A8] placeholder:font-normal focus:border-[#E7B6C5]'
                }`}
              />
            )}

            {/* Khung lồng khung quanh textarea — cùng kiểu khung bìa truyện của NovelCard, viền mảnh 1px */}
            <div
              className={`relative p-1 rounded-2xl border transition-colors ${
                isDark
                  ? 'bg-gradient-to-b from-[#352936] to-[#2B222C] border-[#6B5261] focus-within:border-[#F2B3C1]'
                  : 'bg-gradient-to-b from-[#FFFAFD] to-white border-[#F0D9E3] focus-within:border-[#E7B6C5]'
              }`}
            >
              <textarea
                rows={2}
                required
                placeholder={currentUser ? 'Viết cảm nghĩ về đoạn văn này...' : 'Nhập bình luận...'}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className={`w-full min-h-[38px] p-2.5 text-xs font-lora leading-relaxed rounded-xl border-0 resize-none focus:outline-none focus:ring-0 ${
                  isDark ? 'bg-[#2B222C] text-[#FAF5F6] placeholder:text-[#8F7D85]' : 'bg-white text-[#4A3E44] placeholder:text-[#B5A0A8]'
                }`}
              />
              <span
                className={`pointer-events-none select-none absolute -bottom-1 -right-0.5 text-[10px] ${
                  isDark ? 'text-[#7A5869]' : 'text-[#E9B8C2]'
                }`}
              >
                𝜗𝜚
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-0.5">
              <span className="text-[10px] leading-snug text-[#8F7D85] dark:text-[#D5CBD0]">
                {currentUser ? (
                  <>
                    Đăng bởi{' '}
                    <span
                      style={{ fontFamily: "'Vollkorn', serif" }}
                      className="not-italic font-semibold text-[#B4587E] dark:text-[#F2B3C1]"
                    >
                      {currentUser.name}
                    </span>
                  </>
                ) : (
                  'Bình luận ẩn danh · Tên sẽ được ghi nhớ trên thiết bị này'
                )}
              </span>
              <button
                type="submit"
                className="min-h-[34px] shrink-0 px-4 py-1 rounded-full text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                style={{ background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }}
              >
                <span>Gửi</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};