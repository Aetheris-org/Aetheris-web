-- Supabase Migration: Initial Schema for KeystoneJS Integration
-- Создание таблиц, совместимых с KeystoneJS и Supabase Auth

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- PROFILES TABLE
-- ============================================
-- Расширяет auth.users из Supabase Auth
-- Связывается с auth.users через UUID (id = auth.users.id)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email_hash TEXT NOT NULL UNIQUE, -- HMAC-SHA256 хеш email для приватности
  bio TEXT,
  avatar TEXT,
  cover_image TEXT,
  provider TEXT DEFAULT 'local' CHECK (provider IN ('local', 'google')),
  confirmed BOOLEAN DEFAULT false,
  blocked BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email_hash ON public.profiles(email_hash);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================
-- ARTICLES TABLE
-- ============================================
-- Используем SERIAL для совместимости с KeystoneJS autoincrement
CREATE TABLE IF NOT EXISTS public.articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- TipTap/ProseMirror JSON content
  excerpt TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tags JSONB,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  preview_image TEXT,
  likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
  dislikes_count INTEGER DEFAULT 0 CHECK (dislikes_count >= 0),
  views INTEGER DEFAULT 0 CHECK (views >= 0),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for articles
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at);
CREATE INDEX IF NOT EXISTS idx_articles_title ON public.articles USING gin(to_tsvector('english', title));

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.comments (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL CHECK (char_length(text) >= 1 AND char_length(text) <= 10000),
  article_id INTEGER NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES public.comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
  dislikes_count INTEGER DEFAULT 0 CHECK (dislikes_count >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON public.comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at);

-- ============================================
-- ARTICLE REACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.article_reactions (
  id SERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL CHECK (reaction IN ('like', 'dislike')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, user_id)
);

-- Create indexes for article_reactions
CREATE INDEX IF NOT EXISTS idx_article_reactions_article_id ON public.article_reactions(article_id);
CREATE INDEX IF NOT EXISTS idx_article_reactions_user_id ON public.article_reactions(user_id);

-- ============================================
-- COMMENT REACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.comment_reactions (
  id SERIAL PRIMARY KEY,
  comment_id INTEGER NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL CHECK (reaction IN ('like', 'dislike')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Create indexes for comment_reactions
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON public.comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user_id ON public.comment_reactions(user_id);

-- ============================================
-- BOOKMARKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  article_id INTEGER NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- Create indexes for bookmarks
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_article_id ON public.bookmarks(article_id);

-- ============================================
-- FOLLOWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.follows (
  id SERIAL PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create indexes for follows
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('comment', 'comment_reply', 'follow', 'article_published', 'article_like', 'comment_like')),
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  article_id INTEGER REFERENCES public.articles(id) ON DELETE CASCADE,
  comment_id INTEGER REFERENCES public.comments(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to sync article reaction counts
CREATE OR REPLACE FUNCTION sync_article_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.reaction = 'like' THEN
      UPDATE public.articles SET likes_count = likes_count + 1 WHERE id = NEW.article_id;
    ELSIF NEW.reaction = 'dislike' THEN
      UPDATE public.articles SET dislikes_count = dislikes_count + 1 WHERE id = NEW.article_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.reaction = 'like' THEN
      UPDATE public.articles SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.article_id;
    ELSIF OLD.reaction = 'dislike' THEN
      UPDATE public.articles SET dislikes_count = GREATEST(dislikes_count - 1, 0) WHERE id = OLD.article_id;
    END IF;
    IF NEW.reaction = 'like' THEN
      UPDATE public.articles SET likes_count = likes_count + 1 WHERE id = NEW.article_id;
    ELSIF NEW.reaction = 'dislike' THEN
      UPDATE public.articles SET dislikes_count = dislikes_count + 1 WHERE id = NEW.article_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.reaction = 'like' THEN
      UPDATE public.articles SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.article_id;
    ELSIF OLD.reaction = 'dislike' THEN
      UPDATE public.articles SET dislikes_count = GREATEST(dislikes_count - 1, 0) WHERE id = OLD.article_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for article reaction counts
CREATE TRIGGER sync_article_reaction_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.article_reactions
  FOR EACH ROW EXECUTE FUNCTION sync_article_reaction_counts();

-- Function to sync comment reaction counts
CREATE OR REPLACE FUNCTION sync_comment_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.reaction = 'like' THEN
      UPDATE public.comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
    ELSIF NEW.reaction = 'dislike' THEN
      UPDATE public.comments SET dislikes_count = dislikes_count + 1 WHERE id = NEW.comment_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.reaction = 'like' THEN
      UPDATE public.comments SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.comment_id;
    ELSIF OLD.reaction = 'dislike' THEN
      UPDATE public.comments SET dislikes_count = GREATEST(dislikes_count - 1, 0) WHERE id = OLD.comment_id;
    END IF;
    IF NEW.reaction = 'like' THEN
      UPDATE public.comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
    ELSIF NEW.reaction = 'dislike' THEN
      UPDATE public.comments SET dislikes_count = dislikes_count + 1 WHERE id = NEW.comment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.reaction = 'like' THEN
      UPDATE public.comments SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.comment_id;
    ELSIF OLD.reaction = 'dislike' THEN
      UPDATE public.comments SET dislikes_count = GREATEST(dislikes_count - 1, 0) WHERE id = OLD.comment_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for comment reaction counts
CREATE TRIGGER sync_comment_reaction_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.comment_reactions
  FOR EACH ROW EXECUTE FUNCTION sync_comment_reaction_counts();

