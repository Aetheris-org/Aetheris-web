/**
 * Supabase client configuration
 * Интеграция с Supabase для аутентификации и работы с базой данных
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import logger from './logger';

// Проверяем наличие обязательных переменных окружения
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role key для backend операций
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY; // Anon key для клиентских операций

if (!supabaseUrl) {
  logger.warn('⚠️ SUPABASE_URL is not configured. Supabase features will not work.');
}

if (!supabaseServiceKey) {
  logger.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY is not configured. Backend Supabase operations will not work.');
}

if (!supabaseAnonKey) {
  logger.warn('⚠️ SUPABASE_ANON_KEY is not configured. Client Supabase operations will not work.');
}

// Supabase client для backend операций (с service role key)
// Используется для операций, требующих полных прав (создание пользователей, обход RLS и т.д.)
export const supabaseAdmin: SupabaseClient | null = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Supabase client для клиентских операций (с anon key)
// Используется для операций от имени пользователя
export const supabaseClient: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Проверка конфигурации Supabase
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseServiceKey && supabaseAnonKey);
}

if (isSupabaseConfigured()) {
  logger.info('✅ Supabase client configured successfully');
} else {
  logger.warn('⚠️ Supabase is not fully configured. Some features may not work.');
}

/**
 * Получить Supabase client для использования в middleware
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error('Supabase client is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY.');
  }
  return supabaseClient;
}

/**
 * Получить Supabase admin client для использования в backend операциях
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
  return supabaseAdmin;
}


