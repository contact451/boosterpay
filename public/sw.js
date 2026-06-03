// ─────────────────────────────────────────────────────────────────
//  BoosterPay — Service Worker
//
//  Rôle :
//   1. Recevoir les Web Push notifications du backend BoosterPay
//      (appel manqué / IA a pris un message / paiement / etc.)
//   2. Afficher une notification native (iPhone iOS 16.4+, Android)
//   3. Au tap, ouvrir l'espace user sur la page "Mes appels"
//
//  Pas de cache d'assets pour l'instant (l'app est en ligne uniquement).
//  Le SW se met à jour automatiquement à chaque refresh (skipWaiting).
// ─────────────────────────────────────────────────────────────────

const SW_VERSION = 'v1.0.0';

self.addEventListener('install', (event) => {
  // Activation immédiate à la nouvelle version
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Prend le contrôle des onglets ouverts
  event.waitUntil(self.clients.claim());
});

// ─────────────────────────────────────────────────────────────────
//  FETCH INTERCEPTOR — résolution PWA infaillible iOS + Android
//
//  Quand la PWA s'ouvre depuis l'écran d'accueil, elle navigue vers
//  le start_url du manifest = /espace/appels (SANS ?id=BP-XXX).
//  Sur iOS PWA, le localStorage peut être purgé par ITP entre les
//  sessions → MesAppels lit le cache et redirige avec le bon id,
//  mais avant ce redirect React mount → flash de la page démo.
//
//  Le Service Worker survit aux fermetures de PWA et a accès à un
//  IndexedDB persistent même quand le localStorage est purgé. On
//  l'utilise comme proxy : on intercepte les navigations vers
//  /espace/appels SANS ?id et on renvoie un 302 redirect HTTP avec
//  l'id stocké dans IDB. Le navigateur suit le 302 → arrive direct
//  sur la bonne URL → ZÉRO flash démo.
//
//  Pareil pour /espace/modules et /configurer (les 3 pages de
//  l'espace user qui ont besoin du ?id pour charger les données).
// ─────────────────────────────────────────────────────────────────

const SW_IDB_NAME = 'bp-pwa-store';
const SW_IDB_STORE = 'kv';
const SW_IDB_VERSION = 1;
const SW_IDB_KEY = 'bp_last_commercant_id';

function swOpenIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(SW_IDB_NAME, SW_IDB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(SW_IDB_STORE)) {
        db.createObjectStore(SW_IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function swReadLastId() {
  try {
    const db = await swOpenIDB();
    const id = await new Promise((resolve, reject) => {
      const tx = db.transaction(SW_IDB_STORE, 'readonly');
      const req = tx.objectStore(SW_IDB_STORE).get(SW_IDB_KEY);
      req.onsuccess = () => resolve(req.result || '');
      req.onerror = () => reject(req.error);
    });
    db.close();
    return id;
  } catch (_e) {
    return '';
  }
}

// Pages de l'espace user qui acceptent un ?id et qui DOIVENT en avoir un
// pour ne pas tomber en mode démo.
const PROTECTED_PATHS = new Set([
  '/espace/appels',
  '/espace/modules',
  '/configurer',
]);

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // On ne touche qu'aux NAVIGATIONS (clicks d'utilisateur), pas aux assets.
  if (req.mode !== 'navigate' || req.method !== 'GET') return;

  let url;
  try {
    url = new URL(req.url);
  } catch (_e) { return; }

  // Même origin uniquement (sécurité)
  if (url.origin !== self.location.origin) return;

  // On n'intercepte que les pages protégées + uniquement si pas déjà d'?id
  if (!PROTECTED_PATHS.has(url.pathname)) return;
  if (url.searchParams.has('id')) return;

  // Lookup async → si trouvé, on retourne un 302 vers la même URL +
  // ?id=BP-XXX. Sinon, on laisse passer la requête normalement
  // (la page React fera son propre fallback vers /connexion?from=pwa).
  event.respondWith((async () => {
    try {
      const id = await swReadLastId();
      if (id) {
        url.searchParams.set('id', id);
        return Response.redirect(url.toString(), 302);
      }
    } catch (_e) { /* silent */ }
    // Pas d'id stocké → page normale (mode démo ou redirect vers /connexion)
    return fetch(req);
  })());
});

// ─────────────────────────────────────────────────────────────────
//  PUSH — réception d'une notif depuis le serveur Telnyx (Railway)
//
//  Payload attendu (JSON) :
//   {
//     title: "📞 Appel manqué",
//     body:  "+33 6 12 34 56 78 a essayé de vous joindre",
//     tag:   "missed-<conversation_uuid>",
//     url:   "/espace/appels?id=BP-XXX",
//     icon:  "/pwa-icon-192.png",
//     badge: "/pwa-badge.png"
//   }
// ─────────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_e) {
    data = { title: 'BoosterPay', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'BoosterPay';
  const options = {
    body: data.body || '',
    icon: data.icon || '/pwa-icon-192.png',
    badge: data.badge || '/pwa-badge.png',
    tag: data.tag || 'boosterpay-default',
    renotify: true,
    requireInteraction: false,
    vibrate: [120, 60, 120],
    data: {
      url: data.url || '/espace/appels',
      timestamp: Date.now(),
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ─────────────────────────────────────────────────────────────────
//  NOTIFICATION CLICK — tap sur la notif
//   - Focus un onglet existant si déjà ouvert sur cette URL
//   - Sinon ouvre un nouvel onglet sur l'URL passée dans data.url
// ─────────────────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/espace/appels';

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      // 1. Si un onglet est déjà ouvert sur l'app, on focus + navigate
      for (const client of allClients) {
        try {
          const url = new URL(client.url);
          if (url.origin === self.location.origin) {
            await client.focus();
            if ('navigate' in client) {
              await client.navigate(targetUrl);
            }
            return;
          }
        } catch (_e) { /* ignore */ }
      }

      // 2. Sinon nouvel onglet
      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })()
  );
});

// ─────────────────────────────────────────────────────────────────
//  NOTIFICATION CLOSE — utile pour analytics futur
// ─────────────────────────────────────────────────────────────────
self.addEventListener('notificationclose', (_event) => {
  // No-op pour l'instant
});
