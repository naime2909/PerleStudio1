#!/bin/bash
# PerleStudio - Script de Synchronisation Automatique
# Usage: ./sync.sh ["message de commit optionnel"]

MESSAGE="${1:-Auto-sync: Modifications sauvegardées $(date +'%Y-%m-%d %H:%M')}"

echo "🔄 Synchronisation avec GitHub..."

# Check if there are changes
if [[ -z $(git status --porcelain) ]]; then
    echo "✅ Aucun changement à synchroniser"
    exit 0
fi

echo "📝 Fichiers modifiés:"
git status --short

# Add all changes
echo ""
echo "➕ Ajout des fichiers..."
git add .

# Commit
echo "💾 Création du commit..."
git commit -m "$MESSAGE

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du commit"
    exit 1
fi

# Push
echo "🚀 Push vers GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Synchronisation réussie!"
    echo "🌐 Vercel va redéployer automatiquement dans quelques instants..."
else
    echo "❌ Erreur lors du push"
    exit 1
fi
