# 🏦 Plateforme d'Analyse et de Scoring du Risque de Crédit

> **Projet d'Examen Data Science & Machine Learning**  
> Analyse du portefeuille et prédiction du risque de défaut sur le dataset `DataSet_Credit.xlsx` (Caisses & Mutuelles d'Épargne et de Crédit du Sénégal).

---

## 🎯 Aperçu du Projet

Cette application web Fullstack permet d'analyser, auditer et scorer le risque d'impayé et de défaut de crédit pour des institutions de microfinance sénégalaises (CEC Plateau, CEC Banlieue, MECYD, MECREST, MECZOR).
 
Elle a été construite sans utiliser le framework Streamlit, en s'appuyant sur un stack moderne **FastAPI + React 18 + TypeScript + Tailwind CSS** avec un design system **« Liquid Glass »** (toile de fond en rubans de soie 3D, fenêtrage dépoli translucide `backdrop-blur-2xl`, cartes obsidian noir profond `#18181B` et jauges circulaires concentriques).

---

## 🏗️ Architecture du Projet

```
projetexamen/
├── DataSet_Credit.xlsx         # Fichier de données brut d'origine (15 189 crédits)
├── RAPPORT_EXAMEN_CREDIT.md    # Rapport d'examen complet à remettre au professeur
├── README.md                   # Ce guide de présentation et d'installation
├── start.sh                    # Script de lancement en 1 clic (Backend + Frontend)
│
├── backend/                    # API RESTful & Moteur Machine Learning
│   ├── data/
│   │   └── credit_clean.csv    # Dataset nettoyé et standardisé (15 188 lignes)
│   ├── model.py                # Pipeline ML Random Forest, métriques & scoring
│   ├── main.py                 # Endpoints FastAPI (/overview, /model-metrics, /predict, etc.)
│   └── requirements.txt        # Dépendances Python
│
└── frontend/                   # Interface Utilisateur React + Tailwind CSS
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── App.tsx             # Barre de navigation capsule & layout principal
        ├── index.css           # Design tokens, variables CSS & styles personnalisés
        ├── lib/
        │   ├── api.ts          # Client d'appel des APIs backend
        │   └── utils.ts        # Formatage monétaire FCFA, pourcentages & palettes
        ├── components/ui/
        │   ├── Card.tsx        # Surfaces de cartes avec en-têtes stylisées
        │   ├── KpiCard.tsx     # Cartes d'indicateurs clés financiers
        │   ├── Badge.tsx       # Chips de statut (Sain, Vigilance, Défaut)
        │   └── PageHeader.tsx  # Titres de pages et fil d'Ariane
        └── pages/
            ├── DonneesPage.tsx # KPIs, graphiques Recharts & tableau paginé filtrable
            ├── ModelePage.tsx  # Matrice de confusion, feature importance & rapport
            └── PredictionPage.tsx # Simulateur de scoring et recommandation comité
```

---

## 🚀 Démarrage Rapide

### Méthode 1 : Lancement Automatique (Recommandé)

À la racine du projet, exécutez simplement :

```bash
./start.sh
```

Cette commande démarre automatiquement :
1. Le backend FastAPI sur `http://localhost:8000` (Documentation Swagger : `http://localhost:8000/docs`)
2. Le frontend React sur `http://localhost:5173`

---

### Méthode 2 : Lancement Manuel

#### 1. Démarrer le Backend
```bash
cd backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
```

#### 2. Démarrer le Frontend
```bash
cd frontend
npm run dev
```

Rendez-vous ensuite sur `http://localhost:5173` dans votre navigateur.

---

## 📊 Fonctionnalités & Pages

### 1. Portefeuille (`DonneesPage.tsx`)
- **Indicateurs Clés (KPIs) :** Volume total prêté (16.5 Mds FCFA), encours restant dû (11.6 Mds FCFA), taux d'amortissement moyen (31.3%), taux de défaut global (11.88%) et Portefeuille à Risque (PAR 30 : 16.48%).
- **Graphiques Décisionnels :** Répartition tripartite (Sain, Vigilance, Défaut), analyse des crédits et de l'encours par agence, top secteurs d'activité économique financés, analyse détaillée des paliers de retard de la banque.
- **Registre des Dossiers :** Tableau paginé avec recherche textuelle instantanée (N° crédit, N° membre) et filtres dynamiques par agence et niveau de risque.

### 2. Modèle ML (`ModelePage.tsx`)
- **Performances Globales :** Accuracy de **94.5%**, F1-Score Macro de **0.825** sur 3 038 crédits de test stratifiés.
- **Matrice de Confusion Heatmap :** Coloration contrastée des prédictions exactes vs erreurs d'affectation.
- **Importance des Variables (Gini) :** Graphique à barres horizontales ordonnant les variables les plus discriminantes (ancienneté, ratios d'amortissement, montants).
- **Rapport de Classification :** Précision (94.7% sur le Défaut), Rappel (92.2% sur le Défaut), F1-Score et jauges d'efficacité.

### 3. Simulateur & Scoring (`PredictionPage.tsx`)
- **Formulaire de Simulation en Temps Réel :** Saisie des paramètres d'un emprunteur (agence, secteur, famille de crédit, montants, solde, âge, crédits antérieurs, mois d'octroi).
- **Score de Solvabilité Bancaire :** Indice synthétique sur 100 points calculé à partir de la distribution des probabilités.
- **Avis du Comité d'Engagement :** Recommandation textuelle motivée (Octroi recommandé, examen approfondi en comité, ou refus/renforcement des garanties).
- **Facteurs Clés d'Explicabilité :** Détection automatique des signaux forts ayant influencé positivement ou négativement la décision.

---

## 📑 Rapport d'Examen Détaillé

Pour une présentation académique complète incluant la méthodologie de gestion du risque selon les normes de la BCEAO, consultez le fichier dédié :
👉 [RAPPORT_EXAMEN_CREDIT.md](./RAPPORT_EXAMEN_CREDIT.md)
