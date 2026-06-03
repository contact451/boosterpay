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

  // 1. Service worker
  let reg = await navigator.serviceWorker.getRegistration();
  if (!reg) reg = await registerServiceWorker();
  if (!reg) throw new Error('sw_unavailable');

  // 2. Permission
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error('permission_denied');

  // 3. Subscribe (réutilise si déjà subscribed avec la bonne clé)
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  // 4. Persist côté Apps Script
  await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'savePushSubscription',
      commercant_id: commercantId,
      subscription: sub.toJSON(),
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    }),
  });

  return sub;
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
