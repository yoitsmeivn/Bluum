-- Bluum Database Schema
-- Run this in the Supabase SQL Editor to set up all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  organisation TEXT,
  role TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create user row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- RESEARCHES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS researches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  enriched_query TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'done', 'error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_researches_user_id ON researches(user_id);
CREATE INDEX idx_researches_created_at ON researches(created_at DESC);

-- ============================================================
-- SECTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  research_id UUID NOT NULL REFERENCES researches(id) ON DELETE CASCADE,
  section_name TEXT NOT NULL CHECK (section_name IN ('overview', 'ma_activity', 'targets', 'risks', 'buyers')),
  content JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'loading', 'done', 'error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sections_research_id ON sections(research_id);

-- ============================================================
-- TEARSHEETS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS tearsheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  research_id UUID NOT NULL REFERENCES researches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tearsheets_user_id ON tearsheets(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE researches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tearsheets ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Researches: users can only access their own
CREATE POLICY "Users can view own researches"
  ON researches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create researches"
  ON researches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Sections: users can view sections of their own researches
CREATE POLICY "Users can view own sections"
  ON sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM researches
      WHERE researches.id = sections.research_id
      AND researches.user_id = auth.uid()
    )
  );

-- Tearsheets: users can only access their own
CREATE POLICY "Users can view own tearsheets"
  ON tearsheets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tearsheets"
  ON tearsheets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tearsheets"
  ON tearsheets FOR DELETE
  USING (auth.uid() = user_id);
