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

const SW_VERSION = 'v2.0.0-no-interceptor';

self.addEventListener('install', (event) => {
  // Activation immédiate à la nouvelle version (force rotate iOS)
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Prend le contrôle des onglets ouverts SANS attendre fin de navigation
  event.waitUntil((async () => {
    await self.clients.claim();
    // Vide tous les caches anciens pour s'assurer qu'on sert toujours du
    // contenu frais (la PWA est en ligne uniquement, pas besoin de cache assets)
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch (_e) {}
  })());
});

// Force la mise à jour si le main thread demande
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Note : pas de fetch interceptor. La résolution du commercant_id est
// faite côté client (MesAppels useEffect) avec splash HTML inline pour
// éviter le flash avant React mount. Le SW se concentre uniquement sur
// les Web Push notifications.

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
