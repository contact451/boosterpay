// ─────────────────────────────────────────────────────────────────
//  PWAInstallBanner — propose au commerçant d'installer BoosterPay
//                     sur son écran d'accueil (PWA installable)
//
//  - Sur iPhone : tuto visuel "Partager → Sur l'écran d'accueil"
//                 (Apple n'expose pas de prompt programmable)
//  - Sur Android : prompt natif via beforeinstallprompt
//
//  Désactivé si :
//   - déjà en mode standalone (l'app est ouverte depuis l'écran d'accueil)
//   - dismissé dans les 7 derniers jours (rate limit gentle)
//   - navigateur non supporté
//
//  Visible uniquement sur mobile. Style Apple soft, fond ECFDF5,
//  bouton CTA pill noir.
// ─────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { Smartphone, Share, Plus, X } from 'lucide-react';
import { isStandalonePWA, detectPlatform } from '../services/pushSubscription';

// Dismiss = session courante uniquement.
// Le banner réapparait à chaque nouvelle visite tant que l'app
// n'est pas installée en mode standalone.
const SESSION_KEY = 'bp_pwa_install_dismissed';

function wasDismissedThisSession() {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === '1';
  } catch (_e) {
    return false;
  }
}

export default function PWAInstallBanner({ commercantId: _commercantId }) {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState('unknown');
  const [iosTutoOpen, setIosTutoOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isStandalonePWA()) return; // déjà installé
    if (wasDismissedThisSession()) return;
    // Mobile only
    const isMobile = window.matchMedia('(max-width: 900px)').matches;
    if (!isMobile) return;

    setPlatform(detectPlatform());
    setVisible(true);

    // Capture Android beforeinstallprompt
    const onBIP = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', onBIP);
    return () => window.removeEventListener('beforeinstallprompt', onBIP);
  }, []);

  const handleDismiss = () => {
    try { window.sessionStorage.setItem(SESSION_KEY, '1'); } catch (_e) {}
    setVisible(false);
    setIosTutoOpen(false);
  };

  const handleInstall = async () => {
    if (platform === 'ios') {
      setIosTutoOpen(true);
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch (_e) {}
      setDeferredPrompt(null);
      handleDismiss();
      return;
    }
    // Fallback : ouvrir tuto iOS-like
    setIosTutoOpen(true);
  };

  if (!visible) return null;

  return (
    <>
      <div
        className="mb-6 rounded-2xl p-4 flex items-center gap-3"
        style={{
          background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)',
          border: '1px solid rgba(16, 185, 129, 0.30)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 6px 18px rgba(16,185,129,0.10)',
        }}
      >
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.30)',
          }}
        >
          <Smartphone size={17} color="white" strokeWidth={2.4} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-gray-900 leading-tight">
            Installer BoosterPay sur votre téléphone
          </p>
          <p className="text-[12px] text-gray-600 mt-0.5 leading-snug">
            Accès en 1 tap, alertes en temps réel.
          </p>
        </div>

        <button
          onClick={handleInstall}
          className="flex-shrink-0 px-3.5 py-2 rounded-xl text-[12.5px] font-bold transition-transform active:scale-95"
          style={{
            background: '#0F172A',
            color: 'white',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.25)',
          }}
        >
          Installer
        </button>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:bg-emerald-100/50 transition-colors"
          aria-label="Plus tard"
        >
          <X size={14} color="#047857" strokeWidth={2.2} />
        </button>
      </div>

      {/* ════ Tuto iOS modal ════ */}
      {iosTutoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
          onClick={() => setIosTutoOpen(false)}
        >
          <div
            className="bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-[16px] font-bold text-gray-900">
                Installer sur l'écran d'accueil
              </h3>
              <button
                onClick={() => setIosTutoOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
                aria-label="Fermer"
              >
                <X size={18} color="#6B7280" strokeWidth={2.2} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5 space-y-4">
              <p className="text-[13.5px] text-gray-600 leading-relaxed">
                3 étapes pour avoir BoosterPay comme une vraie application native sur votre iPhone.
              </p>

              <Step
                num={1}
                title="Touchez le bouton Partage"
                icon={<Share size={18} color="#3B82F6" strokeWidth={2.4} />}
                hint="En bas de Safari · au milieu de la barre"
              />
              <Step
                num={2}
                title="Choisissez « Sur l'écran d'accueil »"
                icon={<Plus size={18} color="#3B82F6" strokeWidth={2.4} />}
                hint="Faites défiler la liste si nécessaire"
              />
              <Step
                num={3}
                title="Touchez « Ajouter »"
                icon={<Smartphone size={18} color="#10B981" strokeWidth={2.4} />}
                hint="L'icône BoosterPay apparaît sur votre bureau"
                last
              />

              <div
                className="mt-2 rounded-xl p-3 text-[12px] text-gray-600"
                style={{ background: '#F9FAFB', border: '1px solid #F3F4F6' }}
              >
                ⚠️ Cette procédure marche uniquement depuis <strong>Safari</strong> (pas Chrome iOS).
              </div>
            </div>

            <div className="p-4 border-t border-gray-100" style={{ background: '#FAFBFC' }}>
              <button
                onClick={handleDismiss}
                className="w-full py-3 rounded-2xl text-[14.5px] font-bold transition-transform active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: 'white',
                  boxShadow: '0 4px 14px rgba(16,185,129,0.30)',
                }}
              >
                C'est fait
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Step({ num, title, icon, hint, last }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold"
        style={{ background: '#ECFDF5', color: '#047857' }}
      >
        {num}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[14px] font-bold text-gray-900">{title}</p>
          {icon}
        </div>
        {hint && <p className="text-[12px] text-gray-500 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}
