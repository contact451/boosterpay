// ─────────────────────────────────────────────────────────────────
//  /configurer?id=BP-XXXXX — Espace abonné post-paiement
//
//  Page minimaliste style Apple qui affiche :
//   - Numéro Telnyx local attribué
//   - Statut abonnement (trial / actif / impayé)
//   - Date de fin de trial / prochaine facture
//   - Bouton "Annuler mon abonnement" → Stripe Customer Portal
//
//  L'authentification est faite via le commercant_id en query string
//  (URL difficile à deviner : BP- + 11 chars base36 aléatoires).
// ─────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Phone, Clock, CreditCard, Calendar, ExternalLink, AlertCircle, Sparkles, ArrowRight, Mail } from 'lucide-react';
import EspaceLayout from '../components/EspaceLayout';
import { getCachedAbonne, setCachedAbonne, mergeWithCache } from '../services/abonneCache';

// URL du Web App Apps Script "BoosterPay Vonage CRM" (à mettre en env var si différent)
const APPS_SCRIPT_URL = import.meta.env.VITE_VONAGE_CRM_APPS_SCRIPT_URL
  || 'https://script.google.com/macros/s/AKfycbzVONAGECRMxxx/exec';

const STRIPE_CUSTOMER_PORTAL_URL = import.meta.env.VITE_STRIPE_CUSTOMER_PORTAL_URL
  || 'https://billing.stripe.com/p/login/REPLACE_ME';

function formatPhoneFR(e164) {
  if (!e164) return '';
  // +33189316813 → +33 1 89 31 68 13
  const m = String(e164).match(/^\+33(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (m) return `+33 ${m[1]} ${m[2]} ${m[3]} ${m[4]} ${m[5]}`;
  return e164;
}

// Date de fin d'essai effective : trial_ends_at de Stripe si dispo,
// sinon fallback calculé sur provisioned_at + 7 jours (cas test/legacy).
function effectiveTrialEnd(espace) {
  if (!espace) return null;
  if (espace.trial_ends_at) return espace.trial_ends_at;
  if (espace.provisioned_at) {
    try {
      const d = new Date(espace.provisioned_at);
      d.setDate(d.getDate() + 7);
      return d.toISOString();
    } catch { return null; }
  }
  return null;
}

function formatDateFR(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

function statusLabel(status) {
  switch (status) {
    case 'trialing': return { label: 'Essai en cours', color: 'emerald', icon: Sparkles };
    case 'active': return { label: 'Abonnement actif', color: 'emerald', icon: CheckCircle2 };
    case 'cancelling_at_period_end': return { label: 'Résiliation à fin de période', color: 'amber', icon: Clock };
    case 'cancelled': return { label: 'Résilié', color: 'gray', icon: AlertCircle };
    case 'payment_failed': return { label: 'Paiement en attente', color: 'red', icon: AlertCircle };
    default: return { label: status || 'En cours', color: 'gray', icon: Clock };
  }
}

export default function EspaceAbonne() {
  const navigate = useNavigate();

  // commercant_id depuis l'URL — peut être remplacé par celui résolu via magic link
  const [commercantId, setCommercantId] = useState(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('id') || '';
  });

  // ── Init espace depuis le cache localStorage (affichage IMMEDIAT, pas de skeleton flash) ──
  const [espace, setEspace] = useState(() => {
    const initialId = (typeof window !== 'undefined')
      ? new URLSearchParams(window.location.search).get('id') || ''
      : '';
    return getCachedAbonne(initialId);
  });
  const [loading, setLoading] = useState(!espace); // skip loader si on a déjà du cache
  const [error, setError] = useState('');
  const [verifyingMagicLink, setVerifyingMagicLink] = useState(false);

  useEffect(() => {
    document.title = 'BoosterPay — Mon espace';
  }, []);

  // ─── Compat ancien magic link : si l'URL contient encore ?token=XXX
  // (lien envoyé avant le changement vers les liens permanents), on tente
  // de le résoudre puis on clean l'URL. Sinon on continue normalement.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) return;

    setVerifyingMagicLink(true);
    (async () => {
      try {
        const res = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'verifyMagicLink', token }),
        });
        const data = await res.json();
        if (data.ok && data.commercant_id) {
          setCommercantId(data.commercant_id);
          const cleanUrl = window.location.pathname + '?id=' + encodeURIComponent(data.commercant_id);
          window.history.replaceState({}, '', cleanUrl);
        }
      } catch (err) {
        // Silencieux — on tombe sur la logique commercant_id classique
      } finally {
        setVerifyingMagicLink(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (verifyingMagicLink) return;
    if (!commercantId) {
      // Pas d'identifiant et pas de token : on renvoie vers connexion
      const params = new URLSearchParams(window.location.search);
      if (!params.get('token')) {
        navigate('/connexion', { replace: true });
      }
      return;
    }

    // ─── MODE DÉMO ───
    // Si le commercant_id contient TEST ou DEMO, on injecte un espace mocké
    // pour permettre de valider le rendu sans toucher au sheet Apps Script.
    const isDemoMode = /TEST|DEMO/i.test(commercantId);
    if (isDemoMode) {
      const now = new Date();
      const trialEnds = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // J+7
      const demoEspace = {
        commercant_id: commercantId,
        nom: 'Marc Dupont',
        nom_commerce: 'Garage Dupont',
        email: 'demo@booster-pay.com',
        mobile: '+33612345678',
        code_postal: '69003',
        numero_virtuel: '+33489316691',
        subscription_status: 'trialing',
        mrr_eur: 99,
        trial_ends_at: trialEnds.toISOString(),
        next_billing_at: trialEnds.toISOString(),
        created_at: now.toISOString(),
      };
      // Petit délai pour simuler le chargement (style production)
      const t = setTimeout(() => {
        setEspace(demoEspace);
        setLoading(false);
      }, 350);
      return () => clearTimeout(t);
    }

    (async () => {
      try {
        const res = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          // Apps Script Web Apps : pas de header CORS strict, mais éviter les content-type custom
          // qui déclenchent preflight (Google bloque OPTIONS).
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'getEspaceAbonne', commercant_id: commercantId }),
        });
        const data = await res.json();
        if (!data.ok) {
          // Si on a déjà des données en cache, on garde l'affichage et on
          // n'affiche pas d'erreur bloquante (on continue avec ce qu'on a).
          const cached = getCachedAbonne(commercantId);
          if (!cached) {
            setError(
              data.error === 'not_found'
                ? "Votre espace n'a pas encore été activé. Si vous venez de finaliser votre paiement, patientez quelques instants puis rechargez."
                : 'Impossible de charger votre espace. Réessayez plus tard.'
            );
          }
        } else {
          // Merge fresh + cache pour préserver les champs en transition
          const merged = mergeWithCache(commercantId, data.espace);
          setCachedAbonne(commercantId, merged);
          setEspace(merged);
        }
      } catch (err) {
        console.error('[EspaceAbonne] fetch error:', err);
        // Si on a du cache, l'affichage continue sans erreur visible
        const cached = getCachedAbonne(commercantId);
        if (!cached) setError('Connexion impossible. Vérifiez votre connexion.');
      } finally {
        setLoading(false);
      }
    })();
  }, [commercantId, verifyingMagicLink]);

  // Récupère nom_commerce dès qu'il est disponible (pour la sidebar)
  const nomCommerce = espace?.nom_commerce || '';

  return (
    <EspaceLayout
      nomCommerce={nomCommerce}
      commercantId={commercantId}
      activeSection="abonnement"
    >
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
        <main className="max-w-3xl mx-auto px-6 py-10 md:py-14">
          {loading && <LoadingState />}
          {!loading && error && <ErrorState message={error} />}
          {!loading && !error && espace && <EspaceContent espace={espace} commercantId={commercantId} />}
        </main>
      </div>
    </EspaceLayout>
  );
}

// ─────────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <svg className="w-7 h-7 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
function ErrorState({ message }) {
  return (
    <div className="rounded-3xl bg-white border border-gray-100 p-8 text-center">
      <div className="inline-flex w-12 h-12 rounded-full bg-amber-50 items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-amber-600" strokeWidth={2} />
      </div>
      <h1 className="text-[20px] font-semibold text-gray-900 mb-2">Espace introuvable</h1>
      <p className="text-[14px] text-gray-500 max-w-md mx-auto">{message}</p>
      <a href="/" className="inline-flex items-center gap-1.5 mt-6 text-[13.5px] font-semibold text-emerald-700 hover:text-emerald-800">
        Retour à l'accueil <ArrowRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
function EspaceContent({ espace, commercantId }) {
  const status = statusLabel(espace.subscription_status);
  const StatusIcon = status.icon;
  const isTrial = espace.subscription_status === 'trialing';
  const isCancelling = espace.subscription_status === 'cancelling_at_period_end';
  const isCancelled = espace.subscription_status === 'cancelled';

  return (
    <div className="space-y-6">
      <SkeletonStyles />
      {/* Header — breadcrumb cohérent avec Modules + titre direct + badge IA */}
      <div className="rounded-3xl bg-white border border-gray-100 p-7 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11.5px] font-bold tracking-[0.12em] uppercase mb-2" style={{ color: '#047857' }}>
              Mon espace · Abonnement
            </p>
            <h1 className="text-[28px] md:text-[34px] font-extrabold tracking-[-0.025em] text-gray-900 leading-tight mb-3">
              {espace.nom_commerce || espace.nom || 'Bienvenue'}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[14px] font-bold"
                style={{
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: '#FFFFFF',
                  boxShadow: '0 6px 16px rgba(16,185,129,0.30), 0 2px 4px rgba(0,0,0,0.05)',
                }}
              >
                <span className="relative inline-flex w-2 h-2">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-white opacity-60 animate-ping" />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-white" />
                </span>
                IA active · {isTrial ? 'Essai en cours' : (isCancelling ? 'Résiliation programmée' : 'Opérationnelle')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD RÉCAP VALEUR — 3 stats ── (remplace la répétition du numéro) */}
      <RecapStats espace={espace} isTrial={isTrial} />

      {/* Abonnement */}
      <div className="rounded-3xl bg-white border border-gray-100 p-7 md:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #10B981, #059669)',
              boxShadow: '0 6px 14px rgba(16,185,129,0.30)',
            }}
          >
            <CreditCard className="w-[18px] h-[18px] text-white" strokeWidth={2.4} />
          </div>
          <h2 className="text-[17px] font-semibold text-gray-900 tracking-tight">Mon abonnement</h2>
        </div>

        {/* Calcul date fin essai effective (fallback provisioned_at + 7 jours) */}
        {(() => null)()}
        <dl className="grid sm:grid-cols-2 gap-4">
          <Stat label="Tarif mensuel" value={`${espace.mrr_eur} € HT/mois`} />
          {isTrial && (
            <Stat
              label="Fin de l'essai"
              value={formatDateFR(effectiveTrialEnd(espace)) || 'Bientôt confirmée'}
              icon={Clock}
            />
          )}
          {!isTrial && espace.next_billing_at && (
            <Stat label="Prochaine facture" value={formatDateFR(espace.next_billing_at)} icon={Calendar} />
          )}
        </dl>

        {isTrial && (
          <ul className="mt-5 space-y-2.5">
            <li className="flex items-start gap-2.5 text-[13.5px] text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" strokeWidth={2.4} />
              <span>
                {effectiveTrialEnd(espace)
                  ? <>Essai gratuit jusqu'au <strong>{formatDateFR(effectiveTrialEnd(espace))}</strong></>
                  : <>Essai gratuit · <strong>7 jours</strong></>}
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-[13.5px] text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" strokeWidth={2.4} />
              <span><strong>0 €</strong> prélevé avant cette date</span>
            </li>
            <li className="flex items-start gap-2.5 text-[13.5px] text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" strokeWidth={2.4} />
              <span>Annulation possible à tout moment, en 1 clic</span>
            </li>
          </ul>
        )}

        {isCancelling && (
          <div className="mt-5 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-[13px] text-amber-900 leading-relaxed">
            Votre abonnement est en cours de résiliation. Vous gardez l'accès jusqu'au {formatDateFR(espace.next_billing_at)}.
          </div>
        )}

        {isCancelled && (
          <div className="mt-5 rounded-2xl bg-gray-50 border border-gray-200 p-4 text-[13px] text-gray-700 leading-relaxed">
            Votre abonnement est résilié. Votre numéro a été libéré. Vous pouvez reprendre quand vous voulez.
          </div>
        )}

        {!isCancelled && (
          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center">
            {/* CTA principal — vert plein, premium */}
            <a
              href={STRIPE_CUSTOMER_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[12px] font-bold text-[15px] transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#FFFFFF',
                boxShadow: '0 8px 20px rgba(16,185,129,0.40), 0 2px 6px rgba(0,0,0,0.06)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(16,185,129,0.50), 0 2px 6px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(16,185,129,0.40), 0 2px 6px rgba(0,0,0,0.06)';
              }}
            >
              Gérer mon paiement
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={2.6} />
            </a>
            {/* Action destructive — discrète Apple-style ; rouge au hover pour signal destructif */}
            {isTrial && (
              <a
                href={STRIPE_CUSTOMER_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-3 py-2.5 text-[12px] font-medium transition-colors no-underline"
                style={{ color: '#B0B5BD', background: 'transparent', textDecoration: 'none' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#DC2626'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#B0B5BD'; }}
              >
                Annuler mon essai
              </a>
            )}
          </div>
        )}
      </div>

      {/* Support + ID client discret */}
      <div
        className="rounded-3xl p-6 text-center"
        style={{
          background: '#F8FAFC',
          border: '1px solid #E5E7EB',
        }}
      >
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #10B981, #059669)',
              boxShadow: '0 4px 12px rgba(16,185,129,0.30)',
            }}
          >
            <Mail className="w-4 h-4 text-white" strokeWidth={2.4} />
          </div>
        </div>
        <p className="text-[13.5px] text-gray-600 leading-relaxed">
          Une question ? Écrivez à{' '}
          <a href="mailto:contact@booster-pay.com" className="font-semibold text-gray-900 underline">
            contact@booster-pay.com
          </a>
          <br />
          <span className="text-[12px] text-gray-500">Réponse sous 2 h ouvrées.</span>
        </p>
        <ClientIdLine commercantId={commercantId} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SkeletonStyles — keyframes shimmer global (utilisé par les skel)
// ─────────────────────────────────────────────────────────────────
function SkeletonStyles() {
  return (
    <style>{`
      @keyframes bpShimmerStats {
        0%   { background-position: -200px 0; }
        100% { background-position: 200px 0; }
      }
      .bp-stat-skel {
        background: linear-gradient(
          90deg,
          rgba(16,185,129,0.08) 0%,
          rgba(16,185,129,0.20) 50%,
          rgba(16,185,129,0.08) 100%
        );
        background-size: 400px 100%;
        animation: bpShimmerStats 1.6s linear infinite;
        border-radius: 8px;
      }
    `}</style>
  );
}

function StatSkeleton({ width = 80, height = 32 }) {
  return (
    <span
      className="bp-stat-skel inline-block"
      style={{ width: `${width}px`, height: `${height}px`, borderRadius: '8px' }}
      aria-hidden
    />
  );
}

// ─────────────────────────────────────────────────────────────────
// ID client — ligne discrète avec icône copier
// ─────────────────────────────────────────────────────────────────
function ClientIdLine({ commercantId }) {
  const [copied, setCopied] = useState(false);
  if (!commercantId) return null;
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(commercantId);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch (_e) {}
      }}
      className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-md text-[10.5px] font-medium text-gray-400 hover:text-gray-600 hover:bg-white transition-colors"
      style={{ fontFeatureSettings: '"tnum"', letterSpacing: '0.02em' }}
    >
      ID client · <span className="font-mono">{commercantId}</span>
      {copied ? (
        <CheckCircle2 className="w-3 h-3 text-emerald-500" strokeWidth={2.6} />
      ) : (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
//  RecapStats — card 3 colonnes : Jours restants / Tarif / Premier débit
//  Remplace la répétition de la card numéro (déjà visible sur Bienvenue)
// ─────────────────────────────────────────────────────────────────
function RecapStats({ espace, isTrial }) {
  // Cible : date de fin d'essai si trial, sinon prochaine facture
  // Fallback : si trial_ends_at vide (cas test/compte legacy) ET provisioned_at présent,
  // on calcule provisioned_at + 7 jours (durée standard d'essai BoosterPay).
  const targetDate = (() => {
    if (isTrial) {
      if (espace.trial_ends_at) return espace.trial_ends_at;
      if (espace.provisioned_at) {
        try {
          const d = new Date(espace.provisioned_at);
          d.setDate(d.getDate() + 7);
          return d.toISOString();
        } catch { return null; }
      }
      return null;
    }
    return espace.next_billing_at || null;
  })();
  const daysLeft = (() => {
    if (!targetDate) return null;
    const ms = new Date(targetDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  })();
  const debitDate = (() => {
    if (!targetDate) return '—';
    try {
      return new Date(targetDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    } catch { return '—'; }
  })();

  // Progression de l'essai : combien de jours déjà écoulés / 7 (en %)
  const totalDays = isTrial ? 7 : 30;
  const daysUsed = daysLeft !== null ? Math.max(0, totalDays - daysLeft) : 0;
  const progressPct = Math.min(100, Math.round((daysUsed / totalDays) * 100));

  return (
    <div
      className="rounded-3xl p-6 md:p-8 relative overflow-hidden"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 8px 24px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.03)',
      }}
    >
      {/* Glow décoratif emerald subtle (juste pour signature) */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 w-[260px] h-[260px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
          transform: 'translate(40%, -40%)',
        }}
      />

      <div className="relative grid grid-cols-3 gap-4 text-center">
        {/* Jours restants */}
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: '#374151' }}>
            Jours restants
          </p>
          {daysLeft !== null ? (
            <p
              className="font-extrabold leading-none tracking-[-0.03em]"
              style={{
                color: '#059669',
                fontSize: 'clamp(28px, 4.5vw, 38px)',
                fontFeatureSettings: '"tnum"',
              }}
            >
              {daysLeft}
            </p>
          ) : (
            <StatSkeleton width={64} height={38} />
          )}
        </div>
        {/* Tarif */}
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: '#374151' }}>
            HT / mois
          </p>
          {espace.mrr_eur != null ? (
            <p
              className="font-extrabold leading-none tracking-[-0.03em] text-gray-900"
              style={{
                fontSize: 'clamp(28px, 4.5vw, 38px)',
                fontFeatureSettings: '"tnum"',
              }}
            >
              {espace.mrr_eur}€
            </p>
          ) : (
            <StatSkeleton width={88} height={38} />
          )}
        </div>
        {/* Débit */}
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: '#374151' }}>
            {isTrial ? 'Premier débit' : 'Prochaine facture'}
          </p>
          {targetDate ? (
            <p
              className="font-extrabold leading-none tracking-[-0.03em] text-gray-900"
              style={{
                fontSize: 'clamp(28px, 4.5vw, 38px)',
                fontFeatureSettings: '"tnum"',
              }}
            >
              {debitDate}
            </p>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <StatSkeleton width={84} height={28} />
              <span className="text-[10.5px] font-medium text-gray-500">En cours de configuration</span>
            </div>
          )}
        </div>
      </div>

      {/* Barre de progression de l'essai — contraste fort gris/emerald */}
      {isTrial && daysLeft !== null && (
        <div className="mt-5">
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: '#E5E7EB' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #10B981, #059669)',
                boxShadow: '0 0 8px rgba(16,185,129,0.4)',
              }}
            />
          </div>
          <p className="text-[12px] text-center mt-2.5 font-semibold" style={{ color: '#047857' }}>
            Jour {daysUsed + 1} sur {totalDays}
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div>
      <dt className="text-[12px] font-semibold mb-1" style={{ color: '#6B7280' }}>{label}</dt>
      <dd className="text-[15.5px] font-semibold text-gray-900 inline-flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2.4} style={{ color: '#10B981' }} />}
        {value}
      </dd>
    </div>
  );
}
