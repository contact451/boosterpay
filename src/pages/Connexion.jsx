// ─────────────────────────────────────────────────────────────────
//  Page /connexion — Magic link Apple ultra premium
//
//  Design : charte BoosterPay (emerald 500/600, Plus Jakarta Sans),
//  glassmorphism, glows radiaux animés, micro-interactions douces.
//
//  Le client saisit son email → reçoit un lien sécurisé valide 24h.
//  Pas de mot de passe, pas de friction.
//
//  Backend : POST { action: 'requestMagicLink', email } sur Apps Script
//            Vonage CRM (action publique, pas de token requis).
// ─────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Loader2, UserPlus } from 'lucide-react';

function getVonageCrmApiUrl() {
  return import.meta.env.VITE_VONAGE_CRM_APPS_SCRIPT_URL || '';
}

export default function Connexion() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | sent | not_found | error
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setStatus('error');
      setError('Veuillez saisir un email valide.');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      const apiUrl = getVonageCrmApiUrl();
      if (!apiUrl) {
        setStatus('error');
        setError('Service indisponible. Réessayez dans quelques instants.');
        return;
      }
      const res = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'requestMagicLink', email: trimmed }),
      });
      const json = await res.json();
      if (json.ok) {
        setStatus('sent');
      } else if (json.error === 'email_not_found') {
        setStatus('not_found');
      } else {
        setStatus('error');
        setError(
          json.error === 'email_send_failed'
            ? "L'envoi a échoué. Réessayez dans quelques instants."
            : 'Une erreur est survenue. Réessayez.'
        );
      }
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Connexion impossible.');
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-5 py-16 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(236,253,245,0.7) 0%, #FFFFFF 60%)',
        fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <StyleBlock />

      {/* Glows radiaux animés */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-180px] right-[-160px] w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(209,250,229,0.4) 0%, transparent 70%)',
          animation: 'bpConnexionPulse 9s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-120px] left-[-100px] w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(204,251,241,0.3) 0%, transparent 70%)',
          animation: 'bpConnexionPulse 7s ease-in-out 1.2s infinite',
        }}
      />

      <div className="relative w-full max-w-[420px] z-10">
        {/* Logo */}
        <div
          className="text-center"
          style={{
            marginBottom: '36px',
            animation: 'bpFadeInDown 0.55s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          <Link
            to="/"
            className="inline-block font-extrabold tracking-tight"
            style={{ color: '#059669', fontSize: '20px', letterSpacing: '-0.4px' }}
          >
            BoosterPay
          </Link>
        </div>

        {/* Card */}
        <div
          className="relative"
          style={{
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(32px) saturate(180%)',
            WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            border: '1px solid rgba(16,185,129,0.12)',
            borderRadius: '28px',
            padding: '52px 48px',
            boxShadow:
              '0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 4px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.07), 0 40px 80px rgba(16,185,129,0.06)',
            animation: 'bpFadeInUp 0.65s cubic-bezier(0.16,1,0.3,1) 80ms both',
          }}
        >
          {status === 'not_found' ? (
            <NotFoundState email={email} onRetry={() => { setStatus('idle'); setEmail(''); }} />
          ) : status === 'sent' ? (
            <SentState email={email} onRetry={() => { setStatus('idle'); setEmail(''); }} />
          ) : (
            <FormState
              email={email}
              setEmail={setEmail}
              status={status}
              error={error}
              onSubmit={handleSubmit}
            />
          )}
        </div>

        {/* Aide sous la card */}
        <div
          className="text-center"
          style={{
            marginTop: '24px',
            animation: 'bpFadeInUp 0.65s cubic-bezier(0.16,1,0.3,1) 250ms both',
          }}
        >
          <p style={{ color: '#6B7280', fontSize: '13px' }}>
            Besoin d'aide ?{' '}
            <a
              href="mailto:contact@booster-pay.com"
              style={{ color: '#10B981', fontWeight: 600, textDecoration: 'none' }}
            >
              contact@booster-pay.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  État : formulaire (idle / loading / error)
// ─────────────────────────────────────────────────────────────────
function FormState({ email, setEmail, status, error, onSubmit }) {
  return (
    <>
      {/* Badge pill */}
      <div className="flex justify-center" style={{ marginBottom: '24px' }}>
        <div
          className="inline-flex items-center gap-2"
          style={{
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            color: '#059669',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            padding: '6px 13px',
            borderRadius: '999px',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#10B981',
              boxShadow: '0 0 0 0 rgba(16,185,129,0.5)',
              animation: 'bpDot 2.2s ease-in-out infinite',
            }}
          />
          Connexion sécurisée
        </div>
      </div>

      {/* Titre */}
      <h1
        style={{
          color: '#0F172A',
          fontSize: '34px',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-1.2px',
          margin: 0,
          textAlign: 'center',
        }}
      >
        Bon retour,
        <br />
        <span style={{ color: '#10B981' }}>ravi de vous revoir.</span>
      </h1>

      {/* Sous-titre */}
      <p
        style={{
          color: '#6B7280',
          fontSize: '15px',
          lineHeight: 1.65,
          textAlign: 'center',
          margin: '14px 0 36px 0',
        }}
      >
        Recevez un lien magique dans votre boîte mail.
        <br />
        Connexion instantanée, sans mot de passe.
      </p>

      {/* Séparateur gradient */}
      <div
        style={{
          height: '1px',
          background:
            'linear-gradient(to right, transparent, rgba(16,185,129,0.15), transparent)',
          marginBottom: '28px',
        }}
      />

      {/* Form */}
      <form onSubmit={onSubmit}>
        {/* Label */}
        <label
          htmlFor="connexion-email"
          style={{
            display: 'block',
            fontSize: '11.5px',
            fontWeight: 700,
            letterSpacing: '0.55px',
            color: '#374151',
            textTransform: 'uppercase',
            marginBottom: '10px',
          }}
        >
          Adresse email
        </label>

        {/* Input */}
        <input
          id="connexion-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.com"
          autoFocus
          disabled={status === 'loading'}
          className="bp-connexion-input"
          style={{
            width: '100%',
            height: '54px',
            padding: '0 18px',
            borderRadius: '16px',
            border: '1.5px solid rgba(209,213,219,0.8)',
            background: 'rgba(255,255,255,0.9)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            fontSize: '15px',
            color: '#0F172A',
            outline: 'none',
            transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
            fontFamily: 'inherit',
          }}
        />

        {/* Erreur */}
        {status === 'error' && error && (
          <div
            style={{
              marginTop: '14px',
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(254,242,242,0.9)',
              border: '1px solid rgba(254,202,202,0.7)',
              color: '#991B1B',
              fontSize: '13px',
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        {/* Bouton CTA */}
        <button
          type="submit"
          disabled={status === 'loading' || !email}
          className="bp-connexion-cta"
          style={{
            position: 'relative',
            width: '100%',
            height: '54px',
            marginTop: '20px',
            borderRadius: '16px',
            border: 'none',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#FFFFFF',
            fontSize: '15.5px',
            fontWeight: 700,
            letterSpacing: '-0.1px',
            cursor: status === 'loading' || !email ? 'not-allowed' : 'pointer',
            opacity: status === 'loading' || !email ? 0.6 : 1,
            boxShadow: '0 4px 15px rgba(16,185,129,0.3)',
            overflow: 'hidden',
            transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
            fontFamily: 'inherit',
          }}
        >
          {/* Highlight interne */}
          <span
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 60%)',
              pointerEvents: 'none',
            }}
          />
          <span className="bp-connexion-cta-content" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {status === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Envoi…
              </>
            ) : (
              <>
                Recevoir mon lien
                <ArrowRight className="bp-connexion-cta-arrow w-4 h-4" />
              </>
            )}
          </span>
        </button>
      </form>

      {/* Trust bar */}
      <div
        style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid #F3F4F6',
        }}
      >
        <div
          className="flex items-center justify-center"
          style={{ gap: '14px', flexWrap: 'wrap' }}
        >
          <TrustItem icon="🛡" label="Lien unique" />
          <Dot />
          <TrustItem icon="⏱" label="Valable 24h" />
          <Dot />
          <TrustItem icon="🔒" label="Zéro mot de passe" />
        </div>
      </div>
    </>
  );
}

function TrustItem({ icon, label }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: '#9CA3AF',
        fontSize: '12px',
        fontWeight: 500,
      }}
    >
      <span style={{ fontSize: '13px', lineHeight: 1 }}>{icon}</span>
      {label}
    </span>
  );
}

function Dot() {
  return (
    <span
      aria-hidden
      style={{
        width: '3px',
        height: '3px',
        borderRadius: '50%',
        background: '#E5E7EB',
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────
//  État : email envoyé avec succès
// ─────────────────────────────────────────────────────────────────
function SentState({ email, onRetry }) {
  return (
    <div className="text-center">
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 30% 30%, rgba(209,250,229,1) 0%, rgba(187,247,208,0.9) 100%)',
          margin: '0 auto 22px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(16,185,129,0.18)',
        }}
      >
        <CheckCircle2 style={{ width: '30px', height: '30px', color: '#059669' }} />
      </div>
      <h1
        style={{
          color: '#0F172A',
          fontSize: '26px',
          fontWeight: 800,
          letterSpacing: '-0.8px',
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        Vérifiez votre boîte mail
      </h1>
      <p style={{ color: '#6B7280', fontSize: '15px', lineHeight: 1.65, margin: '14px 0 0 0' }}>
        Un lien sécurisé a été envoyé à
        <br />
        <strong style={{ color: '#0F172A', fontWeight: 700 }}>{email}</strong>.
      </p>
      <p style={{ color: '#9CA3AF', fontSize: '13px', lineHeight: 1.6, margin: '18px 0 0 0' }}>
        Lien valable 24 heures, utilisable une seule fois.
        <br />
        Pensez à vérifier vos spams si vous ne le voyez pas.
      </p>
      <button
        onClick={onRetry}
        style={{
          marginTop: '28px',
          background: 'transparent',
          border: 'none',
          color: '#059669',
          fontSize: '13.5px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Renvoyer un lien
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  État : aucun compte trouvé
// ─────────────────────────────────────────────────────────────────
function NotFoundState({ email, onRetry }) {
  return (
    <div className="text-center">
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 30% 30%, rgba(254,243,199,1) 0%, rgba(253,230,138,0.9) 100%)',
          margin: '0 auto 22px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(245,158,11,0.18)',
        }}
      >
        <UserPlus style={{ width: '28px', height: '28px', color: '#B45309' }} />
      </div>
      <h1
        style={{
          color: '#0F172A',
          fontSize: '26px',
          fontWeight: 800,
          letterSpacing: '-0.8px',
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        Aucun compte trouvé
      </h1>
      <p style={{ color: '#6B7280', fontSize: '15px', lineHeight: 1.65, margin: '14px 0 0 0' }}>
        L'adresse <strong style={{ color: '#0F172A', fontWeight: 700 }}>{email}</strong> ne correspond à aucun compte BoosterPay.
      </p>
      <p style={{ color: '#9CA3AF', fontSize: '13px', lineHeight: 1.6, margin: '14px 0 0 0' }}>
        Vérifiez l'email d'inscription, ou démarrez un essai gratuit dès maintenant.
      </p>

      <Link
        to="/"
        className="bp-connexion-cta"
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          height: '54px',
          marginTop: '28px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: '#FFFFFF',
          fontSize: '15.5px',
          fontWeight: 700,
          letterSpacing: '-0.1px',
          textDecoration: 'none',
          boxShadow: '0 4px 15px rgba(16,185,129,0.3)',
          overflow: 'hidden',
          transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
          fontFamily: 'inherit',
        }}
      >
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />
        <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          Démarrer mon essai 7 jours
          <ArrowRight className="bp-connexion-cta-arrow w-4 h-4" />
        </span>
      </Link>

      <button
        onClick={onRetry}
        style={{
          marginTop: '18px',
          background: 'transparent',
          border: 'none',
          color: '#059669',
          fontSize: '13.5px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Essayer une autre adresse
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Style block — keyframes + states focus/hover hors-Tailwind
// ─────────────────────────────────────────────────────────────────
function StyleBlock() {
  return (
    <style>{`
      @keyframes bpFadeInUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes bpFadeInDown {
        from { opacity: 0; transform: translateY(-10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes bpDot {
        0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); opacity: 1; }
        50%      { box-shadow: 0 0 0 6px rgba(16,185,129,0); opacity: 0.85; }
      }
      @keyframes bpConnexionPulse {
        0%, 100% { opacity: 0.55; transform: scale(1); }
        50%      { opacity: 0.85; transform: scale(1.06); }
      }
      .bp-connexion-input:focus {
        border-color: #10B981 !important;
        box-shadow: 0 0 0 4px rgba(16,185,129,0.1), 0 1px 3px rgba(0,0,0,0.05) !important;
      }
      .bp-connexion-input::placeholder {
        color: #CBD5E1;
      }
      .bp-connexion-cta:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(16,185,129,0.38) !important;
      }
      .bp-connexion-cta:hover:not(:disabled) .bp-connexion-cta-arrow {
        transform: translateX(4px);
      }
      .bp-connexion-cta:active:not(:disabled) {
        transform: scale(0.98);
      }
      .bp-connexion-cta-arrow {
        transition: transform 0.22s cubic-bezier(0.16,1,0.3,1);
      }
    `}</style>
  );
}
