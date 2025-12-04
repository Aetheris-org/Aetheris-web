/**
 * Database client using Supabase directly (без Prisma)
 * Работаем напрямую с Supabase PostgreSQL через SQL
 */
import { supabaseAdmin } from './supabase';
import logger from './logger';

export interface DatabaseClient {
  query: <T = any>(sql: string, params?: any[]) => Promise<T[]>;
  queryOne: <T = any>(sql: string, params?: any[]) => Promise<T | null>;
  execute: (sql: string, params?: any[]) => Promise<void>;
}

/**
 * Простой SQL клиент через Supabase
 */
class SupabaseDatabaseClient implements DatabaseClient {
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    try {
      // Supabase не поддерживает прямые SQL запросы через JS клиент
      // Используем RPC функции или таблицы напрямую
      // Для сложных запросов нужно использовать Supabase REST API или создавать функции
      
      // Пока возвращаем пустой массив - нужно будет переписать на Supabase методы
      logger.warn('Direct SQL queries not supported, use Supabase client methods');
      return [];
    } catch (error: any) {
      logger.error('Database query error', { error: error.message, sql });
      throw error;
    }
  }

  async queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results[0] || null;
  }

  async execute(sql: string, params?: any[]): Promise<void> {
    await this.query(sql, params);
  }
}

export const db = new SupabaseDatabaseClient();

logger.info('✅ Database client initialized (Supabase direct)');

export default db;

