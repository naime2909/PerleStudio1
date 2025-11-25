# 🌟 PerleDesign Studio

Application web professionnelle pour créer et concevoir des bracelets en perles Miyuki.
![PerleDesign](https://img.shields.io/badge/Version-1.0.0-blue) ![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-5.1-646CFF?logo=vite)

## ✨ Fonctionnalités

- 🎨 **Éditeur de Motifs Interactif** : Créez des designs pixel par pixel
- 🤖 **Génération IA de Palettes** : Gemini AI génère des combinaisons de couleurs
- 📏 **Calculateur Automatique** : Nombre de perles nécessaires selon le tour de poignet
- 🎯 **Modes de Tissage** : Support Loom et Peyote
- 💾 **Sauvegarde/Export** : Exportez vos créations en JSON
- 📱 **Responsive** : Fonctionne sur mobile, tablette et desktop

## 🚀 Déploiement sur Vercel (RECOMMANDÉ)

### Méthode 1 : Déploiement Direct (Le plus Simple)

1. **Créer un compte Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Connectez-vous avec GitHub

2. **Préparer le code sur GitHub**
   ```bash
   # Dans le dossier perle-design-app
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/VOTRE-USERNAME/perle-design-app.git
   git push -u origin main
   ```

3. **Déployer sur Vercel**
   - Sur Vercel, cliquez sur "New Project"
   - Importez votre repo GitHub `perle-design-app`
   - Vercel détectera automatiquement que c'est un projet Vite
   - **IMPORTANT** : Ajoutez la variable d'environnement :
     - Key: `VITE_GEMINI_API_KEY`
     - Value: Votre clé API Gemini (obtenue sur [ai.google.dev](https://ai.google.dev))
   - Cliquez sur "Deploy"

4. **C'est en ligne ! 🎉**
   - Votre app sera accessible sur `https://votre-app.vercel.app`

### Méthode 2 : CLI Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Dans le dossier du projet
vercel

# Suivre les instructions
# Ajouter la variable d'environnement quand demandé
```

## 💻 Installation Locale

### Prérequis
- Node.js 18+ ([télécharger](https://nodejs.org/))
- npm ou yarn

### Installation

```bash
# 1. Cloner le projet
git clone https://github.com/VOTRE-USERNAME/perle-design-app.git
cd perle-design-app

# 2. Installer les dépendances
npm install

# 3. Créer le fichier .env
cp .env.example .env

# 4. Ajouter votre clé API Gemini dans .env
# Éditez le fichier .env et ajoutez :
# VITE_GEMINI_API_KEY=votre_clé_ici
```

### Obtenir une Clé API Gemini (GRATUIT)

1. Allez sur [ai.google.dev](https://ai.google.dev)
2. Connectez-vous avec votre compte Google
3. Cliquez sur "Get API Key"
4. Créez une nouvelle clé API
5. Copiez-la dans votre fichier `.env`

### Lancement en Local

```bash
# Démarrer le serveur de développement
npm run dev

# L'application sera accessible sur http://localhost:5173
```

### Build pour Production

```bash
# Créer le build optimisé
npm run build

# Prévisualiser le build
npm run preview
```

## 📱 Application Mobile/Desktop

### Option 1 : PWA (Progressive Web App)

L'application peut être installée comme une app native :

**Sur Mobile (iOS/Android)** :
1. Ouvrez l'app dans Safari/Chrome
2. Appuyez sur "Partager" ou menu (⋮)
3. "Ajouter à l'écran d'accueil"

**Sur Desktop** :
1. Dans Chrome, cliquez sur l'icône d'installation dans la barre d'adresse
2. Ou Menu → "Installer PerleDesign"

### Option 2 : Electron (App Desktop Native)

Pour créer une vraie application desktop :

```bash
# Installation d'Electron
npm install -D electron electron-builder

# Ajoutez dans package.json :
{
  "scripts": {
    "electron": "electron .",
    "electron:build": "electron-builder"
  }
}
```

Créez `electron.js` à la racine :

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

app.whenReady().then(createWindow);
```

## 🛠️ Configuration Vercel

Le projet inclut `vercel.json` avec la configuration optimale :

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_GEMINI_API_KEY": "@gemini_api_key"
  }
}
```

## 🔧 Stack Technique

- **Frontend** : React 18 + TypeScript
- **Build Tool** : Vite 5
- **Styling** : Tailwind CSS 3
- **Icons** : Lucide React
- **IA** : Google Gemini API
- **Hosting** : Vercel

## 📁 Structure du Projet

```
perle-design-app/
├── src/
│   ├── components/          # Composants React
│   │   ├── AIGenerator.tsx
│   │   ├── BeadRenderer.tsx
│   │   ├── PatternEditor.tsx
│   │   ├── StatsPanel.tsx
│   │   └── VisualPreview.tsx
│   ├── services/            # Services API
│   │   └── geminiService.ts
│   ├── App.tsx              # Composant principal
│   ├── index.tsx            # Point d'entrée
│   ├── types.ts             # Types TypeScript
│   └── constants.ts         # Constantes
├── public/                  # Assets statiques
├── index.html               # HTML template
├── package.json             # Dépendances
├── tsconfig.json            # Config TypeScript
├── vite.config.ts           # Config Vite
├── vercel.json              # Config Vercel
└── .env.example             # Template variables env
```

## 🐛 Résolution de Problèmes

### L'IA ne fonctionne pas

1. Vérifiez que `VITE_GEMINI_API_KEY` est bien définie
2. Sur Vercel : Variables d'environnement → Ajouter `VITE_GEMINI_API_KEY`
3. En local : Vérifiez votre fichier `.env`
4. Testez votre clé API sur [ai.google.dev](https://ai.google.dev)

### Erreur de build sur Vercel

1. Vérifiez que `package.json` contient toutes les dépendances
2. Assurez-vous que `vite.config.ts` est présent
3. Vérifiez les logs de build sur Vercel

### L'application ne démarre pas localement

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 🌐 Déploiement sur d'autres Plateformes

### Netlify

1. Créez un compte sur [netlify.com](https://netlify.com)
2. Connectez votre repo GitHub
3. Build command : `npm run build`
4. Publish directory : `dist`
5. Ajoutez la variable d'environnement `VITE_GEMINI_API_KEY`

### GitHub Pages

```bash
# Installer gh-pages
npm install -D gh-pages

# Ajouter dans package.json :
{
  "homepage": "https://VOTRE-USERNAME.github.io/perle-design-app",
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
}

# Build et déployer
npm run build
npm run deploy
```

## 📝 Licence

MIT License - Libre d'utilisation pour projets personnels et commerciaux

## 🤝 Contribution

Les contributions sont les bienvenues ! 

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📧 Support

- **Issues GitHub** : [github.com/VOTRE-USERNAME/perle-design-app/issues](https://github.com)
- **Email** : contact@so-perles.fr

## 🎯 Roadmap

- [ ] Export en image PNG/SVG
- [ ] Bibliothèque de motifs prédéfinis
- [ ] Partage de créations
- [ ] Mode collaboratif temps réel
- [ ] Application mobile native (React Native)
- [ ] Intégration e-commerce

---

**Créé avec ❤️ pour la communauté du tissage de perles Miyuki**

🌟 Si vous aimez ce projet, donnez-lui une étoile sur GitHub !
