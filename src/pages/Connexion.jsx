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

import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Loader2, UserPlus, Shield, Clock, Lock, KeyRound, Mail } from 'lucide-react';
import { rememberLastCommercantId, getLastCommercantId, getLastCommercantIdAsync } from '../services/abonneCache';

function getVonageCrmApiUrl() {
  return import.meta.env.VITE_VONAGE_CRM_APPS_SCRIPT_URL || '';
}

export default function Connexion() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  // idle | loading | sent | verifying | not_found | error
  // (sent = email envoyé, on attend que l'utilisateur saisisse le code 6 chiffres)
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [code, setCode] = useState(''); // code 6 chiffres
  const [codeError, setCodeError] = useState('');

  // ── Auto-login : si on a déjà un commercant_id mémorisé (cache local
  //    écrit lors d'une session précédente), on redirige direct vers
  //    l'espace user sans demander de re-login. La page Connexion n'est
  //    visible que pour la PREMIÈRE ouverture de la PWA.
  useEffect(() => {
    // Lookup sync instantané
    const syncId = getLastCommercantId();
    if (syncId) {
      navigate(`/espace/appels?id=${encodeURIComponent(syncId)}`, { replace: true });
      return;
    }
    // Fallback async (IndexedDB)
    let cancelled = false;
    getLastCommercantIdAsync().then((id) => {
      if (cancelled) return;
      if (id) {
        navigate(`/espace/appels?id=${encodeURIComponent(id)}`, { replace: true });
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [navigate]);

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
        // Affichage brut du JSON retourné pour faciliter le debug
        const debugInfo = JSON.stringify(json, null, 2);
        if (json.error === 'email_send_failed') {
          setError("L'envoi de l'email a échoué côté serveur.\n\nDétail backend :\n" + debugInfo);
        } else if (json.error === 'unknown_action') {
          setError('Service de connexion indisponible (config Apps Script à mettre à jour).\n\nDétail backend :\n' + debugInfo);
        } else if (json.error === 'email_required') {
          setError('Veuillez saisir un email.');
        } else {
          setError('Erreur : ' + (json.error || 'inconnue') + '\n\nDétail backend :\n' + debugInfo);
        }
      }
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Connexion impossible.');
    }
  };

  // ── Vérification du code 6 chiffres ──
  const handleVerifyCode = async (codeToTry) => {
    const trimmedCode = String(codeToTry || code).replace(/\D/g, '').slice(0, 6);
    if (trimmedCode.length !== 6) {
      setCodeError('Le code doit contenir 6 chiffres.');
      return;
    }
    setCodeError('');
    setStatus('verifying');
    try {
      const apiUrl = getVonageCrmApiUrl();
      const res = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({
          action: 'verifyLoginCode',
          email: email.trim().toLowerCase(),
          code: trimmedCode,
        }),
      });
      const json = await res.json();
      if (json.ok && json.commercant_id) {
        rememberLastCommercantId(json.commercant_id);
        // Navigation : on emmène l'utilisateur direct sur Mes appels
        navigate(`/espace/appels?id=${encodeURIComponent(json.commercant_id)}`, { replace: true });
        return;
      }
      // Échec : on remet en mode 'sent' pour retry sans demander l'email
      setStatus('sent');
      if (json.error === 'invalid_code') setCodeError('Code incorrect.');
      else if (json.error === 'expired') setCodeError('Code expiré. Cliquez sur "Renvoyer un code".');
      else if (json.error === 'code_invalid_format') setCodeError('Le code doit contenir 6 chiffres.');
      else if (json.error === 'no_code_pending') setCodeError('Aucun code en attente. Renvoyez-en un.');
      else setCodeError('Code refusé. Réessayez ou renvoyez un code.');
    } catch (err) {
      setStatus('sent');
      setCodeError(err.message || 'Vérification impossible.');
    }
  };

  const resetToEmail = () => {
    setStatus('idle');
    setEmail('');
    setCode('');
    setCodeError('');
    setError('');
  };

  // Force le body/html en blanc pur pendant qu'on est sur cette page
  // (évite le fond gris hérité du reste du site)
  useEffect(() => {
    const prevBodyBg = document.body.style.background;
    const prevHtmlBg = document.documentElement.style.background;
    document.body.style.background = '#ffffff';
    document.documentElement.style.background = '#ffffff';
    return () => {
      document.body.style.background = prevBodyBg;
      document.documentElement.style.background = prevHtmlBg;
    };
  }, []);

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-5 py-16 overflow-hidden"
      style={{
        background: '#ffffff',
        fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <StyleBlock />

      {/* Calque gradient emerald-50/60 → white, par-dessus le blanc pur */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(236,253,245,0.6) 0%, #FFFFFF 65%)',
          zIndex: 0,
        }}
      />

      {/* Glows radiaux animés */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-[-180px] right-[-160px] w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(209,250,229,0.4) 0%, transparent 70%)',
          animation: 'bpConnexionPulse 9s ease-in-out infinite',
          zIndex: 0,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-[-120px] left-[-100px] w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(204,251,241,0.3) 0%, transparent 70%)',
          animation: 'bpConnexionPulse 7s ease-in-out 1.2s infinite',
          zIndex: 0,
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
            <NotFoundState email={email} onRetry={resetToEmail} />
          ) : (status === 'sent' || status === 'verifying') ? (
            <CodeState
              email={email}
              code={code}
              setCode={setCode}
              codeError={codeError}
              verifying={status === 'verifying'}
              onVerify={handleVerifyCode}
              onChangeEmail={resetToEmail}
              onResend={() => { setCode(''); setCodeError(''); handleSubmit({ preventDefault: () => {} }); }}
            />
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
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            color: '#059669',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            padding: '6px 13px',
            borderRadius: '999px',
            margin: '0 auto',
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
          margin: '14px auto 0 auto',
          maxWidth: '320px',
        }}
      >
        Recevez un lien magique dans votre boîte mail. Connexion instantanée, sans mot de passe.
      </p>

      {/* Séparateur gradient — entre sous-titre et label */}
      <div
        style={{
          height: '1px',
          background:
            'linear-gradient(to right, transparent, rgba(16,185,129,0.15), transparent)',
          margin: '28px 0',
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
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'inherit',
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
            color: '#ffffff',
            fontSize: '15.5px',
            fontWeight: 700,
            letterSpacing: '-0.1px',
            cursor: status === 'loading' || !email ? 'not-allowed' : 'pointer',
            opacity: status === 'loading' || !email ? 0.7 : 1,
            boxShadow: '0 4px 15px rgba(16,185,129,0.3)',
            overflow: 'hidden',
            transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
            fontFamily: 'inherit',
          }}
        >
          <span
            className="bp-connexion-cta-content"
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: '#ffffff',
              fontWeight: 700,
            }}
          >
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
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '12px 14px',
            rowGap: '10px',
          }}
        >
          <TrustItem Icon={Shield} label="Lien unique" />
          <Dot />
          <TrustItem Icon={Clock} label="Valable 24h" />
          <Dot />
          <TrustItem Icon={Lock} label="Zéro mot de passe" />
        </div>
      </div>
    </>
  );
}

function TrustItem({ Icon, label }) {
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
      <Icon
        width={12}
        height={12}
        stroke="#10B981"
        strokeWidth={2.2}
        style={{ display: 'block' }}
      />
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
//  CodeState — email envoyé, saisie du code 6 chiffres (Apple-style)
//
//  Utilise un seul <input> caché qui contient tout le code + 6 cases
//  visuelles. Permet : autoFill iOS (one-time-code), copier-coller,
//  flux clavier natif sur mobile (1 seul focus, pas de jonglerie).
//  Auto-soumission dès que les 6 chiffres sont saisis.
// ─────────────────────────────────────────────────────────────────
function CodeState({ email, code, setCode, codeError, verifying, onVerify, onChangeEmail, onResend }) {
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus auto pour ouvrir le clavier immédiatement
    const t = setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 250);
    return () => clearTimeout(t);
  }, []);

  // Auto-submit dès qu'on a 6 chiffres
  useEffect(() => {
    const clean = String(code).replace(/\D/g, '');
    if (clean.length === 6 && !verifying) {
      onVerify(clean);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const handleChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(v);
  };

  const digits = String(code).padEnd(6, ' ').split('').slice(0, 6);

  return (
    <div className="text-center">
      {/* Icône email */}
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
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(16,185,129,0.18)',
        }}
      >
        <Mail style={{ width: '28px', height: '28px', color: '#059669' }} strokeWidth={2.2} />
      </div>

      {/* Titre */}
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
        Saisissez votre code
      </h1>
      <p style={{ color: '#6B7280', fontSize: '14.5px', lineHeight: 1.55, margin: '12px 0 0 0' }}>
        Code à 6 chiffres envoyé à
        <br />
        <strong style={{ color: '#0F172A', fontWeight: 700 }}>{email}</strong>
      </p>

      {/* Cases visuelles + input caché */}
      <div style={{ position: 'relative', margin: '28px 0 8px 0' }}>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={6}
          value={code}
          onChange={handleChange}
          aria-label="Code de connexion à 6 chiffres"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            border: 'none',
            outline: 'none',
            padding: 0,
            background: 'transparent',
            color: 'transparent',
            caretColor: 'transparent',
            fontSize: '16px',
            cursor: 'text',
            zIndex: 2,
          }}
        />
        <div
          style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          {digits.map((d, i) => {
            const filled = d.trim() !== '';
            const isActive = i === String(code).length && !verifying;
            return (
              <div
                key={i}
                style={{
                  width: '46px',
                  height: '56px',
                  borderRadius: '12px',
                  background: '#F9FAFB',
                  border: `1.5px solid ${isActive ? '#10B981' : (filled ? 'rgba(16,185,129,0.30)' : '#E5E7EB')}`,
                  boxShadow: isActive
                    ? '0 0 0 4px rgba(16,185,129,0.12), 0 1px 2px rgba(0,0,0,0.04) inset'
                    : (filled ? '0 1px 2px rgba(16,185,129,0.08) inset' : '0 1px 2px rgba(0,0,0,0.03) inset'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#0F172A',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  letterSpacing: 0,
                  transition: 'all 200ms ease',
                }}
              >
                {filled ? d : ''}
              </div>
            );
          })}
        </div>
      </div>

      {codeError ? (
        <p style={{ color: '#DC2626', fontSize: '13px', margin: '14px 0 0 0', fontWeight: 600 }}>
          {codeError}
        </p>
      ) : (
        <p style={{ color: '#9CA3AF', fontSize: '12.5px', margin: '14px 0 0 0' }}>
          Le code expire dans 10 minutes.
        </p>
      )}

      {/* Spinner pendant la vérification */}
      {verifying && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
          <Loader2 style={{ width: '14px', height: '14px', color: '#10B981', animation: 'bp-spin 0.9s linear infinite' }} />
          <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 600 }}>Connexion en cours…</span>
        </div>
      )}

      {/* Actions secondaires */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '26px' }}>
        <button
          onClick={onResend}
          disabled={verifying}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#059669',
            fontSize: '13.5px',
            fontWeight: 600,
            cursor: verifying ? 'default' : 'pointer',
            opacity: verifying ? 0.4 : 1,
            fontFamily: 'inherit',
            padding: 0,
          }}
        >
          Renvoyer un code
        </button>
        <span style={{ color: '#E5E7EB' }}>·</span>
        <button
          onClick={onChangeEmail}
          disabled={verifying}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#6B7280',
            fontSize: '13.5px',
            fontWeight: 600,
            cursor: verifying ? 'default' : 'pointer',
            opacity: verifying ? 0.4 : 1,
            fontFamily: 'inherit',
            padding: 0,
          }}
        >
          Changer d'email
        </button>
      </div>

      <style>{`
        @keyframes bp-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
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
