# ==============================================================================
# SIARC · Système d'Intelligence Artificielle pour l'Évaluation des Risques de Crédit
# Multi-stage Dockerfile pour déploiement en ligne unifié (Frontend + Backend ML)
# ==============================================================================

# ── Étape 1 : Construction du Frontend React + Vite
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json ./
RUN npm install

COPY frontend/src ./src
COPY frontend/index.html ./
COPY frontend/vite.config.ts ./
COPY frontend/tsconfig.json ./
COPY frontend/tailwind.config.js ./
COPY frontend/postcss.config.js ./

RUN npm run build

# ── Étape 2 : Image d'Exécution Python FastAPI + Scikit-Learn
FROM python:3.11-slim AS runner
WORKDIR /app

# Dépendances système minimales
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Installation des dépendances Python
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r ./backend/requirements.txt

# Copie du code Backend & des données nettoyées
COPY backend/ ./backend/
COPY DataSet_Credit.xlsx ./DataSet_Credit.xlsx

# Copie de l'application Frontend compilée (servie par FastAPI)
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

WORKDIR /app/backend

# Port d'écoute (compatible Render, Railway, Hugging Face, Koyeb, Docker standard)
ENV PORT=8000
EXPOSE 8000

# Commande de lancement avec gestion dynamique du port
CMD python3 -m uvicorn main:app --host 0.0.0.0 --port ${PORT}
