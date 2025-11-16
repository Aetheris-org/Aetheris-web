import apiClient from '@/lib/axios'
import {
  unwrapStrapiCollectionResponse,
  unwrapStrapiResponse,
  getStrapiMediaUrl,
} from '@/lib/strapi'

export interface CommentAuthor {
  id: number | string
  username: string
  avatar?: string
}

export interface Comment {
  id: string
  documentId: string
  databaseId: number
  text: string
  createdAt: string
  updatedAt?: string
  author: CommentAuthor
  parentId?: string | null
}

interface CommentMeta {
  total?: number
  start?: number
  limit?: number
}

function transformComment(raw: any): Comment {
  const documentId =
    raw.documentId ??
    raw.document_id ??
    (typeof raw.id === 'string' ? raw.id : String(raw.id))

  const databaseId =
    typeof raw.id === 'number' ? raw.id : Number.parseInt(raw.id, 10) || 0

  const author = raw.author?.data ?? raw.author ?? null
  const authorAttributes = author?.attributes ?? author ?? {}

  return {
    id: documentId,
    documentId,
    databaseId,
    text: raw.text || raw.attributes?.text || '',
    createdAt: raw.createdAt || raw.attributes?.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.attributes?.updatedAt || undefined,
    author: {
      id: author?.id ?? authorAttributes.id ?? 0,
      username: authorAttributes.username ?? 'Anonymous',
      avatar: getStrapiMediaUrl(authorAttributes.avatar),
    },
    parentId:
      raw.parent?.documentId ??
      raw.parent?.document_id ??
      (typeof raw.parent?.id !== 'undefined' ? String(raw.parent.id) : null),
  }
}

export async function getArticleComments(
  articleDocumentId: string,
  options: { start?: number; limit?: number } = {},
): Promise<{ comments: Comment[]; meta: CommentMeta }> {
  const params: Record<string, any> = {}
  if (typeof options.start !== 'undefined') params.start = options.start
  if (typeof options.limit !== 'undefined') params.limit = options.limit

  const response = await apiClient.get(`/articles/${articleDocumentId}/comments`, {
    params,
  })

  const collection = unwrapStrapiCollectionResponse(response.data).map(transformComment)
  const meta: CommentMeta = response.data?.meta ?? {}

  return {
    comments: collection,
    meta,
  }
}

export async function createArticleComment(
  articleDocumentId: string,
  payload: { text: string; parentId?: string | null },
): Promise<Comment> {
  const response = await apiClient.post(
    `/articles/${articleDocumentId}/comments`,
    {
      data: {
        text: payload.text,
        parent: payload.parentId ?? null,
      },
    },
    {
      headers: {
        'X-Require-Auth': 'true',
      },
    },
  )

  const entity = unwrapStrapiResponse(response.data)
  return transformComment(entity)
}


