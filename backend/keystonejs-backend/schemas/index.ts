/**
 * Экспорт всех схем данных
 */
import { User } from './User';
import { Article } from './Article';
import { Comment } from './Comment';
import { ArticleReaction } from './ArticleReaction';
import { CommentReaction } from './CommentReaction';
import { Bookmark } from './Bookmark';
import { Follow } from './Follow';
import { Notification } from './Notification';

export const lists = {
  User,
  Article,
  Comment,
  ArticleReaction,
  CommentReaction,
  Bookmark,
  Follow,
  Notification,
};

