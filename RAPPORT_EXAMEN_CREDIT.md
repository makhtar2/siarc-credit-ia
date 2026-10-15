# 🏦 SIARC · Rapport Scientifique & Technique de Projet d'Examen
## Système d'Intelligence Artificielle pour l'Évaluation des Risques de Crédit

**Auteur :** Projet d'Examen — Module Data Science & Machine Learning Appliqué  
**Jeu de Données :** `DataSet_Credit.xlsx` (15 189 dossiers de crédits réels)  
**Institutions concernées :** Mutuelles et Caisses d'Épargne et de Crédit du Sénégal (CEC Plateau, CEC Banlieue, MECYD, MECREST, MECZOR)  
**Stack Technique :** Python / FastAPI (Backend & ML) + React 18 / TypeScript / Tailwind CSS / Recharts (Frontend UI/UX)  
**Plateforme Déployée en Ligne :** [https://siarc-credit-ia.onrender.com/](https://siarc-credit-ia.onrender.com/)  
**Dépôt Officiel GitHub :** [https://github.com/makhtar2/siarc-credit-ia](https://github.com/makhtar2/siarc-credit-ia)  
**Documentation API Interactive :** [https://siarc-credit-ia.onrender.com/docs](https://siarc-credit-ia.onrender.com/docs)  

---

## 1. Identité de la Plateforme & Enjeux Prudentiels (Régulation BCEAO)

### Dénomination & Identité Visuelle : « SIARC »
La dénomination du système reflète rigoureusement sa vocation scientifique, académique et institutionnelle :
- **SIARC** : Acronyme officiel pour **Système d'Intelligence Artificielle pour l'Évaluation des Risques de Crédit**.
- **Moteur d'Inférence IA** : Réseau décisionnel par Random Forest (180 estimateurs) entraîné sur des données empiriques réelles d'emprunteurs au Sénégal.
- **Logo Sur-Mesure (`Logo.tsx`)** : Conçu selon un langage géométrique épuré en titane obsidienne `#18181B`. Il associe une topologie neuronale stylisée reliant les nœuds d'évaluation financière, un bouclier protecteur de solvabilité et un cœur décisionnel émeraude validant la conformité aux directives prudentielles de la BCEAO.

### Contexte Réglementaire BCEAO pour les SFD
Dans le secteur de la microfinance en Afrique de l'Ouest (zone UEMOA), la viabilité des Systèmes Financiers Décentralisés (SFD) repose sur la maîtrise rigoureuse de la qualité de leur portefeuille de prêts.

La principale métrique réglementaire fixée par la BCEAO est le **Portefeuille à Risque (PAR)** :
- **PAR 30** : Encours des crédits ayant au moins une échéance impayée depuis plus de 30 jours, rapporté à l'encours brut total.
- **Créances en Souffrance / Douteuses** : Prêts en retard de plus de 90 jours ou 180 jours, nécessitant un provisionnement pour dépréciation (5% pour 1-30j, 20% pour 31-90j, 50% pour 91-180j, 100% au-delà de 180j).

### Objectifs Opérationnels du Cockpit
Développer une solution d'aide à la décision en temps réel permettant aux directeurs généraux de caisse, comités de crédit et analystes risques de :
1. **Piloter en direct le risque par agence** (CEC Plateau, CEC Banlieue, MECYD, MECREST, MECZOR) avec calcul immédiat des provisions réglementaires.
2. **Suivre les flux financiers réels** selon les cycles mensuels et annuels.
3. **Traiter en priorité les créances critiques** présentant les expositions en défaut les plus élevées.
4. **Prédire le risque de défaillance** à l'octroi ou au renouvellement grâce à un classificateur supervisé éprouvé.
5. **Fournir un Score de Solvabilité (0 à 100)** et un avis motivé d'octroi conforme aux ratios prudentiels.

---

## 2. Exploration & Nettoyage des Données (Data Preprocessing)

L'audit initial de `DataSet_Credit.xlsx` a révélé 15 189 observations et 12 variables :

| Variable Initiale | Type | Description | Problèmes Identifiés | Traitement Réalisé |
| :--- | :--- | :--- | :--- | :--- |
| `NUMERO_CREDIT` | Entier | Identifiant unique du prêt | Aucun | Conservé comme clé |
| `AGENCE` | Texte | Code de la caisse (5 uniques) | Espaces résiduels | Normalisation des chaînes (`CEC_B`, `CEC/PLATEAU`, etc.) |
| `SECTEUR ACTIVITE` | Texte | Secteur économique (16 uniques) | Commerce dominant (75%) | Standardisation |
| `TYPE DE CREDIT` | Texte | Libellé commercial (92 types) | Forte cardinalité | **Feature Engineering :** Regroupement en 6 familles métiers (Trésorerie, Personnel, Commercial, Consommation, Habitat, Partenariats) |
| `NUMERO_MEMBRE` | Entier | Identifiant sociétaire (12 709 uniques) | Aucun | Utilisé pour le suivi de la fidélité |
| `ANNEE OUVERTURE` | Entier | Année d'octroi (2017 à 2026) | Portefeuille historique | Utilisé comme variable temporelle |
| `MOIS OUVERTURE` | Entier | Mois d'octroi (1 à 12) | Saisonnalité | Conservé pour capter les cycles économiques |
| `Age` | Entier | Âge du sociétaire | 1 valeur aberrante (`Age = 2`) | Imputation par la médiane adulte (`45 ans`) |
| `Nombre de Crédit antérieur`| Décimal | Historique de crédits | 2 010 valeurs manquantes (`NaN`) | **Imputation à 0** : correspond aux nouveaux membres sans historique au sein du réseau |
| `MONTANT_DEBOURSE` | Entier | Capital prêté | Valeurs de 50 000 à 340 000 000 FCFA | Aucun doublon ni valeur négative |
| `SOLDE_CREDIT` | Décimal | Capital restant dû | Cohérent ($0 \le \text{Solde} \le \text{Déboursé}$) | Création de ratios de remboursement |
| `RETARD` | Texte | Catégorie de retard de la banque | 1 valeur manquante (`NaN`) | Suppression de la ligne non annotée (15 188 restants) |

### Reclassement Réglementaire de la Cible (`statut`)
Les 6 catégories d'impayés de la banque ont été consolidées selon les standards prudentiels internationaux :
1. **Sain (Performing)** : `0 JOUR` $\rightarrow$ **12 685 dossiers (83.52%)**
2. **Vigilance (Early Warning / Watchlist)** : `1 à 30 jours`, `31 à 60 jours`, `61 à 90 jours` $\rightarrow$ **699 dossiers (4.60%)**
3. **Défaut (Non-Performing Loan / Contentieux)** : `91 à 180 jours`, `181 à 3600 jours` $\rightarrow$ **1 804 dossiers (11.88%)**

---

## 3. Ingénierie des Variables (Feature Engineering)

Pour maximiser la capacité prédictive du modèle sans surapprentissage, plusieurs indicateurs financiers clés ont été créés :

1. **Ratio d'Amortissement du Capital** :
   $$\text{Taux d'Amortissement} = \frac{\text{Montant Déboursé} - \text{Solde Crédit}}{\text{Montant Déboursé} + 1}$$
   Ce ratio capture la proportion du prêt déjà remboursée. Un crédit presque amorti présente un risque résiduel marginal.
2. **Ratio Solde / Déboursé** :
   $$\text{Ratio Solde} = \frac{\text{Solde Crédit}}{\text{Montant Déboursé} + 1}$$
3. **Regroupement Macro-Produits (`type_groupe`)** :
   Réduction des 92 libellés détaillés en familles fonctionnelles homogènes (Trésorerie micro-entreprise, Crédits d'équipement/commercial, Crédits à la consommation salariale, Prêts habitat, Projets sous convention DER/PAM).

---

## 4. Modélisation Prédictive & Validation Scientifique

### Algorithme Retenu : Random Forest Classifier
- **Nombre d'estimateurs :** 180 arbres de décision.
- **Profondeur maximale (`max_depth`) :** 12 (évite le surapprentissage et favorise l'explicabilité).
- **Gestion du Déséquilibre :** `class_weight='balanced'`. Cette approche pénalise automatiquement les erreurs sur les classes minoritaires (Vigilance et Défaut) proportionnellement à leur rareté dans le dataset.
- **Découpage des Données :** 80% Entraînement (12 150 dossiers) / 20% Test (3 038 dossiers) avec **stratification stricte** pour préserver les proportions exactes des 3 classes.

### Résultats sur l'Échantillon de Test Indépendant (3 038 dossiers)

| Métrique Globale | Score Obtenu |
| :--- | :--- |
| **Accuracy Globale** | **94.5%** |
| **F1-Score Macro** | **0.825** |
| **F1-Score Moyenne Pondérée** | **0.950** |

#### Rapport de Classification par Profil de Risque :

| Classe de Risque | Précision | Rappel (Recall) | F1-Score | Support Test |
| :--- | :---: | :---: | :---: | :---: |
| **Sain** | 98.1% | 97.2% | **0.976** | 2 537 |
| **Vigilance** | 53.4% | 63.6% | **0.581** | 140 |
| **Défaut** | 94.7% | 92.2% | **0.934** | 361 |

#### Analyse de la Matrice de Confusion :
- Sur les 361 crédits réellement en défaut de l'échantillon test, **333 ont été détectés avec succès** (92.2% de taux de rappel), minimisant le risque de faux négatifs (crédits toxiques non identifiés).
- Sur les 2 537 crédits sains, **2 459 sont classés sans erreur** (97.2%), évitant le refus injustifié d'emprunteurs solvables.

#### Variables les Plus Déterminantes (Gini Importance) :
1. **Année d'ouverture & Ancienneté** (~27.8%) : Déterminant pour l'historique des cycles de remboursement.
2. **Mois d'octroi** (~14.6%) : Saisons agricoles et commerciales (hivernage, fêtes religieuses).
3. **Ratio Solde / Déboursé** (~13.2%) : Poids de l'encours non encore recouvré.
4. **Taux d'amortissement** (~12.8%) : Rythme réel de paiement du sociétaire.
5. **Famille de Crédit** (~10.5%) : Les crédits de trésorerie ont des profils de remboursement très différents des crédits d'équipement.

---

## 5. Architecture de la Solution & Justification Technique

Plutôt que d'utiliser un outil monolithique standard (type Streamlit) dont les options de design et de personnalisation restent rigides et visuellement génériques, nous avons fait le choix délibéré d'une **architecture moderne découplée (Fullstack SaaS)** :

### Backend : FastAPI (Python)
- **Performance Asynchrone :** Temps de réponse en dessous de 10 millisecondes pour les calculs de scoring.
- **Séparation des Responsabilités :** Endpoint `/api/overview` pour la Business Intelligence, `/api/model-metrics` pour l'audit académique du modèle, `/api/credits` pour la recherche paginée, `/api/predict` pour l'inférence.
- **Documentation Interactive :** Swagger UI généré automatiquement sur `/docs`.

### Frontend : React 18 + TypeScript + Vite + Tailwind CSS (Design System « Liquid Glass »)
- **Esthétique « Liquid Glass » & Rubans 3D :** Toile de fond en vagues de soie et verre liquide translucide avec fenêtre principale flottante en verre dépoli (`backdrop-blur-2xl`, bordures en dégradé de blanc translucide et reflets intérieurs).
- **Cartes Obsidian & Haut Contraste :** Widget principal d'information globale en noir profond (`#18181B`) intégrant des mini-cartes pilules blanches en relief pour les statuts prudentiels.
- **Logo Vectoriel Épuré (`Logo.tsx`) :** Emblème minimaliste intégrant le double chevron « W », le bouclier losangique de garantie et le marqueur émeraude de solvabilité.
- **Quatre Espaces Métiers Dédiés :**
  1. **Cockpit Exécutif (`DashboardOverview.tsx`) :** Filtrage dynamique par agence (CEC Plateau, Banlieue, etc.), suivi des flux réels mensuels et annuels, calcul immédiat des provisions réglementaires BCEAO et surveillance des créances critiques.
  2. **Portefeuille & Registre des Crédits (`DonneesPage.tsx`) :** Indicateurs macro-économiques (16.5 Mds prêtés, 11.6 Mds d'encours), ratios de recouvrement, segmentation sectorielle et base de données paginée et filtrable.
  3. **Modèle de Risque & Audit (`ModelePage.tsx`) :** Matrice de confusion interactive, importance des variables discriminantes (Gini) et rapport de classification certifié.
  4. **Simulateur d'Octroi en Temps Réel (`PredictionPage.tsx`) :** Jauge de score de solvabilité (0-100), décomposition probabiliste, avis motivé du comité et analyse des facteurs clés.

---

## 6. Guide de Démarrage Rapide

### Option 1 : Lancement Automatique en 1 Clic
```bash
cd /home/almuxtaar/Projets/data/projetexamen
./start.sh
```

### Option 2 : Lancement Manuel des Deux Services

**1. Démarrer le Backend (Terminal 1) :**
```bash
cd /home/almuxtaar/Projets/data/projetexamen/backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
```
*Le backend démarre sur http://localhost:8000 (Documentation : http://localhost:8000/docs)*

**2. Démarrer le Frontend (Terminal 2) :**
```bash
cd /home/almuxtaar/Projets/data/projetexamen/frontend
npm run dev
```
*Le dashboard s'ouvre sur http://localhost:5173*

---

## 7. Conclusion

Cette solution combine rigueur statistique, conformité aux exigences prudentielles de la microfinance sénégalaise et excellence ergonomique. Elle démontre la capacité à transformer un jeu de données brut en une application décisionnelle industrielle, intuitive et robuste.
