import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Smartphone,
  Laptop,
  Plane,
  Check,
  Shield,
  ChevronRight,
  Send,
  Clock,
  Gift,
  MessageSquare,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.5, ease },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const ratingLabels = [
  "Tr\u00e8s d\u00e9cevant",
  "D\u00e9cevant",
  "Correct",
  "Tr\u00e8s bien",
  "Excellent",
];

const prizes = [
  {
    name: "iPhone 16 Pro",
    value: "1 249 \u20ac",
    gradient: "from-gray-800 to-gray-900",
    Icon: Smartphone,
  },
  {
    name: "MacBook Air M4",
    value: "1 399 \u20ac",
    gradient: "from-indigo-500 to-violet-600",
    Icon: Laptop,
  },
  {
    name: "Voyage pour 2",
    value: "2 000 \u20ac",
    gradient: "from-sky-400 to-blue-600",
    Icon: Plane,
  },
];

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function NotationClient_v4() {
  const { partnerId } = useParams();

  const [rating, setRating] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(null);
  const [contactInfo, setContactInfo] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentSubmitted, setConsentSubmitted] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const commerceName = "Nom du commerce";

  const nextDrawDate = (() => {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return next.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  })();

  const canSubmitConsent =
    consentChecked && contactInfo.trim().length > 0 && !consentSubmitted;

  const handleConsentSubmit = () => {
    if (canSubmitConsent) {
      setConsentSubmitted(true);
    }
  };

  const handleFeedbackSubmit = () => {
    if (feedback.trim().length > 0) {
      setFeedbackSubmitted(true);
    }
  };

  const activeStar = hoveredStar !== null ? hoveredStar : rating;

  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans']">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-xl mx-auto flex items-center justify-between px-5 py-3.5">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 leading-tight">
              Votre avis
            </span>
            <span className="text-sm font-bold text-gray-900 leading-tight">
              {commerceName}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200/60 rounded-full px-3 py-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-medium text-gray-500">30 sec</span>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-5 pb-16">
        {/* ── Section 1: Rating ── */}
        <motion.section
          className="pt-10 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight text-center leading-snug">
            Merci&nbsp;! Aidez-nous {"\u00e0"} grandir.
          </h1>

          <div className="flex justify-center gap-2 mt-8">
            {[1, 2, 3, 4, 5].map((star) => {
              const filled = activeStar !== null && star <= activeStar;
              return (
                <motion.button
                  key={star}
                  type="button"
                  aria-label={`${star} \u00e9toile${star > 1 ? "s" : ""}`}
                  className="relative p-1 outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 rounded-lg"
                  whileTap={{ scale: 0.88 }}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(null)}
                  onClick={() => setRating(star)}
                >
                  <motion.div
                    animate={{
                      scale: filled ? 1.1 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Star
                      size={48}
                      className={`transition-colors duration-200 ${
                        filled
                          ? "fill-gray-900 text-gray-900"
                          : "fill-transparent text-gray-300"
                      }`}
                      strokeWidth={1.5}
                    />
                  </motion.div>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {rating !== null && (
              <motion.p
                key={rating}
                className="text-center text-sm font-semibold text-gray-900 mt-4"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease }}
              >
                {ratingLabels[rating - 1]}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ── Section 2 & 3: Prize Draw + Consent (after rating) ── */}
        <AnimatePresence>
          {rating !== null && !consentSubmitted && (
            <motion.div
              key="prize-consent"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fadeUp}
            >
              {/* Prize Draw */}
              <section className="pb-8">
                <motion.h2
                  className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-snug"
                  variants={fadeUp}
                >
                  Participez {"\u00e0"} notre grand tirage mensuel
                </motion.h2>

                {/* Bento Grid */}
                <motion.div
                  className="grid grid-cols-3 gap-3 mt-6"
                  variants={stagger}
                >
                  {prizes.map((prize) => (
                    <motion.div
                      key={prize.name}
                      className="bg-white border border-gray-200/60 rounded-2xl p-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col items-center text-center"
                      variants={fadeUp}
                    >
                      <div
                        className={`w-full aspect-square rounded-2xl bg-gradient-to-br ${prize.gradient} flex items-center justify-center mb-3`}
                      >
                        <prize.Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={1.5} />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                        {prize.name}
                      </span>
                      <span className="text-xs text-gray-500 mt-0.5">
                        {prize.value}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.p
                  className="text-sm text-gray-500 mt-5 leading-relaxed"
                  variants={fadeUp}
                >
                  Nous offrons une chance de gagner un cadeau de r{"\u00ea"}ve{" "}
                  {"\u00e0"} chaque client pour le remercier. Tirage mensuel,
                  100% gratuit.
                </motion.p>

                {/* Trust Badges */}
                <motion.div
                  className="flex flex-wrap gap-3 mt-5"
                  variants={stagger}
                >
                  {[
                    {
                      label: "100% gratuit",
                      Icon: Check,
                      color: "text-emerald-600",
                      bg: "bg-emerald-50",
                    },
                    {
                      label: "D\u00e9sinscription libre",
                      Icon: Shield,
                      color: "text-gray-500",
                      bg: "bg-gray-50",
                    },
                    {
                      label: "Donn\u00e9es prot\u00e9g\u00e9es",
                      Icon: Shield,
                      color: "text-emerald-600",
                      bg: "bg-emerald-50",
                    },
                  ].map((badge) => (
                    <motion.div
                      key={badge.label}
                      className={`flex items-center gap-1.5 ${badge.bg} rounded-full px-3 py-1.5`}
                      variants={fadeUp}
                    >
                      <badge.Icon className={`w-3.5 h-3.5 ${badge.color}`} />
                      <span className="text-xs font-medium text-gray-700">
                        {badge.label}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              </section>

              {/* Consent + Contact */}
              <motion.section className="pb-8" variants={fadeUp}>
                <div className="bg-gray-50 border border-gray-200/60 rounded-3xl p-5 sm:p-6">
                  {/* Email / Phone */}
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-900">
                      Votre email ou t{"\u00e9"}l{"\u00e9"}phone
                    </span>
                    <input
                      type="text"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder="email@exemple.com ou 06..."
                      className="mt-2 w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5 transition-all duration-200"
                    />
                  </label>

                  {/* Consent Checkbox */}
                  <div className="mt-5">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={consentChecked}
                        onClick={() => setConsentChecked(!consentChecked)}
                        className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                          consentChecked
                            ? "bg-gray-900 border-gray-900"
                            : "bg-white border-gray-300 group-hover:border-gray-400"
                        }`}
                      >
                        {consentChecked && (
                          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        )}
                      </button>
                      <div>
                        <span className="text-sm text-gray-700 leading-snug">
                          J&rsquo;accepte de m&rsquo;inscrire au tirage au sort
                          mensuel et de recevoir occasionnellement des offres et
                          services exclusifs.
                        </span>
                        <span className="block text-xs text-gray-400 mt-1">
                          Participation gratuite au tirage incluse.
                          D{"\u00e9"}sabonnement en 1 clic.
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <AnimatePresence>
                    {canSubmitConsent && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.35, ease }}
                      >
                        <button
                          type="button"
                          onClick={handleConsentSubmit}
                          className="w-full bg-gray-900 text-white rounded-2xl py-4 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-[0.98] transition-all duration-200"
                        >
                          Valider ma participation gratuite
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Privacy Link */}
                  <p className="text-center mt-4">
                    <Link
                      to="/politique-confidentialite"
                      className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-500 transition-colors"
                    >
                      Politique de confidentialit{"\u00e9"}
                    </Link>
                  </p>
                </div>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Success: Consent submitted ── */}
        <AnimatePresence>
          {consentSubmitted && (
            <motion.section
              key="consent-success"
              className="py-8"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease }}
            >
              <div className="bg-gray-50 border border-gray-200/60 rounded-3xl p-6 sm:p-8 text-center">
                <motion.div
                  className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.15,
                  }}
                >
                  <Check className="w-7 h-7 text-emerald-600" strokeWidth={2.5} />
                </motion.div>
                <h3 className="text-lg font-bold text-gray-900 mt-4">
                  Participation confirm{"\u00e9"}e
                </h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Prochain tirage le{" "}
                  <span className="font-semibold text-gray-700">
                    {nextDrawDate}
                  </span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  R{"\u00e9"}sultat envoy{"\u00e9"} par SMS
                </p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── Section 4: Google Review (rating >= 4) ── */}
        <AnimatePresence>
          {rating !== null && rating >= 4 && (
            <motion.section
              key="google-review"
              className="py-8 border-t border-gray-100"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fadeUp}
            >
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                  Merci&nbsp;! Partagez votre avis sur Google.
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  Aidez d&rsquo;autres clients {"\u00e0"} d{"\u00e9"}couvrir ce
                  commerce.
                </p>

                <a
                  href={`https://search.google.com/local/writereview?placeid=${partnerId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full bg-gray-900 text-white rounded-2xl py-4 text-sm font-semibold flex items-center justify-center gap-3 hover:bg-gray-800 active:scale-[0.98] transition-all duration-200 no-underline"
                >
                  <GoogleLogo />
                  Laisser un avis Google
                </a>
                <p className="text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  Moins de 30 secondes
                </p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── Section 5: Negative Feedback (rating 1-3) ── */}
        <AnimatePresence>
          {rating !== null && rating <= 3 && !feedbackSubmitted && (
            <motion.section
              key="negative-feedback"
              className="py-8 border-t border-gray-100"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fadeUp}
            >
              <div className="bg-gray-50 border border-gray-200/60 rounded-3xl p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200/70 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 leading-snug">
                      Nous sommes d{"\u00e9"}sol{"\u00e9"}s que votre
                      exp{"\u00e9"}rience n&rsquo;ait pas {"\u00e9"}t{"\u00e9"}{" "}
                      parfaite.
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Votre retour est transmis directement au responsable.
                    </p>
                  </div>
                </div>

                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Dites-nous ce que nous pourrions am&#233;liorer..."
                  rows={4}
                  className="mt-4 w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5 transition-all duration-200 resize-none"
                />

                <AnimatePresence>
                  {feedback.trim().length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.3, ease }}
                    >
                      <button
                        type="button"
                        onClick={handleFeedbackSubmit}
                        className="w-full bg-gray-900 text-white rounded-2xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-[0.98] transition-all duration-200"
                      >
                        Envoyer mon retour
                        <Send className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── Success: Feedback submitted ── */}
        <AnimatePresence>
          {feedbackSubmitted && (
            <motion.section
              key="feedback-success"
              className="py-8 border-t border-gray-100"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease }}
            >
              <div className="bg-gray-50 border border-gray-200/60 rounded-3xl p-6 text-center">
                <motion.div
                  className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.15,
                  }}
                >
                  <Check className="w-7 h-7 text-emerald-600" strokeWidth={2.5} />
                </motion.div>
                <h3 className="text-base font-bold text-gray-900 mt-4">
                  Merci pour votre retour.
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Le responsable a {"\u00e9"}t{"\u00e9"} notifi{"\u00e9"}.
                </p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-8 px-5">
        <div className="max-w-xl mx-auto flex flex-col items-center gap-3">
          <a
            href="https://boosterpay.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-gray-500 transition-colors no-underline"
          >
            Propuls{"\u00e9"} par{" "}
            <span className="font-semibold">BoosterPay</span>
          </a>
          <div className="flex items-center gap-4">
            <Link
              to="/mentions-legales"
              className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-500 transition-colors"
            >
              Mentions l{"\u00e9"}gales
            </Link>
            <Link
              to="/politique-confidentialite"
              className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-500 transition-colors"
            >
              Confidentialit{"\u00e9"}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
