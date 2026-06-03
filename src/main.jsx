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
  });
}
