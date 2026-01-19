-- Таблица геймификации: опыт, стрики, последняя активность
-- level вычисляется на клиенте по experience (xpForLevel)

CREATE TABLE IF NOT EXISTS public.user_gamification (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  experience INT NOT NULL DEFAULT 0,
  streak_days INT NOT NULL DEFAULT 0,
  best_streak INT NOT NULL DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Индекс по дате для аналитики (опционально)
CREATE INDEX IF NOT EXISTS idx_user_gamification_last_activity
  ON public.user_gamification (last_activity_date)
  WHERE last_activity_date IS NOT NULL;

-- RLS
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;

-- Политики: DROP IF EXISTS для идемпотентного повтора миграции
DROP POLICY IF EXISTS "Users can read own gamification" ON public.user_gamification;
CREATE POLICY "Users can read own gamification"
  ON public.user_gamification
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own gamification" ON public.user_gamification;
CREATE POLICY "Users can insert own gamification"
  ON public.user_gamification
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own gamification" ON public.user_gamification;
CREATE POLICY "Users can update own gamification"
  ON public.user_gamification
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Триггер: обновлять updated_at при UPDATE
CREATE OR REPLACE FUNCTION public.user_gamification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_user_gamification_updated_at ON public.user_gamification;
CREATE TRIGGER tr_user_gamification_updated_at
  BEFORE UPDATE ON public.user_gamification
  FOR EACH ROW
  EXECUTE FUNCTION public.user_gamification_updated_at();

COMMENT ON TABLE public.user_gamification IS 'Опыт, стрики и дата последней активности для системы уровней';
