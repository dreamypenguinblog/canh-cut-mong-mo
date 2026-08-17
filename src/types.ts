export type UserRole = 'reader' | 'author' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  isVerified?: boolean;
  canPublish?: boolean;
}

export interface ParagraphComment {
  id: string;
  novelId: string;
  chapterId: string;
  paragraphIndex: number;
  paragraphExcerpt: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole?: UserRole;
  content: string;
  createdAt: string;
  likes: number;
  likedBy?: string[];
  novelTitle?: string;
  chapterTitle?: string;
}

export interface Chapter {
  id: string;
  novelId: string;
  chapterNumber: number;
  title: string;
  content: string[]; // List of paragraphs for precise paragraph-level commenting
  releaseDate: string;
  views: number;
  hearts: number;
  likedBy?: string[];
  commentsCount: number;
  wordCount: number;
  isPublished: boolean;
  authorNote?: string;
}

export interface Novel {
  id: string;
  title: string;
  frenchSubtitle?: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  coverImage: string;
  synopsis: string;
  genres: string[];
  tags: string[];
  status: 'ongoing' | 'completed' | 'hiatus';
  createdAt: string;
  updatedAt: string;
  totalViews: number;
  totalHearts: number;
  totalComments: number;
  rating: number;
  featured?: boolean;
  chaptersCount: number;
}

export interface Bookmark {
  id: string;
  novelId: string;
  novelTitle: string;
  novelCover: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  paragraphIndex: number;
  paragraphText: string;
  timestamp: string;
  note?: string;
}

export interface ReadingHistoryItem {
  novelId: string;
  novelTitle: string;
  novelCover: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  paragraphIndex: number;
  progressPercent: number;
  lastReadAt: string;
}

export type ReadingFont = 'lora' | 'playfair' | 'cormorant' | 'alegreya' | 'sans';
export type ReadingTheme = 'light-rose' | 'pure-white' | 'cool-gray' | 'noir-luxury' | 'midnight';
export type ReadingWidth = 'compact' | 'standard' | 'wide';

export interface ReaderSettings {
  font: ReadingFont;
  fontSize: number; // e.g. 18
  lineHeight: number; // e.g. 1.8
  paragraphSpacing: number; // e.g. 1.5
  theme: ReadingTheme;
  maxWidth: ReadingWidth;
  justifyText: boolean;
}
