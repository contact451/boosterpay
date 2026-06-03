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

// ─────────────────────────────────────────────────────────────────
//  Splash inline — suppression avec fade-out une fois React prêt
//
//  Le splash est dans index.html (visible AVANT React mount).
//  On le retire avec un petit fade pour une transition douce.
//
//  Logique :
//   - Par défaut, on retire le splash après 700ms (laisse le temps à
//     React de mount + au premier composant d'afficher quelque chose)
//   - Si une page (MesAppels) demande à le garder plus longtemps
//     (résolution async commercant_id), on étend jusqu'à signalement
//     manuel via window.dispatchEvent(new Event('bp:splash-done'))
// ─────────────────────────────────────────────────────────────────
function removeSplash() {
  const el = document.getElementById('bp-splash');
  if (!el) return;
  el.style.transition = 'opacity 280ms ease-out';
  el.style.opacity = '0';
  setTimeout(() => { try { el.remove(); } catch (_e) {} }, 320);
}

if (typeof window !== 'undefined') {
  let splashRemoved = false;
  const safeRemove = () => {
    if (splashRemoved) return;
    splashRemoved = true;
    removeSplash();
  };

  // Signal manuel (depuis MesAppels après résolution async)
  window.addEventListener('bp:splash-done', safeRemove);

  // Fallback : on retire le splash après 2.5s maximum, même si rien
  // n'a signalé. Évite qu'il reste bloqué en cas d'erreur JS.
  setTimeout(safeRemove, 2500);
}
