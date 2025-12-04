/**
 * GraphQL Context
 * Контекст для всех GraphQL resolvers
 */
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { supabaseAdmin, createSupabaseClient } from '../lib/supabase';
import logger from '../lib/logger';

export interface GraphQLContext {
  req: AuthRequest;
  res: Response;
  prisma: PrismaClient;
  supabase: SupabaseClient;
  user?: {
    id: string;
    email: string;
    role?: string;
  };
  logger: typeof logger;
}

/**
 * Создание контекста для GraphQL
 */
export function createContext({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): GraphQLContext {
  const authReq = req as AuthRequest;
  const supabase = authReq.user
    ? createSupabaseClient(req.headers.authorization?.replace('Bearer ', ''))
    : supabaseAdmin;

  return {
    req: authReq,
    res,
    prisma,
    supabase,
    user: authReq.user,
    logger,
  };
}

