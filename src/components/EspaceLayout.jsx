// ─────────────────────────────────────────────────────────────────
//  EspaceLayout — Layout commun pour toutes les pages de l'espace user
//
//  Structure :
//   - Desktop : sidebar fixe gauche (240px) + main scrollable
//   - Mobile  : top nav avec onglets horizontaux scrollables
//
//  Props :
//   - children       : contenu de la page
//   - nomCommerce    : nom du commerce (affiché en sidebar)
//   - commercantId   : id utilisé pour construire les liens
//   - activeSection  : 'bienvenue' | 'parametres' | 'abonnement'
//
//  Utilisé par : MerciPage (phase provisioning/ready/expired), EspaceAbonne
// ─────────────────────────────────────────────────────────────────

import { Link } from 'react-router-dom';
import { Home, LayoutGrid, CreditCard, HelpCircle, Store } from 'lucide-react';

const NAV_SECTIONS = [
  { id: 'bienvenue', label: 'Bienvenue', icon: Home, baseTo: '/merci' },
  { id: 'modules', label: 'Mes modules', icon: LayoutGrid, baseTo: '/espace/modules' },
  { id: 'abonnement', label: 'Mon abonnement', icon: CreditCard, baseTo: '/configurer' },
];

export default function EspaceLayout({ children, nomCommerce, commercantId, activeSection = 'bienvenue' }) {
  // Construit les liens en propagant commercant_id / subscription
  const buildLink = (baseTo) => {
    if (baseTo === '/merci') {
      const params = new URLSearchParams({ subscription: '1' });
      if (commercantId) params.set('commercant_id', commercantId);
      return `/merci?${params.toString()}`;
    }
    if (baseTo === '/configurer' || baseTo === '/espace/modules') {
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
        {/* Brand + statut live */}
        <div className="px-6 pt-7 pb-5">
          <Link to="/" className="block text-gray-900 font-bold text-[16px] tracking-tight mb-1.5 hover:opacity-80 transition-opacity">
            BoosterPay
          </Link>
          {nomCommerce ? (
            <div className="inline-flex items-center gap-1.5 text-[12.5px] text-gray-500 max-w-full mb-2">
              <Store className="w-3 h-3 flex-shrink-0" strokeWidth={2.2} />
              <span className="truncate">{nomCommerce}</span>
            </div>
          ) : (
            <div className="text-[12.5px] text-gray-400 mb-2">Mon espace</div>
          )}
          {/* Statut live — dot vert pulsé */}
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: '#10B981' }}>
            <span className="relative inline-flex w-1.5 h-1.5">
              <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </span>
            En ligne
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV_SECTIONS.map((s) => {
            const isActive = s.id === activeSection;
            const Icon = s.icon;
            return (
              <Link
                key={s.id}
                to={buildLink(s.baseTo)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150"
                style={{
                  background: isActive ? 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)' : 'transparent',
                  color: isActive ? '#047857' : '#4B5563',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <Icon className="w-4 h-4" strokeWidth={2.2} style={{ color: isActive ? '#10B981' : '#6B7280' }} />
                <span>{s.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer aide */}
        <div className="px-3 pb-6 pt-3" style={{ borderTop: '1px solid #F3F4F6' }}>
          <a
            href="mailto:contact@booster-pay.com"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" strokeWidth={2.2} />
            Aide & contact
          </a>
        </div>
      </aside>

      {/* ════════ MOBILE TOP NAV (< md) ════════ */}
      <header className="md:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-md" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <div className="px-5 py-3.5 flex items-center justify-between">
          <Link to="/" className="text-gray-900 font-bold text-[15px] tracking-tight">
            BoosterPay
          </Link>
          {nomCommerce && (
            <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-500 max-w-[160px]">
              <Store className="w-3 h-3 flex-shrink-0" strokeWidth={2.2} />
              <span className="truncate">{nomCommerce}</span>
            </span>
          )}
        </div>
        {/* Onglets horizontaux */}
        <nav
          className="flex overflow-x-auto"
          style={{ borderTop: '1px solid #F3F4F6', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {NAV_SECTIONS.map((s) => {
            const isActive = s.id === activeSection;
            const Icon = s.icon;
            return (
              <Link
                key={s.id}
                to={buildLink(s.baseTo)}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-3 text-[13px] font-semibold transition-colors whitespace-nowrap"
                style={{
                  borderBottom: isActive ? '2px solid #10B981' : '2px solid transparent',
                  color: isActive ? '#047857' : '#6B7280',
                }}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={2.4} />
                {s.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* ════════ MAIN CONTENT ════════ */}
      <main className="md:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
