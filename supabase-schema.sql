-- =============================================
-- JW Quiz - Supabase Database Schema
-- Execute este SQL no SQL Editor do Supabase
-- =============================================

-- 1. Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Questions
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  difficulty SMALLINT NOT NULL CHECK (difficulty IN (1, 2, 3)),
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index SMALLINT NOT NULL CHECK (correct_index >= 0 AND correct_index <= 3),
  reference TEXT NOT NULL,
  explanation TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Quiz Sessions
CREATE TABLE quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  best_streak INTEGER NOT NULL DEFAULT 0,
  category_id UUID REFERENCES categories(id),
  difficulty SMALLINT CHECK (difficulty IN (1, 2, 3)),
  time_per_question INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Weekly Rankings
CREATE TABLE weekly_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  total_score INTEGER NOT NULL DEFAULT 0,
  quizzes_completed INTEGER NOT NULL DEFAULT 0,
  questions_answered INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (player_name, week_start)
);

-- Indexes
CREATE INDEX idx_questions_category ON questions(category_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_active ON questions(is_active);
CREATE INDEX idx_weekly_rankings_week ON weekly_rankings(week_start);
CREATE INDEX idx_weekly_rankings_score ON weekly_rankings(total_score DESC);
CREATE INDEX idx_quiz_sessions_completed ON quiz_sessions(completed_at);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_rankings ENABLE ROW LEVEL SECURITY;

-- Public read for categories
CREATE POLICY "Public read categories" ON categories
  FOR SELECT USING (true);

-- Public read for active questions
CREATE POLICY "Public read active questions" ON questions
  FOR SELECT USING (true);

-- Anyone can insert quiz sessions
CREATE POLICY "Public insert quiz_sessions" ON quiz_sessions
  FOR INSERT WITH CHECK (true);

-- Public read quiz sessions
CREATE POLICY "Public read quiz_sessions" ON quiz_sessions
  FOR SELECT USING (true);

-- Anyone can insert/update weekly rankings
CREATE POLICY "Public insert weekly_rankings" ON weekly_rankings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update weekly_rankings" ON weekly_rankings
  FOR UPDATE USING (true);

-- Public read weekly rankings
CREATE POLICY "Public read weekly_rankings" ON weekly_rankings
  FOR SELECT USING (true);

-- Admin operations via service_role key bypass RLS automatically
-- For questions/categories CRUD from admin panel, we use service_role key
-- Add policies for insert/update/delete on questions and categories
CREATE POLICY "Admin insert questions" ON questions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin update questions" ON questions
  FOR UPDATE USING (true);

CREATE POLICY "Admin delete questions" ON questions
  FOR DELETE USING (true);

CREATE POLICY "Admin insert categories" ON categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin update categories" ON categories
  FOR UPDATE USING (true);

CREATE POLICY "Admin delete categories" ON categories
  FOR DELETE USING (true);
