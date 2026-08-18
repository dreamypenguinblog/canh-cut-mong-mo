import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { auth } from '../lib/firebase';
import { MessageSquare, Heart, X, Send } from 'lucide-react';
import { formatRelativeTime } from '../lib/formatTime';

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
  const { comments, addParagraphComment, likeComment, currentUser, globalTheme, loadMoreCommentsForChapter, hasMoreCommentsForChapter } = useApp();
  const [commentInput, setCommentInput] = useState('');
  const [guestName, setGuestName] = useState(() => {
    try { return localStorage.getItem('canhcut_guest_comment_name') || ''; } catch { return ''; }
  });

  if (!isOpen) return null;

  const isDark = globalTheme === 'dark';

  // Filter comments for this exact paragraph
  const paragraphComments = comments.filter(
    (c) => c.novelId === novelId && c.chapterId === chapterId && c.paragraphIndex === paragraphIndex
  );
  const hasMore = hasMoreCommentsForChapter(chapterId);

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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md h-full flex flex-col shadow-2xl border-l transition-colors duration-200 ${
          isDark ? 'bg-[#18161B] border-[#2F2935] text-[#F3EEF0]' : 'bg-[#FFFFFF] border-[#EADCE1] text-[#1E1B1D]'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#EADCE1] dark:border-[#2F2935] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#8F7D85] dark:text-[#D5CBD0]" />
            <div>
              <h3 className="font-playfair font-semibold text-base text-[#1E1B1D] dark:text-[#FAF5F6]">Bình Luận Đoạn #{paragraphIndex + 1}</h3>
              <p className="text-[11px] text-[#8F7D85] dark:text-[#D5CBD0]">{paragraphComments.length} bình luận</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#8F7D85] hover:text-[#1E1B1D] dark:hover:text-[#FAF5F6]"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quoted Paragraph Box */}
        <div className="p-4 border-b border-[#EADCE1] dark:border-[#2F2935] bg-[#FAF4F6] dark:bg-[#1F1C23]">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-[#8F7D85] dark:text-[#D5CBD0] block mb-1">
            Trích dẫn đoạn văn
          </span>
          <p className="font-lora italic text-xs leading-relaxed text-[#4A3E44] dark:text-[#FAF5F6] line-clamp-4">
            “{paragraphText}”
          </p>
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
                  className={`p-3 rounded-lg border space-y-2 ${
                    isDark ? 'bg-[#1E1B22] border-[#332E38]' : 'bg-[#FAF5F6] border-[#EAE0E4]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {c.userAvatar ? (
                        <img src={c.userAvatar} alt="" className="w-6 h-6 rounded-full object-cover border border-[#EADCE1] dark:border-[#38323D]" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-[#EADCE1] dark:border-[#38323D] bg-transparent" aria-hidden="true" />
                      )}
                      <span className="font-playfair text-xs font-semibold text-[#1E1B1D] dark:text-[#FAF5F6]">{c.userName}</span>
                      {c.userRole === 'author' && (
                        <span className="text-[9px] bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 px-1.5 py-0.2 rounded-md font-medium">
                          Tác Giả
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#8F7D85] dark:text-[#D5CBD0]">{formatRelativeTime(c.createdAt)}</span>
                  </div>

                  <p className="font-lora text-xs leading-relaxed text-[#2C272A] dark:text-[#FAF5F6]">{c.content}</p>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => likeComment(c.id)}
                      className={`min-h-[28px] text-[11px] flex items-center gap-1 px-2.5 py-0.5 rounded-md border transition-colors ${
                        isLiked
                          ? 'bg-[#1E1B1D] text-white dark:bg-[#FAF5F6] dark:text-black border-[#1E1B1D] dark:border-white'
                          : 'border-[#DAC8CE] dark:border-[#38323D] text-[#8F7D85] hover:text-[#1E1B1D] dark:hover:text-white'
                      }`}
                    >
                      <Heart className={`w-3 h-3 text-[#E0A8B6] ${isLiked ? 'fill-current' : ''}`} />
                      <span>{c.likes}</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-[#8F7D85] dark:text-[#D5CBD0] space-y-1">
              <p className="font-playfair text-sm text-[#1E1B1D] dark:text-[#FAF5F6]">Chưa có bình luận nào</p>
              <p className="text-xs">Hãy là người đầu tiên chia sẻ cảm nghĩ của bạn!</p>
            </div>
          )}
          {hasMore && (
            <button
              type="button"
              onClick={() => void loadMoreCommentsForChapter(chapterId)}
              className="w-full py-2.5 rounded-lg border border-[#DAC8CE] dark:border-[#38323D] text-xs font-medium text-[#6E5D65] dark:text-[#D5CBD0] hover:border-[#1E1B1D] dark:hover:border-white transition-colors"
            >
              Xem thêm bình luận
            </button>
          )}
        </div>

        {/* New Comment Input Box */}
        <div className="p-4 border-t border-[#EADCE1] dark:border-[#2F2935] bg-[#FFFFFF] dark:bg-[#18161B]">
          <form onSubmit={handleSubmit} className="space-y-2">
            {!currentUser && (
              <input
                type="text"
                required
                maxLength={40}
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Tên hiển thị của bạn"
                className={`w-full min-h-[38px] px-2.5 text-xs rounded-lg border focus:outline-none focus:border-[#1E1B1D] dark:focus:border-white ${
                  isDark ? 'bg-[#1F1C23] border-[#38323D] text-white' : 'bg-[#FAF5F6] border-[#DED0D5] text-[#1E1B1D]'
                }`}
              />
            )}
            <textarea
              rows={2}
              required
              placeholder={currentUser ? 'Viết cảm nghĩ về đoạn văn này...' : 'Nhập bình luận...'}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className={`w-full min-h-[38px] p-2.5 text-xs rounded-lg border focus:outline-none focus:border-[#1E1B1D] dark:focus:border-white resize-none ${
                isDark ? 'bg-[#1F1C23] border-[#38323D] text-white' : 'bg-[#FAF5F6] border-[#DED0D5] text-[#1E1B1D]'
              }`}
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#8F7D85] dark:text-[#D5CBD0]">
                {currentUser ? `Đăng bởi ${currentUser.name}` : 'Bình luận ẩn danh · Tên sẽ được ghi nhớ trên thiết bị này'}
              </span>
              <button
                type="submit"
                className="min-h-[34px] px-3.5 py-1 rounded-lg bg-[#1E1B1D] text-[#FAF5F6] dark:bg-[#FAF5F6] dark:text-[#121113] text-xs uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
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