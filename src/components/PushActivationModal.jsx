// ─────────────────────────────────────────────────────────────────
//  PushActivationModal — Modal premium d'activation des notifs
//
//  Affiché automatiquement à la 1ère ouverture PWA standalone (1 fois
//  par session). Pousse fort à l'activation pour permettre à BoosterPay
//  d'alerter en temps réel sans payer de SMS.
//
//  UX :
//   - Bottom sheet (mobile) ou modal (desktop)
//   - Illustration premium emerald avec icônes Telephone + Bell
//   - 3 bénéfices clairs (vrai numéro, instant, gratuit)
//   - CTA principal "Activer les notifications"
//   - Lien secondaire "Plus tard" très discret
// ─────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { BellRing, Phone, Zap, Shield, X } from 'lucide-react';

export default function PushActivationModal({ onActivate, onClose }) {
  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'bp-fade-bg 240ms ease-out both',
      }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'bp-slide-up 320ms cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {/* Header visuel premium */}
        <div
          className="relative px-6 pt-8 pb-6 text-center overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #ECFDF5 0%, #FFFFFF 100%)',
          }}
        >
          {/* Glow décoratif */}
          <div
            aria-hidden
            className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(16,185,129,0.22) 0%, transparent 70%)',
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Icône principale animée — téléphone + cloche */}
          <div className="relative inline-flex items-center justify-center mb-4">
            <div
              className="w-20 h-20 rounded-[22px] flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: '0 12px 32px rgba(16, 185, 129, 0.32), 0 4px 12px rgba(16, 185, 129, 0.20)',
                animation: 'bp-icon-float 3s ease-in-out infinite',
              }}
            >
              <Phone size={32} color="white" strokeWidth={2.2} />
            </div>
            {/* Bell badge en haut à droite — pulse */}
            <div
              className="absolute -top-1.5 -right-1.5 w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.10), 0 0 0 2px #ECFDF5',
                animation: 'bp-bell-bounce 2.6s ease-in-out infinite',
              }}
            >
              <BellRing size={16} color="#059669" strokeWidth={2.4} />
            </div>
          </div>

          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/60 transition-colors"
            aria-label="Plus tard"
            style={{ background: 'rgba(255,255,255,0.4)' }}
          >
            <X size={16} color="#374151" strokeWidth={2.4} />
          </button>

          <h2
            className="font-extrabold text-gray-900 relative"
            style={{
              fontSize: 'clamp(22px, 5vw, 26px)',
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
            }}
          >
            Activez les notifications
          </h2>
          <p className="text-[14.5px] text-gray-600 mt-2.5 leading-relaxed max-w-xs mx-auto relative">
            Recevez une alerte instantanée avec le <strong className="text-gray-900">vrai numéro</strong> de chaque appelant. Plus jamais d'opportunité perdue.
          </p>
        </div>

        {/* Bénéfices */}
        <div className="px-6 py-5 space-y-3">
          <Benefit
            icon={Phone}
            title="Le vrai numéro de l'appelant"
            sub="Pas le numéro BoosterPay : celui de votre client."
          />
          <Benefit
            icon={Zap}
            title="Instantané, comme une vraie app"
            sub="Notification native iPhone et Android, en moins d'1 seconde."
          />
          <Benefit
            icon={Shield}
            title="100% gratuit et silencieux si vous répondez"
            sub="Notifié seulement si vous ratez l'appel ou si l'IA prend le relais."
          />
        </div>

        {/* CTAs */}
        <div
          className="px-5 pb-6 pt-2"
          style={{ background: '#FAFBFC' }}
        >
          <button
            onClick={onActivate}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[15.5px] font-bold transition-transform active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              boxShadow: '0 6px 22px rgba(16, 185, 129, 0.36)',
            }}
          >
            <BellRing size={16} strokeWidth={2.6} />
            Activer les notifications
          </button>
          <button
            onClick={onClose}
            className="w-full mt-2 py-2.5 text-[13px] font-semibold"
            style={{
              background: 'transparent',
              color: '#9CA3AF',
              border: 'none',
            }}
          >
            Plus tard
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bp-fade-bg {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bp-slide-up {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes bp-icon-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes bp-bell-bounce {
          0%, 80%, 100% { transform: rotate(0deg); }
          85% { transform: rotate(-12deg); }
          90% { transform: rotate(12deg); }
          95% { transform: rotate(-6deg); }
        }
      `}</style>
    </div>
  );
}

function Benefit({ icon: Icon, title, sub }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
        style={{
          background: '#ECFDF5',
          border: '1px solid rgba(16,185,129,0.16)',
        }}
      >
        <Icon size={15} color="#047857" strokeWidth={2.4} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-gray-900 leading-tight">{title}</p>
        <p className="text-[12.5px] text-gray-600 mt-0.5 leading-snug">{sub}</p>
      </div>
    </div>
  );
}
