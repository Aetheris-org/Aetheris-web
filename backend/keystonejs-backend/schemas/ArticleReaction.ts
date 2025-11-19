/**
 * ArticleReaction schema
 * Реакции пользователей на статьи (like/dislike)
 */
import { list } from '@keystone-6/core';
import { relationship, select, timestamp } from '@keystone-6/core/fields';
import { accessControl } from '../src/access-control';

export const ArticleReaction = list({
  access: accessControl.ArticleReaction,
  fields: {
    article: relationship({
      ref: 'Article.reactions',
      many: false,
      validation: { isRequired: true },
    }),
    user: relationship({
      ref: 'User.articleReactions',
      many: false,
      validation: { isRequired: true },
    }),
    reaction: select({
      type: 'string',
      options: [
        { label: 'Like', value: 'like' },
        { label: 'Dislike', value: 'dislike' },
      ],
      validation: { isRequired: true },
    }),
    createdAt: timestamp({
      defaultValue: { kind: 'now' },
    }),
  },
});

