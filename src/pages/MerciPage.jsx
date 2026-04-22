import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Shield, Mail, Phone } from 'lucide-react';

export default function MerciPage() {
  useEffect(() => {
    document.title = 'Merci ! Votre essai est activé | BoosterPay';
  }, []);

  useEffect(() => {
    // Notify CRM that card was registered
    const urlParams = new URLSearchParams(window.location.search);
    const CRM_API_URL = 'https://script.google.com/macros/s/AKfycbztp_6rllQCg2MPXrrWOyudvaGcUlIdG6pZdVQjpU7-Z-8_3brmGHqoD2nrlCv0mMYe/exec';

    fetch(CRM_API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'cardRegistered',
        sessionId: urlParams.get('session_id') || '',
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">

        {/* BoosterPay Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Phone className="w-6 h-6 text-blue-500" />
          <span className="text-xl font-bold text-gray-900">
            Booster<span className="text-blue-500">Pay</span>
          </span>
        </div>

        {/* Success icon */}
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

        {/* Title */}
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
          Votre empreinte bancaire a bien été enregistrée.
          <br />
          Votre essai gratuit est maintenant actif.
        </motion.p>

        {/* Reassurance cards */}
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
              <p className="text-sm font-semibold text-gray-900">Aucun prélèvement immédiat</p>
              <p className="text-sm text-gray-500">Votre carte est enregistrée mais ne sera débitée qu'à la fin de votre essai.</p>
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

        {/* CTA */}
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

        {/* Footer */}
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
