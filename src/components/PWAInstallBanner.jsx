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

// Le banner s'affiche tant que la PWA n'est pas installée en mode standalone.
// Variant "toast" (par défaut) : flottant en bas de l'écran, dismissable
//   pour 7 jours via localStorage `pwa_install_dismissed_until`.
// Variant "inline" : ancien comportement, banner en haut du contenu.

const DISMISS_KEY = 'pwa_install_dismissed_until';
const DISMISS_DAYS = 7;

function isCurrentlyDismissed() {
  if (typeof localStorage === 'undefined') return false;
  try {
    const until = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10);
    return until && Date.now() < until;
  } catch (_e) {
    return false;
  }
}

function dismissForDays(days) {
  if (typeof localStorage === 'undefined') return;
  try {
    const until = Date.now() + days * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISS_KEY, String(until));
  } catch (_e) {}
}

export default function PWAInstallBanner({ commercantId: _commercantId, variant = 'toast' }) {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState('unknown');
  const [iosTutoOpen, setIosTutoOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isStandalonePWA()) return; // déjà installé → on n'affiche pas
    if (isCurrentlyDismissed()) return; // dismissé pour les 7 prochains jours
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

  // Dismiss user : cache la pastille pour 7 jours
  const closeIosTuto = () => setIosTutoOpen(false);
  const handleDismiss = () => {
    dismissForDays(DISMISS_DAYS);
    setVisible(false);
  };

  const handleInstall = async () => {
    // L'install PWA utilise le start_url du manifest qui est /connexion.
    // Donc on n'a pas besoin de naviguer ailleurs avant l'install : l'icône
    // bureau ouvrira directement la page de connexion (qui fait elle-même
    // un auto-redirect si l'utilisateur a déjà un cache de session).
    if (platform === 'ios') {
      setIosTutoOpen(true);
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch (_e) {}
      setDeferredPrompt(null);
      return;
    }
    setIosTutoOpen(true);
  };

  if (!visible) return null;

  // ─── Variant "toast" : flottant en bas, au-dessus de la bottom tab bar ───
  //    Apparaît avec une animation slide-up douce, dismissable via X.
  //    Padding-bottom calculé pour ne pas chevaucher la bottom tab bar (h ~64px)
  //    ni la safe-area iPhone.
  if (variant === 'toast') {
    return (
      <>
        <div
          className="fixed left-3 right-3 z-40 md:hidden"
          style={{
            bottom: 'calc(76px + env(safe-area-inset-bottom, 0px))',
            animation: 'bp-toast-in 480ms cubic-bezier(0.2,0.8,0.2,1) both',
          }}
        >
          <div
            className="rounded-2xl p-3 flex items-center gap-3"
            style={{
              background: 'rgba(255,255,255,0.96)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              boxShadow: '0 12px 32px rgba(15,23,42,0.16), 0 2px 6px rgba(0,0,0,0.04)',
            }}
          >
            <div
              className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.30)',
              }}
            >
              <Smartphone size={15} color="white" strokeWidth={2.4} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-gray-900 leading-tight">
                Installer BoosterPay
              </p>
              <p className="text-[11.5px] text-gray-500 mt-0.5 leading-snug">
                Accès en 1 tap, alertes temps réel.
              </p>
            </div>
            <button
              onClick={handleInstall}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-bold transition-transform active:scale-95"
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
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
              aria-label="Fermer"
            >
              <X size={14} color="#9CA3AF" strokeWidth={2.4} />
            </button>
          </div>
          <style>{`
            @keyframes bp-toast-in {
              from { opacity: 0; transform: translateY(20px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
        {/* iOS tuto modal — partagé entre variants */}
        {iosTutoOpen && <IosTutoModal onClose={closeIosTuto} />}
      </>
    );
  }

  // ─── Variant "inline" : ancien comportement (banner en haut du contenu) ───
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
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-white/60"
          aria-label="Fermer"
        >
          <X size={14} color="#6B7280" strokeWidth={2.4} />
        </button>
      </div>

      {/* ════ Tuto iOS modal ════ */}
      {iosTutoOpen && <IosTutoModal onClose={closeIosTuto} />}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
//  IosTutoModal — modal extraite pour être réutilisée entre variants
// ─────────────────────────────────────────────────────────────────
function IosTutoModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      onClick={onClose}
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
            onClick={onClose}
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
            Cette procédure marche uniquement depuis <strong>Safari</strong> (pas Chrome iOS).
          </div>
        </div>

        <div className="p-4 border-t border-gray-100" style={{ background: '#FAFBFC' }}>
          <button
            onClick={onClose}
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
