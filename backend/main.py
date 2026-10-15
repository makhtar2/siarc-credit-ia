import os
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Optional, List
import pandas as pd
from model import get_data, get_model, predict_credit

app = FastAPI(
    title="SIARC · Système d’Intelligence Artificielle pour l'Évaluation des Risques de Crédit",
    description="API RESTful & Moteur d'Inférence IA pour l'évaluation et la prévention du risque de défaut (SFD Sénégal)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ────────────────────────────────────── GET /healthz & /api/ping (Keep-Alive Cron)
@app.get("/healthz")
@app.get("/api/ping")
def ping_health():
    return {"status": "ok", "app": "SIARC", "alive": True}


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
def get_overview(agence: Optional[str] = None):
    full_df = get_data()
    df = full_df

    if agence and agence != "ALL":
        df = df[df["agence"] == agence]

    total_credits = int(len(df))
    if total_credits == 0:
        return {"error": "Aucun crédit trouvé"}

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

    # Encours à risque en FCFA
    encours_defaut = float(df[df["statut"] == "Défaut"]["solde_credit"].sum())
    encours_vigilance = float(df[df["statut"] == "Vigilance"]["solde_credit"].sum())
    encours_sain = float(df[df["statut"] == "Sain"]["solde_credit"].sum())

    # Calcul réglementaire des provisions BCEAO
    def calc_provision(row):
        r = row["retard_brut"]
        s = row["solde_credit"]
        if "181" in r:
            return s * 1.0
        elif "91" in r:
            return s * 0.5
        elif "61" in r or "31" in r:
            return s * 0.2
        elif "1 à 30" in r:
            return s * 0.05
        return 0.0

    provisions_bceao = float(df.apply(calc_provision, axis=1).sum())

    # Flux mensuels réels (12 mois)
    mois_noms = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]
    flux_mensuels = []
    for m in range(1, 13):
        m_df = df[df["mois_ouverture"] == m]
        deb = float(m_df["montant_debourse"].sum()) / 1_000_000
        solde = float(m_df["solde_credit"].sum()) / 1_000_000
        amorti = max(0.0, deb - solde)
        flux_mensuels.append({
            "mois": mois_noms[m - 1],
            "mois_num": m,
            "debourse": round(deb, 1),
            "solde": round(solde, 1),
            "amorti": round(amorti, 1),
            "credits": int(len(m_df)),
            "defauts": int((m_df["statut"] == "Défaut").sum()),
        })

    # Flux annuels réels (2019 à 2026)
    flux_annuels = []
    for annee in sorted(df["annee_ouverture"].unique()):
        if annee >= 2019:
            a_df = df[df["annee_ouverture"] == annee]
            flux_annuels.append({
                "annee": int(annee),
                "debourse": round(float(a_df["montant_debourse"].sum()) / 1_000_000, 1),
                "solde": round(float(a_df["solde_credit"].sum()) / 1_000_000, 1),
                "credits": int(len(a_df)),
                "defauts": int((a_df["statut"] == "Défaut").sum()),
            })

    # Top 6 des dossiers en contentieux prioritaires (Plus grandes créances à recouvrer)
    defauts_df = df[df["statut"] == "Défaut"].sort_values(by="solde_credit", ascending=False).head(6)
    dossiers_prioritaires = []
    for _, r in defauts_df.iterrows():
        dossiers_prioritaires.append({
            "numero_credit": int(r["numero_credit"]),
            "numero_membre": int(r["numero_membre"]),
            "agence": str(r["agence"]),
            "secteur": str(r["secteur_activite"]),
            "type_groupe": str(r["type_groupe"]),
            "montant_debourse": float(r["montant_debourse"]),
            "solde_credit": float(r["solde_credit"]),
            "retard": str(r["retard_brut"]),
            "age": int(r["age"]),
            "annee": int(r["annee_ouverture"]),
            "mois": int(r["mois_ouverture"]),
            "nb_credits_anterieurs": int(r["nb_credits_anterieurs"]),
        })

    # Statistiques par agence (calculées sur full_df)
    agences_list = []
    for ag, group in full_df.groupby("agence"):
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

    retard_distribution = df["retard_brut"].value_counts().to_dict()

    return {
        "agence_filtree": agence or "ALL",
        "total_credits": total_credits,
        "total_debourse": total_debourse,
        "total_solde": total_solde,
        "encours_defaut": encours_defaut,
        "encours_vigilance": encours_vigilance,
        "encours_sain": encours_sain,
        "provisions_bceao": round(provisions_bceao, 2),
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
        "flux_mensuels": flux_mensuels,
        "flux_annuels": flux_annuels,
        "dossiers_prioritaires": dossiers_prioritaires,
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


AGENCE_SYNONYMS = {
    "plateau": "CEC/PLATEAU",
    "banlieue": "CEC_B",
    "yoff": "MECYD",
    "thies": "MECREST",
    "thiès": "MECREST",
    "ziguinchor": "MECZOR",
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
        s_clean = s.lstrip("#").strip()
        if s_clean.lower().startswith("id"):
            s_clean = s_clean[2:].strip()
        if s_clean.lower().startswith("n°"):
            s_clean = s_clean[2:].strip()

        synonym_agences = [ag for term, ag in AGENCE_SYNONYMS.items() if term in s.lower()]

        mask = (
            filtered["numero_credit"].astype(str).str.contains(s_clean if s_clean else s, case=False)
            | filtered["numero_membre"].astype(str).str.contains(s_clean if s_clean else s, case=False)
            | filtered["secteur_activite"].astype(str).str.contains(s, case=False)
            | filtered["type_groupe"].astype(str).str.contains(s, case=False)
            | filtered["type_credit"].astype(str).str.contains(s, case=False)
            | filtered["statut"].astype(str).str.contains(s, case=False)
            | filtered["agence"].astype(str).str.contains(s, case=False)
            | filtered["retard_brut"].astype(str).str.contains(s, case=False)
        )
        if synonym_agences:
            mask = mask | filtered["agence"].isin(synonym_agences)

        filtered = filtered[mask]

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


# ────────────────────────────────────── SERVICE DE L'APPLICATION FRONTEND DIST
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    async def serve_root():
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return {"error": "Endpoint introuvable"}
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

