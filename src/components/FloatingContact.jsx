import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, X, Send, ArrowLeft, CheckCircle2, Mail, MessageSquare, ChevronRight } from 'lucide-react';
import { submitContactMessage } from '../services/leadService';

const PHONE_DISPLAY = '+33 4 51 41 05 75';
const PHONE_TEL = '+33451410575';
const SMS_DISPLAY = '+33 7 43 39 11 67';
const SMS_TEL = '+33743391167';

/**
 * FloatingContact — bouton flottant unique en bas-droite.
 * Au clic : panel light Apple-style avec 3 choix → Appeler / SMS / Écrire.
 *
 * Props :
 *   - aboveMobileNav (bool) : si true, décale le bouton + panel au-dessus
 *     de la bottom tab bar (~56px) pour ne pas chevaucher la nav de l'espace user.
 *     Sur desktop (≥ md) la sidebar prend la place → pas d'offset ajouté.
 */
export default function FloatingContact({ aboveMobileNav = false }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('home'); // 'home' | 'phone' | 'sms' | 'chat' | 'sent'
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);
  const inputRef = useRef(null);

  // Reset à la fermeture
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setView('home');
        setMessage('');
        setEmail('');
        setSending(false);
        setErrorMsg('');
        setCopied(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Click en dehors → ferme (en excluant le bouton lui-même pour éviter le toggle/reopen)
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      const insidePanel = panelRef.current && panelRef.current.contains(e.target);
      const insideButton = buttonRef.current && buttonRef.current.contains(e.target);
      if (!insidePanel && !insideButton) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [open]);

  // Échap → ferme
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Auto-focus sur l'input du chat
  useEffect(() => {
    if (view === 'chat' && inputRef.current) {
      const t = setTimeout(() => inputRef.current.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [view]);

  // Auto-ouverture du panel après quelques secondes (1 fois par session)
  // Ne s'ouvre pas si :
  //  - utilisateur a déjà ouvert/fermé le widget manuellement
  //  - autre popup est en cours (saisie email, etc) — heuristique : focus actif sur input
  //  - déjà montré dans la session
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SESSION_KEY = 'bp_floating_auto_shown';
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const t = setTimeout(() => {
      // Évite si l'user est en train de remplir un champ
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
      // Évite si un autre overlay est ouvert (popup capture email, exit intent…)
      if (document.querySelector('[data-bp-popup-open="true"]')) return;
      sessionStorage.setItem(SESSION_KEY, '1');
      setOpen(true);
    }, 5000); // 5 secondes après le mount

    return () => clearTimeout(t);
  }, []);

  const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const sendMessage = async () => {
    setErrorMsg('');
    if (!message.trim() || message.length < 5) {
      setErrorMsg('Décrivez-nous votre besoin en quelques mots.');
      return;
    }
    if (!validEmail(email)) {
      setErrorMsg('Adresse email invalide.');
      return;
    }
    setSending(true);
    try {
      const result = await submitContactMessage({ email, message, source: 'floating_chat' });
      if (result && result.success === false && result.error) {
        console.warn('Contact partiel:', result.error);
      }
      setView('sent');
    } catch (err) {
      setErrorMsg(err.message || 'Erreur d\'envoi, réessayez.');
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const appleEase = [0.16, 1, 0.3, 1];

  return (
    <>
      {/* BOUTON FLOTTANT
          mobileBottom = 5.25rem (84px) si bottom tab bar présente, sinon 1.25rem (20px)
          desktopBottom = toujours 1.25rem (la sidebar à gauche n'interfère pas) */}
      <motion.button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className="fixed z-[80] w-14 h-14 rounded-full flex items-center justify-center text-white"
        style={{
          right: 'calc(env(safe-area-inset-right, 0px) + 1.25rem)',
          bottom: aboveMobileNav
            ? 'calc(env(safe-area-inset-bottom, 0px) + var(--bp-fab-bottom, 5.25rem))'
            : 'calc(env(safe-area-inset-bottom, 0px) + 1.25rem)',
          background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
          boxShadow: '0 12px 36px -8px rgba(59,130,246,0.55), 0 0 0 1px rgba(255,255,255,0.08) inset',
          WebkitTapHighlightColor: 'transparent',
          willChange: 'transform',
        }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        aria-label={open ? 'Fermer' : 'Nous contacter'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <X className="w-5 h-5" strokeWidth={2.4} />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <MessageCircle className="w-5 h-5" strokeWidth={2.2} />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Halo pulse quand fermé */}
        {!open && (
          <span
            className="absolute inset-0 rounded-full pointer-events-none animate-ping"
            style={{ background: 'rgba(59,130,246,0.25)', animationDuration: '2.4s' }}
          />
        )}
      </motion.button>

      {/* PANEL — light theme Apple-style */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            className="fixed z-[80] sm:w-[380px] rounded-[28px] overflow-hidden flex flex-col bg-white"
            style={{
              right: 'calc(env(safe-area-inset-right, 0px) + 1.25rem)',
              bottom: aboveMobileNav
                ? 'calc(env(safe-area-inset-bottom, 0px) + 9.5rem)'
                : 'calc(env(safe-area-inset-bottom, 0px) + 5.5rem)',
              width: 'min(380px, calc(100vw - 2.5rem))',
              maxHeight: 'min(620px, calc(100dvh - 11rem - env(safe-area-inset-bottom, 0px)))',
              border: '1px solid rgba(15,23,42,0.06)',
              boxShadow: '0 24px 60px -12px rgba(15,23,42,0.18), 0 8px 20px -8px rgba(15,23,42,0.08)',
              willChange: 'transform, opacity',
            }}
            initial={{ y: 16, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 12, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {/* HEADER */}
            <div className="px-5 pt-5 pb-4 flex items-center gap-3 border-b border-gray-100/80">
              {view !== 'home' && view !== 'sent' && (
                <button
                  onClick={() => setView('home')}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Retour"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={2.2} />
                </button>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[10.5px] font-bold text-gray-400 uppercase tracking-[0.08em]">
                  {view === 'home' && 'BoosterPay'}
                  {view === 'phone' && 'Appel direct'}
                  {view === 'sms' && 'SMS direct'}
                  {view === 'chat' && 'Nouveau message'}
                  {view === 'sent' && 'Message envoyé'}
                </div>
                <div className="text-[16px] font-bold text-gray-900 tracking-tight truncate">
                  {view === 'home' && 'Comment peut-on vous aider ?'}
                  {view === 'phone' && PHONE_DISPLAY}
                  {view === 'sms' && SMS_DISPLAY}
                  {view === 'chat' && 'Décrivez-nous votre besoin'}
                  {view === 'sent' && 'Bien reçu'}
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto bg-white">
              <AnimatePresence mode="wait">

                {view === 'home' && (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.3, ease: appleEase }}
                    className="p-4 space-y-2"
                  >
                    <ContactOption
                      icon={Phone}
                      title="Nous appeler"
                      subtitle={`${PHONE_DISPLAY} — Lun→Ven 9h-19h`}
                      onClick={() => setView('phone')}
                      accent="emerald"
                    />
                    <ContactOption
                      icon={MessageSquare}
                      title="Nous envoyer un SMS"
                      subtitle={`${SMS_DISPLAY} — Réponse rapide`}
                      onClick={() => setView('sms')}
                      accent="blue"
                    />
                    <ContactOption
                      icon={Mail}
                      title="Nous écrire"
                      subtitle="Réponse par email sous 2h ouvrées"
                      onClick={() => setView('chat')}
                      accent="violet"
                    />

                    <div className="pt-4 pb-1 text-center">
                      <p className="text-[12px] text-gray-400 leading-relaxed">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="relative flex w-1.5 h-1.5">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                          </span>
                          <span className="font-semibold text-gray-600">Équipe humaine en ligne</span>
                        </span>
                        <br/>
                        <span className="text-gray-400">Pas de bot, pas de file d'attente.</span>
                      </p>
                    </div>
                  </motion.div>
                )}

                {view === 'phone' && (
                  <motion.div
                    key="phone"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.35, ease: appleEase }}
                    className="p-5"
                  >
                    <div className="flex justify-center my-3">
                      <PhoneRingAnimation />
                    </div>

                    <div className="text-center">
                      <div className="text-[26px] sm:text-[28px] font-bold text-gray-900 tracking-tight tabular-nums">
                        {PHONE_DISPLAY}
                      </div>
                      <div className="text-[13px] text-gray-500 mt-1.5 font-medium">Lundi → Vendredi · 9h - 19h</div>
                    </div>

                    <a
                      href={`tel:${PHONE_TEL}`}
                      className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-[14.5px] font-semibold text-white transition-all hover:scale-[1.02]"
                      style={{
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        boxShadow: '0 10px 30px -10px rgba(16,185,129,0.55)',
                      }}
                    >
                      <Phone className="w-4 h-4" strokeWidth={2.4} />
                      Lancer l'appel
                    </a>

                    <button
                      onClick={() => copyToClipboard(PHONE_DISPLAY)}
                      className="mt-2 w-full text-[13px] text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl py-2.5 transition-colors font-medium"
                    >
                      {copied ? '✓ Copié dans le presse-papier' : 'Copier le numéro'}
                    </button>
                  </motion.div>
                )}

                {view === 'sms' && (
                  <motion.div
                    key="sms"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.35, ease: appleEase }}
                    className="p-5"
                  >
                    <div className="flex justify-center my-3">
                      <SmsAnimation />
                    </div>

                    <div className="text-center">
                      <div className="text-[26px] sm:text-[28px] font-bold text-gray-900 tracking-tight tabular-nums">
                        {SMS_DISPLAY}
                      </div>
                      <div className="text-[13px] text-gray-500 mt-1.5 font-medium">Réponse rapide aux heures ouvrées</div>
                    </div>

                    <a
                      href={`sms:${SMS_TEL}`}
                      className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-[14.5px] font-semibold text-white transition-all hover:scale-[1.02]"
                      style={{
                        background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                        boxShadow: '0 10px 30px -10px rgba(59,130,246,0.55)',
                      }}
                    >
                      <MessageSquare className="w-4 h-4" strokeWidth={2.4} />
                      Envoyer un SMS
                    </a>

                    <button
                      onClick={() => copyToClipboard(SMS_DISPLAY)}
                      className="mt-2 w-full text-[13px] text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl py-2.5 transition-colors font-medium"
                    >
                      {copied ? '✓ Copié dans le presse-papier' : 'Copier le numéro'}
                    </button>
                  </motion.div>
                )}

                {view === 'chat' && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.35, ease: appleEase }}
                    className="p-5 flex flex-col gap-3"
                  >
                    {/* Bulle équipe — light */}
                    <div className="flex gap-2.5 items-end">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[10.5px] font-bold text-white shrink-0 shadow-sm"
                        style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}
                      >
                        BP
                      </div>
                      <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-gray-100 text-[13.5px] text-gray-800 max-w-[260px] leading-relaxed font-medium">
                        Salut 👋 Décrivez-nous votre besoin, on revient par email sous 2h ouvrées.
                      </div>
                    </div>

                    {/* Input message */}
                    <div className="mt-2">
                      <textarea
                        ref={inputRef}
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Votre message…"
                        style={{ fontSize: 16 }}
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1.5">
                        Votre email pour la réponse
                      </label>
                      <input
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="vous@entreprise.fr"
                        style={{ fontSize: 16 }}
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                      />
                    </div>

                    <AnimatePresence>
                      {errorMsg && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="text-[12.5px] text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 font-medium"
                        >
                          {errorMsg}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      onClick={sendMessage}
                      disabled={sending || !message || !email}
                      className="mt-1 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-[14.5px] font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02]"
                      style={{
                        background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
                        boxShadow: '0 10px 30px -10px rgba(59,130,246,0.55)',
                      }}
                    >
                      {sending ? 'Envoi…' : (<>Envoyer <Send className="w-4 h-4" /></>)}
                    </button>
                  </motion.div>
                )}

                {view === 'sent' && (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: appleEase }}
                    className="p-7 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.05 }}
                      className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-5"
                      style={{
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        boxShadow: '0 12px 32px -10px rgba(16,185,129,0.45)',
                      }}
                    >
                      <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={2.2} />
                    </motion.div>

                    <h3 className="text-[20px] font-bold text-gray-900 tracking-tight">
                      Bien reçu !
                    </h3>
                    <p className="text-[13.5px] text-gray-500 mt-2 leading-relaxed max-w-[280px] mx-auto">
                      Notre équipe revient vers vous à <span className="text-gray-900 font-semibold">{email}</span> sous 2h ouvrées.
                    </p>

                    <button
                      onClick={() => setOpen(false)}
                      className="mt-6 inline-flex items-center justify-center px-5 py-2.5 rounded-full text-[13px] text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      Fermer
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Sub-components ─── */

function ContactOption({ icon: Icon, title, subtitle, onClick, accent = 'blue' }) {
  const accents = {
    emerald: { bg: '#ECFDF5', border: '#A7F3D0', icon: '#059669', iconBg: 'linear-gradient(135deg, #10B981, #059669)' },
    blue:    { bg: '#EFF6FF', border: '#BFDBFE', icon: '#2563EB', iconBg: 'linear-gradient(135deg, #3B82F6, #2563EB)' },
    violet:  { bg: '#F5F3FF', border: '#DDD6FE', icon: '#7C3AED', iconBg: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' },
  };
  const a = accents[accent] || accents.blue;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className="w-full flex items-center gap-3.5 px-3.5 py-3.5 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md hover:shadow-gray-900/[0.04] transition-all text-left group"
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
        style={{ background: a.iconBg, boxShadow: `0 8px 16px -8px ${a.icon}40` }}
      >
        <Icon className="w-[19px] h-[19px] text-white" strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14.5px] font-bold text-gray-900 leading-tight">{title}</div>
        <div className="text-[12px] text-gray-500 truncate font-medium mt-0.5">{subtitle}</div>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" strokeWidth={2.4} />
    </motion.button>
  );
}

function PhoneRingAnimation() {
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full"
          style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}
          animate={{ scale: [1, 1.8], opacity: [0.7, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
        />
      ))}
      <motion.div
        animate={{ rotate: [0, -8, 8, -8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.6 }}
        className="relative w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #10B981, #059669)',
          boxShadow: '0 12px 28px -8px rgba(16,185,129,0.5)',
        }}
      >
        <Phone className="w-6 h-6 text-white" strokeWidth={2.2} />
      </motion.div>
    </div>
  );
}

function SmsAnimation() {
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full"
          style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}
          animate={{ scale: [1, 1.7], opacity: [0.65, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.7, ease: 'easeOut' }}
        />
      ))}
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
          boxShadow: '0 12px 28px -8px rgba(59,130,246,0.5)',
        }}
      >
        <MessageSquare className="w-6 h-6 text-white" strokeWidth={2.2} />
      </motion.div>
    </div>
  );
}
