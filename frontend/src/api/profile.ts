import apiClient from './axios'
import type { User } from '@/types/user'
import {
  unwrapStrapiResponse,
  wrapStrapiData,
  getStrapiMediaUrl,
  type StrapiResponse,
  type StrapiEntity
} from '@/adapters/strapi'

export interface ProfileUpdateData {
    username?: string
    bio?: string
    avatar?: string | null
}

export interface AvatarUploadResponse {
    url: string
}

/**
 * Backend User interface (from Strapi API)
 */
interface BackendUser {
    id: number
    username: string
    avatar?: any
    bio?: string | null
    createdAt: string
    created_at?: string
}

/**
 * Adapter to transform Backend User to Frontend User type
 */
export function adaptBackendUser(backendUser: BackendUser): User {
    console.log('🔄 [adaptBackendUser] Transforming backend user:', {
        id: backendUser.id,
        username: backendUser.username,
        avatarRaw: backendUser.avatar,
        avatarType: typeof backendUser.avatar,
        avatarStringified: backendUser.avatar ? JSON.stringify(backendUser.avatar, null, 2) : 'null'
    });
    
    const avatarValue = getStrapiMediaUrl(backendUser.avatar);
    
    console.log('✅ [adaptBackendUser] Avatar transformed:', {
        original: backendUser.avatar,
        transformed: avatarValue,
        transformedType: typeof avatarValue
    });
    
    return {
        id: backendUser.id,
        nickname: backendUser.username,
        email: '', // Not returned from backend
        avatar: avatarValue,
        bio: backendUser.bio || undefined,
        articlesCount: 0,
        commentsCount: 0,
        likesReceived: 0,
        viewsReceived: 0,
        createdAt: backendUser.createdAt || backendUser.created_at || new Date().toISOString(),
        status: 'active',
        role: 'user',
        isVerified: false,
        isProfilePublic: true,
        showEmail: false,
        showLastSeen: false,
        reputation: 0,
        level: 1,
        experience: 0
    } as User;
}

/**
 * Upload avatar to Strapi Media Library
 * Использует кастомный эндпоинт /api/users/avatar/upload который работает от имени сервера
 */
export async function uploadAvatar(file: File): Promise<string> {
    console.log('📤 [uploadAvatar] Starting upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
    });
    
    const formData = new FormData();
    formData.append('files', file);
    
    try {
        console.log('📤 [uploadAvatar] Sending request to /api/users/avatar/upload');
        // ВАЖНО: НЕ устанавливаем Content-Type вручную - браузер сам установит правильный boundary
        // Если установить вручную, boundary будет отсутствовать и сервер не сможет распарсить FormData
        const res = await apiClient.post<{ id: number; url: string }>('/api/users/avatar/upload', formData, {
        timeout: 120000, // 2 minutes timeout for large files
            // Headers будут установлены автоматически axios interceptor (CSRF token, Authorization)
        });
        
        console.log('✅ [uploadAvatar] Upload response:', {
            status: res.status,
            id: res.data?.id,
            url: res.data?.url
    });
    
        if (!res.data?.id) {
            console.error('❌ [uploadAvatar] No file ID in response:', res.data);
            throw new Error('No file ID returned from server');
    }
        
        const fileId = res.data.id;
        console.log('✅ [uploadAvatar] File uploaded successfully, ID:', fileId, 'Type:', typeof fileId);
    
        // Return the file ID as string (will be used to link to user)
        return String(fileId);
    } catch (error: any) {
        console.error('❌ [uploadAvatar] Upload failed:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers
        });
        throw error;
    }
}

/**
 * Update user profile
 */
export async function updateProfile(data: ProfileUpdateData): Promise<User> {
    // Prepare update data
    const updateData: any = {};
    
    if (data.username !== undefined) {
        updateData.username = data.username;
    }
    
    if (data.bio !== undefined) {
        updateData.bio = data.bio;
    }
    
    if (data.avatar !== undefined) {
        // If avatar is a file ID, link it
        updateData.avatar = data.avatar;
    }
    
    // ВАЖНО: Наш кастомный endpoint /api/users/me ожидает { data: {...} }
    const res = await apiClient.put<BackendUser>('/api/users/me', wrapStrapiData(updateData), {
        timeout: 10000,
        params: {
          populate: {
            avatar: { fields: ['url'] }
          }
        }
    });
    
    if (!res.data) {
        throw new Error('No data returned from server');
    }
    
    return adaptBackendUser(res.data);
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User> {
    // ВАЖНО: /api/users/me возвращает объект напрямую, а не обёрнутый в { data: {} }
    const res = await apiClient.get<BackendUser>('/api/users/me', {
        timeout: 10000,
        params: {
          populate: {
            avatar: { fields: ['url'] }
          }
        }
    });
    
    if (!res.data) {
        throw new Error('No data returned from server');
    }
    
    return adaptBackendUser(res.data);
}
