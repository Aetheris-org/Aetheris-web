import type { CollectionConfig } from 'payload'

export const ArticleBookmarks: CollectionConfig = {
  slug: 'article-bookmarks',
  labels: {
    singular: 'Закладка статьи',
    plural: 'Закладки статей',
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
