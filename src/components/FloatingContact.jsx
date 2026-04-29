import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, X, Send, ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { submitContactMessage } from '../services/leadService';

const PHONE_DISPLAY = '+33 1 77 38 17 11';
const PHONE_TEL = '+33177381711';

/**
 * FloatingContact — bouton flottant unique en bas-droite.
 * Au clic : panel Apple-style avec 2 choix → Appeler ou Envoyer un message.
 *
 * Le mode "message" est en chat-style : message d'abord, email ensuite,
 * envoi → confirmation visuelle, on revient par email.
 */
export default function FloatingContact() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('home'); // 'home' | 'phone' | 'chat' | 'sent'
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const panelRef = useRef(null);
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
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Click en dehors → ferme
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
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

  const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const sendMessage = async () => {
    setErrorMsg('');
    if (!message.trim() || message.length < 5) {
      setErrorMsg('Décris-nous ton besoin en quelques mots.');
      return;
    }
    if (!validEmail(email)) {
      setErrorMsg('Adresse email invalide.');
      return;
    }
    setSending(true);
    try {
      // Envoi vers Google Apps Script (action: 'submitContactMessage')
      // Côté GAS : log dans le sheet CONTACT + auto-réponse email + alerte interne
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

  return (
    <>
      {/* BOUTON FLOTTANT — safe-area iOS, touch target 56px (>44px AAA) */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="fixed z-[80] w-14 h-14 rounded-full flex items-center justify-center text-white"
        style={{
          right: 'calc(env(safe-area-inset-right, 0px) + 1.25rem)',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.25rem)',
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

      {/* PANEL — height dynamique (safe-area + viewport), bouge au-dessus du bouton */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            className="fixed z-[80] sm:w-[380px] rounded-3xl overflow-hidden flex flex-col"
            style={{
              right: 'calc(env(safe-area-inset-right, 0px) + 1.25rem)',
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5.5rem)',
              width: 'min(380px, calc(100vw - 2.5rem))',
              maxHeight: 'min(600px, calc(100dvh - 7rem - env(safe-area-inset-bottom, 0px)))',
              background: 'linear-gradient(160deg, rgba(20,28,48,0.97) 0%, rgba(12,18,32,0.97) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 60px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              willChange: 'transform, opacity',
            }}
            initial={{ y: 16, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 12, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {/* HEADER */}
            <div className="px-5 pt-5 pb-3 border-b border-white/[0.05] flex items-center gap-3">
              {view !== 'home' && view !== 'sent' && (
                <button
                  onClick={() => setView('home')}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Retour"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="flex-1">
                <div className="text-[11px] font-medium text-white/40 uppercase tracking-wider">
                  {view === 'home' && 'BoosterPay'}
                  {view === 'phone' && 'Appel direct'}
                  {view === 'chat' && 'Nouveau message'}
                  {view === 'sent' && 'Bien reçu'}
                </div>
                <div className="text-[15px] font-semibold text-white">
                  {view === 'home' && 'Comment peut-on vous aider ?'}
                  {view === 'phone' && PHONE_DISPLAY}
                  {view === 'chat' && 'Décrivez-nous votre besoin'}
                  {view === 'sent' && 'Message envoyé'}
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto">
              {view === 'home' && (
                <div className="p-5 space-y-2.5">
                  <ContactOption
                    icon={Phone}
                    title="Nous appeler"
                    subtitle={PHONE_DISPLAY + ' — Lun→Ven 9h-19h'}
                    onClick={() => setView('phone')}
                    accent="cyan"
                  />
                  <ContactOption
                    icon={Mail}
                    title="Nous écrire"
                    subtitle="Réponse par email sous 2 h ouvrées"
                    onClick={() => setView('chat')}
                    accent="blue"
                  />

                  <p className="pt-3 text-[11px] text-white/40 text-center leading-relaxed">
                    Une équipe humaine derrière chaque message. <br/>
                    Pas de bot, pas de file d'attente.
                  </p>
                </div>
              )}

              {view === 'phone' && (
                <div className="p-5">
                  {/* Animation phone Apple-style */}
                  <div className="flex justify-center my-4">
                    <PhoneRingAnimation />
                  </div>

                  <div className="text-center">
                    <div className="text-[28px] sm:text-[30px] font-semibold text-white tracking-tight">
                      {PHONE_DISPLAY}
                    </div>
                    <div className="text-sm text-white/50 mt-1.5">Lundi → Vendredi · 9h - 19h</div>
                  </div>

                  <a
                    href={`tel:${PHONE_TEL}`}
                    className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-[15px] font-semibold text-white transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                      boxShadow: '0 10px 30px -10px rgba(34,197,94,0.6)',
                    }}
                  >
                    <Phone className="w-4 h-4" strokeWidth={2.4} />
                    Lancer l'appel
                  </a>

                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(PHONE_DISPLAY);
                    }}
                    className="mt-2 w-full text-[13px] text-white/50 hover:text-white/80 transition-colors py-2"
                  >
                    Copier le numéro
                  </button>
                </div>
              )}

              {view === 'chat' && (
                <div className="p-5 flex flex-col gap-3">
                  {/* Bulle équipe */}
                  <div className="flex gap-2.5 items-end">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}
                    >
                      BP
                    </div>
                    <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-white/[0.05] border border-white/[0.06] text-[13.5px] text-white/85 max-w-[260px] leading-relaxed">
                      Salut 👋 On répond sous 2 h ouvrées. Décris-nous ton besoin, on revient par email.
                    </div>
                  </div>

                  {/* Input message — font-size 16px = pas de zoom iOS */}
                  <div className="mt-2">
                    <textarea
                      ref={inputRef}
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Votre message…"
                      style={{ fontSize: 16 }}
                      className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder-white/30 resize-none focus:outline-none focus:border-blue-400/60 focus:bg-white/[0.05] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
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
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-400/60 focus:bg-white/[0.05] transition-colors"
                    />
                  </div>

                  {errorMsg && (
                    <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    onClick={sendMessage}
                    disabled={sending || !message || !email}
                    className="mt-1 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[14.5px] font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
                      boxShadow: '0 10px 30px -10px rgba(59,130,246,0.6)',
                    }}
                  >
                    {sending ? 'Envoi…' : (<>Envoyer <Send className="w-4 h-4" /></>)}
                  </button>
                </div>
              )}

              {view === 'sent' && (
                <div className="p-6 text-center">
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                    className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(34,197,94,0.06))',
                      border: '1px solid rgba(34,197,94,0.35)',
                    }}
                  >
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" strokeWidth={1.8} />
                  </motion.div>

                  <h3 className="text-lg font-semibold text-white tracking-tight">
                    Bien reçu !
                  </h3>
                  <p className="text-sm text-white/60 mt-2 leading-relaxed max-w-[260px] mx-auto">
                    Notre équipe revient vers vous à <span className="text-white font-medium">{email}</span> sous 2 h ouvrées.
                  </p>

                  <button
                    onClick={() => setOpen(false)}
                    className="mt-5 text-sm text-white/50 hover:text-white/80 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              )}
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
    blue: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', text: '#60A5FA' },
    cyan: { bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.25)', text: '#22D3EE' },
  };
  const a = accents[accent] || accents.blue;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-white/[0.025] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all text-left group"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: a.bg, border: `1px solid ${a.border}` }}
      >
        <Icon className="w-[18px] h-[18px]" style={{ color: a.text }} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14.5px] font-semibold text-white">{title}</div>
        <div className="text-[12px] text-white/55 truncate">{subtitle}</div>
      </div>
      <div className="text-white/30 group-hover:text-white/60 transition-colors">→</div>
    </button>
  );
}

function PhoneRingAnimation() {
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full"
          style={{ background: 'rgba(34,197,94,0.18)', border: '1px solid rgba(34,197,94,0.35)' }}
          animate={{ scale: [1, 1.8], opacity: [0.7, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
        />
      ))}
      <motion.div
        animate={{ rotate: [0, -8, 8, -8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.6 }}
        className="relative w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #22C55E, #16A34A)',
          boxShadow: '0 10px 30px -8px rgba(34,197,94,0.5)',
        }}
      >
        <Phone className="w-6 h-6 text-white" strokeWidth={2.2} />
      </motion.div>
    </div>
  );
}
