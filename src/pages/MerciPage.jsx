import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Shield, Mail, Phone, Sparkles, Calendar, Check, MapPin, Store } from 'lucide-react';

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
  const espaceUrl = commercantId ? `/configurer?id=${encodeURIComponent(commercantId)}` : '/configurer';
  const [profile, setProfile] = useState({ nom_commerce: '', code_postal: '' });
  const [step, setStep] = useState('form'); // 'form' | 'saving' | 'done' | 'skipped'
  const [errors, setErrors] = useState({});

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
      setStep('skipped');
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
      setStep('done');
    } catch (err) {
      console.warn('[MerciPage] update profile failed:', err);
      // On marque done quand même — l'info sera demandée plus tard via l'espace
      setStep('done');
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Ambient orbs verts cohérence landing */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] rounded-full opacity-[0.07] blur-3xl"
             style={{ background: 'radial-gradient(ellipse, #10B981 0%, transparent 60%)' }} />
        <div className="absolute top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.06] blur-3xl"
             style={{ background: 'radial-gradient(circle, #059669, transparent 70%)' }} />
      </div>

      {/* Header sticky avec barre de progression — étape 2 active */}
      <header className="relative z-30 border-b border-gray-100/80 bg-white/85 backdrop-blur-xl sticky top-0">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="text-gray-900 font-bold text-[14px] tracking-tight">
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

      <main className="relative max-w-2xl mx-auto px-6 py-12 md:py-16">

        {/* Icône check + Titre + Sous-titre */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="flex justify-center mb-8"
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl"
               style={{
                 background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                 boxShadow: '0 16px 40px -8px rgba(16, 185, 129, 0.45)',
               }}>
            <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.2} />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[34px] md:text-[44px] font-extrabold tracking-[-0.03em] text-gray-900 text-center leading-[1.05] mb-4"
        >
          Paiement validé.<br />
          <span className="text-emerald-600">Votre IA est activée</span>
          <span style={{ color: '#10B981' }}>.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[17px] text-gray-500 text-center max-w-lg mx-auto leading-relaxed mb-10"
        >
          {step === 'done'
            ? 'Profil complété. Tout est prêt — votre numéro arrive par email.'
            : 'Plus qu\'un dernier détail pour personnaliser votre espace.'}
        </motion.p>

        {/* ─── Mini form étape 2 (nom_commerce + code_postal) ─── */}
        {step !== 'done' && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-7 md:p-8 mb-8"
            style={{
              boxShadow: '0 30px 80px -20px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(16, 185, 129, 0.1)',
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

            <button
              type="button"
              onClick={() => setStep('done')}
              className="w-full mt-3 text-center text-[13px] text-gray-500 hover:text-gray-900 font-medium transition-colors"
            >
              Plus tard
            </button>
          </motion.form>
        )}

        {/* ─── Étape 2 terminée : 3 cards explicatives + CTA espace ─── */}
        {step === 'done' && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 mb-10"
            >
              <Step
                icon={Phone}
                title="Votre numéro BoosterPay arrive par email"
                desc="Sous 2 minutes — vérifiez votre boîte (et vos spams au besoin)."
              />
              <Step
                icon={Sparkles}
                title="7 jours pour tester sans risque"
                desc="L'IA décroche 24/7 à votre place. Annulation libre dans votre espace."
              />
              <Step
                icon={Calendar}
                title="Premier débit le 8e jour si vous restez"
                desc="99 € HT/mois. Pas de surprise — vous serez prévenu 48h avant."
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
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
            </motion.div>
          </>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-14 text-center text-[12px] text-gray-400"
        >
          Une question ? Écrivez à <a href="mailto:contact@booster-pay.com" className="underline hover:text-gray-700">contact@booster-pay.com</a>
        </motion.p>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
function FieldInline({ label, icon: Icon, value, onChange, placeholder, error, inputMode, autoComplete, hint }) {
  return (
    <label className="block">
      <div className="text-[11.5px] font-bold text-gray-700 mb-1.5 tracking-tight uppercase">{label}</div>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          autoComplete={autoComplete}
          style={{ fontSize: 16 }}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl bg-gray-50 border text-[15px] text-gray-900 placeholder:text-gray-400 transition-all
            ${error
              ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-200/50'
              : 'border-gray-200/80 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15'}
            focus:outline-none`}
        />
      </div>
      {error && <div className="mt-1.5 text-[12px] text-red-600 font-medium">{error}</div>}
      {!error && hint && <div className="mt-1.5 text-[11.5px] text-gray-400 leading-relaxed">{hint}</div>}
    </label>
  );
}

function Step({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-start gap-4 bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
        <Icon className="w-4.5 h-4.5 text-emerald-700" strokeWidth={2.2} />
      </div>
      <div className="flex-1">
        <p className="text-[14px] font-semibold text-gray-900 mb-0.5">{title}</p>
        <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
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
