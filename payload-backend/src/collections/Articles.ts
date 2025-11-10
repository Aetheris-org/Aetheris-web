import type { CollectionConfig } from 'payload'
import { slugify } from '../utils/slugify'

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: {
    singular: 'Статья',
    plural: 'Статьи',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt', 'author'],
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req, doc }) =>
      !!req.user && (req.user.role === 'admin' || doc?.author === req.user.id),
    delete: ({ req, doc }) =>
      !!req.user && (req.user.role === 'admin' || doc?.author === req.user.id),
  },
  fields: [
    {
      name: 'title',
      label: 'Заголовок',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      label: 'Слаг',
      type: 'text',
      required: true,
      unique: true,
      localized: false,
    },
    {
      name: 'excerpt',
      label: 'Краткое описание',
      type: 'textarea',
    },
    {
      name: 'content',
      label: 'Контент',
      type: 'textarea',
      required: true,
    },
    {
      name: 'difficulty',
      label: 'Сложность',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: 'Легкая', value: 'easy' },
        { label: 'Средняя', value: 'medium' },
        { label: 'Сложная', value: 'hard' },
      ],
    },
    {
      name: 'tags',
      label: 'Теги',
      type: 'array',
      labels: {
        singular: 'Тег',
        plural: 'Теги',
      },
      fields: [
        {
          name: 'tag',
          label: 'Значение',
          type: 'text',
        },
      ],
    },
    {
      name: 'previewImage',
      label: 'Превью-изображение',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'status',
      label: 'Статус',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Черновик', value: 'draft' },
        { label: 'Опубликовано', value: 'published' },
      ],
      required: true,
    },
    {
      name: 'publishedAt',
      label: 'Дата публикации',
      type: 'date',
    },
    {
      name: 'views',
      label: 'Просмотры',
      type: 'number',
      defaultValue: 0,
      min: 0,
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
      name: 'commentsCount',
      label: 'Комментариев',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'author',
      label: 'Автор',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [({ data, req }) => {
      if (!data) return data
      if (data.title && !data.slug) {
        data.slug = slugify(data.title)
      }
      if (data.status === 'published' && !data.publishedAt) {
        data.publishedAt = new Date().toISOString()
      }
      if (data.status === 'draft') {
        data.publishedAt = null
      }
      if (data.tags && Array.isArray(data.tags)) {
        data.tags = data.tags.map((entry: any) =>
          typeof entry === 'string' ? { tag: entry } : entry
        )
      }
      if (!data.author && req.user) {
        data.author = req.user.id
      }
      return data
    }],
  },
}
