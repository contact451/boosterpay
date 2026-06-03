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
    registerServiceWorker().catch(() => {});
    // Demande au navigateur de protéger notre stockage contre la purge
    // automatique (iOS PWA ITP peut effacer localStorage entre sessions).
    // Best-effort silencieux — Safari l'accorde habituellement aux PWA
    // installées à l'écran d'accueil.
    try {
      if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().catch(() => {});
      }
    } catch (_e) {}
  });
}
