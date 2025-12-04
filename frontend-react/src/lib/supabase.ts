/**
 * Supabase Client
 * Клиент для работы с Supabase REST API
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger';

// Получаем переменные окружения
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
}

// Создаем клиент Supabase
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Типы для базы данных
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          name: string;
          password: string | null;
          bio: string | null;
          avatar: string | null;
          cover_image: string | null;
          provider: string;
          confirmed: boolean;
          blocked: boolean;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      articles: {
        Row: {
          id: number;
          title: string;
          content: any; // JSONB
          excerpt: string;
          author_id: string;
          tags: string[];
          difficulty: string;
          preview_image: string | null;
          likes_count: number;
          dislikes_count: number;
          views: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['articles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['articles']['Insert']>;
      };
      comments: {
        Row: {
          id: number;
          text: string;
          article_id: number;
          author_id: string;
          parent_id: number | null;
          likes_count: number;
          dislikes_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['comments']['Insert']>;
      };
      article_reactions: {
        Row: {
          id: number;
          article_id: number;
          user_id: string;
          reaction: 'like' | 'dislike';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['article_reactions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['article_reactions']['Insert']>;
      };
      comment_reactions: {
        Row: {
          id: number;
          comment_id: number;
          user_id: string;
          reaction: 'like' | 'dislike';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['comment_reactions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['comment_reactions']['Insert']>;
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          article_id: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookmarks']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['bookmarks']['Insert']>;
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['follows']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['follows']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          actor_id: string;
          article_id: number | null;
          comment_id: number | null;
          is_read: boolean;
          read_at: string | null;
          metadata: any | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
    };
    Functions: {
      search_articles: {
        Args: {
          p_search?: string;
          p_tags?: string[];
          p_difficulty?: string;
          p_sort?: string;
          p_skip?: number;
          p_take?: number;
          p_user_id?: string;
        };
        Returns: {
          id: number;
          title: string;
          content: any;
          excerpt: string;
          author_id: string;
          tags: string[];
          difficulty: string;
          preview_image: string | null;
          likes_count: number;
          dislikes_count: number;
          views: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
          author: any;
          user_reaction: string | null;
          total_count: number;
        }[];
      };
      get_article_with_details: {
        Args: {
          p_article_id: number;
          p_user_id?: string;
          p_increment_views?: boolean;
        };
        Returns: {
          id: number;
          title: string;
          content: any;
          excerpt: string;
          author_id: string;
          tags: string[];
          difficulty: string;
          preview_image: string | null;
          likes_count: number;
          dislikes_count: number;
          views: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
          author: any;
          user_reaction: string | null;
        }[];
      };
      toggle_article_reaction: {
        Args: {
          p_article_id: number;
          p_user_id: string;
          p_reaction: 'like' | 'dislike';
        };
        Returns: {
          article_id: number;
          likes_count: number;
          dislikes_count: number;
          user_reaction: string | null;
        }[];
      };
      toggle_bookmark: {
        Args: {
          p_article_id: number;
          p_user_id: string;
        };
        Returns: {
          is_bookmarked: boolean;
          bookmark_id: string | null;
        }[];
      };
      toggle_follow: {
        Args: {
          p_following_id: string;
          p_follower_id: string;
        };
        Returns: {
          is_following: boolean;
          follow_id: string | null;
        }[];
      };
    };
  };
};

// Типизированный клиент
export type TypedSupabaseClient = SupabaseClient<Database>;

// Экспортируем типизированный клиент
export default supabase as TypedSupabaseClient;

// Хелперы для работы с ошибками
export function handleSupabaseError(error: any): never {
  logger.error('Supabase error', error);
  
  if (error?.code === 'PGRST116') {
    throw new Error('Not found');
  }
  
  if (error?.code === '23505') {
    throw new Error('Duplicate entry');
  }
  
  if (error?.code === '23503') {
    throw new Error('Foreign key constraint violation');
  }
  
  throw new Error(error?.message || 'Database error');
}

