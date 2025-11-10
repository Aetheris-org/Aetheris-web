import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Пользователь',
    plural: 'Пользователи',
  },
  auth: {
    strategies: [
      {
        name: 'local',
      },
      {
        name: 'google',
        oauth: true,
        credentials: {
          clientID: process.env.GOOGLE_CLIENT_ID ?? '',
          clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        },
        authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenURL: 'https://oauth2.googleapis.com/token',
        userInfoURL: 'https://openidconnect.googleapis.com/v1/userinfo',
        scope: ['openid', 'email', 'profile'],
        mapUserInfo: ({ payload, userInfo }) => {
          const email = userInfo.email as string | undefined
          const username =
            (userInfo.name as string | undefined) ??
            (userInfo.email as string | undefined)?.split('@')[0] ??
            'user'

          return {
            email,
            username,
            isVerified: true,
          }
        },
      },
    ],
    verify: true,
    tokenExpiration: 15 * 60,
  },
  admin: {
    useAsTitle: 'username',
    defaultColumns: ['username', 'email', 'role'],
  },
  access: {
    read: ({ req }) => !!req.user && (req.user.id === req.id || req.user.role === 'admin'),
    update: ({ req, id }) => !!req.user && (req.user.id === id || req.user.role === 'admin'),
    delete: ({ req, id }) => !!req.user && req.user.role === 'admin' && req.user.id !== id,
  },
  fields: [
    {
      name: 'username',
      label: 'Никнейм',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'email',
      label: 'E-mail',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'bio',
      label: 'О себе',
      type: 'textarea',
    },
    {
      name: 'avatar',
      label: 'Аватар',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'role',
      label: 'Роль',
      type: 'select',
      defaultValue: 'user',
      options: [
        { label: 'Пользователь', value: 'user' },
        { label: 'Администратор', value: 'admin' },
      ],
      required: true,
    },
    {
      name: 'isVerified',
      label: 'Подтверждён',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'isProfilePublic',
      label: 'Профиль публичный',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
