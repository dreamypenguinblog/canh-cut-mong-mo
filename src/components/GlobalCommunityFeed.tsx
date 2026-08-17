import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Heart, ArrowRight } from 'lucide-react';
import { auth } from '../lib/firebase';

export const GlobalCommunityFeed: React.FC = () => {
  const { comments, novels, chapters, likeComment, openReader, globalTheme, currentUser, loadAllComments, loadMoreAllComments, hasMoreAllComments } = useApp();
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
    <div className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="font-playfair italic text-2xl sm:text-4xl font-normal text-[#1E1B1D] dark:text-[#FFFFFF]">
          Tổng Hợp Bình Luận Toàn Web
        </h1>
        <p className="text-xs text-[#8F7D85] dark:text-[#D5CBD0] font-light">
          Cảm xúc và suy nghĩ của độc giả trên từng đoạn văn trong các tác phẩm
        </p>

        {/* Filter controls */}
        <div className="flex items-center justify-center pt-2">
          <select
            value={filterNovelId}
            onChange={(e) => setFilterNovelId(e.target.value)}
            className={`min-h-[38px] px-4 py-1.5 text-xs rounded-xl border focus:outline-none focus:border-[#1E1B1D] dark:focus:border-white font-medium ${
              isDark ? 'bg-[#1A171E] border-[#38323D] text-[#FAF5F6]' : 'bg-[#FFFFFF] border-[#DAC8CE] text-[#1E1B1D]'
            }`}
          >
            <option value="all">Tất cả tác phẩm</option>
            {novels.map((n) => (
              <option key={n.id} value={n.id}>
                {n.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3.5 max-w-4xl mx-auto">
        {filteredComments.length > 0 ? (
          filteredComments.map((comment) => {
            const novel = novels.find((n) => n.id === comment.novelId);
            const chapter = chapters.find((c) => c.id === comment.chapterId);
            const viewerId = currentUser?.id || auth.currentUser?.uid;
            const isLiked = !!viewerId && comment.likedBy?.includes(viewerId);

            return (
              <div
                key={comment.id}
                className={`rounded-xl border p-4 sm:p-5 transition-all shadow-xs ${
                  isDark ? 'bg-[#18161B] border-[#2E2833]' : 'bg-[#FFFFFF] border-[#ECE0E4]'
                }`}
              >
                {/* Header: Novel and chapter meta */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EADCE1]/60 dark:border-[#2A2530] pb-2 mb-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-playfair italic font-medium text-[#1E1B1D] dark:text-[#FAF5F6]">
                      {novel?.title || comment.novelTitle || 'Tiểu Thuyết'}
                    </span>
                    <span className="text-[#8F7D85] dark:text-[#D5CBD0]">•</span>
                    <span className="text-[#8F7D85] dark:text-[#D5CBD0]">
                      {chapter?.title || comment.chapterTitle || 'Chương truyện'} (Đoạn #{comment.paragraphIndex + 1})
                    </span>
                  </div>

                  <button
                    onClick={() => openReader(comment.novelId, comment.chapterId, comment.paragraphIndex)}
                    className="min-h-[32px] text-xs text-[#8F7D85] dark:text-[#D5CBD0] hover:text-[#1E1B1D] dark:hover:text-white flex items-center gap-1 font-medium hover:underline"
                  >
                    <span>Xem đoạn văn</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Excerpt Quote block */}
                {comment.paragraphExcerpt && (
                  <div
                    className={`p-3 rounded-lg text-xs font-lora italic leading-relaxed border-l-2 border-[#E0A8B6] mb-3 ${
                      isDark ? 'bg-[#1F1C23] text-[#FAF5F6]' : 'bg-[#FAF4F6] text-[#5C4F55]'
                    }`}
                  >
                    “{comment.paragraphExcerpt}”
                  </div>
                )}

                {/* User Content & Bio */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {comment.userAvatar ? (
                      <img
                        src={comment.userAvatar}
                        alt={comment.userName}
                        className="w-8 h-8 rounded-full object-cover border border-[#EADCE1] dark:border-[#38323D] shrink-0"
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full border border-[#EADCE1] dark:border-[#38323D] bg-transparent shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-playfair text-xs font-semibold text-[#1E1B1D] dark:text-[#FAF5F6]">
                          {comment.userName}
                        </span>
                        {comment.userRole === 'admin' && (
                          <span className="text-[9px] bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 px-1.5 py-0.2 rounded-md font-medium">
                            Admin
                          </span>
                        )}
                        {comment.userRole === 'author' && (
                          <span className="text-[9px] bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 px-1.5 py-0.2 rounded-md font-medium">
                            Tác Giả
                          </span>
                        )}
                        <span className="text-[10px] text-[#8F7D85] dark:text-[#D5CBD0]">{comment.createdAt}</span>
                      </div>
                      <p className="font-lora text-xs sm:text-sm leading-relaxed text-[#2D282B] dark:text-[#FAF5F6]">
                        {comment.content}
                      </p>
                    </div>
                  </div>

                  {/* Heart / Like button */}
                  <button
                    onClick={() => likeComment(comment.id)}
                    className={`min-h-[34px] flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-colors border ${
                      isLiked
                        ? 'bg-[#1E1B1D] text-white dark:bg-[#FAF5F6] dark:text-black border-[#1E1B1D] dark:border-white'
                        : isDark
                        ? 'border-[#38323D] text-[#D5CBD0] hover:border-white hover:text-white'
                        : 'border-[#DAC8CE] text-[#8F7D85] hover:border-[#1E1B1D]'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 text-[#E0A8B6] ${isLiked ? 'fill-current' : ''}`} />
                    <span>{comment.likes}</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div
            className={`text-center py-12 rounded-2xl border p-6 ${
              isDark ? 'bg-[#18161B] border-[#2D2832]' : 'bg-[#FAF5F6] border-[#EADCE1]'
            }`}
          >
            <p className="font-playfair text-base font-medium text-[#1E1B1D] dark:text-[#FAF5F6]">Chưa có bình luận nào</p>
            <p className="text-xs text-[#8F7D85] dark:text-[#D5CBD0] mt-1">Hãy đọc truyện và chia sẻ cảm nghĩ về từng đoạn văn nhé!</p>
          </div>
        )}
      </div>

      {hasMoreAllComments && (
        <div className="max-w-4xl mx-auto pt-2 text-center">
          <button
            type="button"
            onClick={() => void loadMoreAllComments()}
            className="px-5 py-2.5 rounded-lg border border-[#DAC8CE] dark:border-[#38323D] text-xs font-medium text-[#6E5D65] dark:text-[#D5CBD0] hover:border-[#1E1B1D] dark:hover:border-white transition-colors"
          >
            Xem thêm bình luận
          </button>
        </div>
      )}
    </div>
  );
};
