/**
 * Типы для коллекций статей
 */

import type { Article } from './article';

export type CollectionMemberRole = 'owner' | 'editor' | 'viewer';

export interface CollectionMember {
  id: string;
  collectionId: string;
  userId: string;
  role: CollectionMemberRole;
  invitedBy?: string | null;
  joinedAt: string;
  user?: {
    id: string;
    username: string;
    nickname?: string;
    tag?: string;
    avatar?: string;
  };
}

export interface CollectionArticle {
  id: string;
  collectionId: string;
  articleId: string;
  position: number;
  addedAt: string;
  addedBy?: string | null;
  article?: Article;
}

export interface Collection {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  isPublic: boolean;
  inviteToken: string | null;
  likesCount: number;
  savesCount: number;
  articlesCount?: number;
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
  isSaved?: boolean;
  owner?: {
    id: string;
    username: string;
    nickname?: string;
    tag?: string;
    avatar?: string;
  };
  members?: CollectionMember[];
  articles?: CollectionArticle[];
  canEdit?: boolean;
}

export interface CreateCollectionInput {
  title: string;
  description?: string | null;
  coverImage?: string | null;
  isPublic?: boolean;
}

export interface UpdateCollectionInput {
  title?: string;
  description?: string | null;
  coverImage?: string | null;
  isPublic?: boolean;
}

export interface CollectionQueryParams {
  page?: number;
  pageSize?: number;
  sort?: 'newest' | 'popular' | 'likes' | 'saves';
  ownerId?: string;
  search?: string;
}

export interface CollectionsResponse {
  data: Collection[];
  total: number;
}

export interface CollectionLeaderboardEntry {
  rank: number;
  collection: Collection;
  likesCount: number;
  savesCount: number;
}
