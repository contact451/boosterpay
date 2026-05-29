// ─────────────────────────────────────────────────────────────────
//  Page /connexion — Magic link Apple-style
//
//  Le client saisit son email → reçoit un lien sécurisé valide 24h.
//  Pas de mot de passe, pas de friction.
//
//  Backend : POST { action: 'requestMagicLink', email } sur Apps Script
//            Vonage CRM (action publique, pas de token requis).
// ─────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2, Loader2, UserPlus } from 'lucide-react';

function getVonageCrmApiUrl() {
  return import.meta.env.VITE_VONAGE_CRM_APPS_SCRIPT_URL || '';
}

export default function Connexion() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | sent | error | not_found
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setStatus('error');
      setError('Veuillez saisir un email valide.');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      const apiUrl = getVonageCrmApiUrl();
      if (!apiUrl) {
        setStatus('error');
        setError('Service indisponible. Réessayez dans quelques instants.');
        return;
      }
      const res = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'requestMagicLink', email: trimmed }),
      });
      const json = await res.json();
      if (json.ok) {
        setStatus('sent');
      } else if (json.error === 'email_not_found') {
        setStatus('not_found');
      } else {
        setStatus('error');
        setError(json.error === 'email_send_failed' ? "L'envoi a échoué. Réessayez dans quelques instants." : 'Une erreur est survenue. Réessayez.');
      }
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Connexion impossible.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-[440px]">
        {/* Logo / retour */}
        <Link to="/" className="inline-flex items-center gap-2 text-[13px] font-semibold text-emerald-700 hover:text-emerald-800 mb-8">
          <span className="text-[15px]">BoosterPay</span>
        </Link>

        {/* Carte */}
        <div className="bg-white rounded-[18px] p-9 md:p-10 shadow-sm border border-slate-100">
          {status === 'not_found' ? (
            // État : email pas trouvé → invitation à créer un compte
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-amber-50 mx-auto flex items-center justify-center mb-5">
                <UserPlus className="w-7 h-7 text-amber-600" />
              </div>
              <h1 className="text-[24px] font-bold text-[#1D1D1F] tracking-tight">
                Aucun compte trouvé
              </h1>
              <p className="text-[14.5px] text-[#424245] mt-3 leading-relaxed">
                L'adresse <strong className="text-[#1D1D1F]">{email}</strong> ne correspond à aucun compte BoosterPay.
              </p>
              <p className="text-[13px] text-[#6E6E73] mt-3 leading-relaxed">
                Vérifiez que vous avez bien saisi l'email utilisé lors de votre inscription, ou démarrez un essai gratuit dès maintenant.
              </p>

              <Link
                to="/"
                className="mt-7 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-emerald-600 text-white text-[15px] font-semibold hover:bg-emerald-700 transition-colors w-full"
              >
                Démarrer mon essai 7 jours
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => {
                  setStatus('idle');
                  setEmail('');
                }}
                className="mt-5 text-[13px] font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Essayer une autre adresse
              </button>
            </div>
          ) : status !== 'sent' ? (
            <>
              <h1 className="text-[26px] font-bold text-[#1D1D1F] tracking-tight leading-tight">
                Accéder à mon espace
              </h1>
              <p className="text-[14.5px] text-[#424245] mt-2 leading-relaxed">
                Entrez l'email utilisé lors de votre inscription. Vous recevrez un lien sécurisé pour vous connecter.
              </p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                <div>
                  <label htmlFor="email" className="text-[12.5px] font-semibold text-[#1D1D1F] block mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@exemple.com"
                      autoFocus
                      disabled={status === 'loading'}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 text-[15px] text-[#1D1D1F] placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
                    />
                  </div>
                </div>

                {status === 'error' && error && (
                  <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 text-[13px] text-rose-800">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading' || !email}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-emerald-600 text-white text-[15px] font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Envoi…
                    </>
                  ) : (
                    <>
                      Recevoir le lien
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-[12px] text-[#6E6E73] mt-6 leading-relaxed">
                Lien sécurisé valable 24 heures, utilisable une seule fois. Aucun mot de passe à retenir.
              </p>
            </>
          ) : (
            // État après envoi
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 mx-auto flex items-center justify-center mb-5">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h1 className="text-[24px] font-bold text-[#1D1D1F] tracking-tight">
                Vérifiez votre boîte mail
              </h1>
              <p className="text-[14.5px] text-[#424245] mt-3 leading-relaxed">
                Si l'adresse <strong className="text-[#1D1D1F]">{email}</strong> correspond à un compte BoosterPay, un lien de connexion vient d'y être envoyé.
              </p>
              <p className="text-[13px] text-[#6E6E73] mt-5 leading-relaxed">
                Le lien est valable 24 heures.
                <br />
                Pensez à vérifier vos spams si vous ne le voyez pas.
              </p>

              <button
                onClick={() => {
                  setStatus('idle');
                  setEmail('');
                }}
                className="mt-7 text-[13px] font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Renvoyer un lien
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[12px] text-[#86868B] mt-6">
          Besoin d'aide ?{' '}
          <a href="mailto:contact@booster-pay.com" className="text-emerald-700 hover:text-emerald-800 font-semibold">
            contact@booster-pay.com
          </a>
        </p>
      </div>
    </div>
  );
}
