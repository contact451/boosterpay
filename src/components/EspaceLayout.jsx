// ─────────────────────────────────────────────────────────────────
//  EspaceLayout — Layout commun pour toutes les pages de l'espace user
//
//  Structure :
//   - Desktop : sidebar fixe gauche (240px) + main scrollable
//   - Mobile  : header minimal en haut (logo + commerce) + bottom tab bar
//               fixe 4 onglets (Accueil / Appels / Prospects / Compte)
//
//  Props :
//   - children       : contenu de la page
//   - nomCommerce    : nom du commerce (affiché en sidebar)
//   - commercantId   : id utilisé pour construire les liens
//   - activeSection  : 'bienvenue' | 'appels' | 'prospects' | 'modules' | 'abonnement'
//
//  Utilisé par : MerciPage (phase provisioning/ready/expired), EspaceAbonne,
//                MesAppels, MesProspects, MesModules
// ─────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, LayoutGrid, CreditCard, HelpCircle, Store, PhoneCall, PhoneIncoming, LogOut, Target, User } from 'lucide-react';
import { getCachedAbonne, rememberLastCommercantId, forgetLastCommercantId, clearCachedAbonne } from '../services/abonneCache';
import FloatingContact from './FloatingContact';

// Sidebar desktop — 5 sections complètes
const NAV_SECTIONS = [
  { id: 'bienvenue', label: 'Bienvenue', icon: Home, baseTo: '/merci' },
  { id: 'appels', label: 'Mes appels', icon: PhoneIncoming, baseTo: '/espace/appels' },
  { id: 'prospects', label: 'Acheter prospects', icon: Target, baseTo: '/espace/prospects' },
  { id: 'modules', label: 'Mes modules', icon: LayoutGrid, baseTo: '/espace/modules' },
  { id: 'abonnement', label: 'Mon abonnement', icon: CreditCard, baseTo: '/configurer' },
];

// Bottom tab bar mobile — 5 onglets équidistants (pattern iOS Maps / Photos)
//   Labels courts pour rester lisibles sur petits mobiles (≥ 360px viewport).
//   Ordre : flux logique de l'usage quotidien
//     1. Accueil   → vue d'ensemble + numéro + tuto
//     2. Appels    → centre d'appels live (page la plus consultée)
//     3. Modules   → toutes les capacités IA activables
//     4. Prospects → acquisition / achat one-shot
//     5. Compte    → abonnement + facturation
const MOBILE_TABS = [
  { id: 'bienvenue',  label: 'Accueil',   icon: Home,          baseTo: '/merci' },
  { id: 'appels',     label: 'Appels',    icon: PhoneIncoming, baseTo: '/espace/appels' },
  { id: 'modules',    label: 'Modules',   icon: LayoutGrid,    baseTo: '/espace/modules' },
  { id: 'prospects',  label: 'Prospects', icon: Target,        baseTo: '/espace/prospects' },
  { id: 'abonnement', label: 'Compte',    icon: User,          baseTo: '/configurer' },
];

export default function EspaceLayout({ children, nomCommerce, commercantId, activeSection = 'bienvenue' }) {
  const navigate = useNavigate();

  // Mémorise le dernier commercant_id vu — la PWA s'en sert pour se
  // "souvenir" de l'utilisateur lorsque l'app est ouverte depuis l'icône
  // de l'écran d'accueil (start_url sans ?id).
  useEffect(() => {
    if (commercantId) rememberLastCommercantId(commercantId);
  }, [commercantId]);

  // Déconnexion : vide tout le cache de session (localStorage, cookie,
  // IndexedDB) et redirige vers la page de connexion. Au prochain
  // démarrage de la PWA, l'utilisateur devra entrer son email + code.
  const handleLogout = () => {
    const ok = typeof window !== 'undefined'
      ? window.confirm('Se déconnecter de BoosterPay ?\n\nVous devrez ressaisir votre email pour vous reconnecter.')
      : true;
    if (!ok) return;
    try {
      if (commercantId) clearCachedAbonne(commercantId);
      forgetLastCommercantId();
    } catch (_e) {}
    navigate('/connexion', { replace: true });
  };

  // Construit les liens en propagant commercant_id / subscription
  const buildLink = (baseTo) => {
    if (baseTo === '/merci') {
      const params = new URLSearchParams({ subscription: '1' });
      if (commercantId) params.set('commercant_id', commercantId);
      return `/merci?${params.toString()}`;
    }
    if (baseTo === '/configurer' || baseTo === '/espace/modules' || baseTo === '/espace/appels' || baseTo === '/espace/prospects') {
      return commercantId ? `${baseTo}?id=${encodeURIComponent(commercantId)}` : baseTo;
    }
    return baseTo;
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ════════ DESKTOP SIDEBAR (md+) ════════ */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-64 z-20 bg-white"
        style={{ borderRight: '1px solid #E5E7EB' }}
      >
        {/* Logo BoosterPay — premium Apple-style */}
        <div className="px-6 pt-7 pb-4">
          <Link
            to="/"
            className="inline-block hover:opacity-80 transition-opacity"
            style={{
              fontSize: '17px',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: '#0F172A',
            }}
          >
            Booster<span style={{ color: '#10B981' }}>Pay</span>
          </Link>
        </div>

        {/* Identité utilisateur (carte compacte avec avatar) */}
        <div className="mx-3 mb-3">
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl"
            style={{
              background: '#F9FAFB',
              border: '1px solid #F3F4F6',
            }}
          >
            <UserAvatar name={nomCommerce} />
            <div className="flex-1 min-w-0">
              {nomCommerce ? (
                <p className="text-[13.5px] font-bold text-gray-900 leading-tight truncate">
                  {nomCommerce}
                </p>
              ) : (
                <span
                  className="bp-stat-skel inline-block"
                  style={{ width: '90px', height: '12px', borderRadius: '4px' }}
                  aria-hidden
                />
              )}
              <div className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold mt-1" style={{ color: '#10B981' }}>
                <span className="relative inline-flex w-1.5 h-1.5">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </span>
                En ligne
              </div>
            </div>
          </div>
        </div>

        {/* Séparateur visuel */}
        <div className="mx-6 mb-3" style={{ borderBottom: '1px solid #F3F4F6' }} />

        {/* Nav links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV_SECTIONS.map((s) => {
            const isActive = s.id === activeSection;
            const Icon = s.icon;
            return (
              <Link
                key={s.id}
                to={buildLink(s.baseTo)}
                className="relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-[14px] transition-all duration-200"
                style={{
                  background: isActive ? '#ECFDF5' : 'transparent',
                  color: isActive ? '#047857' : '#374151',
                  fontWeight: isActive ? 700 : 500,
                  boxShadow: isActive
                    ? '0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 10px rgba(16,185,129,0.14)'
                    : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Barre verticale verte côté gauche pour item actif */}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute -left-3 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                    style={{ background: '#10B981', boxShadow: '0 0 8px rgba(16,185,129,0.4)' }}
                  />
                )}
                <Icon
                  className="w-[19px] h-[19px]"
                  strokeWidth={isActive ? 2.6 : 2.2}
                  style={{ color: isActive ? '#10B981' : '#9CA3AF' }}
                />
                <span className="leading-none">{s.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mini widget Essai en cours — juste sous la nav (meuble + utilité) */}
        <TrialMiniWidget commercantId={commercantId} />

        {/* Widget statut IA — distinct visuellement (fond blanc + accent emerald) */}
        <div className="mx-3 mb-3 mt-auto">
          <div
            className="flex items-center gap-3 px-3.5 py-3 rounded-2xl"
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(16,185,129,0.20)',
              boxShadow: '0 4px 14px rgba(16,185,129,0.08), 0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <div
              className="flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.4) inset, 0 6px 14px rgba(16,185,129,0.32)',
              }}
            >
              <PhoneCall className="w-[17px] h-[17px] text-white" strokeWidth={2.4} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-bold text-gray-900 leading-tight">Votre IA</div>
              <div className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold mt-0.5" style={{ color: '#047857' }}>
                <span className="relative inline-flex w-1.5 h-1.5">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </span>
                En ligne 24/7
              </div>
            </div>
          </div>
        </div>

        {/* Footer aide + déconnexion */}
        <div className="px-3 pb-6 pt-3 mx-3 space-y-0.5" style={{ borderTop: '1px solid #F3F4F6' }}>
          <a
            href="mailto:contact@booster-pay.com"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <HelpCircle className="w-4 h-4" strokeWidth={2.2} />
            Aide & contact
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors text-left"
            onMouseEnter={(e) => { e.currentTarget.style.color = '#DC2626'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
          >
            <LogOut className="w-4 h-4" strokeWidth={2.2} />
            Déconnexion
          </button>
        </div>

        {/* Styles globaux pour skeleton sidebar */}
        <style>{`
          @keyframes bpSidebarShimmer {
            0%   { background-position: -200px 0; }
            100% { background-position: 200px 0; }
          }
          .bp-stat-skel {
            background: linear-gradient(
              90deg,
              rgba(16,185,129,0.10) 0%,
              rgba(16,185,129,0.22) 50%,
              rgba(16,185,129,0.10) 100%
            );
            background-size: 400px 100%;
            animation: bpSidebarShimmer 1.6s linear infinite;
          }
        `}</style>
      </aside>

      {/* ════════ MOBILE HEADER MINIMAL (< md) ════════ */}
      {/*   Plus de nav d'onglets ici — la nav est en bas (bottom tab bar).
           Ce header sert juste de barre d'identité (logo + commerce). */}
      <header
        className="md:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-md"
        style={{ borderBottom: '1px solid #E5E7EB' }}
      >
        <div className="px-5 py-3.5 flex items-center justify-between">
          <Link to="/" className="text-gray-900 font-bold text-[15px] tracking-tight">
            Booster<span style={{ color: '#10B981' }}>Pay</span>
          </Link>
          {nomCommerce && (
            <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-500 max-w-[180px]">
              <Store className="w-3 h-3 flex-shrink-0" strokeWidth={2.2} />
              <span className="truncate font-semibold text-gray-700">{nomCommerce}</span>
            </span>
          )}
        </div>
      </header>

      {/* ════════ MAIN CONTENT ════════ */}
      {/*   pb-24 sur mobile pour ne pas être masqué par la bottom tab bar fixe */}
      <main className="md:ml-64 min-h-screen pb-24 md:pb-0">
        {children}
        {/* Bouton Déconnexion mobile (en bas du contenu, AVANT la bottom tab bar)
            Sur desktop il est dans la sidebar. */}
        <div className="md:hidden flex justify-center pt-2 pb-6">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-colors"
            style={{ background: '#F9FAFB', color: '#6B7280', border: '1px solid #F3F4F6' }}
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={2.2} />
            Se déconnecter
          </button>
        </div>
      </main>

      {/* ════════ MOBILE BOTTOM TAB BAR (< md) ════════ */}
      {/*   Pattern iOS natif : 5 onglets équidistants, accès au pouce.
           Compatible viewports ≥ 360px (iPhone SE inclus).
           Safe-area inset pris en compte pour iPhone notch. */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md"
        style={{
          borderTop: '1px solid #E5E7EB',
          boxShadow: '0 -4px 16px rgba(15,23,42,0.04)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          // Fallback Android Chrome < 76 (pas de backdrop-filter) :
          // backgroundColor solide avec opacité élevée pour rester lisible.
          backgroundColor: 'rgba(255,255,255,0.96)',
        }}
        aria-label="Navigation principale"
      >
        <div className="grid grid-cols-5">
          {MOBILE_TABS.map((s) => {
            const isActive = s.id === activeSection;
            const Icon = s.icon;
            return (
              <Link
                key={s.id}
                to={buildLink(s.baseTo)}
                className="flex flex-col items-center justify-center gap-1 py-2 px-1 transition-all duration-200 select-none"
                style={{
                  color: isActive ? '#10B981' : '#6B7280',
                  WebkitTapHighlightColor: 'transparent',
                }}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Pastille emerald fine au-dessus de l'onglet actif (signature iOS)
                    — slide-in animé pour rendre le changement ultra fluide */}
                <span
                  aria-hidden
                  className="block rounded-full"
                  style={{
                    width: isActive ? '16px' : '0px',
                    height: '3px',
                    background: '#10B981',
                    marginTop: '-4px',
                    marginBottom: '2px',
                    boxShadow: isActive ? '0 0 6px rgba(16,185,129,0.5)' : 'none',
                    transition: 'width 240ms cubic-bezier(0.2,0.8,0.2,1), box-shadow 200ms',
                  }}
                />
                {/* Icône avec halo emerald subtil au focus (signature premium) */}
                <span
                  className="relative inline-flex items-center justify-center"
                  style={{ width: '24px', height: '24px' }}
                >
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'radial-gradient(circle, rgba(16,185,129,0.16) 0%, transparent 70%)',
                        transform: 'scale(1.6)',
                      }}
                    />
                  )}
                  <Icon
                    className="relative"
                    style={{
                      width: '21px',
                      height: '21px',
                      transform: isActive ? 'scale(1.04)' : 'scale(1)',
                      transition: 'transform 240ms cubic-bezier(0.2,0.8,0.2,1)',
                    }}
                    strokeWidth={isActive ? 2.6 : 2.1}
                  />
                </span>
                <span
                  className="leading-none tracking-tight"
                  style={{
                    fontSize: '10px',
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: '-0.01em',
                    transition: 'font-weight 200ms',
                  }}
                >
                  {s.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ════════ BOUTON CONTACT FLOTTANT (toutes pages espace user) ════════ */}
      {/*   Décalé au-dessus de la bottom tab bar sur mobile via prop aboveMobileNav */}
      <FloatingContact aboveMobileNav />
    </div>
  );
}

// Avatar utilisateur : initiales du nom_commerce sur fond emerald gradient.
// Si nom pas encore chargé, affiche un avatar skeleton émeraude shimmer plutôt
// que des initiales fallback "BP" (incohérence entre les pages).
function UserAvatar({ name }) {
  const initials = computeInitials(name);
  if (!initials) {
    return (
      <div
        className="bp-stat-skel flex-shrink-0 w-9 h-9 rounded-full"
        aria-hidden="true"
      />
    );
  }
  return (
    <div
      className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white text-[12.5px] font-bold tracking-tight"
      style={{
        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.4) inset, 0 4px 12px rgba(16,185,129,0.30)',
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Mini widget Essai en cours · J X/7 — affiché sous la nav
// Lit le cache localStorage de l'abonné pour avoir trial_ends_at /
// provisioned_at (fallback). Affiché uniquement si essai en cours.
// ─────────────────────────────────────────────────────────────────
function TrialMiniWidget({ commercantId }) {
  // Détecte aussi le commercantId depuis l'URL pour les pages où il n'est pas
  // passé en prop (sécurité supplémentaire)
  let id = commercantId;
  if (!id && typeof window !== 'undefined') {
    id = new URLSearchParams(window.location.search).get('id') || '';
  }
  const espace = id ? getCachedAbonne(id) : null;
  if (!espace) return null;

  const status = String(espace.subscription_status || '').toLowerCase();
  if (status !== 'trialing') return null;

  const trialEnd = espace.trial_ends_at || (() => {
    if (!espace.provisioned_at) return null;
    try {
      const d = new Date(espace.provisioned_at);
      d.setDate(d.getDate() + 7);
      return d.toISOString();
    } catch { return null; }
  })();
  if (!trialEnd) return null;

  const totalDays = 7;
  const msLeft = new Date(trialEnd).getTime() - Date.now();
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  const daysUsed = Math.max(0, totalDays - daysLeft);
  const progressPct = Math.min(100, Math.round(((daysUsed) / totalDays) * 100));

  return (
    <div className="mx-3 mb-3 mt-3">
      <div
        className="px-3.5 py-3 rounded-2xl"
        style={{
          background: '#F9FAFB',
          border: '1px solid #F3F4F6',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.10em]" style={{ color: '#047857' }}>
            Essai en cours
          </p>
          <p className="text-[11px] font-extrabold tabular-nums text-gray-900">
            J{daysUsed + 1}<span className="text-gray-400 font-bold"> / {totalDays}</span>
          </p>
        </div>
        {/* Mini progress bar */}
        <div className="h-1 rounded-full overflow-hidden" style={{ background: '#E5E7EB' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #10B981, #059669)',
              transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)',
            }}
          />
        </div>
        <p className="text-[10.5px] mt-1.5 font-semibold" style={{ color: '#6B7280' }}>
          {daysLeft > 0 ? `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}` : 'Dernier jour'}
        </p>
      </div>
    </div>
  );
}

function computeInitials(name) {
  if (!name || typeof name !== 'string') return null;
  const cleaned = name.replace(/[^a-zA-ZÀ-ÿ ]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) return null;
  const parts = cleaned.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
