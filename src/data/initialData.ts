import { Novel, Chapter, ParagraphComment, User } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_master_author',
    name: 'Canh Cụt Mộng Mơ (Admin)',
    email: 'canhcutmongmoeditor@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    isVerified: true,
    canPublish: true,
  }
];

export const INITIAL_NOVELS: Novel[] = [];

export const INITIAL_CHAPTERS: Chapter[] = [];

export const INITIAL_PARAGRAPH_COMMENTS: ParagraphComment[] = [];

