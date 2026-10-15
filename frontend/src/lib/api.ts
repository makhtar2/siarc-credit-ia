const BASE_URL = import.meta.env.VITE_API_URL || '';

export async function fetchOverview() {
  const res = await fetch(`${BASE_URL}/api/overview`);
  if (!res.ok) throw new Error("Erreur lors de la récupération de la vue d'ensemble");
  return res.json();
}

export async function fetchModelMetrics() {
  const res = await fetch(`${BASE_URL}/api/model-metrics`);
  if (!res.ok) throw new Error("Erreur lors de la récupération des métriques du modèle");
  return res.json();
}

export async function fetchOptions() {
  const res = await fetch(`${BASE_URL}/api/options`);
  if (!res.ok) throw new Error("Erreur lors de la récupération des options du formulaire");
  return res.json();
}

export interface CreditsQuery {
  page?: number;
  pageSize?: number;
  agence?: string;
  statut?: string;
  search?: string;
}

export async function fetchCredits(params: CreditsQuery = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.pageSize) query.set('page_size', String(params.pageSize));
  if (params.agence && params.agence !== 'ALL') query.set('agence', params.agence);
  if (params.statut && params.statut !== 'ALL') query.set('statut', params.statut);
  if (params.search) query.set('search', params.search);

  const res = await fetch(`${BASE_URL}/api/credits?${query.toString()}`);
  if (!res.ok) throw new Error("Erreur lors de la récupération des crédits");
  return res.json();
}

export interface PredictPayload {
  agence: string;
  secteur_activite: string;
  type_groupe: string;
  annee_ouverture: number;
  mois_ouverture: number;
  age: number;
  nb_credits_anterieurs: number;
  montant_debourse: number;
  solde_credit: number;
}

export async function predictCredit(payload: PredictPayload) {
  const res = await fetch(`${BASE_URL}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Erreur lors du calcul de la prédiction");
  return res.json();
}
