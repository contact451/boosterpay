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
