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
import { CheckCircle2, Phone, Clock, CreditCard, Calendar, ExternalLink, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import EspaceLayout from '../components/EspaceLayout';

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
  const [espace, setEspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifyingMagicLink, setVerifyingMagicLink] = useState(false);

  // commercant_id depuis l'URL — peut être remplacé par celui résolu via magic link
  const [commercantId, setCommercantId] = useState(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('id') || '';
  });

  useEffect(() => {
    document.title = 'BoosterPay — Mon espace';
  }, []);

  // ─── Magic link : si l'URL contient ?token=XXX, on le vérifie auprès du backend
  // qui retourne le commercant_id correspondant. Puis on clean l'URL (retire le
  // token) pour éviter qu'il traîne dans l'historique du navigateur.
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
          // Clean URL : retire le token, garde uniquement ?id=BP-XXX
          const cleanUrl = window.location.pathname + '?id=' + encodeURIComponent(data.commercant_id);
          window.history.replaceState({}, '', cleanUrl);
        } else {
          setError(
            data.error === 'expired'
              ? "Ce lien a expiré. Demandez-en un nouveau sur la page de connexion."
              : "Ce lien n'est plus valide. Demandez-en un nouveau sur la page de connexion."
          );
          setLoading(false);
        }
      } catch (err) {
        setError('Vérification impossible. Réessayez ou demandez un nouveau lien.');
        setLoading(false);
      } finally {
        setVerifyingMagicLink(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (verifyingMagicLink) return;
    if (!commercantId) {
      // Si pas de commercant_id et pas en train de vérifier un token, rediriger vers connexion
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
          setError(
            data.error === 'not_found'
              ? "Votre espace n'a pas encore été activé. Si vous venez de finaliser votre paiement, patientez quelques instants puis rechargez."
              : 'Impossible de charger votre espace. Réessayez plus tard.'
          );
        } else {
          setEspace(data.espace);
        }
      } catch (err) {
        console.error('[EspaceAbonne] fetch error:', err);
        setError('Connexion impossible. Vérifiez votre connexion.');
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
      {/* Header carte avec badge IA active */}
      <div className="rounded-3xl bg-white border border-gray-100 p-7 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[12.5px] font-semibold tracking-[0.06em] uppercase text-gray-500 mb-2">Mon espace BoosterPay</div>
            <h1 className="text-[28px] md:text-[32px] font-semibold tracking-[-0.025em] text-gray-900 leading-tight mb-3">
              {espace.nom_commerce || espace.nom || 'Bienvenue'}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-semibold"
                style={{ background: '#F0FDF4', color: '#10B981' }}
              >
                <span className="relative inline-flex w-1.5 h-1.5">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </span>
                IA active · Opérationnelle
              </span>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-${status.color}-50 text-${status.color}-700 border border-${status.color}-200/60 flex-shrink-0`}>
            <StatusIcon className="w-3.5 h-3.5" strokeWidth={2.4} />
            {status.label}
          </span>
        </div>
      </div>

      {/* ── CARD RÉCAP VALEUR — 3 stats ── (remplace la répétition du numéro) */}
      <RecapStats espace={espace} isTrial={isTrial} />

      {/* Abonnement */}
      <div className="rounded-3xl bg-white border border-gray-100 p-7 md:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center">
            <CreditCard className="w-4.5 h-4.5 text-gray-700" strokeWidth={2.2} />
          </div>
          <h2 className="text-[17px] font-semibold text-gray-900 tracking-tight">Mon abonnement</h2>
        </div>

        <dl className="grid sm:grid-cols-2 gap-4">
          <Stat label="Tarif mensuel" value={`${espace.mrr_eur} € HT/mois`} />
          {isTrial && (
            <Stat label="Fin de l'essai" value={formatDateFR(espace.trial_ends_at)} icon={Clock} />
          )}
          {!isTrial && espace.next_billing_at && (
            <Stat label="Prochaine facture" value={formatDateFR(espace.next_billing_at)} icon={Calendar} />
          )}
        </dl>

        {isTrial && (
          <ul className="mt-5 space-y-2.5">
            <li className="flex items-start gap-2.5 text-[13.5px] text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" strokeWidth={2.4} />
              <span>Essai gratuit jusqu'au <strong>{formatDateFR(espace.trial_ends_at)}</strong></span>
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
            <a
              href={STRIPE_CUSTOMER_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[10px] font-semibold text-[15px] transition-all duration-200"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #10B981',
                color: '#10B981',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F0FDF4';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Gérer mon paiement
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={2.4} />
            </a>
            {isTrial && (
              <a
                href={STRIPE_CUSTOMER_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg text-[13px] font-medium transition-all"
                style={{
                  background: 'transparent',
                  border: '1px solid #E5E7EB',
                  color: '#9CA3AF',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#EF4444';
                  e.currentTarget.style.color = '#EF4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.color = '#9CA3AF';
                }}
              >
                Annuler mon essai
              </a>
            )}
          </div>
        )}
      </div>

      {/* Support */}
      <div className="rounded-3xl bg-gray-50 border border-gray-100 p-6 text-center">
        <p className="text-[13.5px] text-gray-600 leading-relaxed">
          Une question ? Écrivez à <a href="mailto:contact@booster-pay.com" className="font-semibold text-gray-900 underline">contact@booster-pay.com</a> — réponse sous 2h ouvrées.
        </p>
        <p className="text-[11.5px] text-gray-400 mt-2">ID : {commercantId}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  RecapStats — card 3 colonnes : Jours restants / Tarif / Premier débit
//  Remplace la répétition de la card numéro (déjà visible sur Bienvenue)
// ─────────────────────────────────────────────────────────────────
function RecapStats({ espace, isTrial }) {
  // Jours restants jusqu'à trial_ends_at (ou next_billing_at si actif)
  const targetDate = isTrial ? espace.trial_ends_at : espace.next_billing_at;
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
      className="rounded-3xl p-6 md:p-7"
      style={{
        background: '#F0FDF4',
        border: '1px solid rgba(16, 185, 129, 0.2)',
      }}
    >
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-[24px] md:text-[28px] font-extrabold tracking-[-0.02em]" style={{ color: '#10B981' }}>
            {daysLeft !== null ? daysLeft : '—'}
          </p>
          <p className="text-[12px] text-gray-600 mt-0.5 font-medium">Jours restants</p>
        </div>
        <div>
          <p className="text-[24px] md:text-[28px] font-extrabold text-gray-900 tracking-[-0.02em]">
            {espace.mrr_eur}€
          </p>
          <p className="text-[12px] text-gray-600 mt-0.5 font-medium">HT / mois</p>
        </div>
        <div>
          <p className="text-[24px] md:text-[28px] font-extrabold text-gray-900 tracking-[-0.02em]">
            {debitDate}
          </p>
          <p className="text-[12px] text-gray-600 mt-0.5 font-medium">
            {isTrial ? 'Premier débit' : 'Prochaine facture'}
          </p>
        </div>
      </div>

      {/* Barre de progression de l'essai */}
      {isTrial && daysLeft !== null && (
        <div className="mt-5">
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ background: 'rgba(16, 185, 129, 0.15)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #10B981, #059669)',
              }}
            />
          </div>
          <p className="text-[11.5px] text-center mt-2 font-medium" style={{ color: '#6B7280' }}>
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
      <dt className="text-[12px] font-medium text-gray-500 mb-1">{label}</dt>
      <dd className="text-[15.5px] font-semibold text-gray-900 inline-flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" strokeWidth={2.4} />}
        {value}
      </dd>
    </div>
  );
}
