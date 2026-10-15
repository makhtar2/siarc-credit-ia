import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, confusion_matrix, classification_report

CSV_PATH = os.path.join(os.path.dirname(__file__), "data", "credit_clean.csv")

_cache = {}


def get_data() -> pd.DataFrame:
    """Charge les données nettoyées avec mise en cache mémoire."""
    if "df" not in _cache:
        if not os.path.exists(CSV_PATH):
            raise FileNotFoundError(f"Fichier introuvable: {CSV_PATH}")
        df = pd.read_csv(CSV_PATH)
        _cache["df"] = df
    return _cache["df"]


def get_model():
    """Entraîne et met en cache le modèle de Random Forest avec métriques d'évaluation."""
    if "model" in _cache:
        return _cache["model"]

    df = get_data().copy()

    # Encodeurs catégoriels
    encoders = {}
    for col in ["agence", "secteur_activite", "type_groupe"]:
        le = LabelEncoder()
        df[col + "_enc"] = le.fit_transform(df[col].astype(str))
        encoders[col] = le

    le_target = LabelEncoder()
    df["statut_enc"] = le_target.fit_transform(df["statut"])

    features = [
        "agence_enc",
        "secteur_activite_enc",
        "type_groupe_enc",
        "annee_ouverture",
        "mois_ouverture",
        "age",
        "nb_credits_anterieurs",
        "montant_debourse",
        "solde_credit",
        "ratio_solde",
        "taux_amortissement",
    ]

    feature_labels = {
        "annee_ouverture": "Année d'ouverture",
        "mois_ouverture": "Mois d'octroi",
        "ratio_solde": "Ratio Solde / Déboursé",
        "taux_amortissement": "Taux d'amortissement",
        "type_groupe_enc": "Type de crédit (Catégorie)",
        "solde_credit": "Solde restant dû",
        "secteur_activite_enc": "Secteur d'activité",
        "montant_debourse": "Montant déboursé",
        "age": "Âge de l'emprunteur",
        "nb_credits_anterieurs": "Crédits antérieurs",
        "agence_enc": "Agence bancaire",
    }

    X = df[features]
    y = df["statut_enc"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=180,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    cm = confusion_matrix(y_test, y_pred)
    classes = list(le_target.classes_)  # ['Défaut', 'Sain', 'Vigilance']

    raw_report = classification_report(
        y_test, y_pred, target_names=classes, output_dict=True
    )

    # Importance ordonnée
    importances = [
        {
            "feature": col,
            "label": feature_labels.get(col, col),
            "importance": round(float(imp), 4),
        }
        for col, imp in sorted(
            zip(features, model.feature_importances_),
            key=lambda item: item[1],
            reverse=True,
        )
    ]

    metrics = {
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "f1_macro": round(float(f1_score(y_test, y_pred, average="macro")), 4),
        "n_train": int(len(X_train)),
        "n_test": int(len(X_test)),
        "classes": classes,
        "confusion_matrix": cm.tolist(),
        "classification_report": raw_report,
        "feature_importances": importances,
    }

    _cache["model"] = {
        "model": model,
        "encoders": encoders,
        "le_target": le_target,
        "metrics": metrics,
        "features": features,
        "feature_labels": feature_labels,
    }
    return _cache["model"]


def predict_credit(payload: dict) -> dict:
    """Évalue le risque d'un crédit et calcule le score de solvabilité."""
    cached = get_model()
    model = cached["model"]
    encoders = cached["encoders"]
    le_target = cached["le_target"]
    classes = cached["metrics"]["classes"]

    # Extraction des inputs
    agence = payload.get("agence", "CEC_B")
    secteur = payload.get("secteur_activite", "COMMERCE")
    type_groupe = payload.get("type_groupe", "Trésorerie")
    annee = int(payload.get("annee_ouverture", 2026))
    mois = int(payload.get("mois_ouverture", 6))
    age = int(payload.get("age", 45))
    nb_credits = int(payload.get("nb_credits_anterieurs", 2))
    montant = float(payload.get("montant_debourse", 1_000_000))
    solde = float(payload.get("solde_credit", 400_000))

    # Calcul des ratios
    ratio_solde = float(round(solde / (montant + 1), 4))
    taux_amortissement = float(round(float(np.clip((montant - solde) / (montant + 1), 0.0, 1.0)), 4))

    # Encodage sécurisé
    def safe_encode(encoder, val, fallback=0):
        try:
            return encoder.transform([str(val)])[0]
        except Exception:
            return fallback

    agence_enc = safe_encode(encoders["agence"], agence)
    secteur_enc = safe_encode(encoders["secteur_activite"], secteur)
    type_enc = safe_encode(encoders["type_groupe"], type_groupe)

    input_row = pd.DataFrame(
        [
            {
                "agence_enc": agence_enc,
                "secteur_activite_enc": secteur_enc,
                "type_groupe_enc": type_enc,
                "annee_ouverture": annee,
                "mois_ouverture": mois,
                "age": age,
                "nb_credits_anterieurs": nb_credits,
                "montant_debourse": montant,
                "solde_credit": solde,
                "ratio_solde": ratio_solde,
                "taux_amortissement": taux_amortissement,
            }
        ]
    )

    pred_idx = model.predict(input_row)[0]
    prediction = le_target.inverse_transform([pred_idx])[0]
    probas = model.predict_proba(input_row)[0]

    prob_dict = {cls: round(float(p), 4) for cls, p in zip(classes, probas)}

    # Calcul du score de crédit bancaire (0 à 100) : 100 = dossier parfait
    # Base = proba Sain * 85 + (1 - proba Défaut) * 15 - pénalités
    p_sain = prob_dict.get("Sain", 0.0)
    p_defaut = prob_dict.get("Défaut", 0.0)
    p_vigilance = prob_dict.get("Vigilance", 0.0)

    credit_score = int(round(np.clip((p_sain * 100) - (p_vigilance * 25) - (p_defaut * 70), 5, 99)))

    # Recommandation métier bancaire
    if prediction == "Sain":
        statut_label = "Crédit Sain"
        recommandation = (
            "Dossier très favorable. Profil d'emprunteur régulier avec un faible risque de contrepartie. "
            "Octroi recommandé dans les conditions standard du comité."
        )
        niveau_risque = "Faible"
    elif prediction == "Vigilance":
        statut_label = "Vigilance Requise"
        recommandation = (
            "Risque modéré de retard de remboursement (impayé précoce). Examen approfondi de la capacité "
            "de remboursement mensuelle, réduction possible de la maturité ou garantie additionnelle requise."
        )
        niveau_risque = "Modéré"
    else:
        statut_label = "Défaut / Risque Élevé"
        recommandation = (
            "Signal de défaut critique. La structure du dossier présente des similitudes marquées avec les créances "
            "en souffrance. Refus motivé recommandé ou cautionnement réel indispensable."
        )
        niveau_risque = "Critique"

    # Facteurs explicatifs
    facteurs = []
    if ratio_solde > 0.75:
        facteurs.append({"facteur": "Encours élevé non amorti", "impact": "Négatif", "detail": f"Solde restant de {ratio_solde:.0%} du montant initial"})
    elif ratio_solde < 0.35:
        facteurs.append({"facteur": "Fort amortissement du capital", "impact": "Positif", "detail": f"{taux_amortissement:.0%} du prêt déjà remboursé"})

    if nb_credits >= 3:
        facteurs.append({"facteur": "Fidélité & Historique bancaire", "impact": "Positif", "detail": f"{nb_credits} crédits souscrits antérieurement"})
    elif nb_credits == 0:
        facteurs.append({"facteur": "Nouvel emprunteur sans historique", "impact": "Neutre", "detail": "Absence d'historique de crédit antérieur"})

    if age < 30:
        facteurs.append({"facteur": "Tranche d'âge jeune entrepreneur", "impact": "Neutre", "detail": f"{age} ans"})
    elif age >= 45:
        facteurs.append({"facteur": "Stabilité d'activité établie", "impact": "Positif", "detail": f"{age} ans"})

    return {
        "prediction": prediction,
        "statut_label": statut_label,
        "niveau_risque": niveau_risque,
        "confiance": round(float(max(probas)), 4),
        "score_credit": credit_score,
        "recommandation": recommandation,
        "probabilites": prob_dict,
        "ratios": {
            "ratio_solde": ratio_solde,
            "taux_amortissement": taux_amortissement,
        },
        "facteurs": facteurs,
    }
