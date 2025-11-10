import type { CollectionConfig } from 'payload'

export const Comments: CollectionConfig = {
  slug: 'comments',
  labels: {
    singular: 'Комментарий',
    plural: 'Комментарии',
  },
  admin: {
    defaultColumns: ['article', 'author', 'createdAt'],
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req, doc }) => !!req.user && (req.user.role === 'admin' || doc?.author === req.user.id),
    delete: ({ req, doc }) => !!req.user && (req.user.role === 'admin' || doc?.author === req.user.id),
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
      name: 'author',
      label: 'Автор',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'guestName',
      label: 'Имя гостя',
      type: 'text',
      admin: {
        condition: (_, siblingData) => !siblingData?.author,
      },
    },
    {
      name: 'parent',
      label: 'Родительский комментарий',
      type: 'relationship',
      relationTo: 'comments',
    },
    {
      name: 'text',
      label: 'Текст',
      type: 'textarea',
      required: true,
    },
    {
      name: 'likesCount',
      label: 'Лайки',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'dislikesCount',
      label: 'Дизлайки',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'isEdited',
      label: 'Редактировано',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'editedAt',
      label: 'Дата редактирования',
      type: 'date',
    },
  ],
  hooks: {
    beforeChange: [({ data, req }) => {
      if (!data) return data
      if (req.user && !data.author) {
        data.author = req.user.id
      }
      if (!data.author && !data.guestName) {
        data.guestName = 'Гость'
      }
      return data
    }],
  },
}
