// ─────────────────────────────────────────────────────────────────
//  Cache localStorage des données de l'espace abonné
//
//  Problème résolu : à chaque navigation entre les pages de l'espace
//  user (Bienvenue / Mes modules / Mon abonnement), le composant
//  fait un fetch async getEspaceAbonne → flash de skeleton/avatar
//  vide → réapparition du nom et du numéro.
//
//  Solution : on persist la dernière réponse `espace` reçue dans
//  localStorage par commercant_id. Au mount d'une page, on initialise
//  le state directement depuis le cache (affichage IMMEDIAT) puis on
//  refetch en arrière-plan pour rafraîchir les données si elles ont
//  changé entre temps.
//
//  Les pages concernées :
//   - MerciPage (Bienvenue)
//   - MesModules
//   - EspaceAbonne (Mon abonnement)
// ─────────────────────────────────────────────────────────────────

const STORAGE_KEY_PREFIX = 'bp_abonne_cache_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h — au-delà on ignore le cache

function keyFor(commercantId) {
  if (!commercantId) return '';
  return STORAGE_KEY_PREFIX + commercantId;
}

/**
 * Récupère les données mises en cache pour ce commercant_id.
 * Retourne null si pas de cache valide.
 */
export function getCachedAbonne(commercantId) {
  if (!commercantId || typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(keyFor(commercantId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.espace || !parsed.cachedAt) return null;
    // Expire après TTL
    if (Date.now() - parsed.cachedAt > CACHE_TTL_MS) return null;
    return parsed.espace;
  } catch (_e) {
    return null;
  }
}

/**
 * Persist les données reçues dans localStorage (par commercant_id).
 */
export function setCachedAbonne(commercantId, espace) {
  if (!commercantId || !espace || typeof window === 'undefined') return;
  try {
    const payload = {
      cachedAt: Date.now(),
      espace,
    };
    window.localStorage.setItem(keyFor(commercantId), JSON.stringify(payload));
  } catch (_e) {
    // localStorage indisponible (quota, mode privé) — silent
  }
}

/**
 * Merge un objet espace partiel (issu du backend) avec ce qui est en
 * cache. Les champs vides dans la réponse fresh ne doivent PAS écraser
 * une valeur déjà connue côté cache (cas : un fetch après cancellation
 * peut renvoyer numero_virtuel vide, on garde la valeur précédente
 * pour l'affichage en transition).
 */
export function mergeWithCache(commercantId, freshEspace) {
  const cached = getCachedAbonne(commercantId);
  if (!cached) return freshEspace || null;
  if (!freshEspace) return cached;
  const merged = { ...cached };
  Object.keys(freshEspace).forEach((k) => {
    const v = freshEspace[k];
    // On écrase uniquement si la valeur fresh est définie ET non vide
    if (v !== undefined && v !== null && v !== '') {
      merged[k] = v;
    }
  });
  return merged;
}

/**
 * Invalide le cache (utile après cancellation, changement de profil, etc.)
 */
export function clearCachedAbonne(commercantId) {
  if (!commercantId || typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(keyFor(commercantId));
  } catch (_e) {}
}

// ─────────────────────────────────────────────────────────────────
//  LAST COMMERCANT ID — utilisé par la PWA pour se "souvenir" de
//  l'utilisateur connecté quand l'app est ouverte depuis l'écran
//  d'accueil iPhone/Android (le start_url du manifest ne porte pas
//  de ?id=BP-XXX). Sans cela, la PWA tomberait toujours en mode démo.
//
//  Stocké séparément du cache abonné pour rester disponible même si
//  le cache complet expire (24h).
// ─────────────────────────────────────────────────────────────────
const LAST_ID_KEY = 'bp_last_commercant_id';

/**
 * Mémorise ce commercant_id comme le dernier utilisé (pour la PWA).
 */
export function rememberLastCommercantId(commercantId) {
  if (!commercantId || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LAST_ID_KEY, String(commercantId));
  } catch (_e) {}
}

/**
 * Récupère le dernier commercant_id mémorisé.
 * Retourne '' si aucun (jamais connecté ou cache vidé).
 */
export function getLastCommercantId() {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(LAST_ID_KEY) || '';
  } catch (_e) {
    return '';
  }
}

/**
 * Oublie l'identifiant — utilisé en cas de logout ou cancellation.
 */
export function forgetLastCommercantId() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LAST_ID_KEY);
  } catch (_e) {}
}
