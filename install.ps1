# Script d'installation des dépendances pour Boutiki
# Contourne les problèmes d'apostrophe dans le chemin

Write-Host "Installation des dépendances Boutiki..." -ForegroundColor Green

# Se placer dans le répertoire du projet
Set-Location -Path $PSScriptRoot

# Installer les dépendances
npm install

Write-Host "`nInstallation terminée !" -ForegroundColor Green
Write-Host "Lancez 'npm run dev' pour démarrer le serveur de développement." -ForegroundColor Cyan
