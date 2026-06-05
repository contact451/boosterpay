import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, Shield, Mail, Phone, Sparkles, Calendar, Check, MapPin, Store, PhoneCall, Bot, Smartphone, Copy, PartyPopper, Zap, CreditCard } from 'lucide-react';
import { setCachedAbonne, mergeWithCache } from '../services/abonneCache';
import EspaceLayout from '../components/EspaceLayout';

// URL Apps Script Vonage CRM (= celle qui gère les abonnés + espace)
const VONAGE_CRM_API_URL = import.meta.env.VITE_VONAGE_CRM_APPS_SCRIPT_URL
  || 'https://script.google.com/macros/s/AKfycbzVONAGECRMxxx/exec';

/* ════════════════════════════════════════════════════════════════════
   /merci — Page de confirmation post-paiement
   2 modes :
    - ?subscription=1   → nouveau flow IA Vocale 99€ HT/mois trial 7j
    - (sans param)      → ancien flow (validation CB 0.50€ pour essai gratuit)
   ════════════════════════════════════════════════════════════════════ */
export default function MerciPage() {
  const { isSubscription, commercantId } = useMemo(() => {
    if (typeof window === 'undefined') return { isSubscription: false, commercantId: '' };
    const params = new URLSearchParams(window.location.search);
    return {
      isSubscription: params.get('subscription') === '1',
      commercantId: params.get('commercant_id') || '',
    };
  }, []);

  useEffect(() => {
    document.title = isSubscription
      ? 'BoosterPay — Votre essai 7 jours est activé'
      : 'Merci ! Votre essai est activé | BoosterPay';
  }, [isSubscription]);

  useEffect(() => {
    if (isSubscription) return; // pas de notification CRM pour le flow subscription (Stripe webhook s'en charge)

    // Legacy : notify CRM that card was registered (ancien flow validation CB 0.50€)
    const urlParams = new URLSearchParams(window.location.search);
    const CRM_API_URL = 'https://script.google.com/macros/s/AKfycbztp_6rllQCg2MPXrrWOyudvaGcUlIdG6pZdVQjpU7-Z-8_3brmGHqoD2nrlCv0mMYe/exec';

    const source = urlParams.get('source') || (() => { try { const s = localStorage.getItem('bp_source') || ''; localStorage.removeItem('bp_source'); return s; } catch(e) { return ''; } })();

    fetch(CRM_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'cardRegistered',
        sessionId: urlParams.get('session_id') || '',
        source,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {});
  }, [isSubscription]);

  if (isSubscription) {
    return <SubscriptionConfirmation commercantId={commercantId} />;
  }

  return <LegacyConfirmation />;
}

// ─────────────────────────────────────────────────────────────────
//  Nouveau flow — confirmation post-paiement subscription (trial 7j)
//  Étape 2 sur 2 : mini form qui complète le profil (nom_commerce + code_postal)
// ─────────────────────────────────────────────────────────────────
function SubscriptionConfirmation({ commercantId }) {
  const navigate = useNavigate();
  const espaceUrl = commercantId ? `/configurer?id=${encodeURIComponent(commercantId)}` : '/configurer';
  const [profile, setProfile] = useState({ nom_commerce: '', code_postal: '' });
  // step machine :
  //  'form'         → user remplit nom_commerce + code_postal
  //  'saving'       → POST en cours vers Apps Script
  //  'provisioning' → animation de provisioning + polling Apps Script pour le numéro
  //  'ready'        → numéro révélé + tuto + test live
  //  'expired'      → fallback si le numéro met > 20s à arriver
  const [step, setStep] = useState('form');
  const [errors, setErrors] = useState({});
  const [provisioningStep, setProvisioningStep] = useState(0); // 0..3
  const [numeroVirtuel, setNumeroVirtuel] = useState('');
  const [mobileCommercant, setMobileCommercant] = useState(''); // pour l'étape 2
  const [copyStatus, setCopyStatus] = useState('idle'); // 'idle' | 'copied'
  const [waitedTooLong, setWaitedTooLong] = useState(false); // après 30s sans numéro
  const numeroReceivedRef = useRef(false);

  // ── Anti-blocage : si après 30s on n'a toujours pas de numéro, on affiche
  // un message rassurant et un bouton pour explorer les modules en attendant.
  // Le cron Apps Script retryFailedProvisioning_ va s'occuper du provisioning
  // côté serveur et envoyer un email "Votre IA est active sur +33..." dès succès.
  useEffect(() => {
    if (step !== 'ready' || numeroVirtuel) {
      setWaitedTooLong(false);
      return;
    }
    const t = setTimeout(() => setWaitedTooLong(true), 30000);
    return () => clearTimeout(t);
  }, [step, numeroVirtuel]);

  // Clé localStorage pour persister le profil de ce commerçant
  const storageKey = commercantId ? `bp_profile_${commercantId}` : '';

  // ── Hydrate depuis localStorage si l'user revient (déjà complété le form) ──
  // Évite de refaire saisir nom_commerce + code_postal à chaque navigation entre
  // les sections de l'espace. Skip directement à step='ready'.
  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data?.nom_commerce && data?.code_postal) {
        setProfile({ nom_commerce: data.nom_commerce, code_postal: data.code_postal });
        if (data.numero_virtuel) {
          setNumeroVirtuel(data.numero_virtuel);
          numeroReceivedRef.current = true;
        }
        if (data.mobile) setMobileCommercant(data.mobile);
        setStep('ready'); // skip form + provisioning, on est chez nous
      }
    } catch (_e) {
      // localStorage indisponible — comportement normal (form étape 2)
    }
  }, [storageKey]);

  // ── Hydrate depuis la sheet si profil déjà complet en BDD ──
  // Cas typique : utilisateur qui revient via magic link sur un nouveau
  // navigateur / nouvel appareil → pas de localStorage local, MAIS profil
  // déjà rempli en sheet. On évite ainsi de re-demander nom_commerce et
  // code_postal au client.
  useEffect(() => {
    if (!commercantId || typeof window === 'undefined') return;
    // Skip uniquement si localStorage contient le profil COMPLET ET un mobile
    // EN CLAIR (pas masqué avec '*'). Les anciennes sessions persistaient soit
    // rien soit un mobile masqué — dans ces 2 cas on doit re-fetch backend
    // pour récupérer le numéro complet.
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const data = JSON.parse(raw);
        const hasCleanMobile = data?.mobile && !String(data.mobile).includes('*');
        if (data?.nom_commerce && data?.code_postal && hasCleanMobile) return;
      }
    } catch (_e) {}

    // Mode démo : pas de fetch (l'autre useEffect injecte les valeurs)
    if (/TEST|DEMO/i.test(commercantId)) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(VONAGE_CRM_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'getEspaceAbonne', commercant_id: commercantId }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (json.ok && json.espace) {
          // Persist le cache global pour les pages Modules/Abonnement
          // (évite le flash skeleton à chaque navigation entre pages)
          try {
            const merged = mergeWithCache(commercantId, json.espace);
            setCachedAbonne(commercantId, merged);
          } catch (_e) {}

          // Mobile perso du commerçant — affiché à l'étape 2 du tuto.
          // Priorité au numéro complet (espace privé) > fallback masqué (legacy).
          const mob = json.espace.mobile_perso || json.espace.mobile_perso_masked || '';
          if (mob) {
            setMobileCommercant(mob);
            persistProfile({ mobile: mob });
          }

          if (json.espace.nom_commerce && json.espace.code_postal) {
            // Profil déjà complet en BDD → skip form
            setProfile({
              nom_commerce: json.espace.nom_commerce,
              code_postal: json.espace.code_postal,
            });
            if (json.espace.numero_virtuel) {
              setNumeroVirtuel(json.espace.numero_virtuel);
              numeroReceivedRef.current = true;
            }
            persistProfile({
              nom_commerce: json.espace.nom_commerce,
              code_postal: json.espace.code_postal,
              numero_virtuel: json.espace.numero_virtuel || '',
              mobile: mob,
              hydratedFromBackend: true,
            });
            setStep('ready');
          }
        }
      } catch (_e) {
        // Network fail : on laisse le form s'afficher (comportement par défaut)
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commercantId]);

  // Helper : persiste un patch dans localStorage
  function persistProfile(patch) {
    if (!storageKey || typeof window === 'undefined') return;
    try {
      const prev = JSON.parse(window.localStorage.getItem(storageKey) || '{}');
      window.localStorage.setItem(storageKey, JSON.stringify({ ...prev, ...patch }));
    } catch (_e) {
      // silent
    }
  }

  function setField(name, value) {
    setProfile((p) => ({ ...p, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!profile.nom_commerce.trim()) errs.nom_commerce = 'Le nom de votre commerce est requis.';
    if (!/^\d{5}$/.test(profile.code_postal.trim())) errs.code_postal = 'Code postal invalide (5 chiffres).';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (step === 'saving') return;
    if (!commercantId) {
      // Pas de commercant_id → on bascule direct sur provisioning fictif (demo)
      setStep('provisioning');
      return;
    }
    if (!validate()) return;
    setStep('saving');
    try {
      await fetch(VONAGE_CRM_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'updateCommercantProfile',
          commercant_id: commercantId,
          nom_commerce: profile.nom_commerce.trim(),
          code_postal: profile.code_postal.trim(),
        }),
      });
    } catch (err) {
      console.warn('[MerciPage] update profile failed:', err);
      // Non bloquant — on continue vers le provisioning
    }
    // Persiste pour que l'user revienne directement en ready la prochaine fois
    persistProfile({
      nom_commerce: profile.nom_commerce.trim(),
      code_postal: profile.code_postal.trim(),
      completedAt: Date.now(),
    });
    setStep('provisioning');
  }

  // ── Animation progression visuelle (0 → 1 → 2 → 3) sur 3.6s ──
  useEffect(() => {
    if (step !== 'provisioning') return;
    const timers = [
      setTimeout(() => setProvisioningStep(1), 800),
      setTimeout(() => setProvisioningStep(2), 1900),
      setTimeout(() => setProvisioningStep(3), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [step]);

  // ── Polling Apps Script pour récupérer le numero_virtuel ──
  // Continue en provisioning ET en ready (tant que le numéro n'est pas reçu).
  // Mode DÉMO : si commercant_id contient TEST/DEMO ou est vide, on injecte
  // un numéro d'exemple → permet de valider le rendu sans toucher au sheet.
  useEffect(() => {
    // Actif uniquement quand on est en provisioning ou ready, ET pas encore reçu
    if (step !== 'provisioning' && step !== 'ready') return;
    if (numeroVirtuel) return;

    const isDemoMode = !commercantId || /TEST|DEMO/i.test(commercantId);

    if (isDemoMode) {
      // Numéro d'exemple Lyon + mobile d'exemple — affichés à la fin de l'animation
      const demoTimer = setTimeout(() => {
        numeroReceivedRef.current = true;
        setNumeroVirtuel('+33489316691');
        setMobileCommercant('+33612345678');
        persistProfile({ numero_virtuel: '+33489316691', mobile: '+33612345678' });
      }, 2400);
      return () => clearTimeout(demoTimer);
    }

    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      try {
        // POST text/plain : pattern standard Apps Script qui évite le CORS
        // preflight (le navigateur ne fait pas OPTIONS pour text/plain).
        // Le doGet() ne sert qu'au healthcheck — la vraie logique action est
        // dans doPost().
        const res = await fetch(VONAGE_CRM_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'getEspaceAbonne',
            commercant_id: commercantId,
          }),
        });
        const data = await res.json();
        const espaceData = data?.espace || data?.abonne || data || {};
        const num = espaceData.numero_virtuel || '';
        // Priorité : mobile_perso complet > mobile_perso_masked legacy
        const mob = espaceData.mobile_perso
          || espaceData.mobile
          || espaceData.mobile_perso_masked
          || '';
        if (num && /^\+?\d{8,}$/.test(String(num).replace(/\s/g, ''))) {
          numeroReceivedRef.current = true;
          setNumeroVirtuel(num);
          persistProfile({ numero_virtuel: num });
        }
        // On accepte un mobile s'il a au moins 4 chiffres (le masque
        // "+33 6 ** ** ** 78" en a 4 significatifs mais reste un signal valide).
        if (mob && /\d{4,}/.test(String(mob))) {
          setMobileCommercant(mob);
          persistProfile({ mobile: mob });
        }
      } catch (_e) {
        // silent — on retentera au prochain tick
      }
    };

    // Tick immédiat + intervalle 2s
    tick();
    const intervalId = setInterval(tick, 2000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [step, commercantId, numeroVirtuel]);

  // ── Quand l'animation visuelle est finie → passe à 'ready' ──
  // On n'attend PAS le numéro : si Apps Script tarde, l'user voit la séquence
  // narrative quand même, avec un spinner dans la card numéro qui se remplace
  // automatiquement dès que le polling reçoit le numero_virtuel.
  useEffect(() => {
    if (step !== 'provisioning') return;
    if (provisioningStep === 3) {
      const t = setTimeout(() => setStep('ready'), 600);
      return () => clearTimeout(t);
    }
  }, [step, provisioningStep]);

  // Plus d'auto-redirect : /merci EST la page d'accueil de l'espace user.

  function handleCopyNumero() {
    if (!numeroVirtuel) return;
    try {
      navigator.clipboard.writeText(numeroVirtuel);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (_e) {
      // ignore
    }
  }

  const isFormPhase = step === 'form' || step === 'saving';

  // Ambient orbs verts — communs aux 2 modes (form & espace)
  const ambientOrbs = (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] rounded-full opacity-[0.07] blur-3xl"
           style={{ background: 'radial-gradient(ellipse, #10B981 0%, transparent 60%)' }} />
      <div className="absolute top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.06] blur-3xl"
           style={{ background: 'radial-gradient(circle, #059669, transparent 70%)' }} />
    </div>
  );

  // Header sticky avec progress bar (uniquement phase form)
  const formHeader = (
    <header className="relative z-30 border-b border-gray-100/80 bg-white/85 backdrop-blur-xl sticky top-0">
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="text-gray-900 font-bold text-[15px] tracking-tight">
          BoosterPay
        </Link>
        <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium">
          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
              <Check className="w-3 h-3" strokeWidth={3} />
            </span>
            <span className="hidden sm:inline">Compte</span>
          </span>
          <span className="text-gray-300">───</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">2</span>
            <span className="hidden sm:inline">Finalisation</span>
          </span>
        </div>
      </div>
    </header>
  );

  // Bloc principal narratif — identique dans les 2 modes (les phases s'auto-affichent)
  const mainContent = (
    <main className="relative max-w-2xl mx-auto px-6 py-10 md:py-12">

        {/* Icône check — pop d'entrée + halo qui pulse en continu (célébration Apple) */}
        <div className="relative flex justify-center mb-5">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
            className="relative"
          >
            {/* Halo pulsé infini — anneau vert qui ondule autour de l'icône */}
            <motion.span
              className="absolute inset-0 rounded-full pointer-events-none"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(16, 185, 129, 0.45)',
                  '0 0 0 24px rgba(16, 185, 129, 0)',
                ],
              }}
              transition={{
                duration: 2,
                ease: 'easeOut',
                repeat: Infinity,
              }}
              aria-hidden="true"
            />
            {/* Icône principale */}
            <div
              className="relative w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow:
                  '0 0 0 12px rgba(16, 185, 129, 0.12), 0 0 0 24px rgba(16, 185, 129, 0.06), 0 16px 40px -8px rgba(16, 185, 129, 0.45)',
              }}
            >
              <Check className="w-9 h-9 text-white" strokeWidth={3} />
            </div>
          </motion.div>
        </div>

        {/* Titre Bienvenue dynamique selon l'étape */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[34px] md:text-[44px] font-extrabold tracking-[-0.03em] text-gray-900 text-center leading-[1.05] mb-4"
        >
          {step === 'ready' ? (
            <>
              Bienvenue{profile.nom_commerce ? <>, <span style={{ color: '#1D1D1F' }}>{profile.nom_commerce}</span></> : ''}<br />
              Votre IA est{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
              >
                opérationnelle
              </span>
              <span style={{ color: '#10B981' }}>.</span>
            </>
          ) : (
            <>
              Bienvenue dans BoosterPay.<br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
              >
                Votre IA est en route
              </span>
              <span style={{ color: '#10B981' }}>.</span>
            </>
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[16px] text-gray-500 text-center max-w-lg mx-auto leading-relaxed mb-7"
        >
          {step === 'expired' && 'Votre numéro arrive par email sous 2 minutes.'}
          {step === 'provisioning' && 'Configuration en cours…'}
          {isFormPhase && "Une dernière étape."}
        </motion.p>

        {/* Bloc réassurance post-validation — 3 items en ligne (uniquement phase form) */}
        {isFormPhase && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] text-gray-500 mb-10"
          >
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.8} />
              Opérationnel en 5 minutes
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.8} />
              Annulation en 1 clic
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.8} />
              Support 7j/7
            </span>
          </motion.div>
        )}

        {/* ─── Mini form étape 2 (nom_commerce + code_postal) ─── */}
        {isFormPhase && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-[20px] p-8 md:p-10 mb-8 relative"
            style={{
              border: '1px solid #E5E7EB',
              boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.12), 0 8px 24px -4px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div className="mb-6">
              <h2 className="text-[20px] font-extrabold text-gray-900 tracking-[-0.02em]">
                Finalisez votre profil
              </h2>
              <p className="text-[13.5px] text-gray-500 mt-1.5 leading-relaxed">
                Ces infos personnalisent votre numéro et votre espace.
              </p>
            </div>

            <div className="space-y-4">
              <FieldInline
                label="Nom de votre commerce"
                icon={Store}
                value={profile.nom_commerce}
                onChange={(v) => setField('nom_commerce', v)}
                placeholder="Garage Dupont"
                error={errors.nom_commerce}
                autoComplete="organization"
              />
              <FieldInline
                label="Code postal"
                icon={MapPin}
                value={profile.code_postal}
                onChange={(v) => setField('code_postal', v.replace(/\D/g, '').slice(0, 5))}
                placeholder="69003"
                error={errors.code_postal}
                inputMode="numeric"
                autoComplete="postal-code"
                hint="Pour un numéro local de votre région"
              />
            </div>

            <button
              type="submit"
              disabled={step === 'saving'}
              className="w-full mt-7 inline-flex items-center justify-center gap-2 py-4 rounded-full font-semibold text-[15px] text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: '0 16px 40px -8px rgba(16, 185, 129, 0.45)',
              }}
            >
              {step === 'saving' ? (
                <>Enregistrement…</>
              ) : (
                <>
                  Valider et accéder à mon espace
                  <ArrowRight className="w-4 h-4" strokeWidth={2.4} />
                </>
              )}
            </button>

          </motion.form>
        )}

        {/* ─── PHASE PROVISIONING — animation de configuration ─── */}
        <AnimatePresence>
          {step === 'provisioning' && (
            <motion.div
              key="provisioning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white rounded-[20px] p-8 md:p-10 mb-8 relative"
              style={{
                border: '1px solid #E5E7EB',
                boxShadow:
                  '0 20px 60px -10px rgba(0, 0, 0, 0.12), 0 8px 24px -4px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div className="mb-6 text-center">
                <h2 className="text-[20px] font-extrabold text-gray-900 tracking-[-0.02em] mb-1.5">
                  Configuration de votre standard
                </h2>
                <p className="text-[14px]" style={{ color: '#374151' }}>
                  Votre IA se prépare à décrocher pour vous.
                </p>
              </div>

              {/* Progress bar fine emerald */}
              <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden mb-7">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #10B981, #059669)' }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${(provisioningStep / 3) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>

              {/* 3 steps qui se cochent */}
              <div className="space-y-3">
                <ProvisioningRow
                  done={provisioningStep >= 1}
                  active={provisioningStep === 0}
                  label="Recherche du numéro local idéal"
                />
                <ProvisioningRow
                  done={provisioningStep >= 2}
                  active={provisioningStep === 1}
                  label="Configuration de votre assistant IA"
                />
                <ProvisioningRow
                  done={provisioningStep >= 3}
                  active={provisioningStep === 2}
                  label="Activation du standard 24/7"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── PHASE READY — numéro révélé + tuto + test live ─── */}
        <AnimatePresence>
          {step === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* ════════════════════════════════════════════════════════════
                  SÉQUENCE NARRATIVE APPLE PREMIUM — animations lentes & douces
                  Timing depuis l'entrée en step='ready' :
                    0.0s   → titre + sous-titre + intro section
                    0.7s   → ÉTAPE 1 (Un client appelle)
                    2.2s   → CARD NUMÉRO grandiose (spotlight)
                    3.4s   → numéro lui-même (blur out)
                    4.2s   → explication + bouton Copier
                    5.2s   → ÉTAPE 2 (Votre mobile sonne)
                    6.4s   → ÉTAPE 3 (L'IA prend le relais)
                    7.8s   → bandeau test
                    8.5s   → CTA final
                  Easing : [0.22, 1, 0.36, 1] (smooth Apple iOS)
                  ═══════════════════════════════════════════════════════════ */}

              {/* ════ INTRO SECTION épurée — un seul label discret ════ */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="text-center mb-7"
              >
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: '#9CA3AF' }}>
                  En 3 étapes
                </p>
              </motion.div>

              {/* ─── ÉTAPE 1 ─── (connecteur vertical descendant vers la card numéro) */}
              <motion.div
                initial={{ opacity: 0, y: 32, scale: 0.96, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <FlowStep
                  n={1}
                  icon={PhoneCall}
                  title="Un client appelle"
                  desc="Sur votre numéro dédié."
                  connector="down"
                />
              </motion.div>

              {/* ════ CARD NUMÉRO grandiose — entre étape 1 et étape 2 ════ */}
              {/* Connecteur vertical au-dessus pour relier à l'étape 1 */}
              <motion.div
                aria-hidden="true"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ duration: 0.7, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto"
                style={{
                  width: '2px',
                  height: '24px',
                  background: 'linear-gradient(to bottom, #D1FAE5, #10B981)',
                  marginLeft: '35px',
                  transformOrigin: 'top',
                }}
              />
              <motion.div
                initial={{ opacity: 0, y: 44, scale: 0.84, filter: 'blur(16px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.4, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[24px] p-8 md:p-10 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, #ECFDF5 0%, #F0FDF4 100%)',
                  border: '1.5px solid #10B981',
                  boxShadow:
                    '0 32px 80px -16px rgba(16, 185, 129, 0.35), 0 12px 28px -6px rgba(16, 185, 129, 0.18), 0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              >
                {/* Halo coin ambient */}
                <div
                  className="absolute -top-24 -right-24 w-[320px] h-[320px] rounded-full opacity-30 blur-3xl pointer-events-none"
                  style={{ background: 'radial-gradient(circle, #10B981, transparent 70%)' }}
                  aria-hidden="true"
                />

                {/* Onde concentrique qui se propage UNE FOIS au reveal du numéro */}
                <motion.div
                  className="absolute inset-0 rounded-[24px] pointer-events-none"
                  initial={{ boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' }}
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(16, 185, 129, 0)',
                      '0 0 0 0 rgba(16, 185, 129, 0.5)',
                      '0 0 0 100px rgba(16, 185, 129, 0)',
                    ],
                  }}
                  transition={{ duration: 2, delay: 3.2, ease: 'easeOut' }}
                  aria-hidden="true"
                />

                <div className="relative text-center">
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 3.0, ease: [0.22, 1, 0.36, 1] }}
                    className="text-[10px] font-bold tracking-[0.12em] uppercase mb-4"
                    style={{ color: '#10B981', opacity: 0.85 }}
                  >
                    Votre numéro dédié
                  </motion.p>

                  {/* Numéro en spotlight — soit spinner (en attente), soit le numéro */}
                  <AnimatePresence mode="wait">
                    {numeroVirtuel ? (
                      <motion.div
                        key="numero-revealed"
                        initial={{ opacity: 0, scale: 0.78, filter: 'blur(14px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="text-[34px] sm:text-[42px] md:text-[48px] font-extrabold text-gray-900 leading-none mb-5"
                        style={{
                          fontVariantNumeric: 'tabular-nums',
                          // letter-spacing négatif fin = look Apple Watch / tabular-nums premium
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {formatPhoneFR(numeroVirtuel)}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="numero-loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex items-center justify-center gap-3 mb-5 py-3"
                      >
                        {/* Spinner emerald élégant */}
                        <div
                          className="w-7 h-7 rounded-full animate-spin"
                          style={{
                            border: '3px solid #ECFDF5',
                            borderTopColor: '#10B981',
                          }}
                          aria-hidden="true"
                        />
                        <span className="text-[15px] text-gray-500 font-medium">
                          Attribution en cours…
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Explication — une seule ligne percutante */}
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 4.2, ease: [0.22, 1, 0.36, 1] }}
                    className="text-[14px] text-gray-600 leading-relaxed max-w-md mx-auto mb-5"
                  >
                    {numeroVirtuel ? (
                      <><strong className="text-gray-900">Communiquez-le à vos clients.</strong> L'IA décroche pour vous.</>
                    ) : waitedTooLong ? (
                      <>Votre numéro arrive par email <strong className="text-gray-900">sous quelques minutes</strong>.</>
                    ) : (
                      <>Attribution en cours. <strong className="text-gray-900">Quelques secondes.</strong></>
                    )}
                  </motion.p>

                  {/* Bouton Copier — désactivé tant que le numéro n'est pas reçu */}
                  <motion.button
                    type="button"
                    onClick={handleCopyNumero}
                    disabled={!numeroVirtuel}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 4.5, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={numeroVirtuel ? { y: -2, scale: 1.01 } : {}}
                    whileTap={numeroVirtuel ? { scale: 0.98 } : {}}
                    className="w-full inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[12px] font-bold text-[15px] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      boxShadow: numeroVirtuel
                        ? '0 12px 28px -6px rgba(16, 185, 129, 0.5)'
                        : '0 6px 16px -4px rgba(16, 185, 129, 0.25)',
                    }}
                  >
                    {copyStatus === 'copied' ? (
                      <>
                        <Check className="w-4 h-4" strokeWidth={3} />
                        Numéro copié
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" strokeWidth={2.4} />
                        Copier le numéro
                      </>
                    )}
                  </motion.button>

                  {/* Bouton de secours après 30s sans numéro — accès libre aux modules */}
                  {waitedTooLong && !numeroVirtuel && (
                    <motion.button
                      type="button"
                      onClick={() => {
                        if (commercantId) {
                          navigate('/espace/modules?id=' + encodeURIComponent(commercantId));
                        }
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full inline-flex items-center justify-center gap-2 px-7 py-3 mt-3 rounded-[12px] font-semibold text-[14px] text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-50 transition-all"
                    >
                      Explorer mes modules en attendant
                    </motion.button>
                  )}
                </div>
              </motion.div>

              {/* Connecteur vertical après la card numéro vers étape 2 */}
              <motion.div
                aria-hidden="true"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ duration: 0.7, delay: 5.0, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  width: '2px',
                  height: '24px',
                  background: 'linear-gradient(to bottom, #10B981, #D1FAE5)',
                  marginLeft: '35px',
                  transformOrigin: 'top',
                }}
              />

              {/* ─── ÉTAPE 2 — affiche le mobile perso du commerçant (masqué) ─── */}
              {/*   Le numéro est crucial pour la compréhension : "C'est MON mobile
                   qui sonne, pas un nouveau". On utilise le format masqué
                   "+33 6 ** ** ** 78" reçu du backend (sécurité URL) — si déjà
                   masqué (contient des *), on l'affiche tel quel ; sinon on passe
                   par formatPhoneFR pour un format propre. */}
              <motion.div
                initial={{ opacity: 0, y: 32, scale: 0.96, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.1, delay: 5.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <FlowStep
                  n={2}
                  icon={Smartphone}
                  title="Votre mobile sonne"
                  desc={mobileCommercant ? (
                    <>
                      <strong
                        className="text-gray-900"
                        style={{
                          fontFeatureSettings: '"tnum"',
                          letterSpacing: '0.01em',
                        }}
                      >
                        {String(mobileCommercant).includes('*') ? mobileCommercant : formatPhoneFR(mobileCommercant)}
                      </strong>
                      {' '}— 18 s pour décrocher.
                    </>
                  ) : (
                    <>Votre mobile reçoit l'appel. 18 s pour décrocher.</>
                  )}
                  connector="none"
                />
              </motion.div>

              {/* Connecteur vertical étape 2 → étape 3 */}
              <motion.div
                aria-hidden="true"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ duration: 0.7, delay: 6.2, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  width: '2px',
                  height: '24px',
                  background: 'linear-gradient(to bottom, #D1FAE5, #ECFDF5)',
                  marginLeft: '35px',
                  transformOrigin: 'top',
                }}
              />

              {/* ─── ÉTAPE 3 (dernière, pas de connecteur du bas) ─── */}
              <motion.div
                initial={{ opacity: 0, y: 32, scale: 0.96, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.1, delay: 6.4, ease: [0.22, 1, 0.36, 1] }}
                className="mb-10"
              >
                <FlowStep
                  n={3}
                  icon={Bot}
                  title="L'IA prend le relais"
                  desc="Elle répond et vous envoie un SMS."
                  connector="none"
                />
              </motion.div>

              {/* ════ BANDEAU TEST — affiché uniquement quand le numéro est reçu ════ */}
              <AnimatePresence>
                {numeroVirtuel && (
                  <motion.div
                    key="test-banner"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, delay: 7.8, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-[18px] px-6 py-6 mb-8 text-center"
                    style={{
                      background: 'rgba(16,185,129,0.04)',
                      border: '1.5px solid rgba(16,185,129,0.30)',
                      color: '#065F46',
                      boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 10px 24px rgba(16,185,129,0.10)',
                    }}
                  >
                    <p className="text-[15px] font-bold mb-1 inline-flex items-center justify-center gap-2 flex-wrap">
                      <Smartphone className="w-4 h-4" strokeWidth={2.4} />
                      Testez maintenant
                    </p>
                    <a
                      href={`tel:${numeroVirtuel}`}
                      className="block text-[18px] font-extrabold tracking-tight underline decoration-2 underline-offset-4 hover:no-underline"
                      style={{ color: '#10B981', fontFeatureSettings: '"tnum"' }}
                    >
                      {formatPhoneFR(numeroVirtuel)}
                    </a>
                    <p className="text-[12px] mt-1.5" style={{ color: '#6B7280' }}>
                      Depuis un autre téléphone.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ════ NAVIGATION DANS L'ESPACE — pas de redirect, l'user est chez lui ════ */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 8.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="text-center mb-6">
                  <h3 className="text-[24px] md:text-[26px] font-extrabold text-gray-900 tracking-[-0.025em] leading-tight">
                    À vous de jouer.
                  </h3>
                  <p className="text-[14px] text-gray-500 mt-2 max-w-md mx-auto">
                    6 actions pour que vos clients utilisent votre numéro.
                  </p>
                </div>

                {/* CTA principal — emerald solide, ultra-visible */}
                <Link
                  to={commercantId ? `/espace/modules?id=${encodeURIComponent(commercantId)}#communiquer` : '/espace/modules'}
                  className="group flex items-center gap-4 p-5 rounded-[20px] transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    boxShadow: '0 12px 28px -6px rgba(16, 185, 129, 0.45), 0 2px 6px rgba(0,0,0,0.06)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 16px 36px -8px rgba(16, 185, 129, 0.55), 0 2px 6px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 12px 28px -6px rgba(16, 185, 129, 0.45), 0 2px 6px rgba(0,0,0,0.06)';
                  }}
                >
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'rgba(255,255,255,0.20)',
                      boxShadow: '0 1px 0 rgba(255,255,255,0.3) inset',
                    }}
                  >
                    <Sparkles className="w-5 h-5 text-white" strokeWidth={2.4} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[15.5px] font-bold text-white leading-tight">
                        Communiquer mon nouveau numéro
                      </p>
                    </div>
                    <p className="text-[12.5px] text-white/85 leading-snug">
                      Google Business, signature, site, voiture… La checklist guidée.
                    </p>
                  </div>
                  <ArrowRight
                    className="w-5 h-5 text-white flex-shrink-0 transition-transform group-hover:translate-x-1"
                    strokeWidth={2.4}
                  />
                </Link>

{/* Liens redondants (navigation sidebar + double contact) supprimés
                    pour épuration du flux Bienvenue. Le footer global suffit. */}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── PHASE EXPIRED — fallback si le numéro met trop de temps ─── */}
        <AnimatePresence>
          {step === 'expired' && (
            <motion.div
              key="expired"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className="rounded-[20px] p-8 mb-8 text-center"
                style={{
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)',
                  background: '#ffffff',
                }}
              >
                <Mail className="w-10 h-10 text-emerald-600 mx-auto mb-4" strokeWidth={1.8} />
                <h3 className="text-[18px] font-extrabold text-gray-900 mb-1.5 tracking-[-0.02em]">
                  Votre numéro arrive par email
                </h3>
                <p className="text-[14px] text-gray-500 leading-relaxed">
                  Configuration en cours côté opérateur — vous recevrez votre numéro<br />
                  par email sous 2 minutes (pensez à vérifier vos spams).
                </p>
              </div>

              <div className="text-center">
                <Link
                  to={espaceUrl}
                  className="inline-flex items-center gap-2 text-white font-semibold px-7 py-3.5 rounded-full text-[14.5px] transition-all hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    boxShadow: '0 12px 32px -8px rgba(16, 185, 129, 0.45)',
                  }}
                >
                  Accéder à mon espace
                  <ArrowRight className="w-4 h-4" strokeWidth={2.4} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-14 text-center text-[12.5px] text-gray-500 inline-flex items-center justify-center gap-2 w-full"
        >
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #10B981, #059669)',
              boxShadow: '0 4px 10px rgba(16,185,129,0.30)',
            }}
            aria-hidden
          >
            <Mail className="w-3 h-3 text-white" strokeWidth={2.6} />
          </span>
          Une question ? Écrivez à{' '}
          <a href="mailto:contact@booster-pay.com" className="font-semibold text-gray-700 hover:text-gray-900 transition-colors">
            contact@booster-pay.com
          </a>
        </motion.div>
      </main>
  );

  // ════════ RENDU CONDITIONNEL ════════
  // Phase form/saving : ancien layout (header progress bar Compte → Finalisation)
  // Phase provisioning/ready/expired : layout d'ESPACE (sidebar + nav permanente)
  if (isFormPhase) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-white">
        {ambientOrbs}
        {formHeader}
        {mainContent}
      </div>
    );
  }

  return (
    <EspaceLayout
      nomCommerce={profile.nom_commerce}
      commercantId={commercantId}
      activeSection="bienvenue"
    >
      <div className="relative overflow-hidden min-h-screen bg-white">
        {ambientOrbs}
        {mainContent}
      </div>
    </EspaceLayout>
  );
}

// ─────────────────────────────────────────────────────────────────
function FieldInline({ label, icon: Icon, value, onChange, placeholder, error, inputMode, autoComplete, hint }) {
  const [focused, setFocused] = useState(false);
  const baseStyle = {
    background: '#ffffff',
    border: error ? '1.5px solid #FCA5A5' : focused ? '1.5px solid #10B981' : '1.5px solid #E5E7EB',
    borderRadius: '10px',
    padding: Icon ? '14px 16px 14px 44px' : '14px 16px',
    fontSize: '16px',
    width: '100%',
    color: '#111827',
    boxShadow: focused
      ? (error ? '0 0 0 3px rgba(252, 165, 165, 0.2)' : '0 0 0 3px rgba(16, 185, 129, 0.10)')
      : 'none',
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  };
  return (
    <label className="block">
      <div className="text-[14px] font-medium mb-1.5" style={{ color: '#374151', letterSpacing: 0 }}>{label}</div>
      <div className="relative">
        {Icon && (
          <Icon
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            strokeWidth={2}
            style={{ color: focused ? '#10B981' : '#9CA3AF' }}
          />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          inputMode={inputMode}
          autoComplete={autoComplete}
          style={baseStyle}
        />
      </div>
      {error && <div className="mt-1.5 text-[12px] text-red-600 font-medium">{error}</div>}
      {!error && hint && <div className="mt-1.5 text-[12px] text-gray-400 leading-relaxed">{hint}</div>}
    </label>
  );
}

function Step({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-start gap-4 bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
        <Icon className="w-4 h-4 text-emerald-700" strokeWidth={2.2} />
      </div>
      <div className="flex-1">
        <p className="text-[14px] font-semibold text-gray-900 mb-0.5">{title}</p>
        <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Ligne d'étape pendant la phase de provisioning (configure le numéro)
//  - active : étape en cours → spinner emerald
//  - done   : étape terminée → check vert
//  - else   : étape à venir  → cercle gris
// ─────────────────────────────────────────────────────────────────
function ProvisioningRow({ done, active, label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">
        {done ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 4px 12px -2px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3.2} />
          </motion.div>
        ) : active ? (
          <div className="w-6 h-6 rounded-full border-[2px] border-emerald-200 border-t-emerald-500 animate-spin" />
        ) : (
          <div className="w-6 h-6 rounded-full border-[1.5px] border-gray-200 bg-white" />
        )}
      </div>
      <span
        className="text-[14px] leading-relaxed transition-colors"
        style={{ color: done ? '#111827' : active ? '#111827' : '#9CA3AF', fontWeight: active || done ? 600 : 500 }}
      >
        {label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Card de navigation dans l'espace user — discrète, hover subtil
// ─────────────────────────────────────────────────────────────────
function EspaceNavCard({ to, icon: Icon, title, desc }) {
  return (
    <Link
      to={to}
      className="group block bg-white rounded-2xl p-6 border border-gray-200 hover:border-emerald-500 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.14)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)' }}
        >
          <Icon className="w-5 h-5 text-emerald-700" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-gray-900 tracking-tight leading-snug mb-1 inline-flex items-center gap-1.5">
            {title}
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" strokeWidth={2.4} />
          </p>
          <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Étape du flux narratif — version Apple flow avec connecteur vertical
//  - n      : numéro de l'étape (1, 2, 3)
//  - icon   : icône lucide-react
//  - title  : titre de l'étape
//  - desc   : description courte
//  - connector : 'down' = ligne descendante visible | 'none' = pas de ligne
// ─────────────────────────────────────────────────────────────────
function FlowStep({ n, icon: Icon, title, desc, connector = 'none' }) {
  return (
    <div
      className="relative flex items-start gap-4 bg-white rounded-2xl p-5"
      style={{
        border: '1px solid #E5E7EB',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04), 0 1px 4px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* Connecteur vertical descendant — relie cette étape à la suivante */}
      {connector === 'down' && (
        <div
          aria-hidden="true"
          className="absolute"
          style={{
            left: '35px',
            top: 'calc(100% - 4px)',
            width: '2px',
            height: '24px',
            background: 'linear-gradient(to bottom, #D1FAE5, #ECFDF5)',
          }}
        />
      )}
      <div className="flex-shrink-0 relative">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)' }}
        >
          <Icon className="w-5 h-5 text-emerald-700" strokeWidth={2.2} />
        </div>
        <span className="absolute -top-1.5 -left-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold ring-2 ring-white">
          {n}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14.5px] font-bold text-gray-900 tracking-tight leading-snug mb-0.5">{title}</p>
        <p className="text-[13.5px] text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Étape détaillée verticale — bloc "Comment ça marche" version 2 lignes (legacy)
// ─────────────────────────────────────────────────────────────────
function DetailedStep({ n, icon: Icon, title, desc }) {
  return (
    <div
      className="flex items-start gap-4 bg-white rounded-2xl p-5"
      style={{
        border: '1px solid #E5E7EB',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04), 0 1px 4px rgba(0, 0, 0, 0.03)',
      }}
    >
      <div className="flex-shrink-0 relative">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)' }}
        >
          <Icon className="w-5 h-5 text-emerald-700" strokeWidth={2.2} />
        </div>
        <span className="absolute -top-1.5 -left-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold ring-2 ring-white">
          {n}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14.5px] font-bold text-gray-900 tracking-tight leading-snug mb-0.5">{title}</p>
        <p className="text-[13.5px] text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Carte "Comment ça marche" — version horizontale (legacy, conservée)
// ─────────────────────────────────────────────────────────────────
function HowItWorksStep({ n, icon: Icon, title, desc }) {
  return (
    <div
      className="relative bg-white rounded-2xl p-5 flex flex-col items-center text-center"
      style={{
        border: '1px solid #E5E7EB',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04), 0 1px 4px rgba(0, 0, 0, 0.03)',
      }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
        style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)' }}
      >
        <Icon className="w-5 h-5 text-emerald-700" strokeWidth={2.2} />
      </div>
      <div className="inline-flex items-center gap-1.5 mb-1.5">
        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold">{n}</span>
        <p className="text-[13.5px] font-bold text-gray-900 tracking-tight">{title}</p>
      </div>
      <p className="text-[12.5px] text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Formate un numéro E.164 français en format lisible
//  +33489316691 → "+33 4 89 31 66 91"
//  +33189316691 → "+33 1 89 31 66 91"
// ─────────────────────────────────────────────────────────────────
function formatPhoneFR(raw) {
  if (!raw) return '';
  const cleaned = String(raw).replace(/\s+/g, '');
  // Format E.164 français : +33 X XX XX XX XX
  const m = cleaned.match(/^\+33(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (m) return `+33 ${m[1]} ${m[2]} ${m[3]} ${m[4]} ${m[5]}`;
  // Format 0X XX XX XX XX
  const m2 = cleaned.match(/^0(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (m2) return `0${m2[1]} ${m2[2]} ${m2[3]} ${m2[4]} ${m2[5]}`;
  return cleaned;
}

// ─────────────────────────────────────────────────────────────────
//  Legacy flow — ancienne page (validation CB 0.50€ pour essai gratuit)
// ─────────────────────────────────────────────────────────────────
function LegacyConfirmation() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Phone className="w-6 h-6 text-blue-500" />
          <span className="text-xl font-bold text-gray-900">
            Booster<span className="text-blue-500">Pay</span>
          </span>
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mx-auto mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-200">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4"
        >
          Merci !
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xl text-gray-500 mb-8 leading-relaxed"
        >
          Votre carte a bien été vérifiée.
          <br />
          Le prélèvement de 0,50€ sera remboursé sous quelques minutes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-4 mb-10"
        >
          <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-5 text-left">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Remboursement automatique</p>
              <p className="text-sm text-gray-500">Les 0,50€ de vérification sont remboursés automatiquement sous quelques minutes.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-5 text-left">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Vous serez notifié à 80% de l'essai</p>
              <p className="text-sm text-gray-500">Transparence totale — vous gardez le contrôle, sans surprise.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-4"
        >
          <p className="text-sm text-gray-400">
            Notre équipe vous contactera sous 24h pour activer votre service.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gray-900 text-white font-semibold px-8 py-4 rounded-full hover:bg-gray-800 transition-colors"
          >
            Retour à l'accueil
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-12 text-xs text-gray-300"
        >
          Une question ? Contactez-nous à contact@booster-pay.com
        </motion.p>
      </div>
    </div>
  );
}
