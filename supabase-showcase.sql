-- ============================================
-- PerleStudio - Showcase / Vitrine
-- À exécuter dans le SQL Editor de Supabase
-- ============================================

-- 1. Ajouter bio aux profils
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';

-- 2. Ajouter visibility aux projets (remplace is_public)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'private'
  CHECK (visibility IN ('private', 'public', 'showcased'));

-- Migrer les données existantes
UPDATE projects SET visibility = 'public' WHERE is_public = true AND visibility = 'private';

-- 3. Table des likes
CREATE TABLE IF NOT EXISTS showcase_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_showcase_likes_project ON showcase_likes(project_id);
CREATE INDEX IF NOT EXISTS idx_showcase_likes_user ON showcase_likes(user_id);

ALTER TABLE showcase_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by everyone"
  ON showcase_likes FOR SELECT USING (true);

CREATE POLICY "Users can like projects"
  ON showcase_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike projects"
  ON showcase_likes FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Table des copies (tracking)
CREATE TABLE IF NOT EXISTS showcase_copies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  copied_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_showcase_copies_source ON showcase_copies(source_project_id);

ALTER TABLE showcase_copies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Copies are viewable by everyone"
  ON showcase_copies FOR SELECT USING (true);

CREATE POLICY "Users can copy projects"
  ON showcase_copies FOR INSERT
  WITH CHECK (auth.uid() = copied_by);

-- 5. Nouvelles policies RLS pour projets publics/showcased
CREATE POLICY "Anyone can view showcased projects"
  ON projects FOR SELECT
  USING (visibility = 'showcased');

CREATE POLICY "Anyone can view public visibility projects"
  ON projects FOR SELECT
  USING (visibility = 'public');

-- 6. Policy pour permettre à tout le monde de lire les profils (déjà existante normalement)
-- Si elle n'existe pas :
-- CREATE POLICY "Profiles are viewable by everyone"
--   ON profiles FOR SELECT USING (true);
