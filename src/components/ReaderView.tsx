import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ReaderSettingsModal } from './ReaderSettingsModal';
import { ParagraphCommentDrawer } from './ParagraphCommentDrawer';
import { auth } from '../lib/firebase';
import {
  ArrowLeft,
  Eye,
  Heart,
  MessageSquare,
  SlidersHorizontal,
  List,
  X,
} from 'lucide-react';

// Bảng màu hồng phẳng đồng bộ với NovelCard / NovelGrid / Leaderboard / Navbar / HomeHero.
// Dùng riêng cho khung "Danh Sách Chương" (mục lục) và thanh cấu hình để đồng bộ
// toàn site. LƯU Ý: toàn bộ giao diện trang đọc (header, thanh bar cấu hình, khung
// danh sách chương, icon bình luận đoạn, đoạn được đánh dấu, nút chuyển chương)
// KHÔNG còn phụ thuộc vào darkmode toàn site (globalTheme) — luôn hiển thị cố định
// theo đúng yêu cầu "mục darkmode phải tách biệt với chương truyện". Riêng khu vực
// nội dung đoạn văn (màu nền/chữ đọc) vẫn do readerSettings.theme (Cài đặt đọc
// truyện) quyết định như trước, không bị ảnh hưởng bởi thay đổi này.
//
// Đợt chỉnh này: đồng bộ lại toàn bộ token màu của thanh bar cấu hình + nút chuyển
// chương về đúng bộ màu chuẩn đang dùng ở NovelCard/NovelDetailView/Leaderboard
// (viền #F0C7DE/#F5DFE7, chữ #B4587E/#A45E78, nền hover #FFEEF6/#FFF6FB) thay vì
// các mã màu #E8B8C5/#E7C3CE/#F3D9E4 lệch tông trước đó — thuần giao diện, không
// đổi bất kỳ hành vi/đường dữ liệu nào.
const ACCENT = '#F0A8C8';
const BORDER = '#F0C7DE';
const BORDER_SOFT = '#F5DFE7';
const TEXT_ACCENT = '#B4587E';
const TEXT_ACCENT_DARK = '#A45E78';
const HOVER_BG = '#FFEEF6';
const PILL_BG = '#FFF6FB';

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
    recordReadingProgress,
    initializing,
    ensureChaptersForNovel,
  } = useApp();

  const [showSettings, setShowSettings] = useState(false);
  const [showChapterDrawer, setShowChapterDrawer] = useState(false);
  const [activeParagraphCommentIdx, setActiveParagraphCommentIdx] = useState<number | null>(null);
  const [hoveredParagraphIdx, setHoveredParagraphIdx] = useState<number | null>(null);
  const [likedAnimation, setLikedAnimation] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const paragraphRefs = useRef<(HTMLParagraphElement | null)[]>([]);

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

  if (!novel || !chapter) {
    if (initializing) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 text-center bg-[#FFF7FB] text-[#A45E78]">
          <div className="flex flex-col items-center gap-3">
            <span
              className="w-10 h-10 rounded-full border-2 border-[#F5DFE7] animate-spin"
              style={{ borderTopColor: ACCENT }}
            />
            <p style={{ fontFamily: "'Vollkorn', serif" }} className="not-italic text-xl font-medium">
              Đang mở trình đọc...
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center bg-[#FFF7FB] text-[#574D4C]">
        <div className="relative max-w-sm w-full mx-auto rounded-[26px] border border-[#F5DFE7] bg-white p-8">
          <div className="pointer-events-none select-none absolute top-3.5 right-4 text-[10px] leading-[1.7] text-[#F2C7DA]/80 hidden sm:block">
            ✧　⋆
          </div>
          <span className="inline-block w-3 h-3 rounded-full bg-[#E8A0B8] mb-3" />
          <p style={{ fontFamily: "'Vollkorn', serif" }} className="not-italic text-xl font-medium">
            Không tìm thấy chương truyện này
          </p>
          <p className="text-xs text-[#8F7D85] mt-1.5">
            Chương này có thể đã bị gỡ hoặc đường dẫn không còn chính xác.
          </p>
          <button
            onClick={() => setActiveView('home')}
            className="mt-5 min-h-[38px] px-5 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-colors hover:opacity-90"
            style={{ background: ACCENT, color: '#FFFFFF' }}
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  // Determine styles from ReaderSettings
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
        // Nền mặc định trang đọc — đồng bộ đúng màu nền mặc định của toàn site
        // (#FFF7FB, giống Navbar/màn hình tải/trang chủ).
        return {
          wrapper: 'bg-[#FFF7FB] text-[#574D4C]',
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
    <div className={`min-h-screen transition-colors duration-200 pb-12 ${themeStyles.wrapper}`}>
      {/* Sticky Reader Navigation Header — thanh bar cấu hình, cố định, không đổi theo
          darkmode toàn site. Đồng bộ đúng bộ màu chuẩn của web (nền gradient hồng nhạt,
          viền #F5DFE7, chữ/nút theo tông #B4587E-#A45E78) thay vì các mã màu lệch tông
          trước đó. */}
      <div
        className="sticky top-0 z-30 border-b backdrop-blur-md px-3 sm:px-8 py-2.5 flex items-center justify-between transition-colors"
        style={{ background: 'linear-gradient(to bottom, rgba(255,247,251,0.97), rgba(255,241,246,0.95))', borderColor: BORDER_SOFT }}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setActiveView('home')}
            className="min-h-[36px] px-3 py-1 rounded-full border transition-colors flex items-center gap-1.5 text-xs font-medium"
            style={{ borderColor: BORDER, background: PILL_BG, color: TEXT_ACCENT }}
            onMouseEnter={(e) => (e.currentTarget.style.background = HOVER_BG)}
            onMouseLeave={(e) => (e.currentTarget.style.background = PILL_BG)}
            title="Về trang chủ"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Trang chủ</span>
          </button>

          <div className="hidden md:block">
            <h2
              style={{ fontFamily: "'Vollkorn', serif", color: TEXT_ACCENT_DARK }}
              className="not-italic text-lg font-medium truncate max-w-[280px]"
            >
              {novel.title}
            </h2>
            <p className={`text-[10px] ${themeStyles.subtext} truncate`}>{chapter.title}</p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* Chapter drawer trigger */}
          <button
            onClick={() => setShowChapterDrawer(true)}
            className="min-h-[36px] px-3 py-1 rounded-full text-xs border flex items-center gap-1.5 font-medium transition-colors"
            style={{ borderColor: BORDER, background: PILL_BG, color: TEXT_ACCENT }}
            onMouseEnter={(e) => (e.currentTarget.style.background = HOVER_BG)}
            onMouseLeave={(e) => (e.currentTarget.style.background = PILL_BG)}
          >
            <List className="w-3.5 h-3.5" />
            <span>Chương {chapter.chapterNumber}</span>
          </button>

          {/* Reader Appearance Settings Modal trigger */}
          <button
            id="reader-settings-btn"
            onClick={() => setShowSettings(true)}
            className="min-h-[36px] px-3 py-1 rounded-full text-xs border flex items-center gap-1.5 font-medium transition-colors"
            style={{ borderColor: BORDER, background: PILL_BG, color: TEXT_ACCENT }}
            onMouseEnter={(e) => (e.currentTarget.style.background = HOVER_BG)}
            onMouseLeave={(e) => (e.currentTarget.style.background = PILL_BG)}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cài đặt</span>
          </button>
        </div>
      </div>

      {/* Main Chapter Content Container */}
      <main ref={containerRef} className={`mx-auto px-4 sm:px-6 py-8 sm:py-12 ${getMaxWidthClass()}`}>
        {/* Chapter Title & Header */}
        <header className="text-center space-y-2.5 pb-6 border-b mb-8" style={{ borderColor: BORDER_SOFT }}>
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: '#B5798D' }}>
            {novel.title}
          </p>
          <h1
            style={{ fontFamily: "'Vollkorn', serif" }}
            className="not-italic text-3xl sm:text-4xl font-medium leading-tight text-[#574D4C]"
          >
            {chapter.title}
          </h1>

          {/* Line Icons for Metadata */}
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
        </header>

        {/* Paragraphs with Comment Button in Right Center */}
        <article className="space-y-4 sm:space-y-6">
          {chapter.content.map((paragraph, idx) => {
            // Reads the authoritative per-paragraph tally already kept on
            // the chapter document (incremented/decremented right alongside
            // every addParagraphComment/deleteComment) instead of filtering
            // whatever comments happen to be loaded in memory. This is both
            // more accurate (counts every comment, not just a loaded page)
            // and cheaper (no comment fetch needed just to show a number).
            const paragraphCommentsCount = chapter.commentsByParagraph?.[idx] || 0;
            const isTargeted = targetParagraphIndex === idx;

            return (
              <div
                key={idx}
                ref={(el) => (paragraphRefs.current[idx] = el)}
                onMouseEnter={() => setHoveredParagraphIdx(idx)}
                onMouseLeave={() => setHoveredParagraphIdx(null)}
                className={`relative group rounded-xl p-2 sm:p-2.5 transition-all duration-200 ${
                  isTargeted ? 'ring-1 ring-[#F0A8C8] bg-[#FCE9F2]' : 'hover:bg-[#FFF9FB]'
                }`}
              >
                {/* gap thu gọn lại + cột nút bình luận chỉ còn đúng bằng kích thước icon,
                    để đoạn văn dàn rộng hơn sang phải mà icon vẫn tách riêng, không đè chữ */}
                <div className="flex items-start justify-between gap-1.5 sm:gap-2.5">
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

                  {/* Compact circular comment button — chỉ chiếm đúng khoảng icon,
                      số lượng bình luận hiện dạng badge nhỏ ở góc để không mở rộng chiều ngang.
                      Màu khi có bình luận dùng đúng 1 tông ACCENT phẳng đồng bộ toàn site,
                      không đụng cách đếm/tải bình luận. */}
                  <div className="shrink-0 pt-0.5 relative">
                    <button
                      onClick={() => setActiveParagraphCommentIdx(idx)}
                      className={`relative min-h-[26px] min-w-[26px] sm:min-h-[28px] sm:min-w-[28px] rounded-full border transition-all flex items-center justify-center ${
                        paragraphCommentsCount > 0
                          ? 'opacity-100'
                          : hoveredParagraphIdx === idx
                          ? 'opacity-100'
                          : 'border-transparent opacity-30 sm:opacity-0 group-hover:opacity-100'
                      }`}
                      style={
                        paragraphCommentsCount > 0
                          ? { borderColor: ACCENT, background: '#FCE9F2', color: '#A45E78' }
                          : hoveredParagraphIdx === idx
                          ? { borderColor: BORDER, background: PILL_BG, color: TEXT_ACCENT }
                          : undefined
                      }
                      title={paragraphCommentsCount > 0 ? `${paragraphCommentsCount} bình luận` : 'Bình luận đoạn này'}
                      aria-label="Bình luận đoạn này"
                    >
                      <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                      {paragraphCommentsCount > 0 && (
                        <span
                          className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-[3px] rounded-full text-[9px] font-bold leading-[15px] text-white flex items-center justify-center"
                          style={{ background: ACCENT }}
                        >
                          {paragraphCommentsCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </article>

        {/* Chapter Completion & Interaction Footer */}
        <footer className="mt-12 pt-8 border-t opacity-90 space-y-6" style={{ borderColor: BORDER_SOFT }}>
          {/* Interactive Heart / Like Section */}
          <div className="text-center space-y-2">
            <button
              onClick={handleLike}
              className="min-h-[40px] relative px-5 py-2 rounded-full border text-xs uppercase tracking-wider transition-all duration-200"
              style={
                isLiked
                  ? { background: ACCENT, color: '#FFFFFF', borderColor: ACCENT }
                  : { background: PILL_BG, borderColor: BORDER, color: TEXT_ACCENT }
              }
            >
              <span className="flex items-center justify-center gap-2">
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-white' : 'text-[#E0A8B6]'}`} />
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

          {/* Chapter Navigation Buttons — font Vollkorn + màu cố định, đồng bộ style web */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            {prevChapter ? (
              <button
                onClick={() => openReader(novel.id, prevChapter.id)}
                className="min-h-[46px] p-3.5 rounded-2xl border text-left transition-all hover:opacity-80"
                style={{ background: PILL_BG, borderColor: BORDER }}
              >
                <span className="text-[10px] uppercase font-semibold block text-[#B79AA6]">
                  ← Chương trước
                </span>
                <span
                  style={{ fontFamily: "'Vollkorn', serif" }}
                  className="not-italic font-medium text-xs sm:text-sm block mt-0.5 truncate text-[#574D4C]"
                >
                  {prevChapter.title}
                </span>
              </button>
            ) : (
              <div className={`p-3.5 rounded-2xl border opacity-40 text-left ${themeStyles.card}`}>
                <span className="text-xs">Đây là chương đầu tiên</span>
              </div>
            )}

            {nextChapter ? (
              <button
                onClick={() => openReader(novel.id, nextChapter.id)}
                className="min-h-[46px] p-3.5 rounded-2xl border text-right transition-all hover:opacity-80"
                style={{ background: PILL_BG, borderColor: BORDER }}
              >
                <span className="text-[10px] uppercase font-semibold block text-[#B79AA6]">
                  Chương tiếp theo →
                </span>
                <span
                  style={{ fontFamily: "'Vollkorn', serif" }}
                  className="not-italic font-medium text-xs sm:text-sm block mt-0.5 truncate text-[#574D4C]"
                >
                  {nextChapter.title}
                </span>
              </button>
            ) : (
              <div className={`p-3.5 rounded-2xl border opacity-40 text-right ${themeStyles.card}`}>
                <span className="text-xs">Đã đọc hết các chương hiện có</span>
              </div>
            )}
          </div>
        </footer>
      </main>

      {/* Chapter Drawer Modal — "Danh Sách Chương" — cố định, không đổi theo darkmode
          toàn site. Đây là khung mẫu mà thanh cấu hình phía trên giờ đồng bộ theo. */}
      {showChapterDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F0A8C8]/20 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg max-h-[80vh] flex flex-col rounded-[26px] border p-5 bg-white border-[#F5DFE7] text-[#574D4C]">
            <div className="flex items-center justify-between border-b pb-3 mb-3 border-[#F0D9E3]">
              <div>
                <h3
                  style={{ fontFamily: "'Vollkorn', serif" }}
                  className="not-italic font-medium text-xl text-[#8B5D71]"
                >
                  Danh Sách Chương
                </h3>
                <p className="text-[11px] text-[#B79AA6] mt-0.5">
                  {chapterListItems.length} chương · đang đọc chương {chapter.chapterNumber}
                </p>
              </div>
              <button
                onClick={() => setShowChapterDrawer(false)}
                className="min-h-[28px] min-w-[28px] rounded-full flex items-center justify-center text-[#B79AA6] hover:text-[#A45E78] transition-colors"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-1">
              {chapterListItems.length > 0 ? (
                chapterListItems.map((ch) => {
                  const isActive = ch.id === chapter.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => {
                        openReader(novel.id, ch.id);
                        setShowChapterDrawer(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-2xl flex items-center gap-3 transition-colors ${
                        isActive ? '' : 'hover:bg-[#FFF1F6]'
                      }`}
                      style={isActive ? { background: '#FFF0F7' } : undefined}
                    >
                      <span
                        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold"
                        style={
                          isActive
                            ? { background: ACCENT, color: '#FFFFFF' }
                            : { background: '#FFF5FA', color: '#D88AB3' }
                        }
                      >
                        {ch.chapterNumber}
                      </span>

                      <div className="min-w-0 flex-1">
                        <span
                          style={{ fontFamily: "'Vollkorn', serif" }}
                          className={`not-italic text-sm sm:text-base font-medium block truncate ${
                            isActive ? 'text-[#A45E78]' : 'text-[#574D4C]'
                          }`}
                        >
                          {ch.title}
                        </span>
                        <span className="text-[11px] text-[#8F7D85]">
                          {ch.wordCount.toLocaleString('vi-VN')} chữ
                        </span>
                      </div>

                      {isActive && (
                        <span
                          className="shrink-0 text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full"
                          style={{ background: ACCENT, color: '#FFFFFF' }}
                        >
                          Đang đọc
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="relative text-center py-10 rounded-2xl border border-[#F5D2E0] bg-[#FFF6FB] overflow-visible">
                  <div className="pointer-events-none select-none absolute top-2.5 right-3.5 text-[8px] leading-[1.6] text-[#F2C7DA]/70 hidden sm:block">
                    ✧　⋆
                  </div>
                  <span className="inline-block w-2 h-2 rounded-full bg-[#E8A0B8] mb-2" />
                  <p style={{ fontFamily: "'Vollkorn', serif" }} className="not-italic text-sm font-medium text-[#574D4C]">
                    Chưa có chương nào được xuất bản
                  </p>
                </div>
              )}
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