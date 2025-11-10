import type { CollectionConfig } from 'payload'

export const ArticleReactions: CollectionConfig = {
  slug: 'article-reactions',
  labels: {
    singular: 'Реакция на статью',
    plural: 'Реакции на статьи',
  },
  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) => !!req.user,
    update: ({ req, doc }) => !!req.user && (req.user.role === 'admin' || doc?.user === req.user.id),
    delete: ({ req, doc }) => !!req.user && (req.user.role === 'admin' || doc?.user === req.user.id),
  },
  fields: [
    {
      name: 'article',
      label: 'Статья',
      type: 'relationship',
      relationTo: 'articles',
      required: true,
    },
    {
      name: 'user',
      label: 'Пользователь',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'reaction',
      label: 'Реакция',
      type: 'select',
      required: true,
      options: [
        { label: 'Лайк', value: 'like' },
        { label: 'Дизлайк', value: 'dislike' },
      ],
    },
  ],
  indexes: [
    {
      fields: ['article', 'user'],
      unique: true,
    },
  ],
  hooks: {
    beforeChange: [({ data, req }) => {
      if (!data) return data
      if (!data.user && req.user) {
        data.user = req.user.id
      }
      return data
    }],
  },
}
