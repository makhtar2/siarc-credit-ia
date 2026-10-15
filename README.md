# 🏦 WariScore · Plateforme de Pilotage & Scoring du Risque de Crédit

> **Projet d'Examen Data Science & Machine Learning**  
> Audit de portefeuille, surveillance prudentielle BCEAO et prédiction du risque de défaut sur le jeu de données `DataSet_Credit.xlsx` (Caisses & Mutuelles d'Épargne et de Crédit du Sénégal : CEC Plateau, CEC Banlieue, MECYD, MECREST, MECZOR).

---

## 🎯 Identité & Aperçu de la Plateforme

**WariScore** tire son nom de :
- **« Wari »** : terme wolof désignant l'argent et le numéraire au Sénégal, ancrant la solution dans l'écosystème local de la microfinance et des SFD (Systèmes Financiers Décentralisés).
- **« Score »** : moteur de notation actuariel et d'aide à la décision prudentielle.
- **Logo Sur-Mesure :** Emblème géométrique moderne en verre liquide et titane obsidienne (`Logo.tsx`), associant un monogramme « W » entrelacé, un bouclier losangique de solvabilité et une pastille émeraude de conformité bancaire.

L'application a été développée selon une architecture Fullstack moderne **FastAPI + React 18 + TypeScript + Tailwind CSS** avec un design system exclusif **« Liquid Glass »** (fond en rubans de soie 3D translucides, fenêtre maître dépolie `backdrop-blur-2xl`, surfaces obsidian `#18181B` et jauges circulaires concentriques). L'ensemble est 100% en français et respecte scrupuleusement la nomenclature bancaire de l'UEMOA / BCEAO.

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

### 1. Cockpit Exécutif & Tableau de Bord (`DashboardOverview.tsx`)
- **Filtres Dynamiques par Caisse :** Filtrage instantané sur tout le réseau SFD ou sur une caisse spécifique (CEC Plateau, CEC Banlieue, MECYD, MECREST, MECZOR).
- **Courbes Temporelles Réelles :** Bascule instantanée entre la distribution des flux mensuels (Janvier à Décembre) et la distribution pluriannuelle réelle (2019 à 2026).
- **Surveillance Prudentielle BCEAO :** Calcul automatisé des provisions réglementaires pour dépréciation (1,047 Milliard FCFA au total : 5% pour 1-30j, 20% pour 31-90j, 50% pour 91-180j, 100% au-delà de 180j).
- **Watchlist des Créances Critiques :** Tableau des 5 dossiers les plus volumineux en défaut nécessitant une mise en demeure immédiate avec accès direct au simulateur et au portefeuille.

### 2. Portefeuille & Registre des Crédits (`DonneesPage.tsx`)
- **Indicateurs Clés (KPIs) :** Volume total prêté (16.5 Mds FCFA), encours restant dû (11.6 Mds FCFA), taux d'amortissement moyen (31.3%), taux de défaut global (11.88%) et Portefeuille à Risque (PAR 30 : 16.48%).
- **Graphiques Décisionnels :** Répartition tripartite (Sain, Vigilance, Défaut), analyse des crédits et de l'encours par agence, top secteurs d'activité économique financés, analyse détaillée des paliers de retard de la banque.
- **Registre des Dossiers :** Tableau paginé avec recherche textuelle instantanée (N° crédit, N° membre) et filtres dynamiques par agence et niveau de risque.

### 3. Modèle ML & Audit Réglementaire (`ModelePage.tsx`)
- **Performances Globales :** Accuracy de **94.5%**, F1-Score Macro de **0.825** sur 3 038 crédits de test stratifiés.
- **Matrice de Confusion Heatmap :** Coloration contrastée des prédictions exactes vs erreurs d'affectation.
- **Importance des Variables (Gini) :** Graphique à barres horizontales ordonnant les variables les plus discriminantes (ancienneté, ratios d'amortissement, montants).
- **Rapport de Classification :** Précision (94.7% sur le Défaut), Rappel (92.2% sur le Défaut), F1-Score et jauges d'efficacité.

### 4. Simulateur & Scoring (`PredictionPage.tsx`)
- **Formulaire de Simulation en Temps Réel :** Saisie des paramètres d'un emprunteur (agence, secteur, famille de crédit, montants, solde, âge, crédits antérieurs, mois d'octroi).
- **Score de Solvabilité Bancaire :** Indice synthétique sur 100 points calculé à partir de la distribution des probabilités.
- **Avis du Comité d'Engagement :** Recommandation textuelle motivée (Octroi recommandé, examen approfondi en comité, ou refus/renforcement des garanties).
- **Facteurs Clés d'Explicabilité :** Détection automatique des signaux forts ayant influencé positivement ou négativement la décision.

---

## 📑 Rapport d'Examen Détaillé

Pour une présentation académique complète incluant la méthodologie de gestion du risque selon les normes de la BCEAO, consultez le fichier dédié :
👉 [RAPPORT_EXAMEN_CREDIT.md](./RAPPORT_EXAMEN_CREDIT.md)
