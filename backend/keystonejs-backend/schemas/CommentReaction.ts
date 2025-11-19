/**
 * CommentReaction schema
 * Реакции пользователей на комментарии (like/dislike)
 */
import { list } from '@keystone-6/core';
import { relationship, select, timestamp } from '@keystone-6/core/fields';
import { accessControl } from '../src/access-control';

export const CommentReaction = list({
  access: accessControl.CommentReaction,
  fields: {
    comment: relationship({
      ref: 'Comment.reactions',
      many: false,
      validation: { isRequired: true },
    }),
    user: relationship({
      ref: 'User.commentReactions',
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

