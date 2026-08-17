import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  User,
  Novel,
  Chapter,
  ParagraphComment,
  Bookmark,
  ReadingHistoryItem,
  ReaderSettings,
} from '../types';
import {
  signInAnonymously,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  startAfter,
  orderBy,
  documentId,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  writeBatch,
  runTransaction,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

export type AppView = 'home' | 'leaderboard' | 'library' | 'community' | 'author_dashboard' | 'reader' | 'novel_detail';

interface AppContextType {
  currentUser: User | null;
  canManageNovels: boolean;
  loginAsGoogleUser: (user: User) => void;
  quickGoogleLogin: (email: string, name: string) => void;
  updateUserProfile: (updates: { name?: string; avatar?: string }) => void;
  logout: () => void;

  globalTheme: 'light' | 'dark';
  toggleGlobalTheme: () => void;

  novels: Novel[];
  chapters: Chapter[];
  comments: ParagraphComment[];
  loadCommentsForChapter: (chapterId: string) => Promise<void>;
  loadMoreCommentsForChapter: (chapterId: string) => Promise<void>;
  hasMoreCommentsForChapter: (chapterId: string) => boolean;
  loadAllComments: () => Promise<void>;
  loadMoreAllComments: () => Promise<void>;
  hasMoreAllComments: boolean;
  selectedNovel: Novel | null;
  selectedChapter: Chapter | null;
  selectedNovelId: string | null;
  selectedChapterId: string | null;
  activeView: AppView;
  setActiveView: (view: AppView) => void;

  openReader: (novelId: string, chapterId?: string, paragraphIndex?: number) => void;
  openNovelDetail: (novelId: string) => void;
  closeDetailModal: () => void;
  modalNovelId: string | null;

  createNovel: (novel: Omit<Novel, 'id' | 'createdAt' | 'updatedAt' | 'totalViews' | 'totalHearts' | 'totalComments' | 'rating' | 'chaptersCount'>) => string;
  updateNovel: (novelId: string, updates: Partial<Novel>) => void;
  deleteNovel: (novelId: string) => void;
  createChapter: (chapter: Omit<Chapter, 'id' | 'releaseDate' | 'views' | 'hearts' | 'commentsCount' | 'wordCount'>) => string;
  updateChapter: (chapterId: string, updates: Partial<Chapter>) => void;
  deleteChapter: (chapterId: string) => void;

  toggleLikeChapter: (chapterId: string) => void;
  recordView: (chapterId: string) => void;
  addParagraphComment: (novelId: string, chapterId: string, paragraphIndex: number, excerpt: string, text: string, guestName?: string) => void;
  likeComment: (commentId: string) => void;

  readerSettings: ReaderSettings;
  updateReaderSettings: (settings: Partial<ReaderSettings>) => void;
  targetParagraphIndex: number | null;
  setTargetParagraphIndex: (idx: number | null) => void;

  libraryNovelIds: string[];
  toggleLibraryNovel: (novelId: string) => void;
  isInLibrary: (novelId: string) => boolean;

  readingHistory: ReadingHistoryItem[];
  recordReadingProgress: (novelId: string, chapterId: string, paragraphIndex: number, progressPercent: number) => void;
  clearHistory: () => void;

  bookmarks: Bookmark[];
  addBookmark: (novelId: string, chapterId: string, paragraphIndex: number, paragraphText: string, note?: string) => void;
  removeBookmark: (bookmarkId: string) => void;
  isParagraphBookmarked: (chapterId: string, paragraphIndex: number) => boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const DEFAULT_READER_SETTINGS: ReaderSettings = {
  font: 'lora',
  fontSize: 18,
  lineHeight: 1.85,
  paragraphSpacing: 1.6,
  theme: 'light-rose',
  maxWidth: 'standard',
  justifyText: true,
};

const ADMIN_EMAIL = 'canhcutmongmoeditor@gmail.com';

const toUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  const ref = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(ref);
  const existing = snap.exists() ? (snap.data() as Partial<User>) : {};
  const isAdminEmail = firebaseUser.email?.toLowerCase() === ADMIN_EMAIL;

  const user: User = {
    id: firebaseUser.uid,
    name: existing.name || firebaseUser.displayName || 'Độc Giả',
    email: firebaseUser.email || existing.email || '',
    avatar: existing.avatar || firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: isAdminEmail ? 'admin' : (existing.role || 'reader'),
    isVerified: firebaseUser.emailVerified,
    canPublish: isAdminEmail || existing.canPublish === true || existing.role === 'author' || existing.role === 'admin',
  };

  await setDoc(ref, {
    ...user,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  return user;
};

const safeDate = () => new Date().toISOString();

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [globalTheme, setGlobalTheme] = useState<'light' | 'dark'>(() => {
    try {
      return localStorage.getItem('dreamy_global_theme') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [novels, setNovels] = useState<Novel[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [comments, setComments] = useState<ParagraphComment[]>([]);
  const [libraryNovelIds, setLibraryNovelIds] = useState<string[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const [activeView, setActiveView] = useState<AppView>('home');
  const [selectedNovelId, setSelectedNovelId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [modalNovelId, setModalNovelId] = useState<string | null>(null);
  const [targetParagraphIndex, setTargetParagraphIndex] = useState<number | null>(null);

  const [readerSettings, setReaderSettings] = useState<ReaderSettings>(() => {
    try {
      const saved = localStorage.getItem('dreamy_reader_settings');
      return saved ? { ...DEFAULT_READER_SETTINGS, ...JSON.parse(saved) } : DEFAULT_READER_SETTINGS;
    } catch {
      return DEFAULT_READER_SETTINGS;
    }
  });

  // A visitor is logged out by default. Anonymous Firebase auth is kept
  // strictly as an invisible technical session for features such as real
  // view tracking; it is NEVER converted into a visible App user.
  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          // Keep an invisible anonymous session so we can safely identify a
          // guest for view deduplication. Do NOT expose it as currentUser.
          if (mounted) setCurrentUser(null);
          try {
            await signInAnonymously(auth);
          } catch (anonymousError) {
            console.error('Anonymous session error:', anonymousError);
          }
          return;
        }

        if (firebaseUser.isAnonymous) {
          if (mounted) setCurrentUser(null);
          return;
        }

        if (mounted) setCurrentUser(await toUser(firebaseUser));
      } catch (error) {
        console.error('Firebase Auth error:', error);
        if (mounted) setCurrentUser(null);
      } finally {
        if (mounted) setAuthReady(true);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('dreamy_global_theme', globalTheme);
      document.documentElement.classList.toggle('dark', globalTheme === 'dark');
    } catch {}
  }, [globalTheme]);

  useEffect(() => {
    try {
      localStorage.setItem('dreamy_reader_settings', JSON.stringify(readerSettings));
    } catch {}
  }, [readerSettings]);

  // Public catalog is loaded once. Comments are deliberately LAZY:
  // loading every comment on every page view can create thousands of reads.
  // A chapter's comments are fetched only when that chapter is opened, while
  // the community feed can explicitly request the full feed when needed.
  useEffect(() => {
    let mounted = true;

    const loadPublicData = async () => {
      try {
        const [novelsSnap, chaptersSnap] = await Promise.all([
          getDocs(collection(db, 'novels')),
          getDocs(collection(db, 'chapters')),
        ]);
        if (!mounted) return;
        setNovels(novelsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Novel, 'id'>) })));
        setChapters(chaptersSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Chapter, 'id'>) })));
      } catch (e) {
        console.error('Public Firestore load:', e);
      }
    };

    loadPublicData();
    return () => { mounted = false; };
  }, []);

  const COMMENT_PAGE_SIZE = 20;
  const loadedCommentChapters = React.useRef<Set<string>>(new Set());
  const loadingCommentChapters = React.useRef<Set<string>>(new Set());
  const chapterCommentCursors = React.useRef<Map<string, any>>(new Map());
  const chapterCommentHasMore = React.useRef<Map<string, boolean>>(new Map());
  const [allCommentsHasMore, setAllCommentsHasMore] = useState(true);
  const allCommentsCursor = React.useRef<any>(null);
  const allCommentsLoading = React.useRef(false);

  const hasMoreCommentsForChapter = (chapterId: string) => chapterCommentHasMore.current.get(chapterId) ?? false;

  const loadCommentsForChapter = async (chapterId: string) => {
    if (!chapterId || loadedCommentChapters.current.has(chapterId) || loadingCommentChapters.current.has(chapterId)) return;
    loadingCommentChapters.current.add(chapterId);
    try {
      const snap = await getDocs(query(
        collection(db, 'comments'),
        where('chapterId', '==', chapterId),
        orderBy(documentId(), 'asc'),
        limit(COMMENT_PAGE_SIZE),
      ));
      const loaded = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ParagraphComment, 'id'>) }));
      setComments(prev => {
        const withoutChapter = prev.filter(c => c.chapterId !== chapterId);
        return [...withoutChapter, ...loaded];
      });
      chapterCommentCursors.current.set(chapterId, snap.docs.at(-1) || null);
      chapterCommentHasMore.current.set(chapterId, snap.size === COMMENT_PAGE_SIZE);
      loadedCommentChapters.current.add(chapterId);
    } catch (e) {
      console.error('Chapter comments load:', e);
    } finally {
      loadingCommentChapters.current.delete(chapterId);
    }
  };

  const loadMoreCommentsForChapter = async (chapterId: string) => {
    if (!chapterId || loadingCommentChapters.current.has(chapterId) || !hasMoreCommentsForChapter(chapterId)) return;
    const cursor = chapterCommentCursors.current.get(chapterId);
    if (!cursor) return;
    loadingCommentChapters.current.add(chapterId);
    try {
      const snap = await getDocs(query(
        collection(db, 'comments'),
        where('chapterId', '==', chapterId),
        orderBy(documentId(), 'asc'),
        startAfter(cursor),
        limit(COMMENT_PAGE_SIZE),
      ));
      const loaded = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ParagraphComment, 'id'>) }));
      setComments(prev => {
        const ids = new Set(loaded.map(c => c.id));
        return [...prev, ...loaded.filter(c => !ids.has(c.id))];
      });
      chapterCommentCursors.current.set(chapterId, snap.docs.at(-1) || cursor);
      chapterCommentHasMore.current.set(chapterId, snap.size === COMMENT_PAGE_SIZE);
    } catch (e) {
      console.error('More chapter comments load:', e);
    } finally {
      loadingCommentChapters.current.delete(chapterId);
    }
  };

  const loadAllComments = async () => {
    if (allCommentsLoading.current || allCommentsCursor.current) return;
    allCommentsLoading.current = true;
    try {
      const snap = await getDocs(query(
        collection(db, 'comments'),
        orderBy(documentId(), 'asc'),
        limit(COMMENT_PAGE_SIZE),
      ));
      setComments(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ParagraphComment, 'id'>) })));
      allCommentsCursor.current = snap.docs.at(-1) || null;
      setAllCommentsHasMore(snap.size === COMMENT_PAGE_SIZE);
    } catch (e) {
      console.error('Community comments load:', e);
    } finally {
      allCommentsLoading.current = false;
    }
  };

  const loadMoreAllComments = async () => {
    if (allCommentsLoading.current || !allCommentsHasMore || !allCommentsCursor.current) return;
    allCommentsLoading.current = true;
    try {
      const snap = await getDocs(query(
        collection(db, 'comments'),
        orderBy(documentId(), 'asc'),
        startAfter(allCommentsCursor.current),
        limit(COMMENT_PAGE_SIZE),
      ));
      const loaded = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ParagraphComment, 'id'>) }));
      setComments(prev => {
        const ids = new Set(prev.map(c => c.id));
        return [...prev, ...loaded.filter(c => !ids.has(c.id))];
      });
      allCommentsCursor.current = snap.docs.at(-1) || allCommentsCursor.current;
      setAllCommentsHasMore(snap.size === COMMENT_PAGE_SIZE);
    } catch (e) {
      console.error('More community comments load:', e);
    } finally {
      allCommentsLoading.current = false;
    }
  };

  useEffect(() => {
    if (!currentUser || !authReady) return;
    const uid = currentUser.id;
    let mounted = true;

    const loadPersonalData = async () => {
      try {
        const [librarySnap, historySnap, bookmarksSnap] = await Promise.all([
          getDocs(collection(db, 'users', uid, 'library')),
          getDocs(collection(db, 'users', uid, 'history')),
          getDocs(collection(db, 'users', uid, 'bookmarks')),
        ]);
        if (!mounted) return;

        setLibraryNovelIds(librarySnap.docs.map((d) => d.id));

        const historyItems = historySnap.docs.map((d) => d.data() as ReadingHistoryItem);
        historyItems.sort((a, b) => String(b.lastReadAt).localeCompare(String(a.lastReadAt)));
        setReadingHistory(historyItems);

        const bookmarkItems = bookmarksSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Bookmark, 'id'>) }));
        bookmarkItems.sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
        setBookmarks(bookmarkItems);
      } catch (e) {
        console.error('Personal Firestore load:', e);
      }
    };

    loadPersonalData();
    return () => { mounted = false; };
  }, [currentUser?.id, authReady]);

  const canManageNovels = useMemo(() => {
    return !!currentUser && (
      currentUser.role === 'admin' ||
      currentUser.role === 'author' ||
      currentUser.canPublish === true
    );
  }, [currentUser]);

  const selectedNovel = useMemo(
    () => novels.find((n) => n.id === selectedNovelId) || novels[0] || null,
    [novels, selectedNovelId]
  );
  const selectedChapter = useMemo(
    () => chapters.find((c) => c.id === selectedChapterId) || null,
    [chapters, selectedChapterId]
  );

  const toggleGlobalTheme = () => setGlobalTheme((p) => p === 'light' ? 'dark' : 'light');

  const loginAsGoogleUser = () => {
    signInWithPopup(auth, googleProvider).catch((e) => console.error('Google sign-in:', e));
  };

  const quickGoogleLogin = () => {
    signInWithPopup(auth, googleProvider).catch((e) => console.error('Google sign-in:', e));
  };

  const logout = () => {
    signOut(auth).catch((e) => console.error('Sign out:', e));
  };

  const updateUserProfile = (updates: { name?: string; avatar?: string }) => {
    if (!currentUser) return;
    const next = {
      ...currentUser,
      name: updates.name?.trim() || currentUser.name,
      avatar: updates.avatar?.trim() || currentUser.avatar,
    };
    setCurrentUser(next);
    setDoc(doc(db, 'users', currentUser.id), next, { merge: true }).catch((e) => console.error('profile:', e));
  };

  const openReader = (novelId: string, chapterId?: string, paragraphIndex?: number) => {
    setSelectedNovelId(novelId);
    let targetChId = chapterId;
    if (!targetChId) {
      const novelChs = chapters.filter((c) => c.novelId === novelId).sort((a, b) => a.chapterNumber - b.chapterNumber);
      targetChId = novelChs[0]?.id;
    }
    setSelectedChapterId(targetChId || null);
    setTargetParagraphIndex(paragraphIndex === undefined ? null : paragraphIndex);
    setModalNovelId(null);
    setActiveView('reader');
    if (targetChId) void loadCommentsForChapter(targetChId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openNovelDetail = (novelId: string) => {
    setSelectedNovelId(novelId);
    setModalNovelId(null);
    setActiveView('novel_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeDetailModal = () => setModalNovelId(null);

  const createNovel = (novelData: Omit<Novel, 'id' | 'createdAt' | 'updatedAt' | 'totalViews' | 'totalHearts' | 'totalComments' | 'rating' | 'chaptersCount'>) => {
    if (!currentUser || !canManageNovels) throw new Error('Bạn không có quyền đăng truyện.');
    const ref = doc(collection(db, 'novels'));
    const today = new Date().toISOString().slice(0, 10);
    const novel: Novel = {
      ...novelData,
      id: ref.id,
      authorId: novelData.authorId || currentUser.id,
      authorName: novelData.authorName || currentUser.name,
      authorEmail: novelData.authorEmail || currentUser.email,
      createdAt: today,
      updatedAt: today,
      totalViews: 0,
      totalHearts: 0,
      totalComments: 0,
      rating: 5,
      chaptersCount: 0,
    };
    setDoc(ref, novel).catch((e) => console.error('createNovel:', e));
    return ref.id;
  };

  const updateNovel = (novelId: string, updates: Partial<Novel>) => {
    const target = novels.find((n) => n.id === novelId);
    if (!target || !currentUser) return;
    if (currentUser.role !== 'admin' && target.authorId !== currentUser.id) return;
    updateDoc(doc(db, 'novels', novelId), { ...updates, updatedAt: new Date().toISOString().slice(0, 10) })
      .catch((e) => console.error('updateNovel:', e));
  };

  const deleteNovel = (novelId: string) => {
    const target = novels.find((n) => n.id === novelId);
    if (!target || !currentUser) return;
    if (currentUser.role !== 'admin' && target.authorId !== currentUser.id) return;

    const batch = writeBatch(db);
    batch.delete(doc(db, 'novels', novelId));
    chapters.filter((c) => c.novelId === novelId).forEach((c) => batch.delete(doc(db, 'chapters', c.id)));
    comments.filter((c) => c.novelId === novelId).forEach((c) => batch.delete(doc(db, 'comments', c.id)));
    batch.commit().catch((e) => {
      console.error('deleteNovel:', e);
      window.alert('Không thể xóa truyện. Vui lòng kiểm tra quyền Firebase hoặc thử lại.');
    });
  };

  const createChapter = (chapterData: Omit<Chapter, 'id' | 'releaseDate' | 'views' | 'hearts' | 'commentsCount' | 'wordCount'>) => {
    if (!currentUser || !canManageNovels) throw new Error('Bạn không có quyền đăng chương.');
    const novel = novels.find((n) => n.id === chapterData.novelId);
    if (!novel) throw new Error('Không tìm thấy truyện.');
    if (currentUser.role !== 'admin' && novel.authorId !== currentUser.id) throw new Error('Bạn không có quyền đăng chương cho truyện này.');

    const ref = doc(collection(db, 'chapters'));
    const wordCount = chapterData.content.reduce((acc, p) => acc + p.trim().split(/\s+/).filter(Boolean).length, 0);
    const chapter: Chapter = {
      ...chapterData,
      id: ref.id,
      releaseDate: new Date().toISOString().slice(0, 10),
      views: 0,
      hearts: 0,
      likedBy: [],
      commentsCount: 0,
      wordCount,
    };

    const batch = writeBatch(db);
    batch.set(ref, chapter);
    batch.update(doc(db, 'novels', novel.id), {
      chaptersCount: increment(1),
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    batch.commit().catch((e) => console.error('createChapter:', e));
    return ref.id;
  };

  const updateChapter = (chapterId: string, updates: Partial<Chapter>) => {
    const target = chapters.find((c) => c.id === chapterId);
    if (!target || !currentUser) return;
    const novel = novels.find((n) => n.id === target.novelId);
    if (!novel || (currentUser.role !== 'admin' && novel.authorId !== currentUser.id)) return;
    const content = updates.content || target.content;
    const wordCount = content.reduce((acc, p) => acc + p.trim().split(/\s+/).filter(Boolean).length, 0);
    updateDoc(doc(db, 'chapters', chapterId), { ...updates, wordCount }).catch((e) => console.error('updateChapter:', e));
  };

  const deleteChapter = async (chapterId: string) => {
    const target = chapters.find((c) => c.id === chapterId);
    if (!target || !currentUser) return;
    const novel = novels.find((n) => n.id === target.novelId);
    if (!novel || (currentUser.role !== 'admin' && novel.authorId !== currentUser.id)) return;

    try {
      // Firestore does not cascade-delete related documents. Clean comments and
      // real view events belonging to this chapter before deleting the chapter.
      const [commentSnap, viewSnap] = await Promise.all([
        getDocs(query(collection(db, 'comments'), where('chapterId', '==', chapterId))),
        getDocs(query(collection(db, 'viewEvents'), where('chapterId', '==', chapterId))),
      ]);

      const docsToDelete = [
        doc(db, 'chapters', chapterId),
        ...commentSnap.docs.map((d) => d.ref),
        ...viewSnap.docs.map((d) => d.ref),
      ];

      // Firestore batches are limited to 500 writes. Chunk cleanup safely.
      for (let i = 0; i < docsToDelete.length; i += 450) {
        const batch = writeBatch(db);
        docsToDelete.slice(i, i + 450).forEach((ref) => batch.delete(ref));
        await batch.commit();
      }

      await updateDoc(doc(db, 'novels', novel.id), {
        chaptersCount: Math.max(0, (novel.chaptersCount || 1) - 1),
        totalComments: Math.max(0, (novel.totalComments || 0) - commentSnap.size),
        totalViews: Math.max(0, (novel.totalViews || 0) - viewSnap.size),
        updatedAt: new Date().toISOString().slice(0, 10),
      });

      setChapters((prev) => prev.filter((c) => c.id !== chapterId));
      setComments((prev) => prev.filter((c) => c.chapterId !== chapterId));
      setNovels((prev) => prev.map((n) => n.id === novel.id ? {
        ...n,
        chaptersCount: Math.max(0, (n.chaptersCount || 1) - 1),
        totalComments: Math.max(0, (n.totalComments || 0) - commentSnap.size),
        totalViews: Math.max(0, (n.totalViews || 0) - viewSnap.size),
      } : n));
      loadedCommentChapters.current.delete(chapterId);
      chapterCommentCursors.current.delete(chapterId);
      chapterCommentHasMore.current.delete(chapterId);
    } catch (e) {
      console.error('deleteChapter:', e);
      window.alert('Không thể xóa chương và dữ liệu liên quan. Vui lòng kiểm tra quyền Firebase hoặc thử lại.');
    }
  };

  const toggleLikeChapter = async (chapterId: string) => {
    const actor = await ensureCommentActor();
    if (!actor) return;
    const target = chapters.find((c) => c.id === chapterId);
    if (!target) return;

    const liked = target.likedBy?.includes(actor.uid) || false;
    const delta = liked ? -1 : 1;
    const ref = doc(db, 'chapters', chapterId);
    const novelRef = doc(db, 'novels', target.novelId);
    const batch = writeBatch(db);

    batch.update(ref, {
      likedBy: liked ? arrayRemove(actor.uid) : arrayUnion(actor.uid),
      hearts: increment(delta),
    });
    batch.update(novelRef, { totalHearts: increment(delta) });

    try {
      await batch.commit();
      setChapters((prev) => prev.map((c) => c.id === chapterId ? {
        ...c,
        likedBy: liked ? (c.likedBy || []).filter((id) => id !== actor.uid) : [...(c.likedBy || []), actor.uid],
        hearts: Math.max(0, (c.hearts || 0) + delta),
      } : c));
      setNovels((prev) => prev.map((n) => n.id === target.novelId ? {
        ...n,
        totalHearts: Math.max(0, (n.totalHearts || 0) + delta),
      } : n));
    } catch (e) {
      console.error('toggleLikeChapter:', e);
    }
  };

  // A view is recorded only after the ReaderView has kept the chapter open for
  // the required delay. One Firebase UID can generate at most one view for the
  // same chapter in a 30-minute bucket. No view is stored in localStorage.
  const recordView = (chapterId: string) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;

    const chapter = chapters.find((c) => c.id === chapterId);
    if (!chapter) return;

    const bucket = Math.floor(Date.now() / (30 * 60 * 1000));
    const eventId = `${firebaseUser.uid}_${chapterId}_${bucket}`;
    const eventRef = doc(db, 'viewEvents', eventId);
    const chapterRef = doc(db, 'chapters', chapterId);
    const novelRef = doc(db, 'novels', chapter.novelId);

    runTransaction(db, async (tx) => {
      const eventSnap = await tx.get(eventRef);
      if (eventSnap.exists()) return;

      tx.set(eventRef, {
        chapterId,
        novelId: chapter.novelId,
        userId: firebaseUser.uid,
        isAnonymous: firebaseUser.isAnonymous,
        createdAt: safeDate(),
      });
      tx.update(chapterRef, { views: increment(1) });
      tx.update(novelRef, { totalViews: increment(1) });
    }).catch((e) => console.error('recordView:', e));
  };

  // Comments and comment likes are available to both signed-in users and guests.
  // Guests use Firebase Anonymous Auth only as a hidden technical identity;
  // they are never exposed as currentUser or written to /users.
  const ensureCommentActor = async (): Promise<FirebaseUser | null> => {
    if (auth.currentUser) return auth.currentUser;
    try {
      const result = await signInAnonymously(auth);
      return result.user;
    } catch (e) {
      console.error('Anonymous comment session:', e);
      return null;
    }
  };

  const addParagraphComment = async (novelId: string, chapterId: string, paragraphIndex: number, excerpt: string, text: string, guestName?: string) => {
    if (!text.trim()) return;

    const actor = await ensureCommentActor();
    if (!actor) return;

    const targetNovel = novels.find((n) => n.id === novelId);
    const targetChapter = chapters.find((c) => c.id === chapterId);
    if (!targetNovel || !targetChapter) return;

    const isGuest = actor.isAnonymous;
    const normalizedGuestName = (guestName || '').trim().slice(0, 40);
    if (isGuest && !normalizedGuestName) return;
    const ref = doc(collection(db, 'comments'));
    const comment: ParagraphComment = {
      id: ref.id,
      novelId,
      chapterId,
      paragraphIndex,
      paragraphExcerpt: excerpt,
      userId: actor.uid,
      userName: isGuest ? normalizedGuestName : (currentUser?.name || actor.displayName || 'Độc giả'),
      userAvatar: isGuest ? '' : (currentUser?.avatar || actor.photoURL || ''),
      userRole: isGuest ? 'reader' : (currentUser?.role || 'reader'),
      content: text.trim(),
      createdAt: safeDate(),
      likes: 0,
      likedBy: [],
      novelTitle: targetNovel.title,
      chapterTitle: targetChapter.title,
    };

    const batch = writeBatch(db);
    batch.set(ref, comment);
    batch.update(doc(db, 'chapters', chapterId), { commentsCount: increment(1) });
    batch.update(doc(db, 'novels', novelId), { totalComments: increment(1) });
    try {
      await batch.commit();
      setComments((prev) => [...prev, comment]);
      setChapters((prev) => prev.map((c) => c.id === chapterId ? { ...c, commentsCount: (c.commentsCount || 0) + 1 } : c));
      setNovels((prev) => prev.map((n) => n.id === novelId ? { ...n, totalComments: (n.totalComments || 0) + 1 } : n));
    } catch (e) {
      console.error('addParagraphComment:', e);
    }
  };

  const likeComment = async (commentId: string) => {
    const actor = await ensureCommentActor();
    if (!actor) return;

    const target = comments.find((c) => c.id === commentId);
    if (!target) return;
    const liked = target.likedBy?.includes(actor.uid) || false;
    const delta = liked ? -1 : 1;
    try {
      await updateDoc(doc(db, 'comments', commentId), {
        likedBy: liked ? arrayRemove(actor.uid) : arrayUnion(actor.uid),
        likes: increment(delta),
      });
      setComments((prev) => prev.map((c) => c.id === commentId ? {
        ...c,
        likedBy: liked ? (c.likedBy || []).filter((id) => id !== actor.uid) : [...(c.likedBy || []), actor.uid],
        likes: Math.max(0, (c.likes || 0) + delta),
      } : c));
    } catch (e) {
      console.error('likeComment:', e);
    }
  };

  const updateReaderSettings = (settings: Partial<ReaderSettings>) => setReaderSettings((prev) => ({ ...prev, ...settings }));

  const toggleLibraryNovel = (novelId: string) => {
    if (!currentUser) return;
    const ref = doc(db, 'users', currentUser.id, 'library', novelId);
    const exists = libraryNovelIds.includes(novelId);
    (exists ? deleteDoc(ref) : setDoc(ref, { novelId, addedAt: safeDate() }))
      .catch((e) => console.error('library:', e));
  };

  const isInLibrary = (novelId: string) => libraryNovelIds.includes(novelId);

  const recordReadingProgress = (novelId: string, chapterId: string, paragraphIndex: number, progressPercent: number) => {
    if (!currentUser) return;
    const novel = novels.find((n) => n.id === novelId);
    const chapter = chapters.find((c) => c.id === chapterId);
    if (!novel || !chapter) return;

    const item: ReadingHistoryItem = {
      novelId,
      novelTitle: novel.title,
      novelCover: novel.coverImage,
      chapterId,
      chapterNumber: chapter.chapterNumber,
      chapterTitle: chapter.title,
      paragraphIndex,
      progressPercent: Math.min(100, Math.max(0, Math.round(progressPercent))),
      lastReadAt: safeDate(),
    };
    setDoc(doc(db, 'users', currentUser.id, 'history', novelId), item)
      .catch((e) => console.error('history:', e));
  };

  const clearHistory = () => {
    if (!currentUser) return;
    const batch = writeBatch(db);
    readingHistory.forEach((item) => batch.delete(doc(db, 'users', currentUser.id, 'history', item.novelId)));
    batch.commit().catch((e) => console.error('clearHistory:', e));
  };

  const addBookmark = (novelId: string, chapterId: string, paragraphIndex: number, paragraphText: string, note?: string) => {
    if (!currentUser) return;
    const novel = novels.find((n) => n.id === novelId);
    const chapter = chapters.find((c) => c.id === chapterId);
    if (!novel || !chapter) return;
    const ref = doc(collection(db, 'users', currentUser.id, 'bookmarks'));
    const bookmark: Bookmark = {
      id: ref.id,
      novelId,
      novelTitle: novel.title,
      novelCover: novel.coverImage,
      chapterId,
      chapterNumber: chapter.chapterNumber,
      chapterTitle: chapter.title,
      paragraphIndex,
      paragraphText,
      timestamp: safeDate(),
      note,
    };
    setDoc(ref, bookmark).catch((e) => console.error('bookmark:', e));
  };

  const removeBookmark = (bookmarkId: string) => {
    if (!currentUser) return;
    deleteDoc(doc(db, 'users', currentUser.id, 'bookmarks', bookmarkId))
      .catch((e) => console.error('removeBookmark:', e));
  };

  const isParagraphBookmarked = (chapterId: string, paragraphIndex: number) =>
    bookmarks.some((bm) => bm.chapterId === chapterId && bm.paragraphIndex === paragraphIndex);

  if (!authReady) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FAF5F6] text-[#8F7D85]">Cánh Cụt Mộng Mơ</div>;
  }

  return (
    <AppContext.Provider value={{
      currentUser,
      canManageNovels,
      loginAsGoogleUser,
      quickGoogleLogin,
      updateUserProfile,
      logout,
      globalTheme,
      toggleGlobalTheme,
      novels,
      chapters,
      comments,
      loadCommentsForChapter,
      loadMoreCommentsForChapter,
      hasMoreCommentsForChapter,
      loadAllComments,
      loadMoreAllComments,
      hasMoreAllComments: allCommentsHasMore,
      selectedNovel,
      selectedChapter,
      selectedNovelId,
      selectedChapterId,
      activeView,
      setActiveView,
      openReader,
      openNovelDetail,
      closeDetailModal,
      modalNovelId,
      createNovel,
      updateNovel,
      deleteNovel,
      createChapter,
      updateChapter,
      deleteChapter,
      toggleLikeChapter,
      recordView,
      addParagraphComment,
      likeComment,
      readerSettings,
      updateReaderSettings,
      targetParagraphIndex,
      setTargetParagraphIndex,
      libraryNovelIds,
      toggleLibraryNovel,
      isInLibrary,
      readingHistory,
      recordReadingProgress,
      clearHistory,
      bookmarks,
      addBookmark,
      removeBookmark,
      isParagraphBookmarked,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
