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

  // Derived author stats
  const authoredNovels = currentUser?.role === 'admin'
    ? novels
    : novels.filter((n) => n.authorId === currentUser?.id);
  const authoredNovelIds = new Set(authoredNovels.map((n) => n.id));
  const authoredChapters = chapters.filter((c) => authoredNovelIds.has(c.novelId));

  const totalViews = authoredNovels.reduce((acc, n) => acc + n.totalViews, 0);
  const totalHearts = authoredNovels.reduce((acc, n) => acc + n.totalHearts, 0);
  const totalComments = comments.filter((c) => authoredNovelIds.has(c.novelId)).length;
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
    setNovelCoverImage('https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80');
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

    if (editingNovelId) {
      updateNovel(editingNovelId, {
        title: novelTitle.trim(),
        authorName: resolvedAuthorName,
        coverImage: novelCoverImage.trim() || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
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
        coverImage: novelCoverImage.trim() || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
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
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E1B1D] text-[#FAF5F6] dark:bg-[#FAF5F6] dark:text-[#121113] px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 border border-neutral-700">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Dashboard Top Header — matches the centered style used on Bảng Xếp Hạng */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="font-playfair italic text-2xl sm:text-4xl font-normal text-[#1E1B1D] dark:text-[#FFFFFF]">
          Quản Lý & Đăng Truyện
        </h1>

        {/* Author info & Quick action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          {currentUser && (
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border border-[#DAC8CE] dark:border-[#4B3E52] bg-[#FFFFFF]/60 dark:bg-[#1E1B24]/60 hover:border-[#1E1B1D] dark:hover:border-white transition-colors text-left"
              title="Nhấn để đổi tên và avatar tác giả"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover"
              />
              <div className="text-left">
                <span className="text-[11px] font-bold block leading-tight truncate max-w-[100px] text-[#1E1B1D] dark:text-white">
                  {currentUser.name}
                </span>
                <span className="text-[9px] text-[#8F7D85] block">
                  Sửa hồ sơ
                </span>
              </div>
            </button>
          )}

          <button
            onClick={handleOpenNovelCreate}
            className="min-h-[38px] px-4 py-1.5 rounded-lg bg-[#1E1B1D] text-[#FAF5F6] dark:bg-[#FAF5F6] dark:text-[#121113] text-xs font-medium hover:opacity-90 transition-opacity shadow-xs"
          >
            <span>Đăng truyện mới</span>
          </button>
          <button
            onClick={() => handleOpenNewChapter(activeNovel?.id || novels[0]?.id)}
            className="min-h-[38px] px-4 py-1.5 rounded-lg border border-[#1E1B1D] dark:border-[#FAF5F6] text-xs font-medium hover:bg-[#FAF0F3] dark:hover:bg-[#201C24] transition-colors"
          >
            <span>Viết chương mới</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#ECE0E4] dark:border-[#2E2833] pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all border ${
            activeTab === 'analytics'
              ? 'bg-[#1E1B1D] text-[#FAF5F6] border-[#1E1B1D] dark:bg-[#FAF5F6] dark:text-[#121113] shadow-xs'
              : isDark
              ? 'border-[#38323D] text-[#A69B9E] hover:border-white'
              : 'border-[#DAC8CE] text-[#6E5D65] hover:border-[#1E1B1D]'
          }`}
        >
          <span>Thống kê chi tiết</span>
        </button>

        <button
          onClick={() => setActiveTab('novels')}
          className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all border ${
            activeTab === 'novels'
              ? 'bg-[#1E1B1D] text-[#FAF5F6] border-[#1E1B1D] dark:bg-[#FAF5F6] dark:text-[#121113] shadow-xs'
              : isDark
              ? 'border-[#38323D] text-[#A69B9E] hover:border-white'
              : 'border-[#DAC8CE] text-[#6E5D65] hover:border-[#1E1B1D]'
          }`}
        >
          <span>Quản lý truyện ({authoredNovels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('chapter_editor')}
          className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all border ${
            activeTab === 'chapter_editor'
              ? 'bg-[#1E1B1D] text-[#FAF5F6] border-[#1E1B1D] dark:bg-[#FAF5F6] dark:text-[#121113] shadow-xs'
              : isDark
              ? 'border-[#38323D] text-[#A69B9E] hover:border-white'
              : 'border-[#DAC8CE] text-[#6E5D65] hover:border-[#1E1B1D]'
          }`}
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
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-[#18161B] border-[#2E2833]' : 'bg-[#FFFFFF] border-[#ECE0E4]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8F7D85] dark:text-[#D5CBD0]">Tổng lượt xem</span>
                <Eye className="w-4 h-4 text-[#8F7D85] dark:text-[#D5CBD0]" />
              </div>
              <div className="font-playfair text-xl sm:text-2xl font-semibold mt-2 text-[#1E1B1D] dark:text-[#FAF5F6]">
                {totalViews.toLocaleString('vi-VN')}
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-[#18161B] border-[#2E2833]' : 'bg-[#FFFFFF] border-[#ECE0E4]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8F7D85] dark:text-[#D5CBD0]">Lượt yêu thích</span>
                <Heart className="w-4 h-4 text-[#E0A8B6]" />
              </div>
              <div className="font-playfair text-xl sm:text-2xl font-semibold mt-2 text-[#E0A8B6]">
                {totalHearts.toLocaleString('vi-VN')}
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-[#18161B] border-[#2E2833]' : 'bg-[#FFFFFF] border-[#ECE0E4]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8F7D85] dark:text-[#D5CBD0]">Bình luận đoạn văn</span>
                <MessageSquare className="w-4 h-4 text-[#8F7D85] dark:text-[#D5CBD0]" />
              </div>
              <div className="font-playfair text-xl sm:text-2xl font-semibold mt-2 text-[#1E1B1D] dark:text-[#FAF5F6]">
                {totalComments.toLocaleString('vi-VN')}
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-[#18161B] border-[#2E2833]' : 'bg-[#FFFFFF] border-[#ECE0E4]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8F7D85] dark:text-[#D5CBD0]">Tổng số chương</span>
                <BookOpen className="w-4 h-4 text-[#8F7D85] dark:text-[#D5CBD0]" />
              </div>
              <div className="font-playfair text-xl sm:text-2xl font-semibold mt-2 text-[#1E1B1D] dark:text-[#FAF5F6]">
                {totalChaptersCount}
              </div>
            </div>
          </div>

          {/* Chapter-by-Chapter In-Depth Analytics */}
          <div
            className={`rounded-2xl border overflow-hidden shadow-xs ${
              isDark ? 'bg-[#18161B] border-[#2E2833]' : 'bg-[#FFFFFF] border-[#ECE0E4]'
            }`}
          >
            <div className="p-4 sm:p-5 border-b border-[#ECE0E4] dark:border-[#2E2833] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-playfair font-semibold text-sm sm:text-base text-[#1E1B1D] dark:text-[#FAF5F6]">
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
                className={`min-h-[36px] px-3 py-1 text-xs rounded-lg border focus:outline-none focus:border-[#1E1B1D] dark:focus:border-white font-medium ${
                  isDark ? 'bg-[#1F1C23] border-[#38323D] text-[#FAF5F6]' : 'bg-[#FAF5F6] border-[#DAC8CE] text-[#1E1B1D]'
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
            <div className="sm:hidden divide-y divide-[#ECE0E4] dark:divide-[#2E2833]">
              {activeNovelChapters.length > 0 ? (
                activeNovelChapters.map((ch) => (
                  <div key={ch.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-[#8F7D85] dark:text-[#D5CBD0] uppercase block">
                          Chương #{ch.chapterNumber}
                        </span>
                        <h4 className="font-playfair font-medium text-sm text-[#1E1B1D] dark:text-[#FAF5F6]">
                          {ch.title}
                        </h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF0F3] dark:bg-[#201C25] text-[#8F7D85] dark:text-[#D5CBD0]">
                        {ch.wordCount.toLocaleString('vi-VN')} chữ
                      </span>
                    </div>

                    {/* Stats Badges */}
                    <div className="grid grid-cols-3 gap-2 bg-[#FAF5F6] dark:bg-[#151317] p-2.5 rounded-lg text-center text-xs">
                      <div>
                        <span className="text-[10px] text-[#8F7D85] dark:text-[#D5CBD0] block">Lượt xem</span>
                        <span className="font-semibold text-[#1E1B1D] dark:text-[#FAF5F6]">{ch.views.toLocaleString('vi-VN')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8F7D85] dark:text-[#D5CBD0] block">Lượt tim</span>
                        <span className="font-semibold text-[#E0A8B6]">{ch.hearts.toLocaleString('vi-VN')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8F7D85] dark:text-[#D5CBD0] block">Bình luận</span>
                        <span className="font-semibold text-[#1E1B1D] dark:text-[#FAF5F6]">{ch.commentsCount}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => openReader(ch.novelId, ch.id)}
                        className="min-h-[34px] px-3 py-1 rounded-md border border-current text-xs font-medium"
                      >
                        Đọc thử
                      </button>
                      <button
                        onClick={() => handleEditChapter(ch)}
                        className="min-h-[34px] px-3 py-1 rounded-md bg-[#1E1B1D] text-white dark:bg-white dark:text-black text-xs font-medium"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa ${ch.title}?`)) {
                            deleteChapter(ch.id);
                          }
                        }}
                        className="min-h-[34px] px-2.5 py-1 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs"
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
                  <thead className={`border-b ${isDark ? 'bg-[#141216] border-[#2E2833] text-[#D5CBD0]' : 'bg-[#FAF5F6] border-[#ECE0E4] text-[#6E5D65]'}`}>
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
                  <tbody className="divide-y divide-[#ECE0E4] dark:divide-[#2E2833]">
                    {activeNovelChapters.map((ch) => (
                      <tr key={ch.id} className="hover:bg-[#FAF4F6] dark:hover:bg-[#1F1C23] transition-colors">
                        <td className="py-3 px-4 font-bold font-playfair text-[#8F7D85] dark:text-[#D5CBD0]">
                          #{ch.chapterNumber}
                        </td>
                        <td className="py-3 px-4 font-medium max-w-xs truncate text-[#1E1B1D] dark:text-[#FAF5F6]">
                          {ch.title}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-[#1E1B1D] dark:text-[#FAF5F6]">
                          {ch.views.toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3 px-4 text-right text-[#E0A8B6] font-semibold">
                          {ch.hearts.toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-[#1E1B1D] dark:text-[#FAF5F6]">
                          {ch.commentsCount}
                        </td>
                        <td className="py-3 px-4 text-right text-[#8F7D85] dark:text-[#D5CBD0]">
                          {ch.wordCount.toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openReader(ch.novelId, ch.id)}
                              className="px-2.5 py-1 rounded-md border border-current text-[11px]"
                              title="Xem trang đọc"
                            >
                              Đọc
                            </button>
                            <button
                              onClick={() => handleEditChapter(ch)}
                              className="px-2.5 py-1 rounded-md bg-[#1E1B1D] text-white dark:bg-white dark:text-black text-[11px]"
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
                              className="p-1 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px]"
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
                  <p className="font-playfair text-sm">Chưa có chương truyện nào</p>
                  <button
                    onClick={() => handleOpenNewChapter(activeNovel?.id || '')}
                    className="mt-3 px-4 py-1.5 rounded-lg border border-[#1E1B1D] dark:border-white text-xs"
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
              className={`p-5 rounded-2xl border shadow-xs ${
                isDark ? 'bg-[#18161B] border-[#2E2833]' : 'bg-[#FFFFFF] border-[#ECE0E4]'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-3 mb-4 border-[#ECE0E4] dark:border-[#2E2833]">
                <h3 className="font-playfair font-semibold text-sm sm:text-base text-[#1E1B1D] dark:text-[#FAF5F6]">
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
                    className={`w-full min-h-[38px] p-2.5 rounded-lg border focus:outline-none focus:border-[#1E1B1D] dark:focus:border-white text-xs ${
                      isDark ? 'bg-[#1F1C23] border-[#38323D] text-[#FAF5F6]' : 'bg-[#FAF5F6] border-[#DED0D5]'
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
                    className={`w-full min-h-[38px] p-2.5 rounded-lg border focus:outline-none focus:border-[#1E1B1D] dark:focus:border-white text-xs ${
                      isDark ? 'bg-[#1F1C23] border-[#38323D] text-[#FAF5F6]' : 'bg-[#FAF5F6] border-[#DED0D5]'
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
                    className={`w-full min-h-[38px] p-2.5 rounded-lg border focus:outline-none focus:border-[#1E1B1D] dark:focus:border-white text-xs ${
                      isDark ? 'bg-[#1F1C23] border-[#38323D] text-[#FAF5F6]' : 'bg-[#FAF5F6] border-[#DED0D5]'
                    }`}
                  />
                  {/* Presets */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {presetCovers.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNovelCoverImage(p.url)}
                        className="text-[10px] px-2 py-0.5 rounded-md border border-[#DAC8CE] dark:border-[#38323D] hover:border-[#1E1B1D] text-[#6E5D65] dark:text-[#D5CBD0]"
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
                    className={`w-full p-2.5 rounded-lg border focus:outline-none focus:border-[#1E1B1D] dark:focus:border-white font-lora text-xs leading-relaxed ${
                      isDark ? 'bg-[#1F1C23] border-[#38323D] text-[#FAF5F6]' : 'bg-[#FAF5F6] border-[#DED0D5]'
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
                      className={`w-full min-h-[38px] p-2.5 rounded-lg border focus:outline-none focus:border-[#1E1B1D] dark:focus:border-white text-xs ${
                        isDark ? 'bg-[#1F1C23] border-[#38323D] text-[#FAF5F6]' : 'bg-[#FAF5F6] border-[#DED0D5]'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[#8F7D85] dark:text-[#D5CBD0] font-semibold uppercase mb-1">Trạng Thái</label>
                    <select
                      value={novelStatus}
                      onChange={(e) => setNovelStatus(e.target.value as any)}
                      className={`w-full min-h-[38px] p-2.5 rounded-lg border focus:outline-none focus:border-[#1E1B1D] dark:focus:border-white text-xs ${
                        isDark ? 'bg-[#1F1C23] border-[#38323D] text-[#FAF5F6]' : 'bg-[#FAF5F6] border-[#DED0D5]'
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
                    className="w-full min-h-[40px] py-2 rounded-lg bg-[#1E1B1D] text-[#FAF5F6] dark:bg-[#FAF5F6] dark:text-[#121113] uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity text-xs shadow-xs"
                  >
                    {editingNovelId ? 'Lưu Cập Nhật' : 'Đăng Tác Phẩm'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Existing Novels List */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-playfair font-semibold text-sm sm:text-base mb-2 text-[#1E1B1D] dark:text-[#FAF5F6]">
              Danh Sách Truyện Của Bạn ({authoredNovels.length})
            </h3>

            <div className="space-y-3">
              {authoredNovels.length === 0 ? (
                <div
                  className={`p-8 text-center rounded-2xl border ${
                    isDark ? 'bg-[#18161B] border-[#2E2833]' : 'bg-[#FFFFFF] border-[#ECE0E4]'
                  }`}
                >
                  <p className="font-playfair text-sm text-[#1E1B1D] dark:text-[#FAF5F6]">Chưa có tác phẩm nào</p>
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
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs ${
                        isDark ? 'bg-[#18161B] border-[#2E2833]' : 'bg-[#FFFFFF] border-[#ECE0E4]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 border border-[#DAC8CE] dark:border-[#38323D]">
                          <img src={novel.coverImage} alt={novel.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-playfair italic font-semibold text-sm text-[#1E1B1D] dark:text-[#FAF5F6]">{novel.title}</h4>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#8F7D85] dark:text-[#D5CBD0] mt-0.5">
                            <span className="font-medium text-[#1E1B1D] dark:text-[#FAF5F6]">Tác giả: {novel.authorName}</span>
                            <span>•</span>
                            <span>{nChapters.length} chương</span>
                            <span>•</span>
                            <span>{novel.totalViews.toLocaleString('vi-VN')} lượt xem</span>
                            <span>•</span>
                            <span className="text-[#E0A8B6]">{novel.totalHearts.toLocaleString('vi-VN')} tim</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => handleOpenNewChapter(novel.id)}
                          className="min-h-[34px] px-3 py-1 rounded-lg border border-[#1E1B1D] dark:border-white text-xs font-medium"
                        >
                          + Viết chương
                        </button>
                        <button
                          onClick={() => handleEditNovel(novel)}
                          className="min-h-[34px] px-3 py-1 rounded-lg bg-[#FAF0F3] dark:bg-[#201C25] text-[#1E1B1D] dark:text-[#FAF5F6] text-xs font-medium border border-transparent hover:border-[#DAC8CE]"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa truyện "${novel.title}" và toàn bộ chương của nó?`)) {
                              deleteNovel(novel.id);
                            }
                          }}
                          className="min-h-[34px] p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
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
              className={`p-8 text-center rounded-2xl border shadow-xs ${
                isDark ? 'bg-[#18161B] border-[#2E2833]' : 'bg-[#FFFFFF] border-[#ECE0E4]'
              }`}
            >
              <p className="font-playfair text-base font-medium text-[#1E1B1D] dark:text-[#FAF5F6]">
                Bạn chưa có tiểu thuyết nào để viết chương
              </p>
              <p className="text-xs text-[#8F7D85] dark:text-[#D5CBD0] mt-1 mb-4">
                Vui lòng tạo một tiểu thuyết mới trước khi bắt đầu viết hoặc sửa chương truyện.
              </p>
              <button
                onClick={() => setActiveTab('novels')}
                className="px-4 py-2 rounded-lg bg-[#1E1B1D] text-white dark:bg-[#FAF5F6] dark:text-[#121113] text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Tạo tiểu thuyết ngay
              </button>
            </div>
          ) : (
            <div
              className={`p-5 sm:p-7 rounded-2xl border shadow-xs ${
                isDark ? 'bg-[#18161B] border-[#2E2833]' : 'bg-[#FFFFFF] border-[#ECE0E4]'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-4 mb-5 border-[#ECE0E4] dark:border-[#2E2833]">
                <div>
                  <h3 className="font-playfair font-semibold text-base sm:text-lg text-[#1E1B1D] dark:text-[#FAF5F6]">
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
              <div className="mb-5 rounded-xl border border-[#ECE0E4] dark:border-[#2E2833] overflow-hidden">
                <div className="px-4 py-3 bg-[#FAF5F6] dark:bg-[#151317] border-b border-[#ECE0E4] dark:border-[#2E2833]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-playfair font-semibold text-sm text-[#1E1B1D] dark:text-[#FAF5F6]">
                        Các chương đã đăng
                      </h4>
                      <p className="text-[10px] text-[#8F7D85] dark:text-[#D5CBD0] mt-0.5">
                        Chọn <strong>Sửa</strong> để mở lại chương và cập nhật nội dung, hoặc <strong>Xóa</strong> để xóa chương khỏi Firebase.
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] px-2 py-1 rounded-md bg-white dark:bg-[#1F1C23] border border-[#DAC8CE] dark:border-[#38323D] text-[#6E5D65] dark:text-[#D5CBD0]">
                      {activeNovelChapters.length} chương
                    </span>
                  </div>
                </div>

                {activeNovelChapters.length > 0 ? (
                  <div className="divide-y divide-[#ECE0E4] dark:divide-[#2E2833] max-h-[360px] overflow-y-auto">
                    {activeNovelChapters.map((ch) => (
                      <div
                        key={ch.id}
                        className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FCF8F9] dark:hover:bg-[#1C1920] transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FAF0F3] dark:bg-[#201C25] text-[#8F7D85] dark:text-[#D5CBD0]">
                              Chương {ch.chapterNumber}
                            </span>
                            {!ch.isPublished && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300">
                                Bản nháp
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs font-medium truncate text-[#1E1B1D] dark:text-[#FAF5F6]" title={ch.title}>
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
                            className="min-h-[34px] px-3 py-1.5 rounded-lg bg-[#1E1B1D] text-white dark:bg-white dark:text-black text-[11px] font-semibold hover:opacity-90"
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
                            className="min-h-[34px] px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[11px] font-semibold"
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
                    className={`w-full min-h-[38px] p-2.5 rounded-lg border focus:outline-none focus:border-[#1E1B1D] dark:focus:border-white font-medium ${
                      isDark ? 'bg-[#1F1C23] border-[#38323D] text-[#FAF5F6]' : 'bg-[#FAF5F6] border-[#DED0D5] text-[#1E1B1D]'
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
                    className={`w-full min-h-[38px] p-2.5 rounded-lg border focus:outline-none focus:border-[#1E1B1D] dark:focus:border-white text-xs font-semibold ${
                      isDark ? 'bg-[#1F1C23] border-[#38323D] text-[#FAF5F6]' : 'bg-[#FAF5F6] border-[#DED0D5]'
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
                    className={`w-full min-h-[38px] p-2.5 rounded-lg border focus:outline-none focus:border-[#1E1B1D] dark:focus:border-white text-xs sm:text-sm ${
                      isDark ? 'bg-[#1F1C23] border-[#38323D] text-[#FAF5F6]' : 'bg-[#FAF5F6] border-[#DED0D5]'
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
                      <strong className="text-[#1E1B1D] dark:text-[#FAF5F6]">
                        {currentParagraphCount}
                      </strong>
                    </span>
                    <span>
                      Số từ:{' '}
                      <strong className="text-[#1E1B1D] dark:text-[#FAF5F6]">
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
                  className={`w-full p-3.5 rounded-lg border focus:outline-none focus:border-[#1E1B1D] dark:focus:border-white font-lora text-xs sm:text-sm leading-relaxed ${
                    isDark ? 'bg-[#1F1C23] border-[#38323D] text-[#FAF5F6]' : 'bg-[#FAF5F6] border-[#DED0D5] text-[#1E1B1D]'
                  }`}
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-[#ECE0E4] dark:border-[#2E2833] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="accent-[#1E1B1D] dark:accent-white"
                  />
                  <span className="text-[#1E1B1D] dark:text-[#FAF5F6]">Xuất bản ngay</span>
                </label>

                <button
                  type="submit"
                  className="min-h-[40px] px-6 py-2 rounded-lg bg-[#1E1B1D] text-[#FAF5F6] dark:bg-[#FAF5F6] dark:text-[#121113] uppercase tracking-wider font-semibold hover:opacity-90 shadow-xs text-xs"
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