import type { Metadata } from 'next'

import config from '@payload-config'
import { NotFoundPage, generatePageMetadata } from '@payloadcms/next/views'

import { importMap } from '../importMap'

type Params = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<Record<string, string | string[]>>
}

export const generateMetadata = ({ params, searchParams }: Params): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

const PayloadNotFound = ({ params, searchParams }: Params) =>
  NotFoundPage({ config, params, searchParams, importMap })

export default PayloadNotFound

