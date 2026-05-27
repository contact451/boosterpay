// ─────────────────────────────────────────────────────────────────
//  SignupModal — Modal d'inscription IA Vocale (essai 7 jours)
//
//  Version ULTRA MINIMALE — uniquement le formulaire centré.
//  Décision conversion : pas de colonne marketing, l'utilisateur arrive
//  ici APRÈS avoir lu la landing → il n'a plus besoin d'être convaincu,
//  il a besoin d'un formulaire qui ne le fait pas réfléchir.
//
//  Architecture :
//   - Backdrop blur sombre cliquable
//   - Card centrée, max-w 460px, rounded 24px
//   - 3 champs + CTA + réassurance + live activity
//   - Scroll lock body
//   - Échappe (Esc) + click outside ferment
//   - Focus auto sur le 1er champ
//
//  La route /inscription-trial reste accessible pour les ads payantes.
// ─────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Sparkles, Shield, X } from 'lucide-react';

const STRIPE_API_URL = import.meta.env.VITE_STRIPE_API_URL
  || 'https://boosterpay-stripe-server-production.up.railway.app';

function normalizeMobileFR(raw) {
  if (!raw) return '';
  const cleaned = String(raw).replace(/[\s\.\-()_]/g, '');
  if (/^0[67]\d{8}$/.test(cleaned)) return '+33' + cleaned.slice(1);
  if (/^\+33[67]\d{8}$/.test(cleaned)) return cleaned;
  if (/^33[67]\d{8}$/.test(cleaned)) return '+' + cleaned;
  return null;
}

function isValidEmail(email) {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
}

export default function SignupModal({ isOpen, onClose, source = 'modal', planIntent = 'gratuit' }) {
  const [form, setForm] = useState({ nom: '', email: '', mobile: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const firstFieldRef = useRef(null);

  // Compteur live signups — semi-stable par jour (8 à 18)
  const liveSignupsToday = useMemo(() => {
    const d = new Date();
    const seed = d.getFullYear() * 1000 + (d.getMonth() + 1) * 31 + d.getDate();
    return 8 + (seed % 11);
  }, []);

  // Body scroll lock + focus auto + Escape
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handler);
    const focusTimer = setTimeout(() => firstFieldRef.current?.focus(), 380);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handler);
      clearTimeout(focusTimer);
    };
  }, [isOpen, onClose]);

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setGlobalError('');
  }

  function validate() {
    const errs = {};
    if (!form.nom.trim()) errs.nom = 'Votre nom est requis.';
    if (!isValidEmail(form.email.trim())) errs.email = 'Email invalide.';
    const mobileE164 = normalizeMobileFR(form.mobile);
    if (!mobileE164) errs.mobile = 'Mobile français invalide (format 06 XX XX XX XX).';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;
    setSubmitting(true);
    setGlobalError('');
    try {
      const payload = {
        nom: form.nom.trim(),
        email: form.email.trim().toLowerCase(),
        mobile: normalizeMobileFR(form.mobile),
        // nom_commerce + code_postal collectés à l'étape 2 (post-paiement /merci)
        nom_commerce: '',
        code_postal: '',
        utm_source: source,
        utm_campaign: planIntent,
      };
      const res = await fetch(`${STRIPE_API_URL}/api/create-subscription-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      // Tente de parser le JSON même si HTTP non-2xx (le serveur renvoie {error: "..."})
      let data = null;
      try {
        data = await res.json();
      } catch (parseErr) {
        console.warn('[SignupModal] JSON parse failed', parseErr);
      }
      if (!res.ok || !data?.checkout_url) {
        const serverMsg = data?.error || `Erreur serveur (HTTP ${res.status}). Réessayez dans quelques instants.`;
        setGlobalError(serverMsg);
        setSubmitting(false);
        return;
      }
      window.location.href = data.checkout_url;
    } catch (err) {
      // Erreur réseau / CORS / DNS — le fetch n'a pas pu obtenir de réponse
      console.error('[SignupModal] erreur réseau :', err);
      setGlobalError("Connexion impossible avec le serveur de paiement. Vérifiez votre connexion et réessayez.");
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="signup-modal-root"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          aria-modal="true"
          role="dialog"
          aria-label="Inscription à l'essai BoosterPay"
        >
          {/* Backdrop — bleu nuit profond, pas de blur (Apple/Stripe style) */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'rgba(15, 23, 42, 0.78)',
            }}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal card centrée — ultra minimal */}
          <motion.div
            className="relative w-full max-w-[460px] max-h-[94vh] overflow-y-auto rounded-[24px] bg-white"
            style={{
              boxShadow: '0 40px 100px -20px rgba(15, 23, 42, 0.45), 0 16px 40px -8px rgba(15, 23, 42, 0.14)',
            }}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Close button — discret, n'invite pas à quitter */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="absolute top-3 right-3 z-20 inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-150"
              style={{ opacity: 0.6 }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
            >
              <X className="w-3.5 h-3.5" strokeWidth={2.2} style={{ color: '#9CA3AF' }} />
            </button>

            <div className="px-7 pt-9 pb-7 sm:px-9 sm:pt-10 sm:pb-8">
              {/* Badge essai 7 jours */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[10.5px] font-bold tracking-[0.12em] uppercase text-emerald-700 mb-5">
                <Sparkles className="w-3 h-3" strokeWidth={2.4} />
                Essai 7 jours · Sans engagement
              </div>

              {/* Titre OUTCOME — projette dans le résultat sans ambigüité sur le déclencheur */}
              <h2 className="text-[26px] sm:text-[28px] font-extrabold text-gray-900 tracking-[-0.025em] leading-[1.1]">
                Vos appels manqués deviennent{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
                >
                  des clients
                </span>
                <span style={{ color: '#10B981' }}>.</span>
              </h2>
              <p className="text-[13.5px] text-gray-500 mt-2 leading-relaxed">
                L'IA répond uniquement quand vous ne pouvez pas. <span className="font-semibold text-gray-700">0€ pendant 7 jours.</span>
              </p>

              {/* ─── Formulaire ─── */}
              <form onSubmit={handleSubmit} aria-label="Formulaire d'inscription BoosterPay" className="mt-6">
                <div className="space-y-3.5">
                  <ModalField
                    label="Votre nom"
                    name="nom"
                    value={form.nom}
                    onChange={(v) => setField('nom', v)}
                    placeholder="Marc Dupont"
                    error={errors.nom}
                    autoComplete="name"
                    disabled={submitting}
                    inputRef={firstFieldRef}
                  />
                  <ModalField
                    label="Votre email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={(v) => setField('email', v)}
                    placeholder="vous@exemple.fr"
                    error={errors.email}
                    autoComplete="email"
                    disabled={submitting}
                  />
                  <ModalField
                    label="Votre mobile"
                    name="mobile"
                    type="tel"
                    value={form.mobile}
                    onChange={(v) => setField('mobile', v)}
                    placeholder="06 12 34 56 78"
                    error={errors.mobile}
                    autoComplete="tel"
                    disabled={submitting}
                  />
                </div>

                {globalError && (
                  <div className="mt-4 rounded-xl bg-red-50 border border-red-200/60 px-3.5 py-2.5 text-[12.5px] text-red-700">
                    {globalError}
                  </div>
                )}

                {/* Live activity dot pulsé */}
                <div className="mt-5 flex items-center justify-center gap-2 text-[12.5px] text-gray-500">
                  <span className="relative inline-flex w-2 h-2">
                    <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
                  </span>
                  <span>
                    <strong className="text-gray-900 font-bold">{liveSignupsToday} professionnels</strong> ont créé leur compte aujourd'hui
                  </span>
                </div>

                {/* CTA */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-4 inline-flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-[15px] text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 hover:scale-[1.02] hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    boxShadow: '0 16px 40px -8px rgba(16, 185, 129, 0.45)',
                  }}
                >
                  {submitting ? (
                    <>
                      <Spinner />
                      Préparation…
                    </>
                  ) : (
                    <>
                      Continuer
                      <ArrowRight className="w-4 h-4" strokeWidth={2.4} />
                    </>
                  )}
                </button>

                {/* Réassurance 3 items en ligne */}
                <div className="mt-3.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11.5px] text-gray-500 leading-relaxed">
                  <span className="inline-flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" strokeWidth={2.6} />
                    Annulation en 1 clic
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" strokeWidth={2.6} />
                    0€ avant le 8e jour
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" strokeWidth={2.6} />
                    Sans engagement
                  </span>
                </div>

              </form>

              {/* Footer micro 1 ligne — trust + légal fusionnés */}
              <p className="mt-3 text-center text-[11px] text-gray-400 leading-relaxed inline-flex items-center justify-center gap-1.5 w-full">
                <Shield className="w-2.5 h-2.5" strokeWidth={2.4} />
                Sécurisé Stripe ·{' '}
                <Link to="/cgv" className="hover:text-gray-600 hover:underline" onClick={onClose}>CGV</Link>
                {' '}·{' '}
                <Link to="/politique-confidentialite" className="hover:text-gray-600 hover:underline" onClick={onClose}>Confidentialité</Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────
function ModalField({ label, name, value, onChange, placeholder, error, type = 'text', autoComplete, disabled, inputRef }) {
  return (
    <label className="block">
      <div className="text-[12.5px] font-medium mb-1.5" style={{ color: '#374151' }}>{label}</div>
      <input
        ref={inputRef}
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className={`w-full px-3.5 py-3 rounded-xl bg-gray-50 border text-[14.5px] text-gray-900 placeholder:text-gray-400 transition-all
          ${error
            ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-200/50'
            : 'border-gray-200/80 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15'}
          focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed`}
        style={{ fontSize: 16 }}
      />
      {error && <div className="mt-1 text-[11.5px] text-red-600 font-medium">{error}</div>}
    </label>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
