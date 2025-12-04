/**
 * Экспорт всех схем данных
 * ВАЖНО: Порядок имеет значение для Admin UI
 * Базовые схемы (User, Article) должны быть первыми
 */
import { User } from './User';
import { Article } from './Article';
import { Comment } from './Comment';
import { ArticleReaction } from './ArticleReaction';
import { CommentReaction } from './CommentReaction';
import { Bookmark } from './Bookmark';
import { Follow } from './Follow';
import { Notification } from './Notification';

// Экспортируем в правильном порядке: базовые схемы первыми
export const lists = {
  // Базовые схемы (не зависят от других)
  User,
  Article,
  // Зависимые схемы (зависят от User/Article)
  Comment,
  ArticleReaction,
  CommentReaction,
  Bookmark,
  Follow,
  Notification,
};

