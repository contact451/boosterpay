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

  const commercantId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('id') || '';
  }, []);

  useEffect(() => {
    document.title = 'BoosterPay — Mon espace';
  }, []);

  useEffect(() => {
    if (!commercantId) {
      setError("Identifiant manquant. Utilisez le lien reçu par email.");
      setLoading(false);
      return;
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
  }, [commercantId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="text-gray-900 font-semibold text-[15px] tracking-tight">
            BoosterPay
          </button>
          <div className="text-[12.5px] text-gray-500">Mon espace</div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 md:py-14">
        {loading && <LoadingState />}

        {!loading && error && <ErrorState message={error} />}

        {!loading && !error && espace && <EspaceContent espace={espace} commercantId={commercantId} />}
      </main>
    </div>
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
      {/* Header carte */}
      <div className="rounded-3xl bg-white border border-gray-100 p-7 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <div className="text-[12.5px] font-semibold tracking-[0.06em] uppercase text-gray-500 mb-2">Mon espace BoosterPay</div>
            <h1 className="text-[28px] md:text-[32px] font-semibold tracking-[-0.025em] text-gray-900 leading-tight">
              {espace.nom_commerce || espace.nom || 'Bienvenue'}
            </h1>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-${status.color}-50 text-${status.color}-700 border border-${status.color}-200/60`}>
            <StatusIcon className="w-3.5 h-3.5" strokeWidth={2.4} />
            {status.label}
          </span>
        </div>
      </div>

      {/* Numéro Telnyx attribué */}
      <div className="rounded-3xl bg-gradient-to-b from-emerald-50/40 to-white border border-emerald-200/60 p-7 md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <Phone className="w-5 h-5 text-emerald-700" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold text-emerald-700 tracking-[0.04em] uppercase mb-1">Votre numéro BoosterPay</div>
            {espace.numero_virtuel ? (
              <>
                <div className="text-[28px] md:text-[32px] font-semibold tracking-tight text-gray-900 mb-1">
                  {formatPhoneFR(espace.numero_virtuel)}
                </div>
                <div className="text-[13px] text-gray-500 leading-relaxed">
                  Configurez le renvoi d'appel sur votre mobile vers ce numéro. L'IA décroche à votre place après{' '}
                  <span className="font-semibold text-gray-700">10 secondes sans réponse</span>.
                </div>
              </>
            ) : (
              <div className="text-[14px] text-amber-700 bg-amber-50 border border-amber-200/60 rounded-xl p-3.5">
                Activation en cours… votre numéro local sera disponible dans quelques minutes. Vous le recevrez aussi par email.
              </div>
            )}
          </div>
        </div>
      </div>

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
          <div className="mt-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 p-4 text-[13px] text-emerald-900 leading-relaxed">
            Vous êtes en <strong>essai gratuit 7 jours</strong>. Le premier débit de {espace.mrr_eur}&nbsp;€ HT/mois aura lieu le {formatDateFR(espace.trial_ends_at)} si vous restez. Annulation libre ci-dessous d'ici là.
          </div>
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
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href={STRIPE_CUSTOMER_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-[13.5px] text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Gérer mon paiement
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={2.4} />
            </a>
            {isTrial && (
              <a
                href={STRIPE_CUSTOMER_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-[13.5px] text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
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
