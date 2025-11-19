/**
 * Comment schema
 * Комментарии к статьям с поддержкой вложенных ответов
 */
import { list } from '@keystone-6/core';
import { text, relationship, integer, timestamp } from '@keystone-6/core/fields';
import { accessControl } from '../src/access-control';

export const Comment = list({
  access: accessControl.Comment,
  fields: {
    text: text({
      validation: { isRequired: true, length: { min: 1, max: 10000 } },
    }),
    article: relationship({
      ref: 'Article.comments',
      many: false,
      validation: { isRequired: true },
    }),
    author: relationship({
      ref: 'User.comments',
      many: false,
      validation: { isRequired: true },
    }),
    parent: relationship({
      ref: 'Comment',
      many: false,
    }),
    likes_count: integer({
      defaultValue: 0,
      validation: { min: 0 },
    }),
    dislikes_count: integer({
      defaultValue: 0,
      validation: { min: 0 },
    }),
    reactions: relationship({
      ref: 'CommentReaction.comment',
      many: true,
    }),
    createdAt: timestamp({
      defaultValue: { kind: 'now' },
    }),
    updatedAt: timestamp({
      defaultValue: { kind: 'now' },
    }),
  },
});

