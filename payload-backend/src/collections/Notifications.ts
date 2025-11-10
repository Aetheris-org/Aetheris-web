import type { CollectionConfig } from 'payload'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  labels: {
    singular: 'Уведомление',
    plural: 'Уведомления',
  },
  access: {
    read: ({ req, doc }) => !!req.user && (req.user.role === 'admin' || doc?.user === req.user.id),
    create: ({ req }) => !!req.user,
    update: ({ req, doc }) => !!req.user && (req.user.role === 'admin' || doc?.user === req.user.id),
    delete: ({ req, doc }) => !!req.user && (req.user.role === 'admin' || doc?.user === req.user.id),
  },
  fields: [
    {
      name: 'user',
      label: 'Пользователь',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'type',
      label: 'Тип',
      type: 'text',
      required: true,
    },
    {
      name: 'title',
      label: 'Заголовок',
      type: 'text',
      required: true,
    },
    {
      name: 'message',
      label: 'Сообщение',
      type: 'textarea',
      required: true,
    },
    {
      name: 'isRead',
      label: 'Прочитано',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'relatedArticle',
      label: 'Связанная статья',
      type: 'relationship',
      relationTo: 'articles',
    },
    {
      name: 'relatedComment',
      label: 'Связанный комментарий',
      type: 'relationship',
      relationTo: 'comments',
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
