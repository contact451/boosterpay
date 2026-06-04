// ─────────────────────────────────────────────────────────────────
//  MesAppels — Centre d'appels live de l'espace user BoosterPay
//
//  Pourquoi cette page existe :
//   En France, on ne peut pas spoofer le caller-id de l'appelant
//   vers le mobile du commerçant (anti-démarchage ARCEP). Quand un
//   appel BoosterPay arrive sur le mobile du commerçant, il voit
//   le numéro BoosterPay — pas celui du vrai client.
//
//   → Cette page donne au commerçant l'historique complet de TOUS
//   ses appels avec le vrai numéro de l'appelant, le statut (lui
//   a répondu / IA a pris le relais / raté), la durée, le transcript
//   IA quand applicable, et 1 tap pour rappeler ou envoyer un SMS.
//
//  Combiné avec :
//   - PWA installable (manifest.json + sw.js)
//   - Web Push Notifications (gratuites, fonctionnent iPhone et Android)
//
//   → Le commerçant ne rate plus jamais un appel et peut toujours
//   rappeler en 1 tap. Zéro friction.
// ─────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Phone,
  PhoneIncoming,
  PhoneMissed,
  Bot,
  RefreshCw,
  MessageSquare,
  Inbox,
  Filter,
  ChevronRight,
  X,
  Clock,
  BellRing,
} from 'lucide-react';
import EspaceLayout from '../components/EspaceLayout';
import { getCachedAbonne, mergeWithCache, setCachedAbonne, rememberLastCommercantId, getLastCommercantId, getLastCommercantIdAsync } from '../services/abonneCache';
import PWAInstallBanner from '../components/PWAInstallBanner';
import PushActivationModal from '../components/PushActivationModal';
import { subscribeToPush, isPushReady, isPushSubscribed, isStandalonePWA, getPushDiagnostic } from '../services/pushSubscription';

const TELNYX_SERVER_URL =
  import.meta.env.VITE_TELNYX_SERVER_URL ||
  'https://web-production-10e1f.up.railway.app';

const APPS_SCRIPT_URL =
  import.meta.env.VITE_VONAGE_CRM_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbzVONAGECRMxxx/exec';

const POLL_INTERVAL_MS = 30_000; // refresh auto toutes les 30s

const KIND_META = {
  answered: {
    label: 'Vous avez répondu',
    Icon: Phone,
    color: '#059669',
    bg: '#ECFDF5',
    dotColor: '#10B981',
  },
  ai: {
    label: 'IA a pris le relais',
    Icon: Bot,
    color: '#0F766E',
    bg: '#F0FDF4',
    dotColor: '#14B8A6',
  },
  missed: {
    label: 'Appel manqué',
    Icon: PhoneMissed,
    color: '#B91C1C',
    bg: '#FEF2F2',
    dotColor: '#EF4444',
  },
};

const FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'missed', label: 'Manqués' },
  { id: 'ai', label: 'IA' },
  { id: 'answered', label: 'Répondus' },
];

// ─── Format heure FR ───
function formatHourMinute(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch (_e) {
    return '';
  }
}

function formatDateGroup(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (isSameDay(d, now)) return "Aujourd'hui";
  if (isSameDay(d, yesterday)) return 'Hier';
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

// ─── Données démo ───
const DEMO_APPELS = [
  {
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    from: '+33612345678',
    from_pretty: '+33 6 12 34 56 78',
    duration_sec: 132,
    duration_pretty: '2 min 12',
    kind: 'answered',
    ai_transcript: '',
    conversation_uuid: 'demo-1',
  },
  {
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    from: '+33788776655',
    from_pretty: '+33 7 88 77 66 55',
    duration_sec: 47,
    duration_pretty: '47s',
    kind: 'ai',
    ai_summary: 'Demande de devis pour une fuite urgente sur Quimper, rappel souhaité avant 18h.',
    ai_transcript:
      "Bonjour, je vous appelle pour une fuite d'eau sous l'évier de ma cuisine. C'est assez urgent, j'aimerais qu'on intervienne aujourd'hui si possible. Vous pouvez me rappeler avant 18h ?",
    conversation_uuid: 'demo-2',
  },
  {
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    from: '+33655443322',
    from_pretty: '+33 6 55 44 33 22',
    duration_sec: 0,
    duration_pretty: '0s',
    kind: 'missed',
    conversation_uuid: 'demo-3',
  },
  {
    timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    from: '+33611223344',
    from_pretty: '+33 6 11 22 33 44',
    duration_sec: 215,
    duration_pretty: '3 min 35',
    kind: 'answered',
    ai_transcript: '',
    conversation_uuid: 'demo-4',
  },
  {
    timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    from: '+33744556677',
    from_pretty: '+33 7 44 55 66 77',
    duration_sec: 38,
    duration_pretty: '38s',
    kind: 'ai',
    ai_summary: 'Question sur disponibilité samedi matin pour une coupe homme.',
    ai_transcript:
      "Bonjour, je souhaiterais prendre rendez-vous pour une coupe samedi matin si possible…",
    conversation_uuid: 'demo-5',
  },
];

// ─────────────────────────────────────────────────────────────────
//  MesAppels — Page principale
// ─────────────────────────────────────────────────────────────────
export default function MesAppels() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const commercantId = searchParams.get('id') || '';

  // ── Résolution du commercant_id : stratégie multi-couches 100% fiable
  //    sur 100% des smartphones (iPhone iOS 16.4+, Android Chrome, etc.)
  //
  //    Couches de résolution :
  //      0. Service Worker fetch interceptor (HTTP 302) → résout AVANT React
  //      1. ?id=BP-XXX dans l'URL (cas normal, magic link)
  //      2. localStorage / cookie (sync, instant)
  //      3. IndexedDB (async, le seul persistent sur iOS PWA)
  //      4. Redirect /connexion?from=pwa si standalone et rien trouvé
  //      5. Mode démo (visite browser non connectée — page de présentation)
  //
  //    PENDANT la résolution async (étape 3), on affiche un splash screen
  //    Apple-style au lieu de la page démo (pas pro de voir "Garage Dupont"
  //    flasher pendant 0.5s avant la vraie data).
  // ── Résolution simple :
  //    - ?id présent → on l'utilise et on le mémorise
  //    - ?id absent + standalone PWA → redirect /connexion
  //    - ?id absent + browser normal → mode démo (page de présentation)
  useEffect(() => {
    if (commercantId) {
      rememberLastCommercantId(commercantId);
      return;
    }
    // Pas d'?id → essayer le cache sync rapide
    const syncLast = getLastCommercantId();
    if (syncLast) {
      navigate(`/espace/appels?id=${encodeURIComponent(syncLast)}`, { replace: true });
      return;
    }
    // Pas de cache : PWA standalone → connexion ; sinon démo
    if (isStandalonePWA()) {
      navigate('/connexion', { replace: true });
    }
  }, [commercantId, navigate]);

  const isDemoMode = !commercantId;

  const cachedAbonne = !isDemoMode ? getCachedAbonne(commercantId) : null;
  const [nomCommerce, setNomCommerce] = useState(
    isDemoMode ? 'Démo · Garage Dupont' : cachedAbonne?.nom_commerce || ''
  );

  const [appels, setAppels] = useState(isDemoMode ? DEMO_APPELS : []);
  const [loading, setLoading] = useState(!isDemoMode);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [openDetail, setOpenDetail] = useState(null);

  // État push notif
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushModalOpen, setPushModalOpen] = useState(false);
  const [testPushStatus, setTestPushStatus] = useState('idle'); // idle | sending | sent | error
  const [pushError, setPushError] = useState('');
  const [diagOpen, setDiagOpen] = useState(false);
  const [diagData, setDiagData] = useState(null);

  const openDiagnostic = async () => {
    setDiagOpen(true);
    try {
      const data = await getPushDiagnostic();
      setDiagData(data);
    } catch (e) {
      setDiagData({ ok: false, error: e.message });
    }
  };

  useEffect(() => {
    setPushSupported(isPushReady());
    isPushSubscribed().then((sub) => {
      setPushSubscribed(sub);
      // Auto-show modal premium d'activation à la 1ère visite si :
      //  - on est en PWA standalone (icône bureau)
      //  - connecté (commercantId présent)
      //  - pas déjà subscribed
      //  - jamais montré dans cette session (sessionStorage)
      //  - support iOS 16.4+ / Android Chrome
      if (!sub && isPushReady() && isStandalonePWA() && commercantId) {
        try {
          const shown = window.sessionStorage.getItem('bp_push_modal_shown') === '1';
          if (!shown) {
            // Délai de 1.2s pour laisser la page se charger (poli)
            setTimeout(() => {
              setPushModalOpen(true);
              try { window.sessionStorage.setItem('bp_push_modal_shown', '1'); } catch (_e) {}
            }, 1200);
          }
        } catch (_e) {}
      }
    }).catch(() => setPushSubscribed(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commercantId]);

  // Fetch initial + polling
  const lastFetchTs = useRef(0);
  const fetchAppels = async () => {
    if (isDemoMode) return;
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'getEspaceAppels',
          commercant_id: commercantId,
          limit: 100,
        }),
      });
      const json = await res.json();
      if (json && json.ok && Array.isArray(json.appels)) {
        setAppels(json.appels);
      }
    } catch (_e) {
      // silent — on garde l'ancien state
    } finally {
      setLoading(false);
      setRefreshing(false);
      lastFetchTs.current = Date.now();
    }
  };

  useEffect(() => {
    if (isDemoMode) {
      setLoading(false);
      return;
    }
    fetchAppels();
    const interval = setInterval(fetchAppels, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commercantId, isDemoMode]);

  // Background refresh espace (pour récupérer nom_commerce si pas en cache)
  useEffect(() => {
    if (!commercantId || isDemoMode || cachedAbonne?.nom_commerce) return;
    (async () => {
      try {
        const res = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'getEspaceAbonne', commercant_id: commercantId }),
        });
        const json = await res.json();
        if (json.ok && json.espace) {
          const merged = mergeWithCache(commercantId, json.espace);
          setCachedAbonne(commercantId, merged);
          if (merged.nom_commerce) setNomCommerce(merged.nom_commerce);
        }
      } catch (_e) {}
    })();
  }, [commercantId, isDemoMode, cachedAbonne]);

  // Filtre actif
  const filtered = useMemo(() => {
    if (filter === 'all') return appels;
    return appels.filter((a) => a.kind === filter);
  }, [appels, filter]);

  // Group par date (Aujourd'hui / Hier / date)
  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((a) => {
      const key = formatDateGroup(a.timestamp);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(a);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const counts = useMemo(() => {
    const c = { all: appels.length, missed: 0, ai: 0, answered: 0 };
    appels.forEach((a) => {
      if (c[a.kind] !== undefined) c[a.kind]++;
    });
    return c;
  }, [appels]);

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    fetchAppels();
  };

  const handleEnablePush = async () => {
    setPushError('');
    try {
      await subscribeToPush(commercantId);
      setPushSubscribed(true);
      setPushModalOpen(false);

      // ── Notification de confirmation immédiate ─────────────────
      // On déclenche une vraie push notif via le serveur Telnyx pour que
      // l'utilisateur voie tout de suite que ses notifs sont opérationnelles.
      // Délai 700ms pour laisser le temps à la subscription d'être stockée
      // dans la sheet PushSubscriptions côté Apps Script.
      setTimeout(() => {
        fetch(`${TELNYX_SERVER_URL}/health/test-push`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            commercant_id: commercantId,
            title: 'Notifications activées',
            body: 'Vous serez alerté à chaque appel reçu sur votre numéro BoosterPay.',
          }),
        }).catch(() => { /* silencieux : l'activation a réussi, c'est l'essentiel */ });
      }, 700);
    } catch (e) {
      const msg = String(e && e.message) || 'unknown';
      if (msg === 'permission_denied') {
        setPushError("Vous avez refusé les notifications. Ouvrez Réglages iPhone → BoosterPay → Notifications pour les autoriser.");
      } else if (msg === 'push_not_supported') {
        setPushError("Votre navigateur ne supporte pas les notifications. Installez la PWA sur l'écran d'accueil et réessayez.");
      } else if (msg === 'vapid_key_missing') {
        setPushError("Configuration manquante côté serveur. Contactez le support.");
      } else {
        setPushError("Activation impossible (" + msg + "). Vérifiez que l'app est bien installée à l'écran d'accueil.");
      }
    }
  };

  // ── Test push : envoie une vraie notif au commerçant via le serveur Telnyx
  const handleTestPush = async () => {
    if (testPushStatus === 'sending') return;
    setTestPushStatus('sending');
    try {
      const res = await fetch(`${TELNYX_SERVER_URL}/health/test-push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commercant_id: commercantId }),
      });
      const json = await res.json();
      if (json.ok && json.sent > 0) {
        setTestPushStatus('sent');
        setTimeout(() => setTestPushStatus('idle'), 4000);
      } else if (json.ok && json.sent === 0 && json.reason === 'no_subscriptions') {
        setTestPushStatus('error');
        setPushError("Aucune notification enregistrée. Cliquez sur 'Activer' d'abord.");
        setTimeout(() => setTestPushStatus('idle'), 5000);
      } else {
        setTestPushStatus('error');
        setPushError('Échec : ' + (json.error || 'inconnu'));
        setTimeout(() => setTestPushStatus('idle'), 5000);
      }
    } catch (e) {
      setTestPushStatus('error');
      setPushError(e.message || 'Réseau indisponible');
      setTimeout(() => setTestPushStatus('idle'), 5000);
    }
  };

  return (
    <EspaceLayout
      nomCommerce={nomCommerce}
      commercantId={commercantId}
      activeSection="appels"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">

        {/* ════ Header ════ */}
        <div className="mb-7">
          <div className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: '#10B981' }}>
            <span className="relative inline-flex w-1.5 h-1.5">
              <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </span>
            Centre d'appels · En direct
          </div>
          <h1
            className="font-bold tracking-tight text-gray-900"
            style={{ fontSize: 'clamp(26px, 4vw, 34px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
          >
            Mes appels
          </h1>
          <p className="mt-2 text-[15px] text-gray-500 max-w-xl leading-relaxed">
            Tous les appels reçus sur votre numéro BoosterPay. Rappelez en 1 tap, retrouvez le transcript de l'IA, ne ratez plus une opportunité.
          </p>
        </div>

        {/* ════ Bandeau install PWA (mobile uniquement, si pas installé) ════ */}
        {!isDemoMode && !isStandalonePWA() && <PWAInstallBanner commercantId={commercantId} />}

        {/* ════ Bandeau activation push (uniquement si en standalone et pas encore subscribed) ════ */}
        {!isDemoMode && isStandalonePWA() && pushSupported && !pushSubscribed && (
          <div
            className="mb-6 rounded-2xl p-4 flex items-start gap-3 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)',
              border: '1.5px solid rgba(16, 185, 129, 0.35)',
              boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 8px 24px rgba(16,185,129,0.14)',
            }}
          >
            {/* Pulse de lumière en fond */}
            <div
              aria-hidden
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)',
                animation: 'bp-pulse 2.4s ease-in-out infinite',
              }}
            />
            <div
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center relative z-10"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.40)',
                animation: 'bp-bell-shake 3s ease-in-out infinite',
              }}
            >
              <BellRing size={18} color="white" strokeWidth={2.4} />
            </div>
            <div className="flex-1 min-w-0 relative z-10">
              <p className="text-[14px] font-bold text-gray-900 leading-tight">
                Ne ratez plus jamais un appel
              </p>
              <p className="text-[12.5px] text-gray-700 mt-0.5 leading-snug">
                Alerte instantanée avec le numéro de l'appelant. Gratuit.
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); handleEnablePush(); }}
              className="flex-shrink-0 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-transform active:scale-95 relative z-10"
              style={{
                background: '#0F172A',
                color: 'white',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.30)',
              }}
            >
              Activer
            </button>
            <style>{`
              @keyframes bp-pulse {
                0%, 100% { opacity: 0.5; transform: scale(1); }
                50% { opacity: 0.9; transform: scale(1.15); }
              }
              @keyframes bp-bell-shake {
                0%, 90%, 100% { transform: rotate(0deg); }
                92%, 96% { transform: rotate(-8deg); }
                94%, 98% { transform: rotate(8deg); }
              }
            `}</style>
          </div>
        )}

        {/* Pas de bandeau quand notifs OK : on libère de la place pour les appels */}

        {pushError && (
          <div
            className="mb-6 rounded-2xl p-3 text-[12.5px] leading-snug"
            style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid rgba(220,38,38,0.20)' }}
          >
            {pushError}
          </div>
        )}

        {/* ════ Filtres + bouton Rafraîchir compact à droite ════ */}
        <div className="flex items-center gap-2 mb-5">
          <div
            className="flex items-center gap-2 overflow-x-auto flex-1 pb-1 -mx-1 px-1"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {FILTERS.map((f) => {
              const isActive = f.id === filter;
              const count = counts[f.id] || 0;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap flex-shrink-0"
                  style={{
                    background: isActive ? '#0F172A' : 'white',
                    color: isActive ? 'white' : '#374151',
                    border: isActive ? '1px solid #0F172A' : '1px solid #E5E7EB',
                    boxShadow: isActive ? '0 2px 8px rgba(15,23,42,0.18)' : 'none',
                  }}
                >
                  {f.label}
                  <span
                    className="inline-flex items-center justify-center text-[11px] font-bold rounded-full px-1.5 min-w-[20px] h-[18px]"
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.18)' : '#F3F4F6',
                      color: isActive ? 'white' : '#6B7280',
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bouton Rafraîchir icône seule, fixé à droite, jamais coupé */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full transition-all"
            style={{
              background: 'white',
              color: '#374151',
              border: '1px solid #E5E7EB',
            }}
            aria-label="Rafraîchir"
          >
            <RefreshCw
              size={15}
              strokeWidth={2.4}
              style={{ animation: refreshing ? 'bp-spin 0.9s linear infinite' : 'none' }}
            />
          </button>
        </div>

        {/* ════ Liste / States ════ */}
        {loading ? (
          <CallsListSkeleton />
        ) : grouped.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div className="space-y-7">
            {grouped.map(([dateLabel, items]) => (
              <section key={dateLabel}>
                <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-2 px-1">
                  {dateLabel}
                </h2>
                <div className="space-y-2">
                  {items.map((a) => (
                    <CallCard key={a.conversation_uuid || a.timestamp} appel={a} onOpen={() => setOpenDetail(a)} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* ════ Footer mini-aide ════ */}
        <p className="text-center text-[12px] text-gray-400 mt-10">
          Tous vos appels sont conservés. Mise à jour automatique toutes les 30 secondes.
        </p>
        {!isDemoMode && (
          <div className="text-center mt-3">
            <button
              onClick={openDiagnostic}
              className="text-[11px] text-gray-400 hover:text-gray-600 underline transition-colors"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              Diagnostic notifications
            </button>
          </div>
        )}
      </div>

      {/* ════ Modal détail appel ════ */}
      {openDetail && <CallDetailModal appel={openDetail} onClose={() => setOpenDetail(null)} />}

      {/* ════ Modal activation push (auto à la 1ère ouverture PWA) ════ */}
      {pushModalOpen && (
        <PushActivationModal
          onActivate={handleEnablePush}
          onClose={() => setPushModalOpen(false)}
        />
      )}

      {/* ════ Modal diagnostic notifications ════ */}
      {diagOpen && (
        <DiagnosticModal data={diagData} onClose={() => setDiagOpen(false)} commercantId={commercantId} />
      )}

      {/* ════ CSS keyframes ════ */}
      <style>{`
        @keyframes bp-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bp-fadein { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bp-fade-bg { from { background: rgba(0,0,0,0); } to { background: rgba(15,23,42,0.45); } }
        @keyframes bp-slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .bp-skel {
          background: linear-gradient(90deg, #F3F4F6 0%, #E5E7EB 50%, #F3F4F6 100%);
          background-size: 200% 100%;
          animation: bp-shimmer 1.4s ease-in-out infinite;
        }
        @keyframes bp-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>
    </EspaceLayout>
  );
}

// ─────────────────────────────────────────────────────────────────
//  CallCard — une carte appel (premium Apple style)
// ─────────────────────────────────────────────────────────────────
function CallCard({ appel, onOpen }) {
  const meta = KIND_META[appel.kind] || KIND_META.missed;
  const Icon = meta.Icon;
  const hour = formatHourMinute(appel.timestamp);
  const dateLabel = formatDateGroup(appel.timestamp);
  const isToday = dateLabel === "Aujourd'hui";
  const aiSnippet = (appel.ai_summary || appel.ai_transcript || '').trim();
  const hasNumber = Boolean(appel.from_pretty || appel.from);

  const telHref = `tel:${appel.from || ''}`;
  const smsHref = `sms:${appel.from || ''}`;

  return (
    <div
      onClick={onOpen}
      className="group rounded-2xl bg-white p-4 cursor-pointer transition-all"
      style={{
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 1px 3px rgba(0,0,0,0.03)',
        animation: 'bp-fadein 280ms ease-out both',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          '0 1px 0 rgba(255,255,255,0.9) inset, 0 6px 16px rgba(0,0,0,0.06)';
        e.currentTarget.style.borderColor = '#D1D5DB';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow =
          '0 1px 0 rgba(255,255,255,0.9) inset, 0 1px 3px rgba(0,0,0,0.03)';
        e.currentTarget.style.borderColor = '#E5E7EB';
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icône statut */}
        <div
          className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
          style={{ background: meta.bg }}
        >
          <Icon size={18} color={meta.color} strokeWidth={2.4} />
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <p
              className="text-[15.5px] font-bold text-gray-900 leading-tight"
              style={{ fontFeatureSettings: '"tnum"' }}
            >
              {hasNumber ? (appel.from_pretty || appel.from) : 'Numéro masqué'}
            </p>
            <span className="inline-flex items-center text-[11.5px] font-semibold" style={{ color: meta.color }}>
              {meta.label}
            </span>
          </div>
          {!hasNumber && (
            <p className="text-[11.5px] text-gray-400 mt-0.5 italic">
              Numéro masqué par l'appelant
            </p>
          )}
          <p className="text-[12.5px] text-gray-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <Clock size={11} strokeWidth={2.4} />
            {!isToday && (
              <>
                <span className="font-semibold text-gray-600">{dateLabel}</span>
                <span className="text-gray-300">·</span>
              </>
            )}
            <span>{hour}</span>
            {appel.duration_pretty && appel.duration_sec > 0 && (
              <>
                <span className="text-gray-300">·</span>
                <span>{appel.duration_pretty}</span>
              </>
            )}
          </p>

          {/* Snippet transcript IA */}
          {aiSnippet && (
            <p
              className="mt-2 text-[13px] text-gray-600 leading-snug overflow-hidden"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              <span className="italic">« {aiSnippet} »</span>
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <a
              href={telHref}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-bold transition-transform active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(16,185,129,0.30)',
              }}
            >
              <Phone size={12} strokeWidth={2.6} />
              Rappeler
            </a>
            <a
              href={smsHref}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-bold transition-transform active:scale-95"
              style={{
                background: 'white',
                color: '#047857',
                textDecoration: 'none',
                border: '1px solid rgba(16, 185, 129, 0.30)',
              }}
            >
              <MessageSquare size={12} strokeWidth={2.6} />
              SMS
            </a>
          </div>
        </div>

        <ChevronRight
          size={18}
          color="#9CA3AF"
          strokeWidth={2}
          className="flex-shrink-0 mt-3 transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  EmptyState
// ─────────────────────────────────────────────────────────────────
function EmptyState({ filter }) {
  const map = {
    all: { Icon: Inbox, title: 'Aucun appel pour le moment', sub: 'Dès qu\'un client appelle votre numéro BoosterPay, il apparaîtra ici en temps réel.' },
    missed: { Icon: PhoneMissed, title: 'Aucun appel manqué', sub: 'Bravo — vous (ou l\'IA) avez répondu à tous les appels récents.' },
    ai: { Icon: Bot, title: 'L\'IA n\'a pas encore pris d\'appel', sub: 'Elle prend automatiquement le relais si vous ne répondez pas dans 18 secondes.' },
    answered: { Icon: PhoneIncoming, title: 'Aucun appel décroché', sub: 'Pas encore d\'appel où vous avez répondu en personne.' },
  };
  const meta = map[filter] || map.all;
  const Icon = meta.Icon;

  return (
    <div
      className="rounded-3xl p-10 text-center"
      style={{ background: '#F9FAFB', border: '1px solid #F3F4F6' }}
    >
      <div
        className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
        style={{ background: 'white', border: '1px solid #E5E7EB' }}
      >
        <Icon size={22} color="#9CA3AF" strokeWidth={2} />
      </div>
      <h3 className="text-[16px] font-bold text-gray-900">{meta.title}</h3>
      <p className="text-[13.5px] text-gray-500 mt-1.5 max-w-sm mx-auto leading-relaxed">{meta.sub}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  CallsListSkeleton
// ─────────────────────────────────────────────────────────────────
function CallsListSkeleton() {
  return (
    <div className="space-y-2" style={{ minHeight: '420px' }}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-2xl bg-white p-4"
          style={{ border: '1px solid #E5E7EB', minHeight: '102px' }}
        >
          <div className="flex items-start gap-3">
            <div className="bp-skel flex-shrink-0 w-11 h-11 rounded-full" />
            <div className="flex-1">
              <div className="bp-skel h-3.5 rounded" style={{ width: '60%' }} />
              <div className="bp-skel h-3 rounded mt-2" style={{ width: '40%' }} />
              <div className="flex gap-2 mt-3">
                <div className="bp-skel h-7 rounded-full" style={{ width: '84px' }} />
                <div className="bp-skel h-7 rounded-full" style={{ width: '64px' }} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  CallDetailModal — fiche détaillée d'un appel
// ─────────────────────────────────────────────────────────────────
function CallDetailModal({ appel, onClose }) {
  const meta = KIND_META[appel.kind] || KIND_META.missed;
  const Icon = meta.Icon;

  const telHref = `tel:${appel.from || ''}`;
  const smsHref = `sms:${appel.from || ''}`;

  // Lock scroll body
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', animation: 'bp-fade-bg 220ms ease-out both' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl"
        style={{ animation: 'bp-slide-up 280ms cubic-bezier(0.2,0.8,0.2,1) both' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: meta.bg }}
            >
              <Icon size={17} color={meta.color} strokeWidth={2.4} />
            </div>
            <div>
              <p className="text-[14px] font-bold text-gray-900 leading-tight">
                {appel.from_pretty || appel.from || 'Numéro masqué'}
              </p>
              <p className="text-[12px]" style={{ color: meta.color }}>{meta.label}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Fermer"
          >
            <X size={18} color="#6B7280" strokeWidth={2.2} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <DetailRow label="Heure" value={formatHourMinute(appel.timestamp)} />
            <DetailRow label="Durée" value={appel.duration_pretty || '—'} />
            <DetailRow label="Date" value={formatDateGroup(appel.timestamp)} />
            <DetailRow label="ID conversation" value={(appel.conversation_uuid || '').slice(0, 8) || '—'} mono />
          </div>

          {appel.ai_summary && (
            <div
              className="rounded-2xl p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(16,185,129,0.03) 100%)',
                border: '1px solid rgba(16,185,129,0.20)',
              }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: '#047857' }}>
                Résumé de l'IA
              </p>
              <p className="text-[14px] text-gray-800 mt-1.5 leading-relaxed">{appel.ai_summary}</p>
            </div>
          )}

          {appel.ai_transcript && (
            <div className="rounded-2xl bg-gray-50 p-4" style={{ border: '1px solid #F3F4F6' }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
                Transcript de l'IA
              </p>
              <p className="text-[13.5px] text-gray-700 mt-1.5 leading-relaxed italic">
                « {appel.ai_transcript} »
              </p>
            </div>
          )}
        </div>

        {/* Actions sticky */}
        <div className="grid grid-cols-2 gap-2 p-4 border-t border-gray-100" style={{ background: '#FAFBFC' }}>
          <a
            href={telHref}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-[14.5px] font-bold transition-transform active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(16,185,129,0.30)',
            }}
          >
            <Phone size={15} strokeWidth={2.6} />
            Rappeler
          </a>
          <a
            href={smsHref}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-[14.5px] font-bold transition-transform active:scale-95"
            style={{
              background: 'white',
              color: '#047857',
              textDecoration: 'none',
              border: '1.5px solid rgba(16, 185, 129, 0.35)',
            }}
          >
            <MessageSquare size={15} strokeWidth={2.6} />
            SMS
          </a>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono }) {
  return (
    <div>
      <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-gray-400">{label}</p>
      <p
        className="text-[13.5px] font-semibold text-gray-800 mt-0.5"
        style={{ fontFamily: mono ? 'ui-monospace, SFMono-Regular, monospace' : undefined }}
      >
        {value}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  DiagnosticModal — affiche l'état complet des notifs pour debug
//
//  Pour chaque maillon de la chaîne, on indique ✅ / ❌ avec valeur :
//   - HTTPS ?
//   - Push API supporté ?
//   - Service Worker enregistré + ACTIF ?
//   - Permission Notification ?
//   - VAPID public key configurée Vercel ?
//   - Subscription créée + endpoint Apple ?
//   - Mode standalone (PWA installée) ?
// ─────────────────────────────────────────────────────────────────
function DiagnosticModal({ data, onClose, commercantId }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const copyToClipboard = async () => {
    const text = JSON.stringify({ commercant_id: commercantId, ...(data || {}) }, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_e) {}
  };

  const lines = data ? [
    { label: 'HTTPS', value: data.protocol, ok: data.protocol === 'https:' },
    { label: 'PWA installée', value: data.standalone ? 'Oui' : 'Non (Safari)', ok: data.standalone },
    { label: 'iOS détecté', value: data.ios_likely ? 'Oui' : 'Non', ok: true },
    { label: 'Push API', value: data.push_ready ? 'Disponible' : 'Indisponible', ok: data.push_ready },
    { label: 'Permission', value: data.notification_permission, ok: data.notification_permission === 'granted' },
    { label: 'Service Worker', value: data.service_worker_registered ? (data.service_worker_active ? 'Actif' : 'Enregistré mais inactif') : 'Non enregistré', ok: data.service_worker_active },
    { label: 'SW scope', value: data.service_worker_scope || '—', ok: true },
    { label: 'VAPID public', value: data.vapid_public_key_set ? data.vapid_public_key_preview : '⚠️ ABSENTE', ok: data.vapid_public_key_set },
    { label: 'Souscrit', value: data.subscribed ? 'Oui' : 'Non', ok: data.subscribed },
    { label: 'Endpoint', value: data.subscription_endpoint_host || '—', ok: data.subscribed },
  ] : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-gray-900">Diagnostic notifications</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Fermer"
          >
            <X size={18} color="#6B7280" strokeWidth={2.2} />
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto flex-1">
          {!data ? (
            <p className="text-[13px] text-gray-500">Chargement…</p>
          ) : (
            <div className="space-y-1.5">
              {lines.map((l) => (
                <div
                  key={l.label}
                  className="flex items-start justify-between gap-3 py-2 px-3 rounded-xl"
                  style={{
                    background: l.ok ? '#F0FDF4' : '#FEF2F2',
                    border: l.ok ? '1px solid rgba(16,185,129,0.20)' : '1px solid rgba(220,38,38,0.20)',
                  }}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span style={{ fontSize: '14px' }}>{l.ok ? '✅' : '❌'}</span>
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-bold text-gray-900 leading-tight">{l.label}</p>
                      <p className="text-[12px] text-gray-600 mt-0.5 break-all font-mono">
                        {String(l.value)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {data.user_agent && (
                <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-gray-500 mb-1">User agent</p>
                  <p className="text-[10.5px] text-gray-600 break-all font-mono leading-snug">{data.user_agent}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100" style={{ background: '#FAFBFC' }}>
          <button
            onClick={copyToClipboard}
            className="w-full py-3 rounded-2xl text-[14px] font-bold transition-transform active:scale-95"
            style={{
              background: copied ? '#ECFDF5' : '#0F172A',
              color: copied ? '#047857' : 'white',
              border: copied ? '1px solid rgba(16,185,129,0.30)' : 'none',
            }}
          >
            {copied ? '✓ Copié' : 'Copier le diagnostic'}
          </button>
        </div>
      </div>
    </div>
  );
}

