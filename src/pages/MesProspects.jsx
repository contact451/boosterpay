// ─────────────────────────────────────────────────────────────────
//  MesProspects — Configurateur d'achat de prospects qualifiés
//
//  Étapes :
//   1. Choisir une catégorie (Urgences / Artisans / Services / Santé / Commerce)
//   2. Choisir une zone géographique (ville ou département FR)
//   3. Choisir le nombre (50 → 1000) avec prix dégressif
//   4. Voir le récap + déclencher le paiement Stripe Checkout
//
//  Livraison : CSV téléchargeable dans la rubrique "Mes prospects" après
//  paiement, avec colonnes nom / commerce / profession / ville / mobile.
// ─────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Target,
  MapPin,
  Users,
  TrendingUp,
  Sparkles,
  Check,
  ArrowRight,
  Wrench,
  Stethoscope,
  Briefcase,
  ShoppingBag,
  Siren,
  Download,
  Info,
  ChevronDown,
} from 'lucide-react';
import EspaceLayout from '../components/EspaceLayout';
import { getCachedAbonne } from '../services/abonneCache';

// ────── Catalogue ──────
// Tarif de base par prospect, dégressif au volume.
const CATEGORIES = [
  {
    id: 'urgences',
    label: 'Urgences',
    sublabel: 'Plomberie, serrurerie, chauffagiste, dépannage',
    icon: Siren,
    color: '#DC2626',
    bg: '#FEF2F2',
    pricePerLead: 1.90,
    expectedConv: '4–7%',
    note: 'Conversion la plus élevée : besoin immédiat.',
  },
  {
    id: 'artisans',
    label: 'Artisans',
    sublabel: 'Peintre, maçon, électricien, menuisier, jardinier',
    icon: Wrench,
    color: '#0F766E',
    bg: '#F0FDF4',
    pricePerLead: 1.40,
    expectedConv: '2–4%',
    note: 'Devis sur RDV — bon volume.',
  },
  {
    id: 'sante',
    label: 'Santé & Bien-être',
    sublabel: 'Kiné, esthéticienne, podologue, ostéopathe, coach',
    icon: Stethoscope,
    color: '#7C3AED',
    bg: '#FAF5FF',
    pricePerLead: 1.20,
    expectedConv: '1.5–3%',
    note: 'Forte récurrence client.',
  },
  {
    id: 'services',
    label: 'Services',
    sublabel: 'Traiteur, déménageur, pressing, taxi, photographe',
    icon: Briefcase,
    color: '#0EA5E9',
    bg: '#F0F9FF',
    pricePerLead: 1.10,
    expectedConv: '1.5–3%',
    note: 'Bon équilibre volume / coût.',
  },
  {
    id: 'commerce',
    label: 'Commerce',
    sublabel: 'Boulangerie, fleuriste, opticien, boucher, primeur',
    icon: ShoppingBag,
    color: '#D97706',
    bg: '#FFFBEB',
    pricePerLead: 0.95,
    expectedConv: '1–2%',
    note: 'Volume fort, ROI sur long terme.',
  },
];

// Volumes proposés (mobile FR ciblés)
const VOLUMES = [
  { count: 50,   discount: 0,    label: '50' },
  { count: 100,  discount: 0.05, label: '100' },
  { count: 250,  discount: 0.10, label: '250' },
  { count: 500,  discount: 0.18, label: '500' },
  { count: 1000, discount: 0.25, label: '1 000' },
];

// Zones — top départements FR (simplifié, on étendra plus tard avec une API)
const TOP_ZONES = [
  { code: 'national', label: 'France entière', multiplier: 1.0 },
  { code: '75', label: 'Paris (75)', multiplier: 1.25 },
  { code: '13', label: 'Bouches-du-Rhône (13)', multiplier: 1.10 },
  { code: '69', label: 'Rhône (69)', multiplier: 1.10 },
  { code: '59', label: 'Nord (59)', multiplier: 1.05 },
  { code: '92', label: 'Hauts-de-Seine (92)', multiplier: 1.20 },
  { code: '33', label: 'Gironde (33)', multiplier: 1.10 },
  { code: '44', label: 'Loire-Atlantique (44)', multiplier: 1.05 },
  { code: '06', label: 'Alpes-Maritimes (06)', multiplier: 1.10 },
  { code: '34', label: 'Hérault (34)', multiplier: 1.05 },
  { code: '29', label: 'Finistère (29)', multiplier: 1.00 },
  { code: '35', label: 'Ille-et-Vilaine (35)', multiplier: 1.00 },
  { code: '56', label: 'Morbihan (56)', multiplier: 1.00 },
  { code: '22', label: 'Côtes-d\'Armor (22)', multiplier: 1.00 },
];

function formatPrice(eur) {
  return eur.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─────────────────────────────────────────────────────────────────
export default function MesProspects() {
  const [searchParams] = useSearchParams();
  const commercantId = searchParams.get('id') || '';
  const cachedAbonne = commercantId ? getCachedAbonne(commercantId) : null;
  const nomCommerce = cachedAbonne?.nom_commerce || '';

  const [categoryId, setCategoryId] = useState('urgences');
  const [zoneCode, setZoneCode] = useState('29'); // Finistère par défaut (BZH)
  const [volume, setVolume] = useState(100);
  const [submitting, setSubmitting] = useState(false);

  const category = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];
  const zone = TOP_ZONES.find((z) => z.code === zoneCode) || TOP_ZONES[0];
  const volumeMeta = VOLUMES.find((v) => v.count === volume) || VOLUMES[0];

  // Calcul du prix dynamique HT
  const pricing = useMemo(() => {
    const base = category.pricePerLead * volume;
    const zoneAdjusted = base * zone.multiplier;
    const afterDiscount = zoneAdjusted * (1 - volumeMeta.discount);
    const unitPrice = afterDiscount / volume;
    return {
      totalHT: afterDiscount,
      totalTTC: afterDiscount * 1.20,
      unitPrice: unitPrice,
      saved: zoneAdjusted - afterDiscount,
    };
  }, [category.pricePerLead, volume, zone.multiplier, volumeMeta.discount]);

  const handleCheckout = async () => {
    setSubmitting(true);
    // TODO : POST → Apps Script createProspectsCheckout
    //   { action: 'createProspectsCheckout', commercant_id, category_id,
    //     zone_code, volume } → renvoie une URL Stripe Checkout
    // En attendant on simule
    setTimeout(() => {
      alert(
        `Préparation du paiement…\n\nCatégorie : ${category.label}\nZone : ${zone.label}\nVolume : ${volume} prospects\nTotal HT : ${formatPrice(pricing.totalHT)}\nTotal TTC : ${formatPrice(pricing.totalTTC)}\n\n(Stripe Checkout sera connecté dans la prochaine étape.)`
      );
      setSubmitting(false);
    }, 600);
  };

  return (
    <EspaceLayout
      nomCommerce={nomCommerce}
      commercantId={commercantId}
      activeSection="prospects"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">

        {/* ═══ Header ═══ */}
        <div className="mb-7">
          <div className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: '#10B981' }}>
            <Sparkles className="w-3 h-3" strokeWidth={2.4} />
            Acquisition · Prospects qualifiés
          </div>
          <h1
            className="font-bold tracking-tight text-gray-900"
            style={{ fontSize: 'clamp(26px, 4vw, 34px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
          >
            Acheter des prospects
          </h1>
          <p className="mt-2 text-[15px] text-gray-500 max-w-xl leading-relaxed">
            Choisissez votre cible et recevez immédiatement un fichier de mobiles français vérifiés, prêts à être contactés.
          </p>
        </div>

        {/* ═══ Step 1 — Catégorie ═══ */}
        <Section number={1} title="Catégorie" sub="Quels prospects ciblez-vous ?">
          <div className="grid sm:grid-cols-2 gap-2.5">
            {CATEGORIES.map((c) => {
              const isActive = c.id === categoryId;
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategoryId(c.id)}
                  className="text-left rounded-2xl p-4 transition-all active:scale-[0.99]"
                  style={{
                    background: isActive ? c.bg : '#FFFFFF',
                    border: isActive
                      ? `1.5px solid ${c.color}`
                      : '1px solid #E5E7EB',
                    boxShadow: isActive
                      ? `0 0 0 4px ${c.bg}, 0 6px 18px ${c.bg}`
                      : '0 1px 2px rgba(0,0,0,0.03)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: isActive ? '#FFFFFF' : c.bg }}
                    >
                      <Icon size={18} color={c.color} strokeWidth={2.4} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <p className="text-[14.5px] font-bold text-gray-900 leading-tight">{c.label}</p>
                        <span
                          className="text-[11px] font-bold rounded-full px-2 py-0.5"
                          style={{ background: c.color, color: 'white' }}
                        >
                          {formatPrice(c.pricePerLead)}/lead
                        </span>
                      </div>
                      <p className="text-[12.5px] text-gray-500 mt-0.5 leading-snug">{c.sublabel}</p>
                      <div className="flex items-center gap-1.5 mt-2 text-[11.5px] font-semibold" style={{ color: c.color }}>
                        <TrendingUp size={12} strokeWidth={2.4} />
                        Conversion attendue : {c.expectedConv}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <Hint text={category.note} color={category.color} />
        </Section>

        {/* ═══ Step 2 — Zone ═══ */}
        <Section number={2} title="Zone" sub="Où voulez-vous cibler ?">
          <div className="relative">
            <select
              value={zoneCode}
              onChange={(e) => setZoneCode(e.target.value)}
              className="w-full appearance-none rounded-2xl py-3.5 pl-12 pr-10 text-[15px] font-semibold text-gray-900 bg-white"
              style={{
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                height: '58px',
              }}
            >
              {TOP_ZONES.map((z) => (
                <option key={z.code} value={z.code}>{z.label}{z.multiplier > 1 ? ' · zone premium' : ''}</option>
              ))}
            </select>
            <MapPin
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              size={18}
              color="#10B981"
              strokeWidth={2.4}
            />
            <ChevronDown
              className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
              size={16}
              color="#9CA3AF"
              strokeWidth={2.4}
            />
          </div>
          {zone.multiplier > 1 && (
            <Hint
              text={`Zone premium : +${Math.round((zone.multiplier - 1) * 100)}% (densité plus forte, conversion supérieure).`}
              color="#10B981"
            />
          )}
        </Section>

        {/* ═══ Step 3 — Volume ═══ */}
        <Section number={3} title="Volume" sub="Combien de prospects ?">
          <div className="grid grid-cols-5 gap-2">
            {VOLUMES.map((v) => {
              const isActive = v.count === volume;
              return (
                <button
                  key={v.count}
                  onClick={() => setVolume(v.count)}
                  className="rounded-2xl py-3.5 flex flex-col items-center transition-all active:scale-95"
                  style={{
                    background: isActive ? '#0F172A' : '#FFFFFF',
                    color: isActive ? 'white' : '#374151',
                    border: isActive ? '1px solid #0F172A' : '1px solid #E5E7EB',
                    boxShadow: isActive
                      ? '0 4px 12px rgba(15,23,42,0.20)'
                      : '0 1px 2px rgba(0,0,0,0.03)',
                  }}
                >
                  <span className="text-[15px] font-bold">{v.label}</span>
                  {v.discount > 0 && (
                    <span
                      className="text-[10px] font-bold mt-0.5"
                      style={{ color: isActive ? '#10B981' : '#10B981' }}
                    >
                      -{Math.round(v.discount * 100)}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {volumeMeta.discount > 0 && (
            <Hint
              text={`Remise volume appliquée : ${formatPrice(pricing.saved)} économisés.`}
              color="#10B981"
            />
          )}
        </Section>

        {/* ═══ Récap + CTA ═══ */}
        <div
          className="mt-7 rounded-3xl p-6 md:p-7"
          style={{
            background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)',
            border: '1.5px solid rgba(16, 185, 129, 0.30)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 12px 32px rgba(16,185,129,0.14)',
          }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.30)',
              }}
            >
              <Target size={17} color="white" strokeWidth={2.4} />
            </div>
            <div className="flex-1">
              <p className="text-[11.5px] font-bold uppercase tracking-[0.14em]" style={{ color: '#047857' }}>
                Votre commande
              </p>
              <p className="text-[15.5px] font-bold text-gray-900 mt-0.5">
                {volume} prospects · {category.label}
              </p>
              <p className="text-[13px] text-gray-600 mt-0.5">
                {zone.label} · {formatPrice(pricing.unitPrice)} par lead
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 my-4">
            <RecapLine label="Total HT" value={formatPrice(pricing.totalHT)} />
            <RecapLine label="Total TTC" value={formatPrice(pricing.totalTTC)} highlight />
          </div>

          <button
            onClick={handleCheckout}
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl text-[15px] font-bold transition-transform active:scale-[0.98] disabled:opacity-60"
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
            }}
          >
            {submitting ? 'Préparation du paiement…' : 'Acheter maintenant'}
            {!submitting && <ArrowRight size={16} strokeWidth={2.6} />}
          </button>

          <p className="text-center text-[11.5px] text-gray-500 mt-3">
            Paiement sécurisé Stripe · Livraison immédiate du CSV après paiement
          </p>
        </div>

        {/* ═══ Engagements ═══ */}
        <div className="mt-7 grid sm:grid-cols-3 gap-2.5">
          <Engagement icon={Check} label="Mobiles FR vérifiés" sub="Format E.164, opt-in opérateur" />
          <Engagement icon={Download} label="Livraison CSV instant" sub="Téléchargement immédiat" />
          <Engagement icon={Users} label="100% RGPD" sub="Bases opt-in commerciales" />
        </div>

        {/* ═══ FAQ courte ═══ */}
        <div className="mt-10">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-3">
            Bon à savoir
          </h2>
          <div className="space-y-3 text-[13.5px] text-gray-600 leading-relaxed">
            <p>
              <strong className="text-gray-800">Format CSV</strong> : colonnes <code className="text-[12px] bg-gray-100 px-1 rounded">nom_commerce</code>, <code className="text-[12px] bg-gray-100 px-1 rounded">profession</code>, <code className="text-[12px] bg-gray-100 px-1 rounded">ville</code>, <code className="text-[12px] bg-gray-100 px-1 rounded">code_postal</code>, <code className="text-[12px] bg-gray-100 px-1 rounded">mobile</code>, <code className="text-[12px] bg-gray-100 px-1 rounded">score</code>.
            </p>
            <p>
              <strong className="text-gray-800">Doublons</strong> : nous excluons automatiquement les numéros déjà commandés par vous précédemment.
            </p>
            <p>
              <strong className="text-gray-800">RGPD</strong> : tous les prospects sont issus de bases professionnelles opt-in. Mention "Prospection commerciale — STOP au 36173 pour vous désinscrire" obligatoire dans vos SMS.
            </p>
          </div>
        </div>
      </div>
    </EspaceLayout>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Composants internes
// ─────────────────────────────────────────────────────────────────
function Section({ number, title, sub, children }) {
  return (
    <section className="mb-6">
      <div className="flex items-baseline gap-2 mb-3">
        <span
          className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[12px] font-bold flex-shrink-0"
          style={{ background: '#ECFDF5', color: '#047857' }}
        >
          {number}
        </span>
        <h2 className="text-[18px] font-bold text-gray-900 tracking-tight" style={{ letterSpacing: '-0.01em' }}>
          {title}
        </h2>
        {sub && <span className="text-[13.5px] text-gray-500 ml-1">· {sub}</span>}
      </div>
      {children}
    </section>
  );
}

function Hint({ text, color = '#10B981' }) {
  return (
    <div
      className="mt-2.5 flex items-start gap-2 text-[12.5px] leading-snug"
      style={{ color: '#6B7280' }}
    >
      <Info size={12} strokeWidth={2.4} className="flex-shrink-0 mt-0.5" color={color} />
      <span>{text}</span>
    </div>
  );
}

function RecapLine({ label, value, highlight }) {
  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: highlight ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
        border: '1px solid rgba(16,185,129,0.18)',
      }}
    >
      <p className="text-[10.5px] font-bold uppercase tracking-[0.12em]" style={{ color: '#374151' }}>
        {label}
      </p>
      <p
        className="font-extrabold mt-1"
        style={{
          fontSize: highlight ? 'clamp(22px, 4vw, 28px)' : 'clamp(18px, 3vw, 22px)',
          color: highlight ? '#0F172A' : '#6B7280',
          fontFeatureSettings: '"tnum"',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </p>
    </div>
  );
}

function Engagement({ icon: Icon, label, sub }) {
  return (
    <div
      className="rounded-2xl p-4 flex items-start gap-3"
      style={{ background: '#F9FAFB', border: '1px solid #F3F4F6' }}
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: '#ECFDF5' }}
      >
        <Icon size={14} color="#047857" strokeWidth={2.4} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-gray-900 leading-tight">{label}</p>
        <p className="text-[11.5px] text-gray-500 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}
