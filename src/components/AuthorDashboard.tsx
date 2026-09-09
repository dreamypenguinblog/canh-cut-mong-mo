import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Novel, Chapter } from '../types';
import {
  BookOpen,
  Trash2,
  Eye,
  Heart,
  MessageSquare,
  Check,
  UserCog
} from 'lucide-react';
import { ProfileModal } from './ProfileModal';

// Bảng màu hồng phẳng đồng bộ với NovelCard / NovelGrid / Leaderboard / Navbar / NovelDetailView.
const ACCENT = '#F0A8C8';
const ACCENT_DARK = '#EDA3B4';
const ACCENT_TEXT_DARK = '#2B222C';

// ---------------------------------------------------------------------------
// Bìa mặc định khi tác giả KHÔNG dán link ảnh bìa — chỉ là một giá trị chuỗi
// (data-URI SVG) được gán vào đúng field `coverImage` giống hệt như trước đây
// (trước là link ảnh Unsplash cố định). Không đổi cách lưu/đọc coverImage ở
// bất kỳ đâu khác, không đụng logic tạo/sửa truyện.
const escapeXmlText = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const wrapTitleLines = (title: string, maxCharsPerLine = 12, maxLines = 3) => {
  const words = title.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
    if (lines.length >= maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length === 0) lines.push('Tiểu Thuyết Mới');
  return lines.slice(0, maxLines);
};

const buildDefaultCoverImage = (title: string) => {
  const lines = wrapTitleLines(title || 'Tiểu Thuyết Mới');
  const titleTexts = lines
    .map(
      (line, i) =>
        `<text x="240" y="${288 + i * 44}" font-family="Georgia, 'Times New Roman', serif" font-size="32" font-weight="700" fill="#FFFFFF" text-anchor="middle">${escapeXmlText(
          line
        )}</text>`
    )
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="640" viewBox="0 0 480 640">
    <defs>
      <linearGradient id="cover-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F6C9DE" />
        <stop offset="55%" stop-color="#F0A8C8" />
        <stop offset="100%" stop-color="#E58FB3" />
      </linearGradient>
    </defs>
    <rect width="480" height="640" fill="url(#cover-bg)" />
    <rect x="18" y="18" width="444" height="604" rx="22" fill="none" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="2" />
    <text x="240" y="78" font-family="Georgia, serif" font-size="26" fill="#FFFFFF" fill-opacity="0.85" text-anchor="middle">${escapeXmlText(
      '✧　⋆'
    )}</text>
    <text x="240" y="150" font-family="Georgia, serif" font-size="30" fill="#FFFFFF" fill-opacity="0.9" text-anchor="middle">𝜗𝜚</text>
    ${titleTexts}
    <text x="70" y="576" font-family="Georgia, serif" font-size="22" fill="#FFFFFF" fill-opacity="0.55" text-anchor="middle">♡</text>
    <text x="240" y="596" font-family="Georgia, serif" font-size="20" fill="#FFFFFF" fill-opacity="0.65" text-anchor="middle">${escapeXmlText(
      '⋆　✿　⋆'
    )}</text>
    <text x="410" y="576" font-family="Georgia, serif" font-size="22" fill="#FFFFFF" fill-opacity="0.55" text-anchor="middle">✧</text>
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};
// ---------------------------------------------------------------------------

export const AuthorDashboard: React.FC = () => {
  const {
    currentUser,
    novels,
    chapters,
    comments,
    createNovel,
    updateNovel,
    deleteNovel,
    createChapter,
    updateChapter,
    deleteChapter,
    rebuildChapterIndex,
    rebuildAllCommentParagraphCounts,
    openReader,
    globalTheme,
  } = useApp();

  const isDark = globalTheme === 'dark';

  const [activeTab, setActiveTab] = useState<'analytics' | 'novels' | 'chapter_editor'>('analytics');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedNovelIdForChapter, setSelectedNovelIdForChapter] = useState<string>(
    novels[0]?.id || ''
  );

  // Novel Form State
  const [editingNovelId, setEditingNovelId] = useState<string | null>(null);
  const [novelTitle, setNovelTitle] = useState('');
  const [novelAuthorName, setNovelAuthorName] = useState('');
  const [novelCoverImage, setNovelCoverImage] = useState('');
  const [novelSynopsis, setNovelSynopsis] = useState('');
  const [novelGenres, setNovelGenres] = useState('Lãng Mạn, Quý Tộc');
  const [novelTags, setNovelTags] = useState('Ngọt Ngào, Cung Đấu');
  const [novelStatus, setNovelStatus] = useState<'ongoing' | 'completed'>('ongoing');

  // Chapter Form State (Author note removed)
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [chapterNumber, setChapterNumber] = useState<number>(1);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContentText, setChapterContentText] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [rebuildingNovelId, setRebuildingNovelId] = useState<string | null>(null);
  const [isRebuildingCommentCounts, setIsRebuildingCommentCounts] = useState(false);

  const handleRebuildAllCommentCounts = async () => {
    if (!confirm('Thao tác này sẽ đọc lại toàn bộ bình luận trên web (1 lần) để tính chính xác số bình luận trên từng đoạn văn cho các chương cũ. Tiếp tục?')) return;
    setIsRebuildingCommentCounts(true);
    try {
      const { chaptersUpdated, commentsScanned } = await rebuildAllCommentParagraphCounts();
      setFeedbackMsg(`Đã làm mới ${chaptersUpdated} chương (rà ${commentsScanned} bình luận).`);
      window.setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (e) {
      console.error(e);
      window.alert('Không thể làm mới số bình luận. Vui lòng thử lại.');
    } finally {
      setIsRebuildingCommentCounts(false);
    }
  };

  const handleRebuildChapterIndex = async (novel: Novel) => {
    setRebuildingNovelId(novel.id);
    try {
      await rebuildChapterIndex(novel.id);
      setFeedbackMsg(`Đã làm mới danh sách chương cho "${novel.title}".`);
      window.setTimeout(() => setFeedbackMsg(null), 4000);
    } finally {
      setRebuildingNovelId(null);
    }
  };

  // Derived author stats
  const authoredNovels = currentUser?.role === 'admin'
    ? novels
    : novels.filter((n) => n.authorId === currentUser?.id);
  const authoredNovelIds = new Set(authoredNovels.map((n) => n.id));
  const authoredChapters = chapters.filter((c) => authoredNovelIds.has(c.novelId));

  const totalViews = authoredNovels.reduce((acc, n) => acc + n.totalViews, 0);
  const totalHearts = authoredNovels.reduce((acc, n) => acc + n.totalHearts, 0);
  // Uses the accurate stored aggregate (kept in sync by addParagraphComment/
  // deleteComment) instead of counting whatever happens to be loaded in
  // memory — comments are no longer eagerly preloaded when a chapter opens,
  // so counting loaded documents would undercount here.
  const totalComments = authoredNovels.reduce((acc, n) => acc + (n.totalComments || 0), 0);
  const totalChaptersCount = authoredChapters.length;

  const currentParagraphCount = chapterContentText.split(/\n+/).filter(Boolean).length;
  const currentWordCount = chapterContentText.trim() ? chapterContentText.trim().split(/\s+/).length : 0;

  const activeNovel = authoredNovels.find((n) => n.id === selectedNovelIdForChapter) || authoredNovels[0];
  const activeNovelChapters = chapters
    .filter((c) => c.novelId === activeNovel?.id)
    .sort((a, b) => a.chapterNumber - b.chapterNumber);

  // Novel CRUD triggers
  const handleOpenNovelCreate = () => {
    setEditingNovelId(null);
    setNovelTitle('');
    setNovelAuthorName(currentUser?.name || 'Canh Cụt Mộng Mơ');
    // Để trống — nếu tác giả không dán link ảnh bìa, lúc lưu sẽ tự tạo bìa
    // gradient hồng có tên truyện (xem buildDefaultCoverImage phía trên).
    setNovelCoverImage('');
    setNovelSynopsis('');
    setNovelGenres('Lãng Mạn, Cung Đình');
    setNovelTags('Chữa Lành, Ngọt Sủng');
    setNovelStatus('ongoing');
    setActiveTab('novels');
  };

  const handleEditNovel = (novel: Novel) => {
    setEditingNovelId(novel.id);
    setNovelTitle(novel.title);
    setNovelAuthorName(novel.authorName || currentUser?.name || 'Canh Cụt Mộng Mơ');
    setNovelCoverImage(novel.coverImage);
    setNovelSynopsis(novel.synopsis);
    setNovelGenres(novel.genres.join(', '));
    setNovelTags(novel.tags.join(', '));
    setNovelStatus(novel.status as any);
    setActiveTab('novels');
  };

  const handleSaveNovel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novelTitle.trim() || !novelSynopsis.trim()) return;

    const genresArr = novelGenres.split(',').map((s) => s.trim()).filter(Boolean);
    const tagsArr = novelTags.split(',').map((s) => s.trim()).filter(Boolean);
    const resolvedAuthorName = novelAuthorName.trim() || currentUser?.name || 'Canh Cụt Mộng Mơ';
    const resolvedCoverImage = novelCoverImage.trim() || buildDefaultCoverImage(novelTitle.trim());

    if (editingNovelId) {
      updateNovel(editingNovelId, {
        title: novelTitle.trim(),
        authorName: resolvedAuthorName,
        coverImage: resolvedCoverImage,
        synopsis: novelSynopsis.trim(),
        genres: genresArr.length > 0 ? genresArr : ['Lãng Mạn'],
        tags: tagsArr.length > 0 ? tagsArr : ['Tiểu Thuyết'],
        status: novelStatus,
      });
      setFeedbackMsg(`Đã cập nhật tiểu thuyết "${novelTitle}"`);
    } else {
      const newId = createNovel({
        title: novelTitle.trim(),
        authorId: currentUser?.id || 'admin_canhcut',
        authorName: resolvedAuthorName,
        authorEmail: currentUser?.email || 'canhcutmongmoeditor@gmail.com',
        coverImage: resolvedCoverImage,
        synopsis: novelSynopsis.trim(),
        genres: genresArr.length > 0 ? genresArr : ['Lãng Mạn'],
        tags: tagsArr.length > 0 ? tagsArr : ['Tiểu Thuyết'],
        status: novelStatus,
      });
      setSelectedNovelIdForChapter(newId);
      setFeedbackMsg(`Đã đăng tiểu thuyết "${novelTitle}" thành công`);
    }

    setEditingNovelId(null);
    setNovelTitle('');
    setNovelAuthorName('');
    setNovelSynopsis('');
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Chapter CRUD triggers
  const handleOpenNewChapter = (novelId?: string) => {
    const targetNovelId = novelId || selectedNovelIdForChapter || novels[0]?.id;
    if (!targetNovelId) return;

    setSelectedNovelIdForChapter(targetNovelId);
    const novelChs = chapters.filter((c) => c.novelId === targetNovelId);
    const nextNum = novelChs.length > 0 ? Math.max(...novelChs.map((c) => c.chapterNumber)) + 1 : 1;

    setEditingChapterId(null);
    setChapterNumber(nextNum);
    setChapterTitle(`Chương ${nextNum}: `);
    setChapterContentText('');
    setIsPublished(true);
    setActiveTab('chapter_editor');
  };

  const handleEditChapter = (ch: Chapter) => {
    setSelectedNovelIdForChapter(ch.novelId);
    setEditingChapterId(ch.id);
    setChapterNumber(ch.chapterNumber);
    setChapterTitle(ch.title);
    setChapterContentText(ch.content.join('\n\n'));
    setIsPublished(ch.isPublished);
    setActiveTab('chapter_editor');
  };

  const handleSaveChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterTitle.trim() || !chapterContentText.trim() || !selectedNovelIdForChapter) return;

    const paragraphs = chapterContentText
      .split(/\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (paragraphs.length === 0) return;

    if (editingChapterId) {
      updateChapter(editingChapterId, {
        chapterNumber,
        title: chapterTitle.trim(),
        content: paragraphs,
        isPublished,
      });
      setFeedbackMsg(`Đã cập nhật Chương ${chapterNumber}`);
    } else {
      createChapter({
        novelId: selectedNovelIdForChapter,
        chapterNumber,
        title: chapterTitle.trim(),
        content: paragraphs,
        isPublished,
      });
      setFeedbackMsg(`Đã đăng Chương ${chapterNumber} thành công`);
      setEditingChapterId(null);
      setChapterNumber(chapterNumber + 1);
      setChapterTitle(`Chương ${chapterNumber + 1}: `);
      setChapterContentText('');
    }

    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const presetCovers = [
    { label: 'Hồng Lãng Mạn', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80' },
    { label: 'Hoa Sơn Trà', url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&auto=format&fit=crop&q=80' },
    { label: 'Cung Điện Cổ', url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80' },
    { label: 'Nước Hoa', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80' },
    { label: 'Hồ Thiên Nga', url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Feedback Toast Notification */}
      {feedbackMsg && (
        <div
          className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-full shadow-xl text-xs flex items-center gap-2 border"
          style={{
            background: isDark ? '#352936' : '#FFFFFF',
            borderColor: isDark ? ACCENT_DARK : '#F0C7DE',
            color: isDark ? '#FAF5F6' : '#574D4C',
          }}
        >
          <Check className="w-3.5 h-3.5" style={{ color: isDark ? ACCENT_DARK : '#B4587E' }} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Header — bỏ khung "Góc tác giả" (eyebrow + card gradient + sparkle) trước
          đây, đổi thành đúng cùng kiểu tiêu đề đơn giản đang dùng ở mọi trang khác
          (GlobalCommunityFeed, Leaderboard, PersonalLibrary): tiêu đề căn giữa,
          font Vollkorn, cỡ chữ/màu chữ giống hệt (#8B5D71 / dark:#F7E4EC), không
          card bọc ngoài, không nhãn phụ. Khối thông tin tác giả + nút hành động
          giữ nguyên, chỉ chuyển ra khỏi card cho nhẹ và đồng bộ. */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1
          style={{ fontFamily: "'Vollkorn', serif" }}
          className="not-italic text-2xl sm:text-3xl font-medium text-[#8B5D71] dark:text-[#F7E4EC]"
        >
          Quản Lý & Đăng Truyện
        </h1>

        {currentUser && (
          <div className="flex items-center justify-center pt-1">
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-colors text-left ${
                isDark ? 'border-[#6B5261] bg-[#2B222C] hover:border-[#D79BAD]' : 'border-[#F5DFE7] bg-white hover:border-[#E7B6C5]'
              }`}
              title="Nhấn để đổi tên và avatar tác giả"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border border-[#F5DFE7] dark:border-[#6B5261]"
              />
              <div className="text-left pr-2">
                <span className="text-xs font-bold block leading-tight text-[#6B4A57] dark:text-[#FAF5F6]">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-[#B79AA6] dark:text-[#D5CBD0] block">
                  Sửa hồ sơ
                </span>
              </div>
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          <button
            onClick={handleOpenNovelCreate}
            className="min-h-[38px] px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-90"
            style={{ background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }}
          >
            <span>Đăng truyện mới</span>
          </button>
          <button
            onClick={() => handleOpenNewChapter(activeNovel?.id || novels[0]?.id)}
            className={`min-h-[38px] px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider transition-colors ${
              isDark
                ? 'border-[#6B5261] text-[#F2B3C1] hover:bg-[#3A2935]'
                : 'border-[#E8B8C5] text-[#A45E78] hover:bg-[#FCEEF3]'
            }`}
          >
            <span>Viết chương mới</span>
          </button>
        </div>
      </div>

      {/* Admin-only, whole-site maintenance tools — not part of regular
          per-novel authoring, kept visually separate so it's clear this
          isn't a per-novel action. */}
      {currentUser?.role === 'admin' && (
        <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-2 text-center">
          <button
            onClick={handleRebuildAllCommentCounts}
            disabled={isRebuildingCommentCounts}
            title="Tính lại chính xác số bình luận trên từng đoạn văn cho các bình luận đăng trước khi có tính năng này — chỉ cần bấm 1 lần"
            className={`min-h-[32px] px-3.5 py-1 rounded-full border text-[11px] font-medium transition-colors disabled:opacity-50 ${
              isDark
                ? 'border-[#6B5261] text-[#D5CBD0] hover:border-[#F2B3C1] hover:text-[#F2B3C1]'
                : 'border-[#E8B8C5] text-[#A45E78] hover:border-[#D985A2]'
            }`}
          >
            {isRebuildingCommentCounts ? 'Đang tính lại toàn bộ...' : 'Làm mới số bình luận theo đoạn văn (toàn web)'}
          </button>
        </div>
      )}

      {/* Tabs — đổi từ dạng pill cuộn ngang (overflow-x-auto) sang lưới 3 cột
          chia đều chiều rộng. Trước đây trên mobile phải vuốt/cuộn ngang mới
          bấm được tới tab "Sửa chương" vì các pill dài hơn khung màn hình; giờ
          cả 3 tab luôn hiện đủ, không cần cuộn, ở mọi kích thước màn hình. */}
      <div
        className={`grid grid-cols-3 gap-1.5 p-1.5 rounded-full border ${
          isDark ? 'border-[#6B5261] bg-[#2B222C]' : 'border-[#F5D2E0] bg-[#FFF5FA]'
        }`}
      >
        <button
          onClick={() => setActiveTab('analytics')}
          className="min-h-[36px] px-2 py-1.5 rounded-full text-[10.5px] sm:text-xs font-medium uppercase tracking-wide sm:tracking-wider transition-all text-center truncate"
          style={
            activeTab === 'analytics'
              ? { background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }
              : isDark
              ? { color: '#E8DFE3' }
              : { color: '#B4587E' }
          }
        >
          <span>Thống kê</span>
        </button>

        <button
          onClick={() => setActiveTab('novels')}
          className="min-h-[36px] px-2 py-1.5 rounded-full text-[10.5px] sm:text-xs font-medium uppercase tracking-wide sm:tracking-wider transition-all text-center truncate"
          style={
            activeTab === 'novels'
              ? { background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }
              : isDark
              ? { color: '#E8DFE3' }
              : { color: '#B4587E' }
          }
        >
          <span>Truyện ({authoredNovels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('chapter_editor')}
          className="min-h-[36px] px-2 py-1.5 rounded-full text-[10.5px] sm:text-xs font-medium uppercase tracking-wide sm:tracking-wider transition-all text-center truncate"
          style={
            activeTab === 'chapter_editor'
              ? { background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }
              : isDark
              ? { color: '#E8DFE3' }
              : { color: '#B4587E' }
          }
        >
          <span>Sửa chương</span>
        </button>
      </div>

      {/* TAB 1: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Master Overview Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div
              className={`p-4 rounded-2xl border ${
                isDark ? 'bg-[#2B222C] border-[#6B5261]' : 'bg-white border-[#F5DFE7]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8F7D85] dark:text-[#D5CBD0]">Tổng lượt xem</span>
                <Eye className="w-4 h-4 text-[#8F7D85] dark:text-[#D5CBD0]" />
              </div>
              <div
                style={{ fontFamily: "'Vollkorn', serif" }}
                className="not-italic text-xl sm:text-2xl font-semibold mt-2 text-[#6B4A57] dark:text-white"
              >
                {totalViews.toLocaleString('vi-VN')}
              </div>
            </div>

            <div
              className={`p-4 rounded-2xl border ${
                isDark ? 'bg-[#2B222C] border-[#6B5261]' : 'bg-white border-[#F5DFE7]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8F7D85] dark:text-[#D5CBD0]">Lượt yêu thích</span>
                <Heart className="w-4 h-4" style={{ color: isDark ? ACCENT_DARK : ACCENT }} />
              </div>
              <div
                style={{ fontFamily: "'Vollkorn', serif", color: isDark ? ACCENT_DARK : ACCENT }}
                className="not-italic text-xl sm:text-2xl font-semibold mt-2"
              >
                {totalHearts.toLocaleString('vi-VN')}
              </div>
            </div>

            <div
              className={`p-4 rounded-2xl border ${
                isDark ? 'bg-[#2B222C] border-[#6B5261]' : 'bg-white border-[#F5DFE7]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8F7D85] dark:text-[#D5CBD0]">Bình luận đoạn văn</span>
                <MessageSquare className="w-4 h-4 text-[#8F7D85] dark:text-[#D5CBD0]" />
              </div>
              <div
                style={{ fontFamily: "'Vollkorn', serif" }}
                className="not-italic text-xl sm:text-2xl font-semibold mt-2 text-[#6B4A57] dark:text-white"
              >
                {totalComments.toLocaleString('vi-VN')}
              </div>
            </div>

            <div
              className={`p-4 rounded-2xl border ${
                isDark ? 'bg-[#2B222C] border-[#6B5261]' : 'bg-white border-[#F5DFE7]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8F7D85] dark:text-[#D5CBD0]">Tổng số chương</span>
                <BookOpen className="w-4 h-4 text-[#8F7D85] dark:text-[#D5CBD0]" />
              </div>
              <div
                style={{ fontFamily: "'Vollkorn', serif" }}
                className="not-italic text-xl sm:text-2xl font-semibold mt-2 text-[#6B4A57] dark:text-white"
              >
                {totalChaptersCount}
              </div>
            </div>
          </div>

          {/* Chapter-by-Chapter In-Depth Analytics */}
          <div
            className={`rounded-2xl border overflow-hidden ${
              isDark ? 'bg-[#2B222C] border-[#6B5261]' : 'bg-white border-[#F5DFE7]'
            }`}
          >
            <div
              className={`p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDark ? 'border-[#594352]' : 'border-[#F0D9E3]'
              }`}
            >
              <div>
                <h3
                  style={{ fontFamily: "'Vollkorn', serif" }}
                  className="not-italic text-xl font-semibold text-[#6B4A57] dark:text-white"
                >
                  Thống Kê Chi Tiết Từng Chương
                </h3>
                <p className="text-xs text-[#8F7D85] dark:text-[#D5CBD0]">
                  Theo dõi lượt xem, số lượt tim và bình luận phân đoạn
                </p>
              </div>

              {/* Selector for novel */}
              <select
                value={selectedNovelIdForChapter}
                onChange={(e) => setSelectedNovelIdForChapter(e.target.value)}
                className={`min-h-[36px] px-3 py-1 text-xs rounded-full border focus:outline-none font-medium ${
                  isDark ? 'bg-[#352936] border-[#6B5261] text-[#FAF5F6] focus:border-[#D79BAD]' : 'bg-[#FFF5FA] border-[#F5D2E0] text-[#B4587E] focus:border-[#E7B6C5]'
                }`}
              >
                {authoredNovels.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile View: Vertical cards (No horizontal scrolling!) */}
            <div className={`sm:hidden divide-y ${isDark ? 'divide-[#594352]' : 'divide-[#F0D9E3]'}`}>
              {activeNovelChapters.length > 0 ? (
                activeNovelChapters.map((ch) => (
                  <div key={ch.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-[#8F7D85] dark:text-[#D5CBD0] uppercase block">
                          Chương #{ch.chapterNumber}
                        </span>
                        <h4
                          style={{ fontFamily: "'Vollkorn', serif" }}
                          className="not-italic font-medium text-sm text-[#574D4C] dark:text-white"
                        >
                          {ch.title}
                        </h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF5FA] dark:bg-[#352936] text-[#8F7D85] dark:text-[#D5CBD0]">
                        {ch.wordCount.toLocaleString('vi-VN')} chữ
                      </span>
                    </div>

                    {/* Stats Badges */}
                    <div className="grid grid-cols-3 gap-2 bg-[#FFF6FB] dark:bg-[#352936] p-2.5 rounded-2xl text-center text-xs">
                      <div>
                        <span className="text-[10px] text-[#8F7D85] dark:text-[#D5CBD0] block">Lượt xem</span>
                        <span className="font-semibold text-[#574D4C] dark:text-white">{ch.views.toLocaleString('vi-VN')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8F7D85] dark:text-[#D5CBD0] block">Lượt tim</span>
                        <span className="font-semibold" style={{ color: isDark ? ACCENT_DARK : ACCENT }}>{ch.hearts.toLocaleString('vi-VN')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8F7D85] dark:text-[#D5CBD0] block">Bình luận</span>
                        <span className="font-semibold text-[#574D4C] dark:text-white">{ch.commentsCount}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => openReader(ch.novelId, ch.id)}
                        className={`min-h-[34px] px-3 py-1 rounded-full border text-xs font-medium ${
                          isDark ? 'border-[#6B5261] text-[#D5CBD0]' : 'border-[#E8B8C5] text-[#A45E78]'
                        }`}
                      >
                        Đọc thử
                      </button>
                      <button
                        onClick={() => handleEditChapter(ch)}
                        className="min-h-[34px] px-3 py-1 rounded-full text-xs font-medium"
                        style={{ background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa ${ch.title}?`)) {
                            deleteChapter(ch.id);
                          }
                        }}
                        className="min-h-[34px] px-2.5 py-1 rounded-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-[#8F7D85] dark:text-[#D5CBD0]">
                  Chưa có chương truyện nào
                </div>
              )}
            </div>

            {/* Desktop View: Clean Table */}
            <div className="hidden sm:block">
              {activeNovelChapters.length > 0 ? (
                <table className="w-full text-left text-xs">
                  <thead className={`border-b ${isDark ? 'bg-[#241D26] border-[#594352] text-[#D5CBD0]' : 'bg-[#FFF6FB] border-[#F0D9E3] text-[#8B5D71]'}`}>
                    <tr>
                      <th className="py-3 px-4 uppercase font-medium">Chương</th>
                      <th className="py-3 px-4 uppercase font-medium">Tiêu Đề</th>
                      <th className="py-3 px-4 uppercase font-medium text-right">Lượt Xem</th>
                      <th className="py-3 px-4 uppercase font-medium text-right">Lượt Tim</th>
                      <th className="py-3 px-4 uppercase font-medium text-right">Bình Luận</th>
                      <th className="py-3 px-4 uppercase font-medium text-right">Số Từ</th>
                      <th className="py-3 px-4 uppercase font-medium text-center">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-[#594352]' : 'divide-[#F0D9E3]'}`}>
                    {activeNovelChapters.map((ch) => (
                      <tr key={ch.id} className="hover:bg-[#FFF6FB] dark:hover:bg-[#241D26] transition-colors">
                        <td className="py-3 px-4 font-bold text-[#8F7D85] dark:text-[#D5CBD0]" style={{ fontFamily: "'Vollkorn', serif" }}>
                          #{ch.chapterNumber}
                        </td>
                        <td className="py-3 px-4 font-medium max-w-xs truncate text-[#574D4C] dark:text-white">
                          {ch.title}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-[#574D4C] dark:text-white">
                          {ch.views.toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold" style={{ color: isDark ? ACCENT_DARK : ACCENT }}>
                          {ch.hearts.toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-[#574D4C] dark:text-white">
                          {ch.commentsCount}
                        </td>
                        <td className="py-3 px-4 text-right text-[#8F7D85] dark:text-[#D5CBD0]">
                          {ch.wordCount.toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openReader(ch.novelId, ch.id)}
                              className={`px-2.5 py-1 rounded-full border text-[11px] ${
                                isDark ? 'border-[#6B5261] text-[#D5CBD0]' : 'border-[#E8B8C5] text-[#A45E78]'
                              }`}
                              title="Xem trang đọc"
                            >
                              Đọc
                            </button>
                            <button
                              onClick={() => handleEditChapter(ch)}
                              className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                              style={{ background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }}
                              title="Sửa chương"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Bạn có chắc muốn xóa ${ch.title}?`)) {
                                  deleteChapter(ch.id);
                                }
                              }}
                              className="p-1 rounded-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px]"
                              title="Xóa chương"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-[#8F7D85] dark:text-[#D5CBD0]">
                  <p style={{ fontFamily: "'Vollkorn', serif" }} className="not-italic text-sm">
                    Chưa có chương truyện nào
                  </p>
                  <button
                    onClick={() => handleOpenNewChapter(activeNovel?.id || '')}
                    className="mt-3 px-4 py-1.5 rounded-full border text-xs"
                    style={isDark ? { borderColor: '#6B5261', color: '#F2B3C1' } : { borderColor: '#E8B8C5', color: '#A45E78' }}
                  >
                    Thêm chương đầu tiên
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NOVELS MANAGER */}
      {activeTab === 'novels' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Create / Edit Novel */}
          <div className="lg:col-span-5">
            <div
              className={`p-5 rounded-2xl border ${
                isDark ? 'bg-[#2B222C] border-[#6B5261]' : 'bg-white border-[#F5DFE7]'
              }`}
            >
              <div className={`flex items-center justify-between border-b pb-3 mb-4 ${isDark ? 'border-[#594352]' : 'border-[#F0D9E3]'}`}>
                <h3
                  style={{ fontFamily: "'Vollkorn', serif" }}
                  className="not-italic font-semibold text-sm sm:text-base text-[#6B4A57] dark:text-white"
                >
                  {editingNovelId ? 'Sửa Thông Tin Tiểu Thuyết' : 'Đăng Tiểu Thuyết Mới'}
                </h3>
                {editingNovelId && (
                  <button
                    onClick={() => {
                      setEditingNovelId(null);
                      setNovelTitle('');
                      setNovelSynopsis('');
                    }}
                    className="text-xs text-[#8F7D85] dark:text-[#D5CBD0] hover:underline"
                  >
                    Hủy chỉnh sửa
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveNovel} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[#8F7D85] dark:text-[#D5CBD0] font-semibold uppercase mb-1">Tên Tiểu Thuyết *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Vương Miện Của Hoa Sơn Trà"
                    value={novelTitle}
                    onChange={(e) => setNovelTitle(e.target.value)}
                    className={`w-full min-h-[38px] p-2.5 rounded-xl border focus:outline-none text-xs ${
                      isDark ? 'bg-[#241D26] border-[#594352] text-[#FAF5F6] focus:border-[#D79BAD]' : 'bg-[#FFF9FB] border-[#F0D9E3] focus:border-[#E7B6C5]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[#8F7D85] dark:text-[#D5CBD0] font-semibold uppercase mb-1">Tên Tác Giả / Bút Danh *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Canh Cụt Mộng Mơ / Tác giả gốc"
                    value={novelAuthorName}
                    onChange={(e) => setNovelAuthorName(e.target.value)}
                    className={`w-full min-h-[38px] p-2.5 rounded-xl border focus:outline-none text-xs ${
                      isDark ? 'bg-[#241D26] border-[#594352] text-[#FAF5F6] focus:border-[#D79BAD]' : 'bg-[#FFF9FB] border-[#F0D9E3] focus:border-[#E7B6C5]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[#8F7D85] dark:text-[#D5CBD0] font-semibold uppercase mb-1">Link Ảnh Bìa (URL)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={novelCoverImage}
                    onChange={(e) => setNovelCoverImage(e.target.value)}
                    className={`w-full min-h-[38px] p-2.5 rounded-xl border focus:outline-none text-xs ${
                      isDark ? 'bg-[#241D26] border-[#594352] text-[#FAF5F6] focus:border-[#D79BAD]' : 'bg-[#FFF9FB] border-[#F0D9E3] focus:border-[#E7B6C5]'
                    }`}
                  />
                  <p className="text-[10px] text-[#B79AA6] dark:text-[#D5CBD0] mt-1">
                    Để trống ô này — hệ thống sẽ tự tạo một bìa gradient hồng có tên truyện cho bạn.
                  </p>
                  {/* Presets */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {presetCovers.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNovelCoverImage(p.url)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                          isDark ? 'border-[#594352] text-[#D5CBD0] hover:border-[#D79BAD]' : 'border-[#F0D9E3] text-[#8B5D71] hover:border-[#E7B6C5]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[#8F7D85] dark:text-[#D5CBD0] font-semibold uppercase mb-1">Tóm Tắt Cốt Truyện *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Mô tả ngắn gọn giới thiệu cốt truyện..."
                    value={novelSynopsis}
                    onChange={(e) => setNovelSynopsis(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none font-lora text-xs leading-relaxed ${
                      isDark ? 'bg-[#241D26] border-[#594352] text-[#FAF5F6] focus:border-[#D79BAD]' : 'bg-[#FFF9FB] border-[#F0D9E3] focus:border-[#E7B6C5]'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#8F7D85] dark:text-[#D5CBD0] font-semibold uppercase mb-1">Thể Loại (Cách bằng dấu phẩy)</label>
                    <input
                      type="text"
                      placeholder="Lãng Mạn, Quý Tộc"
                      value={novelGenres}
                      onChange={(e) => setNovelGenres(e.target.value)}
                      className={`w-full min-h-[38px] p-2.5 rounded-xl border focus:outline-none text-xs ${
                        isDark ? 'bg-[#241D26] border-[#594352] text-[#FAF5F6] focus:border-[#D79BAD]' : 'bg-[#FFF9FB] border-[#F0D9E3] focus:border-[#E7B6C5]'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[#8F7D85] dark:text-[#D5CBD0] font-semibold uppercase mb-1">Trạng Thái</label>
                    <select
                      value={novelStatus}
                      onChange={(e) => setNovelStatus(e.target.value as any)}
                      className={`w-full min-h-[38px] p-2.5 rounded-xl border focus:outline-none text-xs ${
                        isDark ? 'bg-[#241D26] border-[#594352] text-[#FAF5F6] focus:border-[#D79BAD]' : 'bg-[#FFF9FB] border-[#F0D9E3] focus:border-[#E7B6C5]'
                      }`}
                    >
                      <option value="ongoing">Đang tiến hành</option>
                      <option value="completed">Đã hoàn thành</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full min-h-[40px] py-2 rounded-full uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity text-xs"
                    style={{ background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }}
                  >
                    {editingNovelId ? 'Lưu Cập Nhật' : 'Đăng Tác Phẩm'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Existing Novels List */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[9px] ${isDark ? 'text-[#7A5869]' : 'text-[#E9B8C2]'}`}>𝜗𝜚</span>
              <h3
                style={{ fontFamily: "'Vollkorn', serif" }}
                className="not-italic font-semibold text-xl text-[#6B4A57] dark:text-white"
              >
                Danh Sách Truyện Của Bạn ({authoredNovels.length})
              </h3>
            </div>

            <div className="space-y-3">
              {authoredNovels.length === 0 ? (
                <div
                  className={`relative p-8 text-center rounded-2xl border overflow-visible ${
                    isDark ? 'bg-[#2B222C] border-[#6B5261]' : 'bg-white border-[#F0D9E3]'
                  }`}
                >
                  <div
                    className={`pointer-events-none select-none absolute top-3 right-4 text-[9px] leading-[1.7] hidden sm:block ${
                      isDark ? 'text-[#7A5869]/60' : 'text-[#F2C7DA]/70'
                    }`}
                  >
                    ✧　⋆
                  </div>
                  <span className="inline-block w-3 h-3 rounded-full bg-[#E8A0B8] mb-3" />
                  <p style={{ fontFamily: "'Vollkorn', serif" }} className="not-italic text-base font-medium text-[#574D4C] dark:text-white">
                    Chưa có tác phẩm nào
                  </p>
                  <p className="text-xs text-[#8F7D85] dark:text-[#D5CBD0] mt-1">
                    Điền biểu mẫu bên cạnh để xuất bản tác phẩm đầu tiên của bạn.
                  </p>
                </div>
              ) : (
                authoredNovels.map((novel) => {
                  const nChapters = chapters.filter((c) => c.novelId === novel.id);
                  return (
                    <div
                      key={novel.id}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                        isDark ? 'bg-[#2B222C] border-[#6B5261] hover:border-[#D79BAD]' : 'bg-white border-[#F5DFE7] hover:border-[#E7B6C5]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`relative p-1 rounded-xl border shrink-0 ${
                            isDark ? 'bg-gradient-to-b from-[#352936] to-[#2B222C] border-[#6B5261]' : 'bg-gradient-to-b from-[#FFFAFD] to-white border-[#F5DFE7]'
                          }`}
                        >
                          <img src={novel.coverImage} alt={novel.title} className="w-12 h-16 rounded-lg object-cover" />
                        </div>
                        <div>
                          <h4
                            style={{ fontFamily: "'Vollkorn', serif" }}
                            className="not-italic font-semibold text-lg text-[#6B4A57] dark:text-white"
                          >
                            {novel.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#8F7D85] dark:text-[#D5CBD0] mt-0.5">
                            <span className="font-medium" style={{ color: isDark ? ACCENT_DARK : '#B4587E' }}>Tác giả: {novel.authorName}</span>
                            <span>•</span>
                            <span>{nChapters.length} chương</span>
                            <span>•</span>
                            <span>{novel.totalViews.toLocaleString('vi-VN')} lượt xem</span>
                            <span>•</span>
                            <span style={{ color: isDark ? ACCENT_DARK : ACCENT }}>{novel.totalHearts.toLocaleString('vi-VN')} tim</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                        {(novel.chapterIndex?.length || 0) !== novel.chaptersCount && novel.chaptersCount > 0 && (
                          <button
                            onClick={() => handleRebuildChapterIndex(novel)}
                            disabled={rebuildingNovelId === novel.id}
                            title="Truyện này đăng trước khi có tính năng mục lục nhẹ — bấm 1 lần để mục lục tải nhanh hơn, không cần đụng lại sau"
                            className={`min-h-[34px] px-3 py-1 rounded-full border text-xs font-medium transition-colors disabled:opacity-50 ${
                              isDark ? 'border-[#6B5261] text-[#D5CBD0] hover:border-[#D79BAD]' : 'border-[#E8B8C5] text-[#A45E78] hover:border-[#D985A2]'
                            }`}
                          >
                            {rebuildingNovelId === novel.id ? 'Đang làm mới...' : 'Làm mới danh sách chương'}
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenNewChapter(novel.id)}
                          className={`min-h-[34px] px-3 py-1 rounded-full border text-xs font-medium transition-colors ${
                            isDark ? 'border-[#6B5261] text-[#F2B3C1] hover:bg-[#3A2935]' : 'border-[#E8B8C5] text-[#A45E78] hover:bg-[#FCEEF3]'
                          }`}
                        >
                          + Viết chương
                        </button>
                        <button
                          onClick={() => handleEditNovel(novel)}
                          className="min-h-[34px] px-3 py-1 rounded-full text-xs font-medium transition-opacity hover:opacity-90"
                          style={{ background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }}
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa truyện "${novel.title}" và toàn bộ chương của nó?`)) {
                              deleteNovel(novel.id);
                            }
                          }}
                          className="min-h-[34px] p-2 rounded-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Xóa truyện"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CHAPTER EDITOR */}
      {activeTab === 'chapter_editor' && (
        <div className="max-w-4xl mx-auto">
          {authoredNovels.length === 0 ? (
            <div
              className={`relative p-8 text-center rounded-2xl border overflow-visible ${
                isDark ? 'bg-[#2B222C] border-[#6B5261]' : 'bg-white border-[#F0D9E3]'
              }`}
            >
              <div
                className={`pointer-events-none select-none absolute top-3 right-4 text-[9px] leading-[1.7] hidden sm:block ${
                  isDark ? 'text-[#7A5869]/60' : 'text-[#F2C7DA]/70'
                }`}
              >
                ✧　⋆
              </div>
              <span className="inline-block w-3 h-3 rounded-full bg-[#E8A0B8] mb-3" />
              <p style={{ fontFamily: "'Vollkorn', serif" }} className="not-italic text-base font-medium text-[#574D4C] dark:text-white">
                Bạn chưa có tiểu thuyết nào để viết chương
              </p>
              <p className="text-xs text-[#8F7D85] dark:text-[#D5CBD0] mt-1 mb-4">
                Vui lòng tạo một tiểu thuyết mới trước khi bắt đầu viết hoặc sửa chương truyện.
              </p>
              <button
                onClick={() => setActiveTab('novels')}
                className="px-4 py-2 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity"
                style={{ background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }}
              >
                Tạo tiểu thuyết ngay
              </button>
            </div>
          ) : (
            <div
              className={`p-5 sm:p-7 rounded-2xl border ${
                isDark ? 'bg-[#2B222C] border-[#6B5261]' : 'bg-white border-[#F5DFE7]'
              }`}
            >
              <div className={`flex items-center justify-between border-b pb-4 mb-5 ${isDark ? 'border-[#594352]' : 'border-[#F0D9E3]'}`}>
                <div>
                  <h3
                    style={{ fontFamily: "'Vollkorn', serif" }}
                    className="not-italic text-2xl font-semibold text-[#6B4A57] dark:text-white"
                  >
                    {editingChapterId ? 'Chỉnh Sửa Chương Truyện' : 'Sửa & Viết Chương Mới'}
                  </h3>
                  <p className="text-xs text-[#8F7D85] dark:text-[#D5CBD0]">
                    Mỗi đoạn văn cách nhau bởi 1 dòng trống để độc giả có thể bình luận tương tác
                  </p>
                </div>

                {editingChapterId && (
                  <button
                    onClick={() => handleOpenNewChapter(selectedNovelIdForChapter)}
                    className="text-xs text-[#8F7D85] dark:text-[#D5CBD0] hover:underline"
                  >
                    Viết chương mới
                  </button>
                )}
              </div>


              {/* DANH SÁCH CÁC CHƯƠNG ĐÃ ĐĂNG / ĐÃ CÓ */}
              <div className={`mb-5 rounded-2xl border overflow-hidden ${isDark ? 'border-[#6B5261]' : 'border-[#F0D9E3]'}`}>
                <div className={`px-4 py-3 border-b ${isDark ? 'bg-[#352936] border-[#594352]' : 'bg-[#FFF6FB] border-[#F0D9E3]'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4
                        style={{ fontFamily: "'Vollkorn', serif" }}
                        className="not-italic font-semibold text-sm text-[#574D4C] dark:text-white"
                      >
                        Các chương đã đăng
                      </h4>
                      <p className="text-[10px] text-[#8F7D85] dark:text-[#D5CBD0] mt-0.5">
                        Chọn <strong>Sửa</strong> để mở lại chương và cập nhật nội dung, hoặc <strong>Xóa</strong> để xóa chương khỏi Firebase.
                      </p>
                    </div>
                    <span className={`shrink-0 text-[10px] px-2 py-1 rounded-full border ${isDark ? 'bg-[#2B222C] border-[#6B5261] text-[#D5CBD0]' : 'bg-white border-[#F0D9E3] text-[#8B5D71]'}`}>
                      {activeNovelChapters.length} chương
                    </span>
                  </div>
                </div>

                {activeNovelChapters.length > 0 ? (
                  <div className={`divide-y max-h-[360px] overflow-y-auto ${isDark ? 'divide-[#594352]' : 'divide-[#F0D9E3]'}`}>
                    {activeNovelChapters.map((ch) => (
                      <div
                        key={ch.id}
                        className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FFF6FB] dark:hover:bg-[#241D26] transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FFF5FA] dark:bg-[#2B222C] text-[#8F7D85] dark:text-[#D5CBD0]">
                              Chương {ch.chapterNumber}
                            </span>
                            {!ch.isPublished && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300">
                                Bản nháp
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs font-medium truncate text-[#574D4C] dark:text-white" title={ch.title}>
                            {ch.title}
                          </p>
                          <p className="text-[10px] text-[#8F7D85] dark:text-[#D5CBD0] mt-0.5">
                            {ch.views.toLocaleString('vi-VN')} lượt xem · {ch.hearts.toLocaleString('vi-VN')} tim · {ch.commentsCount} bình luận
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditChapter(ch)}
                            className="min-h-[34px] px-3 py-1.5 rounded-full text-[11px] font-semibold hover:opacity-90 transition-opacity"
                            style={{ background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }}
                          >
                            Sửa chương
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const ok = window.confirm(
                                `Bạn có chắc muốn xóa "${ch.title}"?\n\nChương sẽ bị xóa khỏi Firebase cùng các bình luận thuộc chương này.`
                              );
                              if (!ok) return;
                              deleteChapter(ch.id);
                              if (editingChapterId === ch.id) {
                                setEditingChapterId(null);
                                setChapterContentText('');
                                setChapterTitle('');
                              }
                            }}
                            className="min-h-[34px] px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-900/60 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[11px] font-semibold"
                          >
                            Xóa chương
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 text-center text-xs text-[#8F7D85] dark:text-[#D5CBD0]">
                    Chưa có chương nào được đăng cho tiểu thuyết này.
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveChapter} className="space-y-4 text-xs">
                {/* Novel Selector */}
                <div>
                  <label className="block text-[#8F7D85] dark:text-[#D5CBD0] font-semibold uppercase mb-1">Thuộc Tiểu Thuyết *</label>
                  <select
                    value={selectedNovelIdForChapter}
                    onChange={(e) => {
                      setSelectedNovelIdForChapter(e.target.value);
                      const novelChs = chapters.filter((c) => c.novelId === e.target.value);
                      const nextNum = novelChs.length > 0 ? Math.max(...novelChs.map((c) => c.chapterNumber)) + 1 : 1;
                      setChapterNumber(nextNum);
                      setChapterTitle(`Chương ${nextNum}: `);
                    }}
                    className={`w-full min-h-[38px] p-2.5 rounded-xl border focus:outline-none font-medium ${
                      isDark ? 'bg-[#241D26] border-[#594352] text-[#FAF5F6] focus:border-[#D79BAD]' : 'bg-[#FFF9FB] border-[#F0D9E3] text-[#574D4C] focus:border-[#E7B6C5]'
                    }`}
                  >
                    {authoredNovels.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-[#8F7D85] dark:text-[#D5CBD0] font-semibold uppercase mb-1">Số Thứ Tự Chương</label>
                    <input
                      type="number"
                      min={1}
                      value={chapterNumber}
                      onChange={(e) => setChapterNumber(Number(e.target.value))}
                      className={`w-full min-h-[38px] p-2.5 rounded-xl border focus:outline-none text-xs font-semibold ${
                        isDark ? 'bg-[#241D26] border-[#594352] text-[#FAF5F6] focus:border-[#D79BAD]' : 'bg-[#FFF9FB] border-[#F0D9E3] focus:border-[#E7B6C5]'
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[#8F7D85] dark:text-[#D5CBD0] font-semibold uppercase mb-1">Tiêu Đề Chương *</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Chương 5: Lời tỏ tình dưới ánh trăng..."
                      value={chapterTitle}
                      onChange={(e) => setChapterTitle(e.target.value)}
                      className={`w-full min-h-[38px] p-2.5 rounded-xl border focus:outline-none text-xs sm:text-sm ${
                        isDark ? 'bg-[#241D26] border-[#594352] text-[#FAF5F6] focus:border-[#D79BAD]' : 'bg-[#FFF9FB] border-[#F0D9E3] focus:border-[#E7B6C5]'
                      }`}
                    />
                  </div>
                </div>

                {/* Main Chapter Content Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[#8F7D85] dark:text-[#D5CBD0] font-semibold uppercase">Nội Dung Chương Truyện *</label>
                    <div className="text-[11px] text-[#8F7D85] dark:text-[#D5CBD0] flex items-center gap-3">
                      <span>
                        Đoạn văn:{' '}
                        <strong className="text-[#574D4C] dark:text-white">
                          {currentParagraphCount}
                        </strong>
                      </span>
                      <span>
                        Số từ:{' '}
                        <strong className="text-[#574D4C] dark:text-white">
                          {currentWordCount}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <textarea
                    rows={14}
                    required
                    placeholder="Nhập nội dung chương truyện tại đây...&#10;&#10;Mỗi đoạn văn cách nhau bởi 1 dòng trống để tạo thành một khối bình luận tương tác riêng cho độc giả."
                    value={chapterContentText}
                    onChange={(e) => setChapterContentText(e.target.value)}
                    className={`w-full p-3.5 rounded-xl border focus:outline-none font-lora text-xs sm:text-sm leading-relaxed ${
                      isDark ? 'bg-[#241D26] border-[#594352] text-[#FAF5F6] focus:border-[#D79BAD]' : 'bg-[#FFF9FB] border-[#F0D9E3] text-[#574D4C] focus:border-[#E7B6C5]'
                    }`}
                  />
                </div>

                {/* Submit Buttons */}
                <div className={`pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isDark ? 'border-[#594352]' : 'border-[#F0D9E3]'}`}>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      style={{ accentColor: isDark ? ACCENT_DARK : ACCENT }}
                    />
                    <span className="text-[#574D4C] dark:text-white">Xuất bản ngay</span>
                  </label>

                  <button
                    type="submit"
                    className="min-h-[40px] px-6 py-2 rounded-full uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity text-xs"
                    style={{ background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }}
                  >
                    {editingChapterId ? 'Cập nhật chương' : 'Đăng chương'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};