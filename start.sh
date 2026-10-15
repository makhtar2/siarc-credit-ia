#!/usr/bin/env bash

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "======================================================================"
echo "🏦  SIARC · SYSTÈME D’INTELLIGENCE ARTIFICIELLE POUR L'ÉVALUATION DES RISQUES DE CRÉDIT"
echo "    Plateforme Décisionnelle & Scoring Prudentiel (SFD Sénégal)"
echo "======================================================================"
echo "📁 Répertoire projet : $DIR"
echo ""

# 1. Vérification Backend
echo "⚙️  Démarrage du Backend FastAPI..."
cd "$DIR/backend"
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "   ✅ Backend lancé (PID: $BACKEND_PID) -> http://localhost:8000/docs"

# 2. Vérification Frontend
echo "⚙️  Démarrage du Frontend React + Vite..."
cd "$DIR/frontend"
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!
echo "   ✅ Frontend lancé (PID: $FRONTEND_PID) -> http://localhost:5173"

echo ""
echo "======================================================================"
echo "🚀 Application accessible sur : http://localhost:5173"
echo "📚 Documentation API Swagger : http://localhost:8000/docs"
echo "Appuyez sur [Ctrl + C] pour arrêter tous les services."
echo "======================================================================"

# Nettoyage à l'arrêt
trap "echo ''; echo 'Arrêt des services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit 0" SIGINT SIGTERM

wait
