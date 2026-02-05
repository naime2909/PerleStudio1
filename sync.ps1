# PerleStudio - Script de Synchronisation Automatique
# Usage: .\sync.ps1 ["message de commit optionnel"]

param(
    [string]$Message = "Auto-sync: Modifications sauvegardées $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

Write-Host "🔄 Synchronisation avec GitHub..." -ForegroundColor Cyan

# Check if there are changes
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "✅ Aucun changement à synchroniser" -ForegroundColor Green
    exit 0
}

Write-Host "📝 Fichiers modifiés:" -ForegroundColor Yellow
git status --short

# Add all changes
Write-Host "`n➕ Ajout des fichiers..." -ForegroundColor Cyan
git add .

# Commit
Write-Host "💾 Création du commit..." -ForegroundColor Cyan
$commitMessage = "$Message`n`nCo-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du commit" -ForegroundColor Red
    exit 1
}

# Push
Write-Host "🚀 Push vers GitHub..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Synchronisation réussie!" -ForegroundColor Green
    Write-Host "🌐 Vercel va redéployer automatiquement dans quelques instants..." -ForegroundColor Cyan
} else {
    Write-Host "❌ Erreur lors du push" -ForegroundColor Red
    exit 1
}
