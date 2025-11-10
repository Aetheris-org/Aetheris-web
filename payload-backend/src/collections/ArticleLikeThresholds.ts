import type { CollectionConfig } from 'payload'

export const ArticleLikeThresholds: CollectionConfig = {
  slug: 'article-like-thresholds',
  labels: {
    singular: 'Порог лайков статьи',
    plural: 'Пороги лайков статей',
  },
  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) => !!req.user,
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
      name: 'threshold',
      label: 'Порог',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'reachedAt',
      label: 'Дата достижения',
      type: 'date',
    },
  ],
  indexes: [
    {
      fields: ['article', 'user', 'threshold'],
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
