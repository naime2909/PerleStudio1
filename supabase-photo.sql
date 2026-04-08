-- ============================================
-- PerleStudio - Photos de projets physiques
-- À exécuter dans le SQL Editor de Supabase
-- ============================================

-- 1. Ajouter la colonne photo_url aux projets
ALTER TABLE projects ADD COLUMN IF NOT EXISTS photo_url TEXT DEFAULT NULL;

-- 2. Créer le bucket 'project-photos' dans Storage
-- ⚠️ Ceci doit être fait via le dashboard Supabase :
--    Storage > New bucket > "project-photos" > Public bucket = ON
--
-- Ou via SQL (si supporté) :
-- INSERT INTO storage.buckets (id, name, public) VALUES ('project-photos', 'project-photos', true)
-- ON CONFLICT (id) DO NOTHING;

-- 3. Policies pour le bucket (à exécuter dans SQL Editor)
-- Permettre à tout le monde de voir les photos
CREATE POLICY "Public photo access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-photos');

-- Permettre aux utilisateurs connectés d'uploader
CREATE POLICY "Users can upload project photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'project-photos' AND auth.role() = 'authenticated');

-- Permettre aux utilisateurs de supprimer leurs photos
CREATE POLICY "Users can delete own project photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'project-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
