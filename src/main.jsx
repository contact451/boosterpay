import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerServiceWorker } from './services/pushSubscription';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Enregistre le service worker BoosterPay (PWA + Web Push)
// Silent fail — pas bloquant si HTTPS absent (localhost OK)
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // Force la mise à jour du SW si une nouvelle version est dispo (sinon
    // iOS PWA peut garder l'ancien SW indéfiniment).
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.update())))
        .catch(() => {});
    }
    registerServiceWorker().catch(() => {});
    // Demande au navigateur de protéger notre stockage contre la purge
    // automatique (iOS PWA ITP peut effacer localStorage entre sessions).
    try {
      if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().catch(() => {});
      }
    } catch (_e) {}
  });
}

