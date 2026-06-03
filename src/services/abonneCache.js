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
//  toujours ?id=BP-XXX). Sans cela, la PWA tomberait en mode démo.
//
//  Stratégie 100% fiable, multi-couches :
//   1. localStorage  → standard moderne (iPhone iOS 16.4+, Android)
//   2. Cookie 1 an   → backup pour les cas où localStorage est isolé
//                       entre Safari et la PWA installée (rare mais
//                       arrive sur certains anciens iOS / containers)
//
//  Lecture : on essaie localStorage en priorité, puis cookie en backup.
//  Écriture : on écrit dans les DEUX simultanément.
// ─────────────────────────────────────────────────────────────────
const LAST_ID_KEY = 'bp_last_commercant_id';
const COOKIE_NAME = 'bp_last_commercant_id';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 an

function setCookie(name, value, maxAgeSec) {
  if (typeof document === 'undefined') return;
  try {
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const secure = isHttps ? '; Secure' : '';
    document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSec}; Path=/; SameSite=Lax${secure}`;
  } catch (_e) {}
}

function getCookie(name) {
  if (typeof document === 'undefined') return '';
  try {
    const cookies = document.cookie ? document.cookie.split('; ') : [];
    for (const c of cookies) {
      const eq = c.indexOf('=');
      const k = eq >= 0 ? c.slice(0, eq) : c;
      if (k === name) {
        const v = eq >= 0 ? c.slice(eq + 1) : '';
        return decodeURIComponent(v || '');
      }
    }
  } catch (_e) {}
  return '';
}

function deleteCookie(name) {
  if (typeof document === 'undefined') return;
  try {
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
  } catch (_e) {}
}

/**
 * Mémorise ce commercant_id comme le dernier utilisé (pour la PWA).
 * Écrit dans localStorage ET cookie pour couverture 100%.
 */
export function rememberLastCommercantId(commercantId) {
  if (!commercantId || typeof window === 'undefined') return;
  try { window.localStorage.setItem(LAST_ID_KEY, String(commercantId)); } catch (_e) {}
  setCookie(COOKIE_NAME, String(commercantId), COOKIE_MAX_AGE);
}

/**
 * Récupère le dernier commercant_id mémorisé.
 * Lit localStorage d'abord, puis cookie en backup.
 * Retourne '' si aucun (jamais connecté ou cache vidé).
 */
export function getLastCommercantId() {
  if (typeof window === 'undefined') return '';
  // 1. localStorage (standard moderne)
  try {
    const fromLs = window.localStorage.getItem(LAST_ID_KEY) || '';
    if (fromLs) return fromLs;
  } catch (_e) {}
  // 2. Cookie (backup pour contextes isolés)
  const fromCookie = getCookie(COOKIE_NAME);
  if (fromCookie) {
    // On rétablit le localStorage pour les prochains accès
    try { window.localStorage.setItem(LAST_ID_KEY, fromCookie); } catch (_e) {}
    return fromCookie;
  }
  return '';
}

/**
 * Oublie l'identifiant — utilisé en cas de logout ou cancellation.
 * Vide les deux supports.
 */
export function forgetLastCommercantId() {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(LAST_ID_KEY); } catch (_e) {}
  deleteCookie(COOKIE_NAME);
}
