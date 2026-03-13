import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, FileText, Hash, ArrowLeft } from 'lucide-react';
import DebtorLayout, { useIsMobile } from './components/DebtorLayout';

const ease = [0.22, 1, 0.36, 1];

export default function PaiementConfirmePage() {
  const [params] = useSearchParams();
  const id = params.get('id') || '';
  const ref = params.get('ref') || '';
  const isMobile = useIsMobile();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <DebtorLayout>
      {/* Icône animée */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="flex justify-center mb-6"
      >
        <div className="relative">
          {!isMobile && (
            <motion.div
              className="absolute inset-0 rounded-full bg-green-500/20 blur-xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          )}
          <motion.div
            className="relative w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center"
            animate={isMobile ? {} : { y: [-3, 3, -3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <CheckCircle className="w-10 h-10 text-green-400" />
          </motion.div>
        </div>
      </motion.div>

      {/* Titre */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease }}
        className="text-center mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Paiement confirmé !
        </h1>
        <p className="text-sm text-gray-400">
          Merci, votre règlement a bien été pris en compte.
        </p>
      </motion.div>

      {/* Card récapitulative */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5, ease }}
        className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 md:p-6 mb-6 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent rounded-2xl pointer-events-none" />
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Récapitulatif
        </h2>

        {ref && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.6, ease }}
            className="flex items-center justify-between py-2.5 border-b border-white/[0.06]"
          >
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <FileText className="w-3.5 h-3.5 text-gray-600" />
              Référence facture
            </div>
            <span className="text-sm font-semibold text-white">{ref}</span>
          </motion.div>
        )}

        {id && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.7, ease }}
            className="flex items-center justify-between py-2.5 border-b border-white/[0.06]"
          >
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Hash className="w-3.5 h-3.5 text-gray-600" />
              N° de dossier
            </div>
            <span className="text-sm font-semibold text-white font-mono">{id}</span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.8, ease }}
          className="flex items-center justify-between py-2.5"
        >
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <CheckCircle className="w-3.5 h-3.5 text-gray-600" />
            Statut
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
            Réglé
          </span>
        </motion.div>
      </motion.div>

      {/* Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="text-center text-sm text-gray-400 mb-6"
      >
        Un email de confirmation vous sera envoyé sous quelques minutes.
      </motion.p>

      {/* Bouton retour */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1, ease }}
        className="flex justify-center"
      >
        <a
          href="https://www.booster-pay.com"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white text-sm font-semibold hover:bg-white/[0.07] hover:border-white/[0.15] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </a>
      </motion.div>
    </DebtorLayout>
  );
}
