/**
 * Authentication middleware
 * Проверка JWT токенов Supabase и добавление пользователя в контекст
 */
import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import logger from '../lib/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

/**
 * Middleware для проверки аутентификации
 * Извлекает JWT токен из заголовка Authorization и проверяет его через Supabase
 */
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = undefined;
      return next();
    }

    const token = authHeader.substring(7); // Убираем "Bearer "

    // Проверяем токен через Supabase
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      logger.debug('Invalid or expired token', { error: error?.message });
      req.user = undefined;
      return next();
    }

    // Получаем профиль пользователя из БД
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id, email, role, blocked, confirmed')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      logger.warn('User profile not found', { userId: user.id });
      req.user = undefined;
      return next();
    }

    // Проверяем, не заблокирован ли пользователь
    if (profile.blocked) {
      logger.warn('Blocked user attempted to access', { userId: user.id });
      req.user = undefined;
      return next();
    }

    req.user = {
      id: profile.id,
      email: profile.email,
      role: profile.role,
    };

    next();
  } catch (error: any) {
    logger.error('Authentication middleware error', { error: error.message });
    req.user = undefined;
    next();
  }
}

/**
 * Middleware для проверки обязательной аутентификации
 * Возвращает 401, если пользователь не аутентифицирован
 */
export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'You must be logged in to access this resource',
    });
    return;
  }
  next();
}

/**
 * Middleware для проверки роли администратора
 */
export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'You must be logged in to access this resource',
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required',
    });
    return;
  }

  next();
}

