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

// --- Lightweight hash-based routing -----------------------------------
// No server rewrite is required for hash URLs, so refreshing the page
// (or sharing a link) always lands back on the exact same screen instead
// of resetting to Home. Parsing the URL also tells the initial data-load
// effect exactly which Firestore documents are actually needed, instead
// of eagerly loading the entire catalog on every boot.
type AppRoute =
  | { view: 'home' | 'leaderboard' | 'community' | 'library' | 'author_dashboard' }
  | { view: 'novel_detail'; novelId: string }
  | { view: 'reader'; novelId: string; chapterId?: string };

const parseHash = (hash: string): AppRoute => {
  const clean = hash.replace(/^#\/?/, '');
  const parts = clean.split('/').filter(Boolean).map((p) => {
    try {
      return decodeURIComponent(p);
    } catch {
      return p;
    }
  });

  if (parts[0] === 'truyen' && parts[1]) return { view: 'novel_detail', novelId: parts[1] };
  if (parts[0] === 'doc' && parts[1]) return { view: 'reader', novelId: parts[1], chapterId: parts[2] };
  if (parts[0] === 'bang-xep-hang') return { view: 'leaderboard' };
  if (parts[0] === 'cong-dong') return { view: 'community' };
  if (parts[0] === 'tu-sach') return { view: 'library' };
  if (parts[0] === 'tac-gia') return { view: 'author_dashboard' };
  return { view: 'home' };
};

const buildHash = (route: AppRoute): string => {
  switch (route.view) {
    case 'novel_detail':
      return `#/truyen/${encodeURIComponent(route.novelId)}`;
    case 'reader':
      return `#/doc/${encodeURIComponent(route.novelId)}${route.chapterId ? `/${encodeURIComponent(route.chapterId)}` : ''}`;
    case 'leaderboard':
      return '#/bang-xep-hang';
    case 'community':
      return '#/cong-dong';
    case 'library':
      return '#/tu-sach';
    case 'author_dashboard':
      return '#/tac-gia';
    default:
      return '#/';
  }
};

const updateHash = (hash: string) => {
  if (typeof window === 'undefined') return;
  if (window.location.hash !== hash) {
    window.location.hash = hash;
  }
};

interface AppContextType {
  currentUser: User | null;
  canManageNovels: boolean;
  loginAsGoogleUser: (user: User) => void;
  quickGoogleLogin: (email: string, name: string) => void;
  updateUserProfile: (updates: { name?: string; avatar?: string }) => Promise<void>;
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
  // True only until the data needed for the very first screen (the one
  // encoded in the URL on load) has been fetched. Lets Reader/NovelDetail
  // show a loading state instead of a false "not found" while their
  // scoped Firestore query is still in flight.
  initializing: boolean;

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

  // The initial screen (and which novel/chapter, if any) comes straight
  // from the URL hash so a page reload re-opens exactly where the reader
  // left off, instead of always bouncing back to Home.
  const initialRouteRef = React.useRef<AppRoute>(
    parseHash(typeof window !== 'undefined' ? window.location.hash : '')
  );

  const [activeView, setActiveViewState] = useState<AppView>(() => initialRouteRef.current.view);
  const [selectedNovelId, setSelectedNovelId] = useState<string | null>(() => {
    const r = initialRouteRef.current;
    return r.view === 'novel_detail' || r.view === 'reader' ? r.novelId : null;
  });
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(() => {
    const r = initialRouteRef.current;
    return r.view === 'reader' ? r.chapterId || null : null;
  });
  const [modalNovelId, setModalNovelId] = useState<string | null>(null);
  const [targetParagraphIndex, setTargetParagraphIndex] = useState<number | null>(null);
  const [initializing, setInitializing] = useState(true);

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

  // --- Scoped, cached Firestore loaders --------------------------------
  // Novels and chapters are no longer fetched in bulk on every boot. Each
  // helper below fetches only what a given screen actually needs and
  // caches the result, so re-visiting a view (or a view another component
  // already warmed up) costs zero extra reads.

  const novelsLoadedRef = React.useRef(false);
  const novelsLoadPromiseRef = React.useRef<Promise<void> | null>(null);
  const novelsByIdRef = React.useRef<Map<string, Novel>>(new Map());

  useEffect(() => {
    const map = new Map<string, Novel>();
    novels.forEach((n) => map.set(n.id, n));
    novelsByIdRef.current = map;
  }, [novels]);

  // Fetches the full novels catalog exactly once (cached afterwards).
  // Needed by any screen that lists/filters across novels: home grid,
  // leaderboard, community filter dropdown, personal library, author dashboard.
  const ensureNovelsLoaded = (): Promise<void> => {
    if (novelsLoadedRef.current) return Promise.resolve();
    if (novelsLoadPromiseRef.current) return novelsLoadPromiseRef.current;
    const p = (async () => {
      try {
        const snap = await getDocs(collection(db, 'novels'));
        setNovels(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Novel, 'id'>) })));
        novelsLoadedRef.current = true;
      } catch (e) {
        console.error('ensureNovelsLoaded:', e);
      } finally {
        novelsLoadPromiseRef.current = null;
      }
    })();
    novelsLoadPromiseRef.current = p;
    return p;
  };

  // Fetches a single novel document. Used when deep-linking straight into
  // a novel's detail or reader page, so we never need to download the
  // entire novels collection just to show one of them.
  const novelLoadPromisesRef = React.useRef<Map<string, Promise<Novel | null>>>(new Map());
  const ensureNovelById = (novelId: string): Promise<Novel | null> => {
    if (!novelId) return Promise.resolve(null);
    const cached = novelsByIdRef.current.get(novelId);
    if (cached) return Promise.resolve(cached);
    if (novelsLoadedRef.current) return Promise.resolve(null);
    const inFlight = novelLoadPromisesRef.current.get(novelId);
    if (inFlight) return inFlight;

    const p = (async () => {
      try {
        const snap = await getDoc(doc(db, 'novels', novelId));
        if (!snap.exists()) return null;
        const novel = { id: snap.id, ...(snap.data() as Omit<Novel, 'id'>) } as Novel;
        setNovels((prev) => (prev.some((n) => n.id === novelId) ? prev : [...prev, novel]));
        return novel;
      } catch (e) {
        console.error('ensureNovelById:', e);
        return null;
      } finally {
        novelLoadPromisesRef.current.delete(novelId);
      }
    })();
    novelLoadPromisesRef.current.set(novelId, p);
    return p;
  };

  // Fetches chapters for exactly one novel (cached per novel). This is the
  // single biggest cost-saver: chapter documents hold full paragraph text,
  // so downloading every chapter of every novel on boot was by far the
  // largest source of Firestore reads. Now a novel's chapters are only
  // ever read when that specific novel is actually opened.
  const chaptersByNovelRef = React.useRef<Map<string, Chapter[]>>(new Map());
  const chapterLoadPromisesRef = React.useRef<Map<string, Promise<Chapter[]>>>(new Map());
  const ensureChaptersForNovel = (novelId: string): Promise<Chapter[]> => {
    if (!novelId) return Promise.resolve([]);
    const cached = chaptersByNovelRef.current.get(novelId);
    if (cached) return Promise.resolve(cached);
    const inFlight = chapterLoadPromisesRef.current.get(novelId);
    if (inFlight) return inFlight;

    const p = (async () => {
      try {
        const snap = await getDocs(query(collection(db, 'chapters'), where('novelId', '==', novelId)));
        const loaded = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Chapter, 'id'>) }));
        chaptersByNovelRef.current.set(novelId, loaded);
        setChapters((prev) => [...prev.filter((c) => c.novelId !== novelId), ...loaded]);
        return loaded;
      } catch (e) {
        console.error('ensureChaptersForNovel:', e);
        return [];
      } finally {
        chapterLoadPromisesRef.current.delete(novelId);
      }
    })();
    chapterLoadPromisesRef.current.set(novelId, p);
    return p;
  };

  const ensureChaptersForNovels = (novelIds: string[]): Promise<void> =>
    Promise.all(Array.from(new Set(novelIds.filter(Boolean))).map((id) => ensureChaptersForNovel(id))).then(
      () => undefined
    );

  // Loads whatever the *current* screen needs (and nothing else). Runs on
  // boot for the URL's initial route, and again on every subsequent
  // navigation performed via setActiveView/openNovelDetail/openReader.
  // All the loaders above are cached, so re-running this on every view
  // change costs no extra reads once a view has already been visited.
  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;

    (async () => {
      if (activeView === 'novel_detail' || activeView === 'reader') {
        if (selectedNovelId) {
          await Promise.all([ensureNovelById(selectedNovelId), ensureChaptersForNovel(selectedNovelId)]);
        }
      } else {
        // home, leaderboard, community, library, author_dashboard
        await ensureNovelsLoaded();
      }
      if (!cancelled) setInitializing(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [activeView, selectedNovelId, authReady]);

  // The author dashboard additionally needs the chapters of every novel the
  // signed-in user (or, for admins, every novel) actually owns — loaded
  // only once that dashboard is opened, never as part of the normal
  // reader flow.
  useEffect(() => {
    if (activeView !== 'author_dashboard' || !currentUser) return;
    const authoredIds = currentUser.role === 'admin'
      ? novels.map((n) => n.id)
      : novels.filter((n) => n.authorId === currentUser.id).map((n) => n.id);
    if (authoredIds.length > 0) void ensureChaptersForNovels(authoredIds);
  }, [activeView, currentUser, novels]);

  // Keeps the app in sync with browser back/forward and manually-edited
  // hash URLs.
  useEffect(() => {
    const handleHashChange = () => {
      const route = parseHash(window.location.hash);
      if (route.view === 'reader') {
        setSelectedNovelId(route.novelId);
        setSelectedChapterId(route.chapterId || null);
        setActiveViewState('reader');
      } else if (route.view === 'novel_detail') {
        setSelectedNovelId(route.novelId);
        setActiveViewState('novel_detail');
      } else {
        setActiveViewState(route.view);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
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

  const openReader = async (novelId: string, chapterId?: string, paragraphIndex?: number) => {
    setSelectedNovelId(novelId);
    setTargetParagraphIndex(paragraphIndex === undefined ? null : paragraphIndex);
    setModalNovelId(null);
    setActiveViewState('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    await ensureNovelById(novelId);
    const novelChapters = await ensureChaptersForNovel(novelId);

    let targetChId = chapterId;
    if (!targetChId) {
      const sorted = [...novelChapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
      targetChId = sorted[0]?.id;
    }
    setSelectedChapterId(targetChId || null);
    updateHash(buildHash({ view: 'reader', novelId, chapterId: targetChId }));
    if (targetChId) void loadCommentsForChapter(targetChId);
  };

  const openNovelDetail = async (novelId: string) => {
    setSelectedNovelId(novelId);
    setModalNovelId(null);
    setActiveViewState('novel_detail');
    updateHash(buildHash({ view: 'novel_detail', novelId }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await Promise.all([ensureNovelById(novelId), ensureChaptersForNovel(novelId)]);
  };

  const closeDetailModal = () => setModalNovelId(null);

  // Public navigation setter for the "simple" views (home, leaderboard,
  // community, library, author_dashboard — none of which carry an id).
  // Keeps the URL hash in sync so a reload lands back on the same screen.
  const setActiveView = (view: AppView) => {
    setActiveViewState(view);
    updateHash(buildHash({ view } as AppRoute));
  };

  // Deep-linking makes the author dashboard reachable by typing its URL
  // directly, which previously required clicking the Navbar button that
  // only ever renders for users with permission. Guard the route itself.
  useEffect(() => {
    if (!authReady || activeView !== 'author_dashboard') return;
    if (!canManageNovels) setActiveView('home');
  }, [authReady, activeView, canManageNovels]);

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
      initializing,
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
