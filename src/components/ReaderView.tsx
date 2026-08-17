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

  const currentChapterIdx = novelChapters.findIndex((c) => c.id === chapter?.id);
  const prevChapter = currentChapterIdx > 0 ? novelChapters[currentChapterIdx - 1] : null;
  const nextChapter = currentChapterIdx < novelChapters.length - 1 ? novelChapters[currentChapterIdx + 1] : null;

  // A view is only eligible after the reader has stayed on this chapter for 10 seconds.
  // Refreshing immediately does not create a new view.
  useEffect(() => {
    if (!chapter) return;
    const timer = window.setTimeout(() => {
      recordView(chapter.id);
    }, 10_000);
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

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (!chapter || !novel) return;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        recordReadingProgress(novel.id, chapter.id, 0, progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [novel?.id, chapter?.id]);

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
  const getFontFamilyClass = () => {
    switch (readerSettings.font) {
      case 'playfair':
        return 'font-playfair italic';
      case 'cormorant':
        return 'font-cormorant';
      case 'alegreya':
        return 'font-alegreya';
      case 'sans':
        return 'font-luxury-sans';
      case 'lora':
      default:
        return 'font-lora';
    }
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
        return {
          wrapper: 'bg-[#FAF4F6] text-[#1E1B1D]',
          card: 'bg-[#FFFFFF] border-[#EADCE1] text-[#1E1B1D]',
          subtext: 'text-[#8F7D85]',
          border: 'border-[#EADCE1]',
          floatingCard: 'bg-[#FFFFFF]/95 text-[#1E1B1D] border-[#EADCE1]',
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
        zenMode ? 'pb-16 pt-8 sm:pt-12 cursor-default' : 'pb-20 md:pb-12'
      } ${themeStyles.wrapper}`}
    >
      {/* Toast Notification when entering Chế độ Tập trung */}
      {zenToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#1E1B1D] text-[#FAF5F6] dark:bg-[#FAF5F6] dark:text-[#121113] text-xs shadow-xl flex items-center gap-2 border border-white/20 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-3.5 h-3.5 text-current opacity-80" />
          <span>Chế độ Tập trung: Đã ẩn điều hướng. Nhấn vào giữa màn hình để hiện chỉnh font chữ.</span>
        </div>
      )}

      {/* Sticky Reader Navigation Header (Hidden in Chế độ Tập trung) */}
      {!zenMode && (
        <div
          className={`sticky top-0 z-30 border-b backdrop-blur-md px-3 sm:px-8 py-2.5 flex items-center justify-between transition-colors ${
            themeStyles.card
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveView('home')}
              className="min-h-[36px] px-3 py-1 rounded-lg border border-current hover:opacity-80 transition-opacity flex items-center gap-1.5 text-xs font-medium"
              title="Về trang chủ"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Trang chủ</span>
            </button>

            <div className="hidden md:block">
              <h2 className="font-playfair italic text-sm font-semibold truncate max-w-[280px]">
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
              className="min-h-[36px] px-3 py-1 rounded-lg text-xs border border-current hover:opacity-80 flex items-center gap-1.5 font-medium transition-all"
              title="Bật chế độ tập trung (ẩn điều hướng)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-semibold">Chế độ Tập trung</span>
            </button>

            {/* Chapter drawer trigger */}
            <button
              onClick={() => setShowChapterDrawer(true)}
              className="min-h-[36px] px-3 py-1 rounded-lg text-xs border border-current hover:opacity-80 flex items-center gap-1.5 font-medium"
            >
              <List className="w-3.5 h-3.5" />
              <span>Chương {chapter.chapterNumber}</span>
            </button>

            {/* Reader Appearance Settings Modal */}
            <button
              id="reader-settings-btn"
              onClick={() => setShowSettings(true)}
              className="min-h-[36px] px-3 py-1 rounded-lg text-xs border border-current hover:opacity-80 flex items-center gap-1.5 font-medium"
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

          {/* Quick Font Cycle */}
          <button
            onClick={() => {
              const fontList: Array<'lora' | 'playfair' | 'cormorant' | 'alegreya' | 'sans'> = ['lora', 'playfair', 'cormorant', 'alegreya', 'sans'];
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
        <header className="text-center space-y-2.5 pb-6 border-b mb-8 border-current opacity-90">
          <p className="text-xs uppercase tracking-wider opacity-75">
            {novel.title}
          </p>
          <h1 className="font-playfair italic text-xl sm:text-3xl font-normal leading-tight">
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
                className={`relative group rounded-lg p-2 sm:p-2.5 transition-all duration-200 ${
                  isTargeted ? 'ring-1 ring-current bg-black/5 dark:bg-white/5' : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  {/* Paragraph Text with full justify - dedicated column */}
                  <p
                    className={`flex-1 min-w-0 leading-relaxed tracking-normal text-justify [text-align:justify] [text-justify:inter-word] ${getFontFamilyClass()}`}
                    style={{
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
                      className={`min-h-[26px] sm:min-h-[28px] px-1.5 py-0.5 rounded-md text-[11px] border transition-all flex items-center gap-1 shadow-2xs ${
                        paragraphCommentsCount > 0
                          ? 'border-current bg-black/10 dark:bg-white/10 font-semibold opacity-100'
                          : hoveredParagraphIdx === idx
                          ? 'border-current bg-black/5 dark:bg-white/5 opacity-100'
                          : 'border-transparent opacity-30 sm:opacity-0 group-hover:opacity-100 group-hover:border-current'
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
              className={`min-h-[40px] relative px-5 py-2 rounded-lg border text-xs uppercase tracking-wider transition-all duration-200 shadow-xs ${
                isLiked
                  ? 'bg-[#1E1B1D] text-white dark:bg-[#FAF5F6] dark:text-black border-[#1E1B1D] dark:border-white'
                  : 'bg-transparent border-current hover:opacity-80'
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
                className={`min-h-[46px] p-3.5 rounded-lg border text-left transition-all hover:opacity-80 ${themeStyles.card}`}
              >
                <span className={`text-[10px] uppercase font-semibold block ${themeStyles.subtext}`}>
                  ← Chương trước
                </span>
                <span className="font-playfair italic font-medium text-xs sm:text-sm block mt-0.5 truncate">
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
                className={`min-h-[46px] p-3.5 rounded-lg border text-right transition-all hover:opacity-80 ${themeStyles.card}`}
              >
                <span className={`text-[10px] uppercase font-semibold block ${themeStyles.subtext}`}>
                  Chương tiếp theo →
                </span>
                <span className="font-playfair italic font-medium text-xs sm:text-sm block mt-0.5 truncate">
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

      {/* Floating Bottom Quick Controls for Mobile Readers (Hidden in Chế độ Tập trung) */}
      {!zenMode && (
        <div
          className={`md:hidden fixed bottom-0 left-0 right-0 z-30 border-t backdrop-blur-md px-2 py-2 grid grid-cols-5 gap-1 ${
            themeStyles.card
          }`}
        >
          <button
            disabled={!prevChapter}
            onClick={() => prevChapter && openReader(novel.id, prevChapter.id)}
            aria-label="Chương trước"
            title="Chương trước"
            className={`h-10 w-full rounded-lg border flex items-center justify-center transition-all ${
              prevChapter ? 'border-current hover:opacity-80' : 'opacity-30 border-transparent'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowChapterDrawer(true)}
            aria-label="Mục lục"
            title="Mục lục"
            className="h-10 w-full rounded-lg border border-current flex items-center justify-center transition-all hover:opacity-80"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleZenMode}
            aria-label="Chế độ tập trung"
            title="Chế độ tập trung"
            className="h-10 w-full rounded-lg border border-current flex items-center justify-center transition-all hover:opacity-80"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSettings(true)}
            aria-label="Cài đặt đọc"
            title="Cài đặt đọc"
            className="h-10 w-full rounded-lg border border-current flex items-center justify-center transition-all hover:opacity-80"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            disabled={!nextChapter}
            onClick={() => nextChapter && openReader(novel.id, nextChapter.id)}
            aria-label="Chương tiếp theo"
            title="Chương tiếp theo"
            className={`h-10 w-full rounded-lg border flex items-center justify-center transition-all ${
              nextChapter ? 'bg-[#1E1B1D] text-white dark:bg-white dark:text-black border-[#1E1B1D] dark:border-white hover:opacity-90' : 'opacity-30 border-transparent'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Chapter Drawer Modal */}
      {showChapterDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className={`w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl border p-5 shadow-2xl ${
              isDark ? 'bg-[#18161B] border-[#38323D] text-[#F3EEF0]' : 'bg-[#FFFFFF] border-[#EADCE1] text-[#1E1B1D]'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-3 border-[#EADCE1] dark:border-[#2E2833]">
              <h3 className="font-playfair font-semibold text-base">Danh Sách Chương ({novelChapters.length})</h3>
              <button
                onClick={() => setShowChapterDrawer(false)}
                className="p-1 rounded-md text-[#8F7D85] hover:text-black dark:hover:text-white"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5">
              {novelChapters.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    openReader(novel.id, ch.id);
                    setShowChapterDrawer(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg border flex items-center justify-between transition-colors ${
                    ch.id === chapter.id
                      ? 'border-[#1E1B1D] dark:border-white bg-[#FAF0F3] dark:bg-[#201C25] font-bold text-[#1E1B1D] dark:text-[#FAF5F6]'
                      : isDark
                      ? 'border-[#332E38] hover:bg-[#221E26] text-[#FAF5F6]'
                      : 'border-[#EAE0E4] hover:bg-[#FAF5F6] text-[#1E1B1D]'
                  }`}
                >
                  <div>
                    <span className="font-playfair text-xs sm:text-sm block">{ch.title}</span>
                    <span className="text-[11px] text-[#8F7D85] dark:text-[#D5CBD0]">
                      {ch.wordCount.toLocaleString('vi-VN')} chữ • {ch.views.toLocaleString('vi-VN')} lượt xem
                    </span>
                  </div>
                  {ch.id === chapter.id && <span className="text-xs font-semibold">Đang đọc</span>}
                </button>
              ))}
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

