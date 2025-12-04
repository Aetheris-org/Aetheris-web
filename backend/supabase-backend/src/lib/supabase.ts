/**
 * Supabase client configuration
 * Клиент для работы с Supabase API
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import logger from './logger';

if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL environment variable is required');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}

// Клиент для серверных операций (с полными правами)
export const supabaseAdmin: SupabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Клиент для клиентских операций (с ограниченными правами через RLS)
export const createSupabaseClient = (accessToken?: string): SupabaseClient => {
  const options: any = {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
    },
  };

  if (accessToken) {
    options.global = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }

  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!,
    options
  );
};

logger.info('✅ Supabase clients initialized');

export default supabaseAdmin;

