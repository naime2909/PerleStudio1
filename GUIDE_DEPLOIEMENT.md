# 🚀 GUIDE DE DÉPLOIEMENT COMPLET
## PerleDesign Studio sur Vercel

Ce guide vous accompagne **étape par étape** pour mettre votre application en ligne gratuitement.

---

## 📋 PRÉREQUIS

Avant de commencer, vous aurez besoin de :

✅ Un compte **GitHub** (gratuit) → [github.com/signup](https://github.com/signup)  
✅ Un compte **Vercel** (gratuit) → [vercel.com/signup](https://vercel.com/signup)  
✅ Une **Clé API Gemini** (gratuite) → [ai.google.dev](https://ai.google.dev)  
✅ **Git installé** sur votre ordinateur → [git-scm.com](https://git-scm.com)

---

## 🔑 ÉTAPE 1 : OBTENIR UNE CLÉ API GEMINI (5 min)

### 1.1 Créer la clé API

1. Allez sur [https://ai.google.dev](https://ai.google.dev)
2. Cliquez sur **"Get API Key"** ou **"Get started"**
3. Connectez-vous avec votre **compte Google**
4. Cliquez sur **"Create API Key"**
5. **Copiez la clé** (elle ressemble à : `AIzaSyD...`)
6. ⚠️ **IMPORTANT** : Gardez cette clé en lieu sûr, vous en aurez besoin !

### 1.2 Vérifier que la clé fonctionne

Testez sur la page [Google AI Studio](https://aistudio.google.com/) :
- Si vous pouvez générer du texte, votre clé est active ✅

---

## 📦 ÉTAPE 2 : PRÉPARER LE CODE (10 min)

### 2.1 Créer un dépôt GitHub

1. Allez sur [https://github.com/new](https://github.com/new)
2. **Nom du repository** : `perle-design-app`
3. **Public** ou **Private** (au choix)
4. ❌ **Ne cochez pas** "Add a README file"
5. Cliquez sur **"Create repository"**

### 2.2 Uploader votre code

Deux méthodes possibles :

#### Méthode A : Via Terminal (recommandé)

```bash
# 1. Ouvrez un terminal dans le dossier perle-design-app

# 2. Initialisez Git
git init
git add .
git commit -m "Initial commit - PerleDesign Studio"

# 3. Connectez à GitHub (remplacez VOTRE-USERNAME)
git remote add origin https://github.com/VOTRE-USERNAME/perle-design-app.git
git branch -M main
git push -u origin main
```

Si Git demande vos identifiants :
- **Username** : Votre nom d'utilisateur GitHub
- **Password** : Créez un [Personal Access Token](https://github.com/settings/tokens) (pas votre mot de passe)

#### Méthode B : Via GitHub Desktop (plus simple pour débutants)

1. Téléchargez [GitHub Desktop](https://desktop.github.com)
2. Installez et connectez-vous
3. **File** → **Add Local Repository**
4. Sélectionnez le dossier `perle-design-app`
5. **Publish repository** → Cochez "Keep this code private" si souhaité
6. Cliquez sur **Publish**

### 2.3 Vérifier sur GitHub

Allez sur `https://github.com/VOTRE-USERNAME/perle-design-app`  
Vous devriez voir tous vos fichiers ! ✅

---

## 🌐 ÉTAPE 3 : DÉPLOYER SUR VERCEL (5 min)

### 3.1 Connecter Vercel à GitHub

1. Allez sur [https://vercel.com](https://vercel.com)
2. Cliquez sur **"Sign Up"** (ou "Log In" si vous avez déjà un compte)
3. Choisissez **"Continue with GitHub"**
4. Autorisez Vercel à accéder à votre GitHub

### 3.2 Importer le Projet

1. Sur le dashboard Vercel, cliquez sur **"Add New..."** → **"Project"**
2. Cherchez `perle-design-app` dans la liste
3. Cliquez sur **"Import"**

### 3.3 Configurer le Projet

Vercel va détecter automatiquement que c'est un projet **Vite React**.

**Configuration détectée** :
- Framework Preset : **Vite**
- Build Command : `npm run build`
- Output Directory : `dist`

✅ Pas besoin de changer ces paramètres !

### 3.4 Ajouter la Variable d'Environnement (CRITIQUE !)

C'est l'étape la plus importante :

1. Déroulez **"Environment Variables"**
2. Ajoutez une nouvelle variable :
   - **Name** : `VITE_GEMINI_API_KEY`
   - **Value** : Votre clé API Gemini (de l'étape 1)
3. Cochez **Production**, **Preview**, et **Development**

![Environment Variables](https://via.placeholder.com/600x150?text=Name:+VITE_GEMINI_API_KEY+|+Value:+Your+API+Key)

### 3.5 Déployer !

1. Cliquez sur **"Deploy"**
2. ☕ Attendez 1-2 minutes (Vercel va build votre application)
3. 🎉 **C'est en ligne !**

---

## 🎯 ÉTAPE 4 : ACCÉDER À VOTRE APPLICATION

### 4.1 Récupérer l'URL

Vercel vous donne automatiquement une URL :
```
https://perle-design-app-XXXXX.vercel.app
```

### 4.2 Tester l'Application

1. Cliquez sur **"Visit"** ou copiez l'URL
2. L'application devrait s'ouvrir ! ✅
3. Testez le générateur IA pour vérifier que la clé API fonctionne

### 4.3 Personnaliser le Domaine (Optionnel)

Si vous voulez un nom plus sympa :

1. Dans Vercel → **Settings** → **Domains**
2. Ajoutez un domaine personnalisé :
   - Gratuit : `mon-app.vercel.app`
   - Payant : `monsite.com` (vous devez acheter le domaine)

---

## 🔧 MAINTENANCE ET MISES À JOUR

### Mettre à Jour l'Application

Chaque fois que vous modifiez le code :

```bash
# 1. Commit vos changements
git add .
git commit -m "Description des changements"

# 2. Push sur GitHub
git push

# 3. Vercel redéploie automatiquement ! 🚀
```

### Modifier la Clé API

1. Allez sur Vercel → Votre projet
2. **Settings** → **Environment Variables**
3. Modifiez `VITE_GEMINI_API_KEY`
4. **Redeploy** nécessaire (bouton "Redeploy" dans Deployments)

---

## ❌ PROBLÈMES FRÉQUENTS

### 🐛 Problème : "Build Failed"

**Solution** :
```bash
# Vérifiez que le build fonctionne localement
npm install
npm run build

# Si ça marche en local mais pas sur Vercel :
# 1. Vérifiez package.json
# 2. Vérifiez tsconfig.json
# 3. Regardez les logs sur Vercel (Deployments → View Logs)
```

### 🐛 Problème : "API Key Not Found"

**Solution** :
1. Vérifiez que `VITE_GEMINI_API_KEY` est bien ajoutée sur Vercel
2. Variable d'environnement doit commencer par `VITE_` (important !)
3. Après ajout, faites un **Redeploy**

### 🐛 Problème : "Cannot Push to GitHub"

**Solution** :
```bash
# Utilisez un Personal Access Token au lieu du mot de passe
# 1. Allez sur https://github.com/settings/tokens
# 2. Generate new token (classic)
# 3. Sélectionnez "repo"
# 4. Utilisez ce token comme mot de passe
```

### 🐛 Problème : "L'IA ne génère rien"

**Solution** :
1. Vérifiez que votre clé API Gemini est active
2. Testez sur [ai.google.dev](https://ai.google.dev)
3. Vérifiez la console du navigateur (F12) pour voir les erreurs
4. Quota gratuit : 60 requêtes/minute

---

## 📱 ÉTAPE BONUS : INSTALLER COMME APPLICATION

### Sur Mobile (iOS/Android)

**iPhone/iPad** :
1. Ouvrez l'app dans Safari
2. Appuyez sur le bouton **Partager** (carré avec flèche)
3. **"Sur l'écran d'accueil"**
4. Nommez l'app → **Ajouter**

**Android** :
1. Ouvrez l'app dans Chrome
2. Menu (⋮) → **"Installer l'application"**
3. **Installer**

### Sur Desktop (Windows/Mac/Linux)

**Chrome/Edge** :
1. Cliquez sur l'icône **+** dans la barre d'adresse
2. Ou Menu → **"Installer PerleDesign..."**
3. L'app s'ouvre comme une vraie application !

**Firefox** :
1. Pas de PWA native, mais vous pouvez créer un raccourci
2. Menu → **Personnaliser** → Glissez l'icône sur le bureau

---

## 🎨 PERSONNALISATION

### Changer le Nom de l'Application

Éditez `index.html` :
```html
<title>VotreNom - Créateur de Bracelets</title>
```

### Changer les Couleurs

Éditez `src/App.tsx` et cherchez les classes Tailwind :
- `bg-indigo-600` → `bg-purple-600` (boutons)
- `text-indigo-600` → `text-purple-600` (accents)

### Ajouter un Logo

1. Ajoutez `logo.png` dans le dossier `public/`
2. Modifiez `index.html` :
```html
<link rel="icon" type="image/png" href="/logo.png" />
```

---

## 📊 ANALYTICS (Optionnel)

### Ajouter Google Analytics

1. Créez un compte sur [analytics.google.com](https://analytics.google.com)
2. Obtenez votre ID de tracking (G-XXXXXXXXXX)
3. Ajoutez dans `index.html` avant `</head>` :

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## ✅ CHECKLIST FINALE

Avant de partager votre application :

- [ ] L'application fonctionne sur `https://votre-app.vercel.app`
- [ ] Le générateur IA fonctionne (teste avec "Coucher de soleil")
- [ ] Les calculs de perles sont corrects
- [ ] Testée sur mobile (responsive)
- [ ] Testée sur différents navigateurs
- [ ] Clé API Gemini configurée et active
- [ ] README.md mis à jour avec votre URL

---

## 🎉 FÉLICITATIONS !

Votre application est maintenant **en ligne et accessible** dans le monde entier !

**Partagez-la** :
- Sur Instagram/TikTok : @gomunohit
- Sur votre boutique So Perles
- Avec la communauté du tissage de perles

**Prochaines étapes** :
1. Collectez des retours utilisateurs
2. Ajoutez des fonctionnalités
3. Partagez sur les réseaux sociaux
4. Monétisez avec des fonctionnalités premium

---

## 📞 BESOIN D'AIDE ?

**Problèmes techniques** :
- GitHub Issues : [github.com/VOTRE-USERNAME/perle-design-app/issues](https://github.com)
- Documentation Vercel : [vercel.com/docs](https://vercel.com/docs)
- Documentation Vite : [vitejs.dev](https://vitejs.dev)

**Questions spécifiques** :
- Email : contact@so-perles.fr
- Community Discord Vercel : [vercel.com/discord](https://vercel.com/discord)

---

**Bon déploiement ! 🚀✨**

*Guide créé avec ❤️ pour So Perles*
