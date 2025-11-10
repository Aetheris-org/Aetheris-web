import type { CollectionConfig } from 'payload'

export const CommentReactions: CollectionConfig = {
  slug: 'comment-reactions',
  labels: {
    singular: 'Реакция на комментарий',
    plural: 'Реакции на комментарии',
  },
  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) => !!req.user,
    update: ({ req, doc }) => !!req.user && (req.user.role === 'admin' || doc?.user === req.user.id),
    delete: ({ req, doc }) => !!req.user && (req.user.role === 'admin' || doc?.user === req.user.id),
  },
  fields: [
    {
      name: 'comment',
      label: 'Комментарий',
      type: 'relationship',
      relationTo: 'comments',
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
      fields: ['comment', 'user'],
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
