import path from 'path'
import { fileURLToPath } from 'url'
import withPayload from '@payloadcms/next/withPayload'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const nextConfig = withPayload(
  {
    reactStrictMode: true,
    experimental: {
      serverActions: {
        bodySizeLimit: '2mb',
      },
    },
  },
  {
    payloadConfigPath: path.resolve(dirname, 'payload.config.ts'),
  }
)

export default nextConfig

