// ─────────────────────────────────────────────────────────────────
//  ServicePageTemplate — Template Apple ultra-premium pour les 6
//  pages services dédiées (/services/[id]).
//
//  Structure :
//   1. Header navigation minimal
//   2. Hero — Badge catégorie + Icône + Titre géant + Sous-titre + Stats inline
//   3. Visual produit (mock animé, optionnel)
//   4. "Comment ça marche" — 3 étapes Apple-style
//   5. Bénéfices détaillés (grid 2 cols)
//   6. CTA final massif dark
//   7. Autres services à découvrir
//
//  Toutes les pages partagent ce layout, seules les données changent.
// ─────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';

const TRIAL_INSCRIPTION_URL = '/inscription-trial';

const COLOR_VARIANTS = {
  amber:   { grad: 'from-amber-500 to-orange-500',   bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200/60',   shadow: 'shadow-amber-500/25', hex: '#F59E0B' },
  emerald: { grad: 'from-emerald-500 to-teal-400',   bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/60', shadow: 'shadow-emerald-500/25', hex: '#10B981' },
  blue:    { grad: 'from-blue-500 to-indigo-500',    bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200/60',    shadow: 'shadow-blue-500/25', hex: '#3B82F6' },
  yellow:  { grad: 'from-yellow-400 to-amber-400',   bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200/60',  shadow: 'shadow-yellow-500/25', hex: '#EAB308' },
  rose:    { grad: 'from-rose-500 to-pink-500',      bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200/60',    shadow: 'shadow-rose-500/25', hex: '#F43F5E' },
  violet:  { grad: 'from-violet-500 to-purple-500',  bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200/60',  shadow: 'shadow-violet-500/25', hex: '#8B5CF6' },
};

export default function ServicePageTemplate({ service }) {
  const color = COLOR_VARIANTS[service.color] || COLOR_VARIANTS.amber;
  const Icon = service.icon;

  useEffect(() => {
    document.title = `${service.title.split('.')[0]} — BoosterPay`;
    window.scrollTo(0, 0);
  }, [service.id, service.title]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header minimal */}
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-[14.5px] text-gray-600 hover:text-gray-900 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            Retour à BoosterPay
          </Link>
          <Link
            to={TRIAL_INSCRIPTION_URL}
            className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
          >
            Démarrer mon essai 7 jours
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.4} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-[0.06] blur-3xl"
            style={{ background: `radial-gradient(circle, ${color.hex}, transparent 70%)` }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${color.bg} border ${color.border} text-[11.5px] font-semibold tracking-[0.08em] uppercase ${color.text} mb-7`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
            {service.badge}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="flex justify-center mb-7"
          >
            <div className={`inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br ${color.grad} items-center justify-center shadow-2xl ${color.shadow}`}>
              <Icon className="w-10 h-10 text-white" strokeWidth={1.6} />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="text-[40px] sm:text-[56px] md:text-[68px] font-semibold tracking-[-0.03em] text-gray-900 leading-[1.02] mb-5"
          >
            {service.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            className="text-[18px] md:text-[21px] text-gray-500 leading-[1.55] max-w-2xl mx-auto"
          >
            {service.subtitle}
          </motion.p>

          {service.stats && service.stats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.28 }}
              className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto"
            >
              {service.stats.map((s, i) => (
                <div key={i} className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-5">
                  <div className={`text-[28px] md:text-[32px] font-semibold tracking-tight ${color.text} leading-none`}>
                    {s.value}
                  </div>
                  <div className="text-[11.5px] font-medium text-gray-500 mt-2 tracking-wide">
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.38 }}
            className="mt-12"
          >
            <Link
              to={TRIAL_INSCRIPTION_URL}
              className={`inline-flex items-center gap-2 bg-gradient-to-r ${color.grad} text-white font-semibold px-7 py-3.5 rounded-full text-[15px] hover:shadow-2xl ${color.shadow} hover:scale-[1.02] transition-all`}
            >
              Démarrer mon essai 7 jours
              <ArrowRight className="w-4 h-4" strokeWidth={2.4} />
            </Link>
            <p className="mt-3 text-[12.5px] text-gray-400">
              7 jours gratuits · Annulation libre · Aucun débit avant le 8e jour
            </p>
          </motion.div>
        </div>
      </section>

      {/* Visual produit optionnel */}
      {service.visual && (
        <section className="relative pb-12 md:pb-20">
          <div className="max-w-5xl mx-auto px-6">
            {service.visual}
          </div>
        </section>
      )}

      {/* Comment ça marche */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-white via-gray-50/40 to-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-[28px] md:text-[40px] font-semibold tracking-[-0.025em] text-gray-900 leading-tight">
              Comment ça marche
            </h2>
            <p className="text-[16px] text-gray-500 mt-3">Trois étapes. Zéro friction.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 lg:gap-7">
            {service.howItWorks.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-15%' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative bg-white rounded-3xl border border-gray-100 p-7 lg:p-8"
              >
                <div className={`absolute -top-3 left-7 inline-flex w-7 h-7 rounded-full bg-gradient-to-br ${color.grad} items-center justify-center text-white text-[12px] font-bold shadow-md`}>
                  {i + 1}
                </div>
                <h3 className="text-[18px] font-semibold text-gray-900 mb-2 mt-2 leading-tight">
                  {step.title}
                </h3>
                <p className="text-[14px] text-gray-500 leading-[1.6]">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bénéfices */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-[28px] md:text-[40px] font-semibold tracking-[-0.025em] text-gray-900 leading-tight">
              Ce que ça change pour vous
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {service.benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
                className="flex items-start gap-3 bg-gray-50 rounded-2xl p-5"
              >
                <div className={`flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br ${color.grad} flex items-center justify-center mt-0.5`}>
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.8} />
                </div>
                <p className="text-[14.5px] text-gray-700 leading-relaxed">
                  {benefit}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final dark Apple */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20%' }}
            transition={{ duration: 0.6 }}
            className="relative rounded-[32px] overflow-hidden bg-gray-900 p-10 md:p-16"
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                backgroundImage: `radial-gradient(circle at 30% 20%, ${color.hex}55, transparent 50%)`,
              }}
            />
            <div className="relative">
              <Sparkles className="w-7 h-7 text-white/70 mx-auto mb-5" strokeWidth={1.8} />
              <h2 className="text-[32px] md:text-[44px] font-semibold tracking-[-0.025em] text-white leading-[1.05] mb-4">
                Prêt à essayer ?
              </h2>
              <p className="text-[16px] md:text-[18px] text-white/60 leading-relaxed mb-8 max-w-lg mx-auto">
                7 jours gratuits, annulation en 1 clic. Aucun débit avant le 8e jour.
              </p>
              <Link
                to={TRIAL_INSCRIPTION_URL}
                className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-7 py-3.5 rounded-full text-[15px] hover:bg-gray-100 transition-colors"
              >
                Tester gratuitement 7 jours — rien débité avant
                <ArrowRight className="w-4 h-4" strokeWidth={2.4} />
              </Link>
              <p className="mt-4 text-[12.5px] text-white/40">
                ⭐ 4,8/5 · +250 professionnels nous font confiance
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Autres services */}
      {service.otherServices && service.otherServices.length > 0 && (
        <section className="relative pb-24 md:pb-32">
          <div className="max-w-5xl mx-auto px-6">
            <h3 className="text-[20px] md:text-[24px] font-semibold text-gray-900 mb-7 tracking-tight">
              Découvrez aussi
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {service.otherServices.map((s) => (
                <Link
                  key={s.id}
                  to={`/services/${s.id}`}
                  className="group block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-900/[0.05] hover:-translate-y-1 transition-all"
                >
                  <p className="text-[14.5px] font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                    {s.title}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-gray-500 group-hover:text-gray-900 transition-colors">
                    Voir <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer minimal */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <Link to="/" className="text-[14px] font-semibold text-gray-900">
            BoosterPay
          </Link>
          <p className="mt-2 text-[12px] text-gray-400">
            L'IA vocale qui décroche, relance, qualifie et convertit — automatiquement.
          </p>
        </div>
      </footer>
    </div>
  );
}
