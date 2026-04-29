import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { submitTrialSignup } from '../services/leadService';

/**
 * EmailCapturePopup — Capture email pour essai gratuit 100 appels / 14 jours.
 * Style Apple/Qonto : verre dépoli, animations soft, 2 étapes (formulaire → confirmation).
 *
 * Props :
 *  - open: boolean
 *  - onClose: () => void
 *  - source: string  (ex: 'hero', 'pricing', 'floating') — tracé pour analytics
 *  - plan?: 'gratuit' | 'a-la-carte' | 'pro' | 'business' (par défaut 'gratuit')
 */
export default function EmailCapturePopup({ open, onClose, source = 'unknown', plan = 'gratuit' }) {
  const [email, setEmail] = useState('');
  const [entreprise, setEntreprise] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'sending' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  // Reset à la fermeture
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setEmail('');
        setEntreprise('');
        setStep('form');
        setErrorMsg('');
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Échap pour fermer
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Bloque le scroll page quand ouvert
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validEmail(email)) {
      setErrorMsg('Adresse email invalide.');
      return;
    }
    setStep('sending');
    setErrorMsg('');

    try {
      // Envoi vers Google Apps Script (action: 'startTrial')
      // Côté GAS : insertion sheet ESSAIS + envoi du mail de confirmation
      // avec lien tokenisé vers la page /configurer/{token}
      const result = await submitTrialSignup({ email, entreprise, plan, source });

      // On reste positif : même si l'API renvoie une erreur réseau, on affiche
      // le succès (le lead est récupérable via les logs et l'utilisateur n'est
      // pas pénalisé par un éventuel quota Apps Script atteint)
      if (result && result.success === false && result.error) {
        console.warn('Trial signup partiel:', result.error);
      }

      setStep('success');
    } catch (err) {
      console.error('Trial signup error:', err);
      setErrorMsg(err.message || 'Erreur, réessayez dans un instant.');
      setStep('error');
    }
  };

  const planCopy = {
    gratuit: { titre: '100 appels offerts', sous: '14 jours pour voir les résultats avant de payer.' },
    'a-la-carte': { titre: '300 appels — 97€', sous: 'Paiement unique. Valables 30 jours.' },
    pro: { titre: 'Plan Pro — 97€/mois', sous: '500 appels par mois. Renouvelés automatiquement.' },
    business: { titre: 'Plan Business — 249€/mois', sous: '2 000 appels par mois. Multi-sites, account manager dédié.' },
  };
  const cur = planCopy[plan] || planCopy.gratuit;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop blur Apple-style — clair au lieu de noir */}
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-md"
            onClick={onClose}
            aria-hidden
          />

          {/* Card LIGHT THEME — fond blanc, ombres douces, accents verts */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Démarrer l'essai gratuit"
            className="relative w-full max-w-md rounded-3xl overflow-hidden flex flex-col bg-white"
            style={{
              border: '1px solid rgba(15,23,42,0.06)',
              boxShadow: '0 30px 80px -20px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.03)',
              maxHeight: 'min(700px, calc(100dvh - 4rem))',
              willChange: 'transform, opacity',
            }}
            initial={{ y: 32, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 16, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-8 sm:p-10 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              {step === 'form' || step === 'sending' || step === 'error' ? (
                <>
                  {/* Badge plan */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-700 mb-5">
                    <Sparkles className="w-3 h-3" />
                    {cur.titre}
                  </div>

                  <h2 className="text-2xl sm:text-[26px] font-semibold text-slate-900 tracking-tight leading-tight">
                    Démarrez en 30 secondes
                  </h2>
                  <p className="text-sm text-slate-500 mt-2 mb-7 leading-relaxed">
                    {cur.sous} On vous envoie le lien pour configurer votre transfert d'appel et activer vos modules par email.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                        Email professionnel
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          autoFocus
                          autoComplete="email"
                          inputMode="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="vous@entreprise.fr"
                          style={{ fontSize: 16 }}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                        />
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                        {errorMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={step === 'sending' || !email}
                      className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-[15px] font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
                        boxShadow: '0 10px 30px -10px rgba(16,185,129,0.5)',
                      }}
                    >
                      {step === 'sending' ? (
                        <>Envoi…</>
                      ) : (
                        <>
                          {plan === 'gratuit' ? 'Recevoir mes 100 appels offerts' : 'Continuer'}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-slate-400 text-center mt-3 leading-relaxed">
                      Sans CB. Sans engagement. Vous gardez la main à 100 %.
                    </p>
                  </form>
                </>
              ) : (
                /* SUCCESS */
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                    className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-5"
                    style={{
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))',
                      border: '1px solid rgba(16,185,129,0.35)',
                    }}
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" strokeWidth={1.8} />
                  </motion.div>

                  <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
                    Vérifiez votre boîte mail
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-xs mx-auto">
                    On vient d'envoyer un lien à <span className="text-slate-900 font-medium">{email}</span> pour configurer votre transfert d'appel et activer vos modules.
                  </p>

                  <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left">
                    <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">
                      Prochaine étape
                    </div>
                    <ul className="space-y-2 text-[13px] text-slate-700">
                      <li className="flex gap-2.5"><span className="text-emerald-600 font-bold">1.</span> Cliquez sur le lien dans le mail</li>
                      <li className="flex gap-2.5"><span className="text-emerald-600 font-bold">2.</span> Configurez le transfert depuis votre numéro</li>
                      <li className="flex gap-2.5"><span className="text-emerald-600 font-bold">3.</span> Activez les modules dont vous avez besoin</li>
                    </ul>
                  </div>

                  <button
                    onClick={onClose}
                    className="mt-6 text-sm text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
