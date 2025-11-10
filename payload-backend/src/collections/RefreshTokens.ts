import type { CollectionConfig } from 'payload'

export const RefreshTokens: CollectionConfig = {
  slug: 'refresh-tokens',
  labels: {
    singular: 'Refresh токен',
    plural: 'Refresh токены',
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
      name: 'jti',
      label: 'JTI',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'expiresAt',
      label: 'Истекает',
      type: 'date',
      required: true,
    },
    {
      name: 'revoked',
      label: 'Отозван',
      type: 'checkbox',
      defaultValue: false,
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
