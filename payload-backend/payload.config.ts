import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { Users } from './src/collections/Users'
import { Media } from './src/collections/Media'
import { Articles } from './src/collections/Articles'
import { Comments } from './src/collections/Comments'
import { ArticleReactions } from './src/collections/ArticleReactions'
import { CommentReactions } from './src/collections/CommentReactions'
import { ArticleBookmarks } from './src/collections/ArticleBookmarks'
import { Notifications } from './src/collections/Notifications'
import { ArticleLikeThresholds } from './src/collections/ArticleLikeThresholds'
import { RefreshTokens } from './src/collections/RefreshTokens'

import dotenv from 'dotenv'

dotenv.config()

const databaseUrl = process.env.DATABASE_URL ?? 'file:./payload-data.sqlite'
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const defaultServerURL =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  'http://localhost:3000'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? 'development-secret-change-me',
  serverURL: defaultServerURL,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      favicon: '/media/favicon.png',
      titleSuffix: ' | Payload Admin',
    },
  },
  collections: [
    Users,
    Media,
    Articles,
    Comments,
    ArticleReactions,
    CommentReactions,
    ArticleBookmarks,
    Notifications,
    ArticleLikeThresholds,
    RefreshTokens
  ],
  globals: [],
  cors: [
    defaultServerURL,
    process.env.PAYLOAD_PUBLIC_FRONTEND_URL ?? '',
  ].filter(Boolean),
  csrf: [
    defaultServerURL,
    process.env.PAYLOAD_PUBLIC_FRONTEND_URL ?? '',
  ],
  routes: {
    admin: '/admin',
  },
  db: sqliteAdapter({
    client: {
      url: databaseUrl,
    },
  }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  graphQL: {
    disable: false,
  },
})
