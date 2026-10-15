# Guide de Déploiement en Ligne · SIARC
**Système d'Intelligence Artificielle pour l'Évaluation des Risques de Crédit**  
*Microfinance & Systèmes Financiers Décentralisés (SFD) — Réglementation BCEAO*

---

## 🏛️ Architecture Unifiée de Déploiement

L'application **SIARC** est conçue pour fonctionner de manière **100% unifiée et autonome** dans un seul conteneur Docker ou sur un seul port :
- **Frontend** : Interface React + Tailwind CSS compilée en production (`frontend/dist`).
- **Backend & ML** : API FastAPI + Random Forest Classifier (180 estimateurs) servant à la fois l'API REST (`/api/*`) et les pages web (`/`).
- **Base de Données & Données** : 15 188 dossiers réels SFD Sénégal intégrés dans `backend/data/credit_clean.csv`.

---

## 🚀 Option 1 : Déploiement Gratuit sur Render.com (Recommandé)

Render permet d'héberger gratuitement l'application avec HTTPS automatique et nom de domaine public.

### Étapes simples (en 3 clics) :
1. Créez un compte gratuit sur [Render.com](https://render.com).
2. Cliquez sur **« New »** > **« Blueprint »** (ou **« Web Service »**).
3. Connectez votre dépôt GitHub (`projetexamen`).
4. Render détectera automatiquement le fichier [render.yaml](file:///home/almuxtaar/Projets/data/projetexamen/render.yaml) configuré à la racine :
   - Type d'environnement : `Docker`
   - Région : `Frankfurt` (ou Oregon)
   - Plan : `Free`
   - Route de santé : `/api/overview`
5. Cliquez sur **« Apply »**. En moins de 3 minutes, votre application sera accessible en ligne sur une URL du type :
   ```
   https://siarc-credit-ia.onrender.com
   ```

---

## 🤗 Option 2 : Déploiement Gratuit sur Hugging Face Spaces (Idéal IA / Académique)

Hugging Face Spaces offre un hébergement Docker gratuit sans mise en veille brutale, parfaitement adapté aux jurys académiques et soutenances de projets de Data Science.

### Étapes :
1. Connectez-vous sur [Hugging Face](https://huggingface.co).
2. Rendez-vous dans **Spaces** > **« Create new Space »**.
3. Choisissez :
   - Space name : `siarc-evaluation-risque-credit`
   - License : `mit`
   - Space SDK : **Docker** > **Blank**
   - Space hardware : `Free (CPU basic · 2 vCPU · 16 GB RAM)`
4. Poussez le dépôt Git vers votre Space :
   ```bash
   git remote add space https://huggingface.co/spaces/<VOTRE_PSEUDO>/siarc-evaluation-risque-credit
   git push space main
   ```
5. Hugging Face va construire automatiquement l'image Docker multi-étapes et générer votre URL publique pérenne :
   ```
   https://huggingface.co/spaces/<VOTRE_PSEUDO>/siarc-evaluation-risque-credit
   ```

---

## 🚂 Option 3 : Déploiement sur Railway.app

Le fichier [railway.json](file:///home/almuxtaar/Projets/data/projetexamen/railway.json) est déjà pré-configuré à la racine.

1. Allez sur [Railway.app](https://railway.app).
2. Cliquez sur **« New Project »** > **« Deploy from GitHub repo »**.
3. Sélectionnez le dépôt.
4. Railway génère automatiquement une URL publique `*.up.railway.app` et déploie le conteneur en moins de 2 minutes.

---

## 🐳 Option 4 : Déploiement sur N'importe quel Serveur VPS avec Docker

Sur un serveur Ubuntu / Debian (OVH, DigitalOcean, AWS, Linode) :

```bash
# 1. Cloner le projet
git clone <URL_DU_DEPOT> siarc-credit
cd siarc-credit

# 2. Construction de l'image Docker unifiée
docker build -t siarc-app .

# 3. Lancement du conteneur en arrière-plan
docker run -d --name siarc_credit --restart always -p 80:8000 -e PORT=8000 siarc-app

# 4. Vérification
curl http://localhost/api/overview
```

L'application est immédiatement accessible sur l'adresse IP publique de votre serveur (port 80).

---

## 🧪 Option 5 : Test Local du Serveur Unifié de Production

Vous pouvez tester immédiatement en local le mode de production unifié (FastAPI servant l'interface React et le modèle ML sur un seul port) :

```bash
# 1. Compiler le frontend
cd frontend && npm run build && cd ..

# 2. Lancer le serveur unifié
cd backend && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
```

Accédez à `http://localhost:8000` : l'interface React complète, l'API REST et le moteur d'inférence fonctionnent de concert.
