-- ============================================
-- PerleStudio - Public Link Sharing
-- À exécuter dans le SQL Editor de Supabase
-- ============================================

-- 1. Ajouter la colonne is_public aux projets
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- 2. Policy: tout le monde peut voir les projets publics
CREATE POLICY "Anyone can view public projects"
  ON projects FOR SELECT
  USING (is_public = true);
