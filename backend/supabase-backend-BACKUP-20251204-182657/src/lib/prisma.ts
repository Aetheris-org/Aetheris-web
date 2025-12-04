/**
 * Database client - используем Supabase напрямую вместо Prisma
 * Это обход проблемы с установкой Prisma engines
 */
import { supabaseAdmin } from './supabase';
import logger from './logger';

// Простой интерфейс для работы с БД через Supabase
export const prisma = {
  // User operations
  user: {
    findUnique: async (args: { where: { id: string } }) => {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', args.where.id)
        .single();
      if (error) throw error;
      return data;
    },
    findMany: async (args?: { skip?: number; take?: number; where?: any; orderBy?: any }) => {
      let query = supabaseAdmin.from('users').select('*');
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            if ('equals' in value) query = query.eq(key, value.equals);
            if ('contains' in value) query = query.ilike(key, `%${value.contains}%`);
          } else {
            query = query.eq(key, value);
          }
        });
      }
      
      if (args?.skip) query = query.range(args.skip, args.skip + (args.take || 10) - 1);
      if (args?.take && !args.skip) query = query.limit(args.take);
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    create: async (args: { data: any }) => {
      const { data: result, error } = await supabaseAdmin
        .from('users')
        .insert(args.data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    update: async (args: { where: { id: string }; data: any }) => {
      const { data: result, error } = await supabaseAdmin
        .from('users')
        .update(args.data)
        .eq('id', args.where.id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    delete: async (args: { where: { id: string } }) => {
      const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', args.where.id);
      if (error) throw error;
      return { id: args.where.id };
    },
  },
  
  // Article operations (базовые, остальные по аналогии)
  article: {
    findUnique: async (args: { where: { id: number | string }; include?: any }) => {
      const id = typeof args.where.id === 'string' ? parseInt(args.where.id) : args.where.id;
      let select = '*';
      
      // Поддержка include для связей
      if (args?.include) {
        const includes: string[] = [];
        if (args.include.author) includes.push('author:users(*)');
        if (args.include.comments) includes.push('comments(*)');
        if (includes.length > 0) {
          select = `*,${includes.join(',')}`;
        }
      }
      
      const { data, error } = await supabaseAdmin
        .from('articles')
        .select(select)
        .eq('id', id)
        .single();
      if (error) throw error;
      
      // Преобразуем структуру для совместимости с Prisma
      if (data && args?.include) {
        if (args.include.author && data.author_id) {
          const { data: author } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', data.author_id)
            .single();
          data.author = author;
        }
      }
      
      return data;
    },
    findUniqueOrThrow: async (args: { where: { id: number | string }; include?: any }) => {
      const result = await prisma.article.findUnique(args);
      if (!result) throw new Error('Article not found');
      return result;
    },
    findMany: async (args?: { skip?: number; take?: number; where?: any; orderBy?: any; include?: any }) => {
      let select = '*';
      
      // Поддержка include для связей
      if (args?.include) {
        const includes: string[] = [];
        if (args.include.author) includes.push('author:users(*)');
        if (args.include.comments) includes.push('comments(*)');
        if (includes.length > 0) {
          select = `*,${includes.join(',')}`;
        }
      }
      
      let query = supabaseAdmin.from('articles').select(select);
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            if ('equals' in value) query = query.eq(key, value.equals);
            if ('not' in value && value.not === null) query = query.not('is', key, null);
          } else {
            query = query.eq(key, value);
          }
        });
      }
      
      if (args?.skip) query = query.range(args.skip, args.skip + (args.take || 10) - 1);
      if (args?.take && !args.skip) query = query.limit(args.take);
      
      if (args?.orderBy) {
        const [field, direction] = Object.entries(args.orderBy)[0];
        query = query.order(field, { ascending: direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Загружаем связанные данные если нужно
      if (data && args?.include?.author) {
        const authorIds = [...new Set(data.map((a: any) => a.author_id).filter(Boolean))];
        if (authorIds.length > 0) {
          const { data: authors } = await supabaseAdmin
            .from('users')
            .select('*')
            .in('id', authorIds);
          
          const authorsMap = new Map(authors?.map((a: any) => [a.id, a]) || []);
          data.forEach((article: any) => {
            if (article.author_id) {
              article.author = authorsMap.get(article.author_id);
            }
          });
        }
      }
      
      return data || [];
    },
    create: async (args: { data: any }) => {
      const { data: result, error } = await supabaseAdmin
        .from('articles')
        .insert(args.data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    update: async (args: { where: { id: number | string }; data: any }) => {
      const id = typeof args.where.id === 'string' ? parseInt(args.where.id) : args.where.id;
      
      // Обработка increment/decrement
      const updateData: any = {};
      for (const [key, value] of Object.entries(args.data)) {
        if (typeof value === 'object' && value !== null) {
          if ('increment' in value) {
            // Получаем текущее значение
            const { data: current } = await supabaseAdmin
              .from('articles')
              .select(key)
              .eq('id', id)
              .single();
            updateData[key] = (current?.[key] || 0) + value.increment;
          } else if ('decrement' in value) {
            const { data: current } = await supabaseAdmin
              .from('articles')
              .select(key)
              .eq('id', id)
              .single();
            updateData[key] = (current?.[key] || 0) - value.decrement;
          } else {
            updateData[key] = value;
          }
        } else {
          updateData[key] = value;
        }
      }
      
      const { data: result, error } = await supabaseAdmin
        .from('articles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    updateOne: async (args: { where: { id: number | string }; data: any }) => {
      return prisma.article.update(args);
    },
    delete: async (args: { where: { id: number | string } }) => {
      const id = typeof args.where.id === 'string' ? parseInt(args.where.id) : args.where.id;
      const { error } = await supabaseAdmin
        .from('articles')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { id };
    },
    count: async (args?: { where?: any }) => {
      let query = supabaseAdmin.from('articles').select('*', { count: 'exact', head: true });
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            if ('equals' in value) query = query.eq(key, value.equals);
          } else {
            query = query.eq(key, value);
          }
        });
      }
      
      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
  },
  
  // Disconnect (для совместимости)
  $disconnect: async () => {
    // Supabase не требует явного отключения
    logger.info('Database connection closed');
  },
};

logger.info('✅ Database client initialized (Supabase direct, без Prisma)');

export default prisma;

