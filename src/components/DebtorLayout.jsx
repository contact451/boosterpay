import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return scrolled;
}

export function AnimatedBackground() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#0a0f1a] to-[#050608]" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 150% 80% at 50% 0%, rgba(59,130,246,0.2) 0%, transparent 50%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 120% 60% at 50% 100%, rgba(139,92,246,0.15) 0%, transparent 40%)' }} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#0a0f1a] to-[#050608]" />
      <motion.div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 100% 60% at 50% 10%, rgba(59,130,246,0.25) 0%, transparent 55%)' }}
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 80% 70%, rgba(139,92,246,0.2) 0%, transparent 50%)' }}
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 90% 40% at 10% 80%, rgba(6,182,212,0.15) 0%, transparent 45%)' }}
        animate={{ opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 60%)', filter: 'blur(80px)' }}
        animate={{ scale: [1, 1.1, 1], y: [0, -15, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 60%)', filter: 'blur(60px)' }}
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

export default function DebtorLayout({ children }) {
  const scrolled = useScrolled();

  return (
    <div className="min-h-screen text-white">
      <AnimatedBackground />

      {/* Header */}
      <header className={`sticky top-0 z-20 px-4 md:px-8 py-4 transition-all duration-300 ${
        scrolled ? 'bg-[#0a0f1a]/80 backdrop-blur-lg border-b border-white/[0.06]' : 'border-b border-transparent'
      }`}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-lg font-bold tracking-tight">
              Booster<span className="text-blue-500">Pay</span>
            </Link>
            <a
              href="https://www.booster-pay.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-blue-400 transition-colors group"
            >
              <span className="hidden sm:inline text-gray-500 group-hover:text-blue-400 transition-colors">Récupérez vos impayés</span>
              <span className="sm:hidden text-gray-500 group-hover:text-blue-400 transition-colors">BoosterPay Pro</span>
              <svg className="w-3 h-3 text-gray-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/[0.04] border border-white/[0.08] rounded-full px-3 py-1.5">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <Lock className="w-3 h-3 shrink-0" />
            Espace sécurisé
          </div>
        </div>
      </header>


      {/* Main */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 py-8 md:py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-white/[0.06] px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pb-4 border-b border-white/[0.06]">
            {['🇫🇷 Hébergé en France', '🔒 Chiffrement SSL', '📋 Conforme RGPD'].map(badge => (
              <span key={badge} className="text-xs text-gray-500 bg-white/[0.03] border border-white/[0.05] rounded-full px-2.5 py-1">
                {badge}
              </span>
            ))}
          </div>
          {/* Conversion link */}
          <div className="flex items-center justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors group hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            >
              Vous êtes une entreprise ? Découvrez BoosterPay
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          {/* Legal */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
            <span>© {new Date().getFullYear()} BoosterPay</span>
            <Link to="/mentions-legales" className="hover:text-gray-400 transition-colors">Mentions légales</Link>
            <Link to="/politique-confidentialite" className="hover:text-gray-400 transition-colors">Confidentialité</Link>
            <Link to="/cgv" className="hover:text-gray-400 transition-colors">CGV</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
