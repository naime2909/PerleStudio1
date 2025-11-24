# ⚡ GUIDE ULTRA-RAPIDE
## Déployer PerleDesign en 10 minutes

---

## 🎯 EN 3 ÉTAPES

### 1️⃣ GITHUB (2 min)

```bash
cd perle-design-app
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/VOTRE-USERNAME/perle-design-app.git
git push -u origin main
```

### 2️⃣ CLÉ API GEMINI (3 min)

1. → [ai.google.dev](https://ai.google.dev)
2. **"Get API Key"**
3. Copiez la clé (AIzaSy...)

### 3️⃣ VERCEL (5 min)

1. → [vercel.com](https://vercel.com)
2. **"New Project"**
3. Importez `perle-design-app` depuis GitHub
4. **Environment Variables** :
   - Name: `VITE_GEMINI_API_KEY`
   - Value: Votre clé de l'étape 2
5. **Deploy**

---

## ✅ VÉRIFICATION

- URL : `https://perle-design-app-xxxxx.vercel.app`
- Testez le générateur IA (thème "Océan")
- Si ça marche → **🎉 BRAVO !**

---

## 🆘 PROBLÈME ?

### Erreur "API Key not found"
→ Ajoutez `VITE_GEMINI_API_KEY` sur Vercel (Settings → Environment Variables)

### Build Failed
→ Vérifiez que tous les fichiers sont sur GitHub

### IA ne répond pas
→ Vérifiez votre clé API sur [ai.google.dev](https://ai.google.dev)

---

## 📱 INSTALLER COMME APP

**iPhone** : Safari → Partager → Sur l'écran d'accueil  
**Android** : Chrome → Menu → Installer l'application  
**PC** : Chrome → Icône + dans barre d'adresse

---

**C'EST TOUT ! 🚀**

Lire le **GUIDE_DEPLOIEMENT.md** pour plus de détails.
