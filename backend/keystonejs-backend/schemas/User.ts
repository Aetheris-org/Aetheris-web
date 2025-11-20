/**
 * User schema
 * Расширение встроенной схемы пользователей KeystoneJS
 */
import { list } from '@keystone-6/core';
import { text, relationship, select, timestamp, checkbox, password } from '@keystone-6/core/fields';
import { accessControl } from '../src/access-control';
import logger from '../src/lib/logger';

export const User = list({
  access: accessControl.User,
  hooks: {
    // ВАЖНО: Автоматическое назначение роли 'admin' УБРАНО из соображений безопасности
    // Роль 'admin' может быть назначена ТОЛЬКО через защищенный endpoint /api/setup/initial
    // или вручную существующим администратором через Admin UI
    resolveInput: async ({ resolvedData, operation, context }) => {
      if (operation === 'create') {
        // Если роль не указана - устанавливаем 'user' по умолчанию
        // НИКОГДА не назначаем 'admin' автоматически через GraphQL API
        if (!resolvedData.role) {
          resolvedData.role = 'user';
        }
        
        // Для локальных пользователей (не OAuth) пароль обязателен
        if (!resolvedData.provider || resolvedData.provider === 'local') {
          if (!resolvedData.password) {
            throw new Error('Password is required for local users');
          }
        }
      }
      return resolvedData;
    },
  },
  fields: {
    name: text({ validation: { isRequired: true } }),
    email: text({
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),
    password: password({
      // Password обязателен для локальных пользователей
      // Для OAuth пользователей можно оставить пустым
      validation: { isRequired: false },
      // KeystoneJS автоматически хеширует пароль при сохранении
    }),
    username: text({
      validation: { isRequired: true, length: { min: 3, max: 50 } },
      isIndexed: 'unique',
    }),
    bio: text(),
    avatar: text(), // URL строки (от imgBB или Cloudinary)
    coverImage: text(), // URL строки (от imgBB или Cloudinary)
    provider: select({
      type: 'string',
      options: [
        { label: 'Local', value: 'local' },
        { label: 'Google', value: 'google' },
      ],
      defaultValue: 'local',
    }),
    confirmed: checkbox({
      defaultValue: false,
    }),
    blocked: checkbox({
      defaultValue: false,
    }),
    role: select({
      type: 'string',
      options: [
        { label: 'User', value: 'user' },
        { label: 'Admin', value: 'admin' },
      ],
      defaultValue: 'user',
      validation: { isRequired: true },
    }),
    articles: relationship({
      ref: 'Article.author',
      many: true,
    }),
    comments: relationship({
      ref: 'Comment.author',
      many: true,
    }),
    articleReactions: relationship({
      ref: 'ArticleReaction.user',
      many: true,
    }),
    commentReactions: relationship({
      ref: 'CommentReaction.user',
      many: true,
    }),
    bookmarks: relationship({
      ref: 'Bookmark.user',
      many: true,
    }),
    following: relationship({
      ref: 'Follow.follower',
      many: true,
    }),
    followers: relationship({
      ref: 'Follow.following',
      many: true,
    }),
    notifications: relationship({
      ref: 'Notification.user',
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

