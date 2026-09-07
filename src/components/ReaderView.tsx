import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ReaderSettingsModal } from './ReaderSettingsModal';
import { ParagraphCommentDrawer } from './ParagraphCommentDrawer';
import { auth } from '../lib/firebase';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Heart,
  MessageSquare,
  SlidersHorizontal,
  List,
  X,
  Sparkles,
  Minimize2,
  Maximize2,
  Type,
  Minus,
  Plus,
} from 'lucide-react';

// Bảng màu hồng phẳng đồng bộ với NovelCard / NovelGrid / Leaderboard / Navbar / HomeHero.
// Dùng riêng cho khung "Danh Sách Chương" (mục lục) để đồng bộ toàn site.
const ACCENT = '#F0A8C8';
const ACCENT_DARK = '#EDA3B4';
const ACCENT_TEXT_DARK = '#2B222C';

export const ReaderView: React.FC = () => {
  const {
    novels,
    chapters,
    selectedNovelId,
    selectedChapterId,
    openReader,
    setActiveView,
    readerSettings,
    updateReaderSettings,
    targetParagraphIndex,
    recordView,
    toggleLikeChapter,
    currentUser,
    comments,
    recordReadingProgress,
    globalTheme,
    initializing,
    ensureChaptersForNovel,
  } = useApp();

  const [showSettings, setShowSettings] = useState(false);
  const [showChapterDrawer, setShowChapterDrawer] = useState(false);
  const [activeParagraphCommentIdx, setActiveParagraphCommentIdx] = useState<number | null>(null);
  const [hoveredParagraphIdx, setHoveredParagraphIdx] = useState<number | null>(null);
  const [likedAnimation, setLikedAnimation] = useState(false);

  // Chế độ Tập trung state
  const [zenMode, setZenMode] = useState(false);
  const [showZenControls, setShowZenControls] = useState(false);
  const [zenToast, setZenToast] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const paragraphRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const isDark = globalTheme === 'dark';

  const novel = novels.find((n) => n.id === selectedNovelId) || novels[0];
  const novelChapters = chapters
    .filter((c) => c.novelId === novel?.id)
    .sort((a, b) => a.chapterNumber - b.chapterNumber);

  const chapter = novelChapters.find((c) => c.id === selectedChapterId) || novelChapters[0];

  // The Reader normally only loads the current chapter (+ neighbors), not
  // the novel's full chapter list. The "Danh Sách Chương" drawer needs the
  // full list — but only fetches it when the novel's lightweight
  // chapterIndex (title/date/word count, no content) isn't already
  // complete, and only at the moment the drawer is actually opened.
  const hasCompleteChapterIndex = !!novel && novel.chaptersCount > 0 && (novel.chapterIndex?.length || 0) === novel.chaptersCount;
  useEffect(() => {
    if (showChapterDrawer && novel && !hasCompleteChapterIndex) {
      void ensureChaptersForNovel(novel.id);
    }
  }, [showChapterDrawer, novel?.id, hasCompleteChapterIndex]);

  const chapterListItems = hasCompleteChapterIndex
    ? [...novel!.chapterIndex!].sort((a, b) => a.chapterNumber - b.chapterNumber)
    : novelChapters.map((c) => ({
        id: c.id,
        chapterNumber: c.chapterNumber,
        title: c.title,
        releaseDate: c.releaseDate,
        wordCount: c.wordCount,
      }));

  const currentChapterIdx = novelChapters.findIndex((c) => c.id === chapter?.id);
  const prevChapter = currentChapterIdx > 0 ? novelChapters[currentChapterIdx - 1] : null;
  const nextChapter = currentChapterIdx < novelChapters.length - 1 ? novelChapters[currentChapterIdx + 1] : null;

  // A view is only eligible after the reader has stayed on this chapter for
  // roughly 10 seconds. Refreshing immediately does not create a new view.
  // A small random delay (0–6s extra) is added on top: when many readers
  // open the same promoted chapter within the same few seconds (e.g. right
  // after a PR post), their 10s timers would otherwise all fire in the same
  // instant, all trying to write to the SAME chapter/novel counter document
  // at once — which is exactly what Firestore's per-document write-rate
  // limit rejects. Spreading those writes out over a few extra seconds
  // meaningfully reduces how many land in the same instant.
  useEffect(() => {
    if (!chapter) return;
    const jitter = Math.floor(Math.random() * 6_000);
    const timer = window.setTimeout(() => {
      recordView(chapter.id);
    }, 10_000 + jitter);
    return () => window.clearTimeout(timer);
  }, [chapter?.id]);

  // Scroll to target paragraph if specified
  useEffect(() => {
    if (targetParagraphIndex !== null && paragraphRefs.current[targetParagraphIndex]) {
      setTimeout(() => {
        paragraphRefs.current[targetParagraphIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    }
  }, [targetParagraphIndex, chapter?.id]);

  // Keeps a shared ref up to date with whichever chapter/position is
  // currently on screen. Runs on every chapter change, but never talks to
  // Firestore — switching chapters *within the same novel* is still "still
  // reading this story", so there's nothing worth persisting yet (it would
  // just get overwritten moments later anyway, since history is keyed by
  // novel, one record per novel).
  const latestReadRef = useRef<{ novelId: string; chapterId: string; progress: number } | null>(null);

  useEffect(() => {
    if (!novel || !chapter) return;

    const computeProgress = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      return totalHeight > 0 ? Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100)) : 0;
    };

    latestReadRef.current = { novelId: novel.id, chapterId: chapter.id, progress: computeProgress() };

    const handleScroll = () => {
      latestReadRef.current = { novelId: novel.id, chapterId: chapter.id, progress: computeProgress() };
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [novel?.id, chapter?.id]);

  // Persists the last-known position to Firestore only when the reader
  // actually leaves THIS NOVEL — switching to a different novel, leaving
  // the reader entirely, hiding the tab, or closing it. Moving between
  // chapters of the same novel never triggers a write on its own.
  useEffect(() => {
    if (!novel) return;
    const novelIdAtMount = novel.id;

    const flush = () => {
      const latest = latestReadRef.current;
      if (latest && latest.novelId === novelIdAtMount && latest.progress > 0) {
        recordReadingProgress(latest.novelId, latest.chapterId, 0, latest.progress);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', flush);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', flush);
      // Leaving this novel (switched to a different novel, or left the
      // reader entirely) — save the final position once.
      flush();
    };
  }, [novel?.id]);

  const handleToggleZenMode = () => {
    const nextZen = !zenMode;
    setZenMode(nextZen);
    setShowZenControls(false);
    if (nextZen) {
      setZenToast(true);
      setTimeout(() => setZenToast(false), 3000);
    }
  };

  const handleScreenClick = (e: React.MouseEvent) => {
    // Only toggle điều khiển chế độ tập trung in Chế độ Tập trung if user clicks outside button elements
    if (zenMode) {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('select')) {
        return;
      }
      setShowZenControls((prev) => !prev);
    }
  };

  if (!novel || !chapter) {
    if (initializing) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 text-center bg-[#FFF1F5] dark:bg-[#211B22] text-[#A45E78] dark:text-[#F2B3C1]">
          <div className="flex flex-col items-center gap-3"><span className="w-10 h-10 rounded-full border-2 border-[#E8B8C5] border-t-[#D985A2] animate-spin" /><p className="font-eb-garamond text-xl">Đang mở trình đọc...</p></div>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center bg-[#FAF5F6] dark:bg-[#121113] text-[#1E1B1D] dark:text-[#FAF5F6]">
        <div>
          <p className="font-playfair text-xl">Không tìm thấy chương truyện này</p>
          <button
            onClick={() => setActiveView('home')}
            className="mt-4 px-5 py-2.5 rounded-lg bg-[#1E1B1D] text-white dark:bg-[#FAF5F6] dark:text-[#121113] text-xs font-medium"
          >
            Quay Về Trang Chủ
          </button>
        </div>
      </div>
    );
  }

  // Determine styles from ReaderSettings
  // Playfair Display giờ dùng dạng thường (bỏ italic) theo yêu cầu.
  // Vollkorn được xử lý riêng qua getFontFamilyStyle() (inline style) vì
  // chưa chắc có sẵn class Tailwind "font-vollkorn" trong cấu hình dự án —
  // dùng inline fontFamily để không cần đụng tới tailwind config.
  const getFontFamilyClass = () => {
    switch (readerSettings.font) {
      case 'playfair':
        return 'font-playfair';
      case 'cormorant':
        return 'font-cormorant';
      case 'alegreya':
        return 'font-alegreya';
      case 'sans':
        return 'font-luxury-sans';
      case 'vollkorn':
        return '';
      case 'lora':
      default:
        return 'font-lora';
    }
  };

  const getFontFamilyStyle = (): React.CSSProperties => {
    if (readerSettings.font === 'vollkorn') {
      return { fontFamily: "'Vollkorn', serif" };
    }
    return {};
  };

  const getThemeClasses = () => {
    switch (readerSettings.theme) {
      case 'pure-white':
        return {
          wrapper: 'bg-[#FFFFFF] text-[#1A1A1A]',
          card: 'bg-[#FFFFFF] border-[#E8E8E8] text-[#1A1A1A]',
          subtext: 'text-[#666666]',
          border: 'border-[#E8E8E8]',
          floatingCard: 'bg-[#FFFFFF]/95 text-[#1A1A1A] border-[#E8E8E8]',
        };
      case 'cool-gray':
        return {
          wrapper: 'bg-[#F3F4F6] text-[#1F2937]',
          card: 'bg-[#FFFFFF] border-[#E5E7EB] text-[#1F2937]',
          subtext: 'text-[#6B7280]',
          border: 'border-[#E5E7EB]',
          floatingCard: 'bg-[#FFFFFF]/95 text-[#1F2937] border-[#E5E7EB]',
        };
      case 'noir-luxury':
        return {
          wrapper: 'bg-[#121113] text-[#FAF5F6]',
          card: 'bg-[#1A171E] border-[#38323D] text-[#FAF5F6]',
          subtext: 'text-[#D5CBD0]',
          border: 'border-[#38323D]',
          floatingCard: 'bg-[#1A171E]/95 text-[#FAF5F6] border-[#38323D]',
        };
      case 'midnight':
        return {
          wrapper: 'bg-[#0F172A] text-[#FFFFFF]',
          card: 'bg-[#1E293B] border-[#475569] text-[#FFFFFF]',
          subtext: 'text-[#CBD5E1]',
          border: 'border-[#475569]',
          floatingCard: 'bg-[#1E293B]/95 text-[#FFFFFF] border-[#475569]',
        };
      case 'light-rose':
      default:
        // Nền mặc định đổi sang cùng tông pastel với phần còn lại của web
        // (#FFF9FB / #F5DFE7 / #574D4C / #8F7D85) thay vì tông xám nhạt cũ,
        // để trang đọc đồng bộ hơn với trang chủ, danh sách truyện...
        return {
          wrapper: 'bg-[#FFF9FB] text-[#574D4C]',
          card: 'bg-white border-[#F5DFE7] text-[#574D4C]',
          subtext: 'text-[#8F7D85]',
          border: 'border-[#F5DFE7]',
          floatingCard: 'bg-white/95 text-[#574D4C] border-[#F5DFE7]',
        };
    }
  };

  const getMaxWidthClass = () => {
    switch (readerSettings.maxWidth) {
      case 'compact':
        return 'max-w-2xl';
      case 'wide':
        return 'max-w-5xl';
      case 'standard':
      default:
        return 'max-w-3xl';
    }
  };

  const themeStyles = getThemeClasses();
  const viewerUid = currentUser?.id || auth.currentUser?.uid || '';
  const isLiked = !!viewerUid && chapter.likedBy?.includes(viewerUid);

  const handleLike = () => {
    toggleLikeChapter(chapter.id);
    setLikedAnimation(true);
    setTimeout(() => setLikedAnimation(false), 1000);
  };

  return (
    <div
      onClick={handleScreenClick}
      className={`min-h-screen transition-colors duration-200 ${
        zenMode ? 'pb-16 pt-8 sm:pt-12 cursor-default' : 'pb-12'
      } ${themeStyles.wrapper}`}
    >
      {/* Toast Notification when entering Chế độ Tập trung */}
      {zenToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#D985A2] text-white dark:bg-[#F2B3C1] dark:text-[#2B222C] text-xs flex items-center gap-2 border border-[#F7D9E5] animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-3.5 h-3.5 text-current opacity-80" />
          <span>Chế độ Tập trung: Đã ẩn điều hướng. Nhấn vào giữa màn hình để hiện chỉnh font chữ.</span>
        </div>
      )}

      {/* Sticky Reader Navigation Header (Hidden in Chế độ Tập trung) */}
      {!zenMode && (
        <div
          className={`sticky top-0 z-30 border-b-2 backdrop-blur-md px-3 sm:px-8 py-2.5 flex items-center justify-between transition-colors bg-[#FFF9FB]/95 dark:bg-[#2B222C]/95 border-[#E7C3CE] dark:border-[#6B5261]`}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveView('home')}
              className="min-h-[36px] px-3 py-1 rounded-full border border-[#E8B8C5] dark:border-[#8A6172] text-[#A45E78] dark:text-[#F2B3C1] hover:bg-[#FCEEF3] dark:hover:bg-[#3A2935] transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Về trang chủ"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Trang chủ</span>
            </button>

            <div className="hidden md:block">
              <h2 className="font-eb-garamond text-lg font-medium truncate max-w-[280px] text-[#A45E78] dark:text-[#F2B3C1]">
                {novel.title}
              </h2>
              <p className={`text-[10px] ${themeStyles.subtext} truncate`}>{chapter.title}</p>
            </div>
          </div>

          {/* Action controls */}
          <div className="flex items-center gap-2">
            {/* Chế độ Tập trung Button */}
            <button
              id="zen-mode-btn"
              onClick={handleToggleZenMode}
              className="min-h-[36px] px-3 py-1 rounded-full text-xs border border-[#E8B8C5] dark:border-[#8A6172] text-[#A45E78] dark:text-[#F2B3C1] hover:bg-[#FCEEF3] dark:hover:bg-[#3A2935] flex items-center gap-1.5 font-medium transition-colors"
              title="Bật chế độ tập trung (ẩn điều hướng)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-semibold">Chế độ Tập trung</span>
            </button>

            {/* Chapter drawer trigger */}
            <button
              onClick={() => setShowChapterDrawer(true)}
              className="min-h-[36px] px-3 py-1 rounded-full text-xs border border-[#E8B8C5] dark:border-[#8A6172] text-[#A45E78] dark:text-[#F2B3C1] hover:bg-[#FCEEF3] dark:hover:bg-[#3A2935] flex items-center gap-1.5 font-medium"
            >
              <List className="w-3.5 h-3.5" />
              <span>Chương {chapter.chapterNumber}</span>
            </button>

            {/* Reader Appearance Settings Modal */}
            <button
              id="reader-settings-btn"
              onClick={() => setShowSettings(true)}
              className="min-h-[36px] px-3 py-1 rounded-full text-xs border border-[#E8B8C5] dark:border-[#8A6172] text-[#A45E78] dark:text-[#F2B3C1] hover:bg-[#FCEEF3] dark:hover:bg-[#3A2935] flex items-center gap-1.5 font-medium"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cài đặt</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Chế độ Tập trung Quick Font/Control Widget (Appears on click in Chế độ Tập trung) */}
      {zenMode && (
        <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
          {/* Subtle always-available nút thoát chế độ tập trung Pill button */}
          <button
            onClick={() => setZenMode(false)}
            className="min-h-[32px] px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md border border-current opacity-60 hover:opacity-100 flex items-center gap-1.5 transition-all shadow-md bg-black/10 dark:bg-white/10"
            title="Thoát chế độ tập trung"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span className="text-[11px]">Thoát chế độ tập trung</span>
          </button>
        </div>
      )}

      {/* Floating Center Font Adjustment Bar in Chế độ Tập trung (Toggled on Screen Click) */}
      {zenMode && showZenControls && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-in fade-in zoom-in-95 duration-150 bg-[#1E1B1D]/95 text-white border-white/20 dark:bg-[#18161B]/95 dark:text-white dark:border-[#38323D]">
          {/* Font decrease */}
          <button
            onClick={() => updateReaderSettings({ fontSize: Math.max(14, readerSettings.fontSize - 1) })}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold transition-colors"
            title="Giảm cỡ chữ"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Current Font Size */}
          <span className="text-xs font-semibold px-1 whitespace-nowrap">
            {readerSettings.fontSize}px
          </span>

          {/* Font increase */}
          <button
            onClick={() => updateReaderSettings({ fontSize: Math.min(28, readerSettings.fontSize + 1) })}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold transition-colors"
            title="Tăng cỡ chữ"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-5 bg-white/20" />

          {/* Quick Font Cycle — đã thêm 'vollkorn' vào danh sách xoay vòng */}
          <button
            onClick={() => {
              const fontList: Array<'lora' | 'playfair' | 'cormorant' | 'alegreya' | 'sans' | 'vollkorn'> = [
                'lora',
                'playfair',
                'cormorant',
                'alegreya',
                'sans',
                'vollkorn',
              ];
              const currentIdx = fontList.indexOf(readerSettings.font);
              const nextFont = fontList[(currentIdx + 1) % fontList.length];
              updateReaderSettings({ font: nextFont });
            }}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs flex items-center gap-1.5 transition-colors"
            title="Đổi kiểu chữ"
          >
            <Type className="w-3.5 h-3.5 opacity-90" />
            <span className="capitalize">{readerSettings.font}</span>
          </button>

          <div className="w-px h-5 bg-white/20" />

          {/* Full Settings modal */}
          <button
            onClick={() => setShowSettings(true)}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs transition-colors"
            title="Mở tất cả cài đặt"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Close floating bar */}
          <button
            onClick={() => setShowZenControls(false)}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-rose-300 transition-colors"
            title="Đóng thanh điều khiển"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Chapter Content Container */}
      <main ref={containerRef} className={`mx-auto px-4 sm:px-6 ${zenMode ? 'py-4 sm:py-6' : 'py-8 sm:py-12'} ${getMaxWidthClass()}`}>
        {/* Chapter Title & Header */}
        <header className="text-center space-y-2.5 pb-6 border-b mb-8 border-[#E7C3CE] dark:border-[#594352]">
          <p className="text-xs uppercase tracking-[0.2em] text-[#B5798D] dark:text-[#E8B8C5]">
            {novel.title}
          </p>
          <h1 className="font-eb-garamond text-3xl sm:text-4xl font-medium leading-tight text-[#574D4C] dark:text-[#FFFFFF]">
            {chapter.title}
          </h1>

          {/* Line Icons for Metadata (Hidden in Chế độ Tập trung for extreme cleanliness) */}
          {!zenMode && (
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs opacity-75 pt-1.5">
              <span>Tác giả: {novel.authorName}</span>
              <span>•</span>
              <span>{chapter.wordCount.toLocaleString('vi-VN')} chữ</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{chapter.views.toLocaleString('vi-VN')}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#E0A8B6]">
                <Heart className="w-3.5 h-3.5" />
                <span>{chapter.hearts.toLocaleString('vi-VN')}</span>
              </span>
            </div>
          )}
        </header>

        {/* Paragraphs with Comment Button in Right Center */}
        <article className="space-y-4 sm:space-y-6">
          {chapter.content.map((paragraph, idx) => {
            const paragraphCommentsCount = comments.filter(
              (c) => c.novelId === novel.id && c.chapterId === chapter.id && c.paragraphIndex === idx
            ).length;
            const isTargeted = targetParagraphIndex === idx;

            return (
              <div
                key={idx}
                ref={(el) => (paragraphRefs.current[idx] = el)}
                onMouseEnter={() => setHoveredParagraphIdx(idx)}
                onMouseLeave={() => setHoveredParagraphIdx(null)}
                className={`relative group rounded-xl p-2 sm:p-2.5 transition-all duration-200 ${
                  isTargeted ? 'ring-1 ring-[#D985A2] bg-[#FFF1F5] dark:bg-[#352936]' : 'hover:bg-[#FFF9FB] dark:hover:bg-[#352936]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  {/* Paragraph Text with full justify - dedicated column */}
                  <p
                    className={`flex-1 min-w-0 leading-relaxed tracking-normal text-justify [text-align:justify] [text-justify:inter-word] ${getFontFamilyClass()}`}
                    style={{
                      ...getFontFamilyStyle(),
                      fontSize: `${readerSettings.fontSize}px`,
                      lineHeight: readerSettings.lineHeight,
                      marginBottom: `${readerSettings.paragraphSpacing * 0.35}rem`,
                      textAlign: 'justify',
                      textJustify: 'inter-word',
                    }}
                  >
                    {paragraph}
                  </p>

                  {/* Compact Comment Button in dedicated separate right column (hidden in chế độ tập trung unless hovered) */}
                  <div className={`shrink-0 pt-0.5 flex items-center ${zenMode ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''}`}>
                    <button
                      onClick={() => setActiveParagraphCommentIdx(idx)}
                      className={`min-h-[26px] sm:min-h-[28px] px-1.5 py-0.5 rounded-md text-[11px] border transition-all flex items-center gap-1 ${
                        paragraphCommentsCount > 0
                          ? 'border-[#D985A2] bg-[#F7D9E5] dark:bg-[#4A2F3D] font-semibold opacity-100'
                          : hoveredParagraphIdx === idx
                          ? 'border-[#E8B8C5] bg-[#FFF1F5] dark:bg-[#3A2935] opacity-100'
                          : 'border-transparent opacity-30 sm:opacity-0 group-hover:opacity-100 group-hover:border-[#E8B8C5]'
                      }`}
                      title={paragraphCommentsCount > 0 ? `${paragraphCommentsCount} bình luận` : 'Bình luận đoạn này'}
                      aria-label="Bình luận đoạn này"
                    >
                      <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                      {paragraphCommentsCount > 0 && (
                        <span className="text-[10px] font-bold leading-none">{paragraphCommentsCount}</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </article>

        {/* Chapter Completion & Interaction Footer */}
        <footer className="mt-12 pt-8 border-t border-current opacity-90 space-y-6">
          {/* Interactive Heart / Like Section */}
          <div className="text-center space-y-2">
            <button
              onClick={handleLike}
              className={`min-h-[40px] relative px-5 py-2 rounded-lg border text-xs uppercase tracking-wider transition-all duration-200 ${
                isLiked
                  ? 'bg-[#D985A2] text-white dark:bg-[#F2B3C1] dark:text-[#2B222C] border-[#D985A2] dark:border-[#F2B3C1]'
                  : 'bg-[#FFF9FB] dark:bg-[#352936] border-[#E8B8C5] text-[#A45E78] dark:text-[#F2B3C1] hover:bg-[#FFF1F5]'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Heart className={`w-4 h-4 text-[#E0A8B6] ${isLiked ? 'fill-current' : ''}`} />
                <span>{isLiked ? 'Đã thích chương' : 'Thả tim chương này'}</span>
                <span className="font-bold">({chapter.hearts.toLocaleString('vi-VN')})</span>
              </span>

              {likedAnimation && (
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[#E0A8B6] font-bold text-xs animate-bounce">
                  +1 Yêu thích
                </span>
              )}
            </button>
            <p className={`text-xs ${themeStyles.subtext}`}>
              Nhấn thả tim để ủng hộ tác giả
            </p>
          </div>

          {/* Chapter Navigation Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            {prevChapter ? (
              <button
                onClick={() => openReader(novel.id, prevChapter.id)}
                className={`min-h-[46px] p-3.5 rounded-lg border text-left transition-all hover:opacity-80 bg-[#FFF9FB] dark:bg-[#352936] border-[#E8B8C5]`}
              >
                <span className={`text-[10px] uppercase font-semibold block ${themeStyles.subtext}`}>
                  ← Chương trước
                </span>
                <span className="font-playfair not-italic font-medium text-xs sm:text-sm block mt-0.5 truncate">
                  {prevChapter.title}
                </span>
              </button>
            ) : (
              <div className={`p-3.5 rounded-lg border opacity-40 text-left ${themeStyles.card}`}>
                <span className="text-xs">Đây là chương đầu tiên</span>
              </div>
            )}

            {nextChapter ? (
              <button
                onClick={() => openReader(novel.id, nextChapter.id)}
                className={`min-h-[46px] p-3.5 rounded-lg border text-right transition-all hover:opacity-80 bg-[#FFF9FB] dark:bg-[#352936] border-[#E8B8C5]`}
              >
                <span className={`text-[10px] uppercase font-semibold block ${themeStyles.subtext}`}>
                  Chương tiếp theo →
                </span>
                <span className="font-playfair not-italic font-medium text-xs sm:text-sm block mt-0.5 truncate">
                  {nextChapter.title}
                </span>
              </button>
            ) : (
              <div className={`p-3.5 rounded-lg border opacity-40 text-right ${themeStyles.card}`}>
                <span className="text-xs">Đã đọc hết các chương hiện có</span>
              </div>
            )}
          </div>
        </footer>
      </main>

      {/* Chapter Drawer Modal — "khung cấu hình mục lục", restyle đồng bộ ACCENT chung toàn site
          (overlay pastel, viền/nền hồng, tiêu đề Vollkorn, item đang đọc dùng ACCENT, bỏ nút X vuông cứng) */}
      {showChapterDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F0A8C8]/20 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className={`w-full max-w-lg max-h-[80vh] flex flex-col rounded-[26px] border p-5 ${
              isDark ? 'bg-[#2B222C] border-[#6B5261] text-[#F3EEF0]' : 'bg-white border-[#F5DFE7] text-[#574D4C]'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-3 border-[#F0D9E3] dark:border-[#594352]">
              <h3
                style={{ fontFamily: "'Vollkorn', serif" }}
                className="not-italic font-medium text-xl text-[#8B5D71] dark:text-[#F7E4EC]"
              >
                Danh Sách Chương ({chapterListItems.length})
              </h3>
              <button
                onClick={() => setShowChapterDrawer(false)}
                className="min-h-[28px] min-w-[28px] rounded-full flex items-center justify-center text-[#B79AA6] hover:text-[#A45E78] dark:hover:text-white transition-colors"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5">
              {chapterListItems.map((ch) => {
                const isActive = ch.id === chapter.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      openReader(novel.id, ch.id);
                      setShowChapterDrawer(false);
                    }}
                    className={`w-full text-left p-3 rounded-2xl border flex items-center justify-between transition-colors ${
                      isActive
                        ? ''
                        : isDark
                        ? 'hover:bg-[#3A2935]'
                        : 'hover:bg-[#FFF1F6]'
                    }`}
                    style={
                      isActive
                        ? {
                            borderColor: isDark ? ACCENT_DARK : ACCENT,
                            background: isDark ? '#4A2F3D' : '#FFF0F7',
                            color: isDark ? '#FAF5F6' : '#A45E78',
                          }
                        : isDark
                        ? { borderColor: '#6B5261', color: '#FAF5F6' }
                        : { borderColor: '#F5DFE7', color: '#574D4C' }
                    }
                  >
                    <div>
                      <span
                        style={{ fontFamily: "'Vollkorn', serif" }}
                        className="not-italic text-base sm:text-lg font-medium block"
                      >
                        {ch.title}
                      </span>
                      <span className="text-[11px] text-[#8F7D85] dark:text-[#D5CBD0]">
                        {ch.wordCount.toLocaleString('vi-VN')} chữ
                      </span>
                    </div>
                    {isActive && (
                      <span
                        className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }}
                      >
                        Đang đọc
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reader Settings Modal */}
      <ReaderSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Paragraph Comment Drawer */}
      {activeParagraphCommentIdx !== null && (
        <ParagraphCommentDrawer
          isOpen={true}
          onClose={() => setActiveParagraphCommentIdx(null)}
          novelId={novel.id}
          chapterId={chapter.id}
          paragraphIndex={activeParagraphCommentIdx}
          paragraphText={chapter.content[activeParagraphCommentIdx] || ''}
        />
      )}
    </div>
  );
};