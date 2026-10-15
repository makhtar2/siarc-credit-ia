from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import pandas as pd
from model import get_data, get_model, predict_credit

app = FastAPI(
    title="Plateforme d'Analyse et de Scoring du Risque de Crédit",
    description="API RESTful de gestion de portefeuille et de prédiction du risque de défaut (Microfinance - Sénégal)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    print("🏦 Initialisation du modèle d'évaluation du risque de crédit...")
    get_model()
    print("✅ Modèle chargé et prêt pour inférence.")


class PredictRequest(BaseModel):
    agence: str = Field(default="CEC_B", description="Code agence (ex: CEC_B, MECYD)")
    secteur_activite: str = Field(default="COMMERCE", description="Secteur d'activité du client")
    type_groupe: str = Field(default="Trésorerie", description="Famille du produit de crédit")
    annee_ouverture: int = Field(default=2026, ge=2015, le=2030)
    mois_ouverture: int = Field(default=6, ge=1, le=12)
    age: int = Field(default=45, ge=18, le=95)
    nb_credits_anterieurs: int = Field(default=2, ge=0, le=20)
    montant_debourse: float = Field(default=1_000_000, gt=0)
    solde_credit: float = Field(default=400_000, ge=0)


# ────────────────────────────────────── GET /api/overview
@app.get("/api/overview")
def get_overview():
    df = get_data()
    total_credits = int(len(df))
    total_debourse = float(df["montant_debourse"].sum())
    total_solde = float(df["solde_credit"].sum())
    taux_remboursement = float(df["taux_amortissement"].mean() * 100)

    # Répartition des statuts
    statut_counts = df["statut"].value_counts().to_dict()
    nb_sain = int(statut_counts.get("Sain", 0))
    nb_vigilance = int(statut_counts.get("Vigilance", 0))
    nb_defaut = int(statut_counts.get("Défaut", 0))

    taux_defaut = round((nb_defaut / total_credits) * 100, 2)
    taux_vigilance = round((nb_vigilance / total_credits) * 100, 2)
    taux_sain = round((nb_sain / total_credits) * 100, 2)
    par_30 = round(((nb_vigilance + nb_defaut) / total_credits) * 100, 2)

    # Statistiques par agence
    agences_list = []
    for ag, group in df.groupby("agence"):
        ag_total = len(group)
        ag_defaut = (group["statut"] == "Défaut").sum()
        ag_vigilance = (group["statut"] == "Vigilance").sum()
        agences_list.append({
            "agence": ag,
            "total_credits": int(ag_total),
            "montant_debourse": float(group["montant_debourse"].sum()),
            "solde_restant": float(group["solde_credit"].sum()),
            "taux_defaut": round((ag_defaut / ag_total) * 100, 2),
            "taux_vigilance": round((ag_vigilance / ag_total) * 100, 2),
            "taux_sain": round(((group["statut"] == "Sain").sum() / ag_total) * 100, 2),
        })
    agences_list.sort(key=lambda x: x["total_credits"], reverse=True)

    # Répartition par secteur
    secteurs_list = []
    for sec, group in df.groupby("secteur_activite"):
        sec_total = len(group)
        secteurs_list.append({
            "secteur": sec,
            "count": int(sec_total),
            "montant_moyen": round(float(group["montant_debourse"].mean()), 2),
            "taux_defaut": round(((group["statut"] == "Défaut").sum() / sec_total) * 100, 2),
        })
    secteurs_list.sort(key=lambda x: x["count"], reverse=True)

    # Répartition par type de groupe
    types_list = []
    for tg, group in df.groupby("type_groupe"):
        tg_total = len(group)
        types_list.append({
            "type_groupe": tg,
            "count": int(tg_total),
            "taux_defaut": round(((group["statut"] == "Défaut").sum() / tg_total) * 100, 2),
        })
    types_list.sort(key=lambda x: x["count"], reverse=True)

    # Tranches de retard d'origine
    retard_distribution = df["retard_brut"].value_counts().to_dict()

    return {
        "total_credits": total_credits,
        "total_debourse": total_debourse,
        "total_solde": total_solde,
        "montant_moyen_debourse": round(float(df["montant_debourse"].mean()), 2),
        "solde_moyen": round(float(df["solde_credit"].mean()), 2),
        "taux_remboursement_moyen": round(taux_remboursement, 2),
        "taux_defaut": taux_defaut,
        "taux_vigilance": taux_vigilance,
        "taux_sain": taux_sain,
        "par_30": par_30,
        "statut_counts": {
            "Sain": nb_sain,
            "Vigilance": nb_vigilance,
            "Défaut": nb_defaut,
        },
        "agences": agences_list,
        "secteurs": secteurs_list[:8],
        "types_groupe": types_list,
        "retard_distribution": retard_distribution,
        "annee_min": int(df["annee_ouverture"].min()),
        "annee_max": int(df["annee_ouverture"].max()),
        "nb_membres_uniques": int(df["numero_membre"].nunique()),
    }


# ────────────────────────────────────── GET /api/model-metrics
@app.get("/api/model-metrics")
def get_model_metrics():
    model_data = get_model()
    m = model_data["metrics"]

    classes = m["classes"]
    raw_report = m["classification_report"]

    formatted_report = [
        {
            "classe": cls,
            "precision": round(float(raw_report[cls]["precision"]), 3),
            "recall": round(float(raw_report[cls]["recall"]), 3),
            "f1": round(float(raw_report[cls]["f1-score"]), 3),
            "support": int(raw_report[cls]["support"]),
        }
        for cls in classes
    ]

    return {
        "accuracy": m["accuracy"],
        "f1_macro": m["f1_macro"],
        "n_train": m["n_train"],
        "n_test": m["n_test"],
        "classes": classes,
        "confusion_matrix": m["confusion_matrix"],
        "report": formatted_report,
        "feature_importances": m["feature_importances"],
    }


# ────────────────────────────────────── GET /api/options
@app.get("/api/options")
def get_options():
    df = get_data()
    return {
        "agences": sorted(df["agence"].unique().tolist()),
        "secteurs": sorted(df["secteur_activite"].unique().tolist()),
        "types_groupe": sorted(df["type_groupe"].unique().tolist()),
        "annees": sorted(df["annee_ouverture"].unique().tolist(), reverse=True),
        "montant_min": float(df["montant_debourse"].min()),
        "montant_max": float(df["montant_debourse"].max()),
        "montant_moyen": float(round(df["montant_debourse"].mean(), 2)),
        "age_min": int(df["age"].min()),
        "age_max": int(df["age"].max()),
    }


# ────────────────────────────────────── GET /api/credits
@app.get("/api/credits")
def get_credits(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=5, le=100),
    agence: Optional[str] = None,
    statut: Optional[str] = None,
    search: Optional[str] = None,
):
    df = get_data()
    filtered = df

    if agence and agence != "ALL":
        filtered = filtered[filtered["agence"] == agence]

    if statut and statut != "ALL":
        filtered = filtered[filtered["statut"] == statut]

    if search:
        s = search.strip()
        filtered = filtered[
            filtered["numero_credit"].astype(str).str.contains(s, case=False)
            | filtered["numero_membre"].astype(str).str.contains(s, case=False)
            | filtered["type_credit"].str.contains(s, case=False)
        ]

    total_count = len(filtered)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size

    page_data = filtered.iloc[start_idx:end_idx]

    records = []
    for _, row in page_data.iterrows():
        records.append({
            "numero_credit": int(row["numero_credit"]),
            "numero_membre": int(row["numero_membre"]),
            "agence": row["agence"],
            "secteur_activite": row["secteur_activite"],
            "type_groupe": row["type_groupe"],
            "annee_ouverture": int(row["annee_ouverture"]),
            "mois_ouverture": int(row["mois_ouverture"]),
            "age": int(row["age"]),
            "nb_credits_anterieurs": int(row["nb_credits_anterieurs"]),
            "montant_debourse": float(row["montant_debourse"]),
            "solde_credit": float(row["solde_credit"]),
            "taux_amortissement": float(row["taux_amortissement"]),
            "retard_brut": row["retard_brut"],
            "statut": row["statut"],
        })

    return {
        "page": page,
        "page_size": page_size,
        "total_records": total_count,
        "total_pages": max(1, (total_count + page_size - 1) // page_size),
        "data": records,
    }


# ────────────────────────────────────── POST /api/predict
@app.post("/api/predict")
def predict_endpoint(payload: PredictRequest):
    return predict_credit(payload.dict())
