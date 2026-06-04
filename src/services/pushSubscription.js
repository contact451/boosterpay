// ─────────────────────────────────────────────────────────────────
//  pushSubscription.js — Web Push (VAPID) côté client
//
//  Permet au commerçant d'activer les notifications natives sur son
//  téléphone (iPhone iOS 16.4+, tous Android), sans installer d'app
//  native. Fonctionne pour :
//   - 📞 Nouvel appel manqué
//   - 🤖 L'IA a pris un message
//   - 💳 Paiement confirmé
//   - ⚠️  Échec paiement / facture impayée
//
//  Architecture :
//   1. registerServiceWorker — enregistre /sw.js
//   2. subscribeToPush(commercantId)
//      - demande permission Notification
//      - PushManager.subscribe(VAPID)
//      - POST l'endpoint+keys à Apps Script (savePushSubscription)
//   3. isPushSubscribed() — utilitaire pour afficher l'état dans l'UI
//
//  La VAPID public key est exposée via VITE_VAPID_PUBLIC_KEY.
// ─────────────────────────────────────────────────────────────────

const APPS_SCRIPT_URL =
  import.meta.env.VITE_VONAGE_CRM_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbzVONAGECRMxxx/exec';

const VAPID_PUBLIC_KEY =
  import.meta.env.VITE_VAPID_PUBLIC_KEY ||
  // Placeholder — sera remplacé par la vraie clé en .env.production
  '';

// ─────────────────────────────────────────────────────────────────
//  Utility : convertit la clé VAPID base64-url en Uint8Array
//  (requis par PushManager.subscribe)
// ─────────────────────────────────────────────────────────────────
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ─────────────────────────────────────────────────────────────────
//  isPushReady — Le navigateur supporte le Web Push ?
//   - Service Worker disponible
//   - PushManager disponible
//   - Notification API disponible
//   - Page servie en HTTPS (sauf localhost)
// ─────────────────────────────────────────────────────────────────
export function isPushReady() {
  if (typeof window === 'undefined') return false;
  if (!('serviceWorker' in navigator)) return false;
  if (!('PushManager' in window)) return false;
  if (!('Notification' in window)) return false;
  return true;
}

// ─────────────────────────────────────────────────────────────────
//  registerServiceWorker — appelé une fois au démarrage de l'app
// ─────────────────────────────────────────────────────────────────
export async function registerServiceWorker() {
  if (!isPushReady()) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return reg;
  } catch (e) {
    console.warn('[push] SW registration failed', e);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────
//  isPushSubscribed — Le navigateur est déjà abonné ?
// ─────────────────────────────────────────────────────────────────
export async function isPushSubscribed() {
  if (!isPushReady()) return false;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return false;
    const sub = await reg.pushManager.getSubscription();
    return Boolean(sub);
  } catch (_e) {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────
//  subscribeToPush — Demande permission + abonnement + persist backend
//
//  Workflow :
//   1. registerServiceWorker (si pas déjà fait)
//   2. Notification.requestPermission()
//   3. pushManager.subscribe(vapid)
//   4. POST subscription → Apps Script (savePushSubscription)
//
//  Renvoie la subscription ou throw si erreur.
// ─────────────────────────────────────────────────────────────────
export async function subscribeToPush(commercantId) {
  if (!isPushReady()) throw new Error('push_not_supported');
  if (!VAPID_PUBLIC_KEY) throw new Error('vapid_key_missing');

  // ⚠️ CRITIQUE iOS : requestPermission() DOIT être appelé en TOUT
  //    PREMIER, AVANT tout autre await. Si on attend (registerSW,
  //    serviceWorker.ready, etc.), iOS Safari considère que le user
  //    gesture est consommé et IGNORE silencieusement la demande
  //    de permission (le popup natif ne s'affiche jamais).
  //
  //    Pattern Apple-validé : requestPermission EN PREMIER, dans la
  //    même tick que le clic utilisateur.
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error('permission_denied');

  // Service worker : on s'assure qu'il est ENREGISTRÉ ET ACTIF.
  //    iOS exige que reg.active soit non-null avant subscribe.
  let reg = await navigator.serviceWorker.getRegistration();
  if (!reg) reg = await registerServiceWorker();
  if (!reg) throw new Error('sw_unavailable');
  // Attend que le SW soit ACTIVE (peut être en installing/waiting)
  reg = await navigator.serviceWorker.ready;
  if (!reg || !reg.active) throw new Error('sw_not_active');

  // 3. Subscribe (réutilise si déjà subscribed avec la bonne clé,
  //    sinon désinscrit + re-subscribe avec la nouvelle clé pour
  //    éviter les VAPID mismatch sur des installs anciennes).
  let sub = await reg.pushManager.getSubscription();
  if (sub) {
    // Vérifie que la clé applicationServerKey matche celle qu'on a
    const expectedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    const currentKey = sub.options && sub.options.applicationServerKey;
    if (!currentKey || !sameKey(expectedKey, currentKey)) {
      try { await sub.unsubscribe(); } catch (_e) {}
      sub = null;
    }
  }
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }
  if (!sub || !sub.endpoint) throw new Error('subscribe_failed');

  // 4. Persist côté Apps Script (single retry pour réseau flaky)
  const payload = JSON.stringify({
    action: 'savePushSubscription',
    commercant_id: commercantId,
    subscription: sub.toJSON(),
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  });
  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: payload,
    });
  } catch (_e) {
    // 1 retry après 800ms (Apps Script peut être lent au cold start)
    await new Promise((r) => setTimeout(r, 800));
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: payload,
    });
  }

  return sub;
}

// Compare deux ArrayBuffer/Uint8Array bytes par bytes
function sameKey(a, b) {
  const va = new Uint8Array(a);
  const vb = new Uint8Array(b);
  if (va.length !== vb.length) return false;
  for (let i = 0; i < va.length; i++) if (va[i] !== vb[i]) return false;
  return true;
}

// ─────────────────────────────────────────────────────────────────
//  Diagnostic complet — affichage dans l'UI pour debug
//
//  Retourne un objet qui décrit chaque maillon de la chaîne push :
//   - is_https / origin
//   - push_ready (API disponibles)
//   - service_worker (registered, active, scope)
//   - notification_permission ('granted' | 'denied' | 'default')
//   - subscribed (true/false + endpoint partiel)
//   - vapid_key_set (et fingerprint des 8 premiers chars)
//   - standalone (PWA installée)
//   - user_agent
// ─────────────────────────────────────────────────────────────────
export async function getPushDiagnostic() {
  const out = {
    ok: true,
    origin: typeof window !== 'undefined' ? window.location.origin : '',
    protocol: typeof window !== 'undefined' ? window.location.protocol : '',
    push_ready: isPushReady(),
    notification_permission: 'unknown',
    vapid_public_key_set: Boolean(VAPID_PUBLIC_KEY),
    vapid_public_key_preview: VAPID_PUBLIC_KEY ? VAPID_PUBLIC_KEY.slice(0, 12) + '…' : '',
    service_worker_registered: false,
    service_worker_active: false,
    service_worker_scope: '',
    subscribed: false,
    subscription_endpoint_host: '',
    standalone: false,
    ios_likely: false,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  };
  try {
    if (typeof Notification !== 'undefined') {
      out.notification_permission = Notification.permission;
    }
    if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        out.service_worker_registered = true;
        out.service_worker_active = Boolean(reg.active);
        out.service_worker_scope = reg.scope || '';
        try {
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            out.subscribed = true;
            try {
              const url = new URL(sub.endpoint);
              out.subscription_endpoint_host = url.host;
            } catch (_e) {}
          }
        } catch (_e) {}
      }
    }
    out.standalone = isStandalonePWA();
    const ua = (out.user_agent || '').toLowerCase();
    out.ios_likely = /iphone|ipad|ipod/.test(ua);
  } catch (e) {
    out.ok = false;
    out.error = e.message || String(e);
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────
//  unsubscribeFromPush
// ─────────────────────────────────────────────────────────────────
export async function unsubscribeFromPush(commercantId) {
  if (!isPushReady()) return false;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return false;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return false;
    const endpoint = sub.endpoint;
    await sub.unsubscribe();
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'deletePushSubscription',
        commercant_id: commercantId,
        endpoint: endpoint,
      }),
    });
    return true;
  } catch (e) {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────
//  isStandalonePWA — la page est-elle ouverte depuis le mode "installé" ?
//  (utilisé pour adapter le tutoriel "Ajouter à l'écran d'accueil")
// ─────────────────────────────────────────────────────────────────
export function isStandalonePWA() {
  if (typeof window === 'undefined') return false;
  // iOS Safari : navigator.standalone
  if ('standalone' in window.navigator && window.navigator.standalone === true) return true;
  // Standard PWA (Android, Chrome desktop)
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
  return false;
}

// ─────────────────────────────────────────────────────────────────
//  detectPlatform — utile pour afficher le bon tuto d'installation
// ─────────────────────────────────────────────────────────────────
export function detectPlatform() {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua) || (ua.includes('mac') && navigator.maxTouchPoints > 1);
  if (isIOS) return 'ios';
  if (/android/.test(ua)) return 'android';
  if (/mac/.test(ua)) return 'mac';
  if (/win/.test(ua)) return 'windows';
  return 'unknown';
}
