import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Медиа-файл',
    plural: 'Медиа-файлы',
  },
  upload: {
    staticDir: path.resolve(dirname, '../../media'),
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 400,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
  },
  access: {
    read: () => true,
    delete: ({ req }) => !!req.user && req.user.role === 'admin',
    update: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'alt',
      label: 'Alt-текст',
      type: 'text',
    },
  ],
}
