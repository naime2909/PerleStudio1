-- ============================================
-- PerleStudio - Schema Supabase
-- À exécuter dans le SQL Editor de Supabase
-- ============================================

-- 1. Table des profils utilisateurs
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index pour recherche par username
CREATE INDEX idx_profiles_username ON profiles(username);

-- 2. Table des projets (sync cloud)
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Sans titre',
  project_data JSONB NOT NULL, -- ProjectState (mode, grid, columns, rows, etc.)
  beads_data JSONB, -- ActiveBeads palette
  settings_data JSONB, -- ProjectSettings
  thumbnail TEXT, -- Base64 SVG thumbnail
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);

-- 3. Table des amitiés
CREATE TABLE friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(requester_id, addressee_id)
);

CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);

-- 4. Table des projets partagés
CREATE TABLE shared_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  shared_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  shared_with UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(project_id, shared_with)
);

CREATE INDEX idx_shared_projects_shared_with ON shared_projects(shared_with);
CREATE INDEX idx_shared_projects_project ON shared_projects(project_id);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut voir les profils (pour rechercher des amis)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Un utilisateur ne peut modifier que son propre profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Un utilisateur peut créer son profil
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- PROJECTS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Un utilisateur voit ses propres projets
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

-- Un utilisateur voit les projets partagés avec lui
CREATE POLICY "Users can view shared projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shared_projects
      WHERE shared_projects.project_id = projects.id
      AND shared_projects.shared_with = auth.uid()
    )
  );

-- CRUD sur ses propres projets
CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- FRIENDSHIPS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Voir ses propres demandes d'amis
CREATE POLICY "Users can view own friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Envoyer une demande d'ami
CREATE POLICY "Users can send friend requests"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Mettre à jour (accepter/refuser) une demande reçue
CREATE POLICY "Users can respond to friend requests"
  ON friendships FOR UPDATE
  USING (auth.uid() = addressee_id);

-- Supprimer une amitié (les deux parties peuvent)
CREATE POLICY "Users can delete friendships"
  ON friendships FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- SHARED PROJECTS
ALTER TABLE shared_projects ENABLE ROW LEVEL SECURITY;

-- Voir les partages qui nous concernent
CREATE POLICY "Users can view own shares"
  ON shared_projects FOR SELECT
  USING (auth.uid() = shared_by OR auth.uid() = shared_with);

-- Partager ses propres projets
CREATE POLICY "Users can share own projects"
  ON shared_projects FOR INSERT
  WITH CHECK (
    auth.uid() = shared_by
    AND EXISTS (
      SELECT 1 FROM projects WHERE projects.id = project_id AND projects.user_id = auth.uid()
    )
  );

-- Supprimer un partage
CREATE POLICY "Users can delete own shares"
  ON shared_projects FOR DELETE
  USING (auth.uid() = shared_by);

-- ============================================
-- Fonction: Créer automatiquement un profil à l'inscription
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      'user_' || LEFT(NEW.id::text, 8)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: après création d'un user dans auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Fonction: Mettre à jour updated_at automatiquement
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 5. Table des templates utilisateurs
-- ============================================
CREATE TABLE user_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Mon template',
  category TEXT NOT NULL DEFAULT 'custom' CHECK (category IN ('geometrique', 'floral', 'animal', 'symbole', 'alphabet', 'custom')),
  difficulty TEXT NOT NULL DEFAULT 'debutant' CHECK (difficulty IN ('debutant', 'intermediaire', 'avance')),
  rows INTEGER NOT NULL,
  columns INTEGER NOT NULL,
  mode TEXT NOT NULL DEFAULT 'loom',
  grid JSONB NOT NULL,
  bead_colors JSONB NOT NULL, -- Map "row-col" => hex color
  description TEXT,
  thumbnail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_user_templates_user_id ON user_templates(user_id);
CREATE INDEX idx_user_templates_updated_at ON user_templates(updated_at DESC);

-- RLS for user_templates
ALTER TABLE user_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates"
  ON user_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own templates"
  ON user_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON user_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON user_templates FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER user_templates_updated_at
  BEFORE UPDATE ON user_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
