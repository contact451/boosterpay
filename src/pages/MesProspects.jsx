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

import { useMemo, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Target,
  MapPin,
  Users,
  TrendingUp,
  Sparkles,
  Check,
  ArrowRight,
  ArrowUpRight,
  Wrench,
  Stethoscope,
  Briefcase,
  ShoppingBag,
  Siren,
  Download,
  Info,
  ChevronDown,
  Lock,
  Search,
  X,
} from 'lucide-react';
import EspaceLayout from '../components/EspaceLayout';
import { getCachedAbonne } from '../services/abonneCache';

// ────── Catalogue ──────
// Tarif de base par prospect, dégressif au volume.
// ─── Catalogue catégories — chiffres conversion observés flotte BoosterPay ───
//
// Modèle business :
//   Conversion moyenne 11% (= 11 clients pour 100 contacts qualifiés)
//   Tickets moyens hauts (panier moyen observé sur les clients PME convertis)
//   → CA estimé = 100 × 0.11 × avgTicketEur
//
// La valeur 11% est la moyenne haute observée sur les cohortes PME locales
// 2024-2025 (CallPilot + emails+SMS post-contact). C'est une estimation —
// les résultats varient selon qualité de l'offre, saison, timing d'appel.
const CONVERSION_RATE = 0.11; // 11% — taux moyen observé toutes catégories
const PROSPECT_PER_BATCH = 100; // unité de calcul CA pour affichage

const CATEGORIES = [
  {
    id: 'urgences',
    label: 'Urgences',
    sublabel: 'Plomberie, serrurerie, chauffagiste, dépannage',
    icon: Siren,
    color: '#DC2626',
    bg: '#FEF2F2',
    pricePerLead: 1.90,
    avgTicketEur: 280,         // intervention urgence moyenne (déplacement + main d'œuvre)
    badge: 'Top retour',
    note: 'Besoin immédiat, conversion maximale.',
  },
  {
    id: 'artisans',
    label: 'Artisans',
    sublabel: 'Peintre, maçon, électricien, menuisier, jardinier',
    icon: Wrench,
    color: '#0F766E',
    bg: '#F0FDF4',
    pricePerLead: 1.40,
    avgTicketEur: 1800,        // devis travaux moyen artisan
    badge: 'Gros paniers',
    note: 'Devis travaux, tickets élevés.',
  },
  {
    id: 'sante',
    label: 'Santé & Bien-être',
    sublabel: 'Kiné, esthéticienne, podologue, ostéopathe, coach',
    icon: Stethoscope,
    color: '#7C3AED',
    bg: '#FAF5FF',
    pricePerLead: 1.20,
    avgTicketEur: 520,         // forfait + récurrence annuelle (4-6 séances)
    badge: 'Récurrence forte',
    note: 'Clients fidèles, CA récurrent.',
  },
  {
    id: 'services',
    label: 'Services',
    sublabel: 'Traiteur, déménageur, pressing, taxi, photographe',
    icon: Briefcase,
    color: '#0EA5E9',
    bg: '#F0F9FF',
    pricePerLead: 1.10,
    avgTicketEur: 420,         // prestation moyenne service local
    badge: 'Bon équilibre',
    note: 'Volume + ticket équilibrés.',
  },
  {
    id: 'commerce',
    label: 'Commerce',
    sublabel: 'Boulangerie, fleuriste, opticien, boucher, primeur',
    icon: ShoppingBag,
    color: '#D97706',
    bg: '#FFFBEB',
    pricePerLead: 0.95,
    avgTicketEur: 480,         // panier annuel client fidélisé
    badge: 'Long terme',
    note: 'Trafic récurrent, fidélisation.',
  },
];

// Formate "1 200 €" propre style fr
function formatCA(eur) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(eur);
}

// CA additionnel estimé : conversion 11% × ticket moyen × nb prospects
//   Utilisé pour les cards catégories (preview sur 100 contacts) ET pour
//   le récap commande (sur le volume sélectionné).
function estimateCA(category, nbProspects = PROSPECT_PER_BATCH) {
  const clients = nbProspects * CONVERSION_RATE;
  return Math.round(clients * category.avgTicketEur);
}

// Volumes proposés (mobile FR ciblés)
const VOLUMES = [
  { count: 50,   discount: 0,    label: '50' },
  { count: 100,  discount: 0.05, label: '100' },
  { count: 250,  discount: 0.10, label: '250' },
  { count: 500,  discount: 0.18, label: '500' },
  { count: 1000, discount: 0.25, label: '1 000' },
];

// ─── Zones de ciblage : couverture exhaustive France ───
//
// Pattern Apple Settings (langues / pays) : 3 sections groupées,
// barre de recherche en haut, scroll fluide.
//
//  - 1 zone "France entière" (multiplier base 1.0)
//  - 13 régions FR (multipliers selon densité commerciale)
//  - 101 départements (95 métropole + 5 outre-mer)
//
// Multipliers calculés selon densité de PME (sources INSEE 2024) :
//   - Premium (1.20–1.25) : 75 (Paris), 92 (Hauts-de-Seine), Île-de-France
//   - Élevé (1.05–1.10)   : grandes métropoles régionales (Lyon, Bordeaux, Lille…)
//   - Standard (1.00)     : reste du territoire

const ZONE_NATIONAL = { type: 'national', code: 'FR', label: 'France entière', multiplier: 1.0 };

const ZONE_REGIONS = [
  { type: 'region', code: 'IDF', label: 'Île-de-France',              multiplier: 1.20 },
  { type: 'region', code: 'ARA', label: 'Auvergne-Rhône-Alpes',       multiplier: 1.08 },
  { type: 'region', code: 'PAC', label: "Provence-Alpes-Côte d'Azur", multiplier: 1.08 },
  { type: 'region', code: 'OCC', label: 'Occitanie',                  multiplier: 1.05 },
  { type: 'region', code: 'NAQ', label: 'Nouvelle-Aquitaine',         multiplier: 1.05 },
  { type: 'region', code: 'GES', label: 'Grand Est',                  multiplier: 1.05 },
  { type: 'region', code: 'HDF', label: 'Hauts-de-France',            multiplier: 1.05 },
  { type: 'region', code: 'PDL', label: 'Pays de la Loire',           multiplier: 1.03 },
  { type: 'region', code: 'BRE', label: 'Bretagne',                   multiplier: 1.00 },
  { type: 'region', code: 'NOR', label: 'Normandie',                  multiplier: 1.00 },
  { type: 'region', code: 'CVL', label: 'Centre-Val de Loire',        multiplier: 1.00 },
  { type: 'region', code: 'BFC', label: 'Bourgogne-Franche-Comté',    multiplier: 1.00 },
  { type: 'region', code: 'COR', label: 'Corse',                      multiplier: 1.00 },
];

// 101 départements français (métropole + outre-mer)
// Format : { code, name } → multiplier dérivé selon densité urbaine
const DEPARTEMENTS_RAW = [
  ['01', 'Ain'], ['02', 'Aisne'], ['03', 'Allier'], ['04', 'Alpes-de-Haute-Provence'],
  ['05', 'Hautes-Alpes'], ['06', 'Alpes-Maritimes'], ['07', 'Ardèche'], ['08', 'Ardennes'],
  ['09', 'Ariège'], ['10', 'Aube'], ['11', 'Aude'], ['12', 'Aveyron'],
  ['13', 'Bouches-du-Rhône'], ['14', 'Calvados'], ['15', 'Cantal'], ['16', 'Charente'],
  ['17', 'Charente-Maritime'], ['18', 'Cher'], ['19', 'Corrèze'], ['2A', 'Corse-du-Sud'],
  ['2B', 'Haute-Corse'], ['21', "Côte-d'Or"], ['22', "Côtes-d'Armor"], ['23', 'Creuse'],
  ['24', 'Dordogne'], ['25', 'Doubs'], ['26', 'Drôme'], ['27', 'Eure'],
  ['28', 'Eure-et-Loir'], ['29', 'Finistère'], ['30', 'Gard'], ['31', 'Haute-Garonne'],
  ['32', 'Gers'], ['33', 'Gironde'], ['34', 'Hérault'], ['35', 'Ille-et-Vilaine'],
  ['36', 'Indre'], ['37', 'Indre-et-Loire'], ['38', 'Isère'], ['39', 'Jura'],
  ['40', 'Landes'], ['41', 'Loir-et-Cher'], ['42', 'Loire'], ['43', 'Haute-Loire'],
  ['44', 'Loire-Atlantique'], ['45', 'Loiret'], ['46', 'Lot'], ['47', 'Lot-et-Garonne'],
  ['48', 'Lozère'], ['49', 'Maine-et-Loire'], ['50', 'Manche'], ['51', 'Marne'],
  ['52', 'Haute-Marne'], ['53', 'Mayenne'], ['54', 'Meurthe-et-Moselle'], ['55', 'Meuse'],
  ['56', 'Morbihan'], ['57', 'Moselle'], ['58', 'Nièvre'], ['59', 'Nord'],
  ['60', 'Oise'], ['61', 'Orne'], ['62', 'Pas-de-Calais'], ['63', 'Puy-de-Dôme'],
  ['64', 'Pyrénées-Atlantiques'], ['65', 'Hautes-Pyrénées'], ['66', 'Pyrénées-Orientales'],
  ['67', 'Bas-Rhin'], ['68', 'Haut-Rhin'], ['69', 'Rhône'], ['70', 'Haute-Saône'],
  ['71', 'Saône-et-Loire'], ['72', 'Sarthe'], ['73', 'Savoie'], ['74', 'Haute-Savoie'],
  ['75', 'Paris'], ['76', 'Seine-Maritime'], ['77', 'Seine-et-Marne'], ['78', 'Yvelines'],
  ['79', 'Deux-Sèvres'], ['80', 'Somme'], ['81', 'Tarn'], ['82', 'Tarn-et-Garonne'],
  ['83', 'Var'], ['84', 'Vaucluse'], ['85', 'Vendée'], ['86', 'Vienne'],
  ['87', 'Haute-Vienne'], ['88', 'Vosges'], ['89', 'Yonne'], ['90', 'Territoire de Belfort'],
  ['91', 'Essonne'], ['92', 'Hauts-de-Seine'], ['93', 'Seine-Saint-Denis'], ['94', 'Val-de-Marne'],
  ['95', "Val-d'Oise"],
  // Outre-mer
  ['971', 'Guadeloupe'], ['972', 'Martinique'], ['973', 'Guyane'],
  ['974', 'La Réunion'], ['976', 'Mayotte'],
];

// Multipliers premium par code département
const DEPT_MULTIPLIERS = {
  '75': 1.25, '92': 1.20, '93': 1.05, '94': 1.10, '91': 1.05,
  '77': 1.03, '78': 1.05, '95': 1.03,
  '13': 1.10, '06': 1.10, '69': 1.10, '33': 1.10, '31': 1.08,
  '59': 1.05, '44': 1.05, '67': 1.05, '34': 1.05, '38': 1.05,
  '83': 1.03, '74': 1.03, '54': 1.03, '76': 1.03,
};

const ZONE_DEPTS = DEPARTEMENTS_RAW.map(([code, name]) => ({
  type: 'dept',
  code,
  label: `${name} (${code})`,
  shortLabel: name,
  multiplier: DEPT_MULTIPLIERS[code] || 1.00,
}));

// Liste plate exhaustive pour findRow / autocomplete
const ALL_ZONES = [ZONE_NATIONAL, ...ZONE_REGIONS, ...ZONE_DEPTS];

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
  // Infos commerçant nécessaires pour pré-remplir submitLeadsRequest
  // (entreprise + email + mobile sont attendus côté backend api.gs).
  // On tente d'abord depuis le cache, fallback fetch en background.
  const [commercantInfo, setCommercantInfo] = useState({
    nom_commerce: cachedAbonne?.nom_commerce || '',
    email: cachedAbonne?.email || '',
    mobile_perso: cachedAbonne?.mobile_perso || '',
    code_postal: cachedAbonne?.code_postal || '',
  });

  // Background fetch si infos incomplètes (email pas en cache)
  useEffect(() => {
    if (!commercantId) return;
    if (commercantInfo.nom_commerce && commercantInfo.email && commercantInfo.mobile_perso) return;
    const apiUrl = import.meta.env.VITE_VONAGE_CRM_APPS_SCRIPT_URL || '';
    if (!apiUrl) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'getEspaceAbonne', commercant_id: commercantId }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (json && json.ok && json.espace) {
          setCommercantInfo({
            nom_commerce: json.espace.nom_commerce || '',
            email: json.espace.email || '',
            mobile_perso: json.espace.mobile_perso || '',
            code_postal: json.espace.code_postal || '',
          });
        }
      } catch (_e) { /* silent */ }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commercantId]);

  // Aucune valeur par défaut → l'user doit valider chaque étape consciemment
  // (pattern Apple iPhone Setup où chaque écran exige une action).
  const [categoryId, setCategoryId] = useState('');
  const [zoneCode, setZoneCode] = useState('');
  const [volume, setVolume] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  // 'idle' | 'sent' | 'error' — affiche un état de succès après envoi backend
  const [submitResult, setSubmitResult] = useState({ status: 'idle', demandeId: '', error: '' });

  // Progression : un dot devient emerald uniquement quand l'étape correspondante
  // a été validée par un click utilisateur. Progressive disclosure Apple-style.
  const step1Done = Boolean(categoryId);
  const step2Done = Boolean(zoneCode);
  const step3Done = volume !== null;

  // Fallback pour les calculs internes uniquement (pas affichés tant que step pas Done)
  const category = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];
  const zone = ALL_ZONES.find((z) => z.code === zoneCode) || ALL_ZONES[0];
  const volumeMeta = VOLUMES.find((v) => v.count === volume) || VOLUMES[0];
  const allStepsDone = step1Done && step2Done && step3Done;

  // Calcul du prix dynamique HT
  const pricing = useMemo(() => {
    const base = category.pricePerLead * (volume || 0);
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
    if (!allStepsDone || submitting) return;
    setSubmitting(true);
    setSubmitResult({ status: 'idle', demandeId: '', error: '' });

    // On envoie sur le MÊME endpoint que le formulaire "Réservez votre zone" de
    // la landing : action `submitLeadsRequest` sur VITE_GOOGLE_SHEET_API_URL.
    // → Toutes les demandes (landing + espace user) atterrissent dans la sheet
    //   "🎯 Demandes Leads" du CRM v7, lisible par /demandes-leads du CRM.
    const apiUrl = import.meta.env.VITE_GOOGLE_SHEET_API_URL || '';
    if (!apiUrl) {
      setSubmitting(false);
      setSubmitResult({ status: 'error', demandeId: '', error: 'API non configurée.' });
      return;
    }

    // Source compact + traçable côté CRM : "espace_user_prospects · BP-XXX"
    const sourceTag = `espace_user_prospects · ${commercantId || 'anonyme'}`;
    // Volume formaté avec zone (la colonne "volume" du CRM accepte un texte libre)
    const volumeTxt = `${volume} prospects · ${zone.label}`;

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'submitLeadsRequest',
          entreprise: commercantInfo.nom_commerce || nomCommerce || `Commerçant ${commercantId}`,
          secteur: category.label,
          email: commercantInfo.email || '',
          telephone: commercantInfo.mobile_perso || '',
          volume: volumeTxt,
          source: sourceTag,
        }),
      });
      const json = await res.json();
      if (json && json.success) {
        // Le backend renvoie soit { id: 'LREQ-...' } soit { ref: 'L014' } selon version
        setSubmitResult({ status: 'sent', demandeId: json.id || json.ref || '', error: '' });
      } else {
        setSubmitResult({ status: 'error', demandeId: '', error: (json && json.error) || 'Erreur inconnue.' });
      }
    } catch (e) {
      setSubmitResult({ status: 'error', demandeId: '', error: e.message || 'Réseau indisponible.' });
    } finally {
      setSubmitting(false);
    }
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
          <p className="mt-2 text-[15px] text-gray-500 max-w-xl">
            Choisissez votre cible. Recevez le CSV immédiatement.
          </p>
        </div>

        {/* ═══ Progress bar 1 → 2 → 3 — progressive Apple iPhone Setup ═══ */}
        <div className="mb-7 flex items-center gap-3">
          <ProgressDot n={1} label="Catégorie" active={step1Done} />
          <ProgressLine active={step1Done} />
          <ProgressDot n={2} label="Zone" active={step2Done} />
          <ProgressLine active={step2Done && step3Done} />
          <ProgressDot n={3} label="Volume" active={step3Done} />
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[14.5px] font-bold text-gray-900 leading-tight">{c.label}</p>
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-[0.05em]"
                          style={{ background: c.bg, color: c.color }}
                        >
                          {c.badge}
                        </span>
                      </div>
                      <p className="text-[12.5px] text-gray-500 mt-0.5 leading-snug">{c.sublabel}</p>
                      {/* CA additionnel estimé — basé sur 11% de conversion observée */}
                      <div className="inline-flex items-center gap-1.5 mt-2 text-[13px] font-bold flex-wrap" style={{ color: c.color }}>
                        <ArrowUpRight size={13} strokeWidth={2.8} />
                        <span className="text-gray-900">
                          jusqu'à {formatCA(estimateCA(c))}
                        </span>
                        <span className="text-gray-500 font-medium">
                          de CA / 100 contacts
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <Hint text={category.note} color={category.color} />
        </Section>

        {/* ═══ Step 2 — Zone (dropdown Apple search exhaustif) ═══ */}
        <Section number={2} title="Zone" sub="Où voulez-vous cibler ?">
          <ZonePicker
            value={zoneCode}
            onChange={setZoneCode}
          />
          {/* Hint contextuel — uniquement quand une zone est sélectionnée */}
          {step2Done && zone.multiplier > 1 && (
            <Hint
              text={`Zone premium · densité élevée (+${Math.round((zone.multiplier - 1) * 100)}%).`}
              color="#10B981"
            />
          )}
        </Section>

        {/* ═══ Step 3 — Volume ═══ */}
        <Section number={3} title="Volume" sub="Combien de prospects ?">
          {/* gap-1.5 et min-w-[56px] : sur très petit mobile les 5 pills ne se touchent plus */}
          <div className="grid grid-cols-5 gap-1.5">
            {VOLUMES.map((v) => {
              const isActive = v.count === volume;
              return (
                <button
                  key={v.count}
                  onClick={() => setVolume(v.count)}
                  className="rounded-2xl py-3.5 flex flex-col items-center transition-all active:scale-95"
                  style={{
                    minWidth: '56px',
                    background: isActive ? '#0F172A' : '#FFFFFF',
                    color: isActive ? 'white' : '#374151',
                    border: isActive ? '1px solid #0F172A' : '1px solid #E5E7EB',
                    boxShadow: isActive
                      ? '0 4px 12px rgba(15,23,42,0.20)'
                      : '0 1px 2px rgba(0,0,0,0.03)',
                  }}
                >
                  <span className="text-[15px] font-bold">{v.label}</span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* ═══ Récap + CTA — design ultra conversion Apple ═══ */}
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
              {allStepsDone ? (
                <>
                  <p className="text-[16px] font-bold text-gray-900 mt-0.5">
                    {volume} prospects · {category.label}
                  </p>
                  <p className="text-[13px] text-gray-600 mt-0.5">
                    {zone.label}
                  </p>
                </>
              ) : (
                <p className="text-[13.5px] text-gray-500 mt-1">
                  Complétez les 3 étapes ci-dessus.
                </p>
              )}
            </div>
          </div>

          {/* CA additionnel estimé — bloc proéminent quand commande complète */}
          {allStepsDone && (
            <div
              className="mb-4 rounded-2xl p-4 relative overflow-hidden"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid rgba(16,185,129,0.25)',
                boxShadow: '0 4px 14px rgba(16,185,129,0.10)',
              }}
            >
              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em]" style={{ color: '#047857' }}>
                Potentiel de CA additionnel
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span
                  className="font-extrabold leading-none tracking-[-0.03em]"
                  style={{
                    color: '#0F172A',
                    fontSize: 'clamp(28px, 5vw, 36px)',
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  jusqu'à {formatCA(estimateCA(category, volume))}
                </span>
              </div>
              <p className="text-[11.5px] text-gray-500 mt-2 leading-snug flex items-start gap-1.5">
                <Info size={11} strokeWidth={2.4} className="flex-shrink-0 mt-0.5" color="#9CA3AF" />
                <span>
                  Estimation indicative basée sur <strong className="text-gray-700">{Math.round(CONVERSION_RATE * 100)}% de conversion moyenne</strong> et un ticket moyen secteur de {formatCA(category.avgTicketEur)}.
                </span>
              </p>
            </div>
          )}

          {/* État SUCCÈS — affiché après envoi backend */}
          {submitResult.status === 'sent' ? (
            <div
              className="rounded-2xl p-5 text-center"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid rgba(16, 185, 129, 0.4)',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.15)',
              }}
            >
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  boxShadow: '0 8px 20px rgba(16, 185, 129, 0.30)',
                }}
              >
                <Check size={22} color="white" strokeWidth={3} />
              </div>
              <p className="text-[17px] font-bold text-gray-900 tracking-tight">
                Demande envoyée.
              </p>
              <p className="text-[13.5px] text-gray-500 mt-1.5 leading-snug">
                Votre devis personnalisé arrive par email <strong className="text-gray-700">sous 1 h ouvrée</strong>.
              </p>
              {submitResult.demandeId && (
                <p className="text-[11.5px] text-gray-400 mt-3 font-mono">
                  Réf. {submitResult.demandeId}
                </p>
              )}
            </div>
          ) : (
            <>
              {/* CTA — disabled tant que les 3 étapes ne sont pas validées. */}
              <button
                onClick={handleCheckout}
                disabled={submitting || !allStepsDone}
                className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl text-[15px] font-bold transition-transform active:scale-[0.98] disabled:cursor-not-allowed"
                style={{
                  background: allStepsDone ? '#0F172A' : '#E5E7EB',
                  color: allStepsDone ? 'white' : '#9CA3AF',
                  boxShadow: allStepsDone
                    ? '0 6px 20px rgba(15, 23, 42, 0.32), 0 2px 6px rgba(0,0,0,0.06)'
                    : 'none',
                }}
              >
                {submitting ? (
                  'Envoi en cours…'
                ) : (
                  <>
                    <Lock size={14} strokeWidth={2.6} />
                    Recevoir mon devis
                    <ArrowRight size={16} strokeWidth={2.6} />
                  </>
                )}
              </button>

              {/* Trust signals row */}
              <div className="mt-4 flex items-center justify-center gap-4 flex-wrap text-[11px] text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Check size={11} strokeWidth={2.8} color="#10B981" />
                  Sans engagement
                </span>
                <span className="inline-flex items-center gap-1">
                  <Check size={11} strokeWidth={2.8} color="#10B981" />
                  Réponse sous 1 h
                </span>
                <span className="inline-flex items-center gap-1">
                  <Check size={11} strokeWidth={2.8} color="#10B981" />
                  100% RGPD
                </span>
              </div>

              {submitResult.status === 'error' && (
                <div
                  className="mt-3 rounded-xl px-3 py-2 text-center text-[12.5px] font-medium"
                  style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid rgba(220,38,38,0.20)' }}
                >
                  {submitResult.error || 'Erreur — veuillez réessayer.'}
                </div>
              )}
            </>
          )}
        </div>

        {/* ═══ Engagements ═══ */}
        <div className="mt-7 grid sm:grid-cols-3 gap-2.5">
          <Engagement icon={Check} label="Mobiles FR vérifiés" sub="Format E.164, opt-in opérateur" />
          <Engagement icon={Download} label="Livraison CSV instant" sub="Téléchargement immédiat" />
          <Engagement icon={Users} label="100% RGPD" sub="Bases opt-in commerciales" />
        </div>

        {/* ═══ FAQ ultra-courte ═══ */}
        <div className="mt-10">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-3">
            Bon à savoir
          </h2>
          <div className="space-y-2.5 text-[13.5px] text-gray-600 leading-snug">
            <p>
              <strong className="text-gray-800">CSV</strong> · nom, profession, ville, mobile, score.
            </p>
            <p>
              <strong className="text-gray-800">Sans doublons</strong> · nous excluons vos achats précédents.
            </p>
            <p>
              <strong className="text-gray-800">RGPD</strong> · bases opt-in. Mention STOP 36173 obligatoire dans vos SMS.
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
  // mb-4 (16px) au lieu de mb-5 — densifie la mise en page Apple iOS Settings
  return (
    <section className="mb-4">
      <div className="flex items-baseline gap-2 mb-2.5 flex-wrap">
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
  // mt-2 au lieu de mt-2.5 — compacte la respiration sous les selects
  return (
    <div
      className="mt-2 flex items-start gap-2 text-[12.5px] leading-snug"
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

// ─────────────────────────────────────────────────────────────────
//  ZonePicker — dropdown Apple style avec barre de recherche
//
//  UX : bouton qui affiche la zone sélectionnée → click ouvre un sheet
//  modal plein écran sur mobile / centré sur desktop. Sections groupées :
//  France entière / Régions / Départements. Search filter en haut.
//
//  Pattern iOS : Settings → General → Language & Region → Region picker.
// ─────────────────────────────────────────────────────────────────
function ZonePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const selected = ALL_ZONES.find((z) => z.code === value);

  // Focus auto sur la barre de recherche à l'ouverture
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 220);
    // Lock scroll body
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape ferme
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Normalise pour comparaison search (insensible accents + case)
  const normalize = (s) => String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '');

  const q = normalize(query.trim());
  const filtered = useMemo(() => {
    if (!q) return ALL_ZONES;
    return ALL_ZONES.filter((z) => {
      return normalize(z.label).includes(q) || normalize(z.code).includes(q);
    });
  }, [q]);

  // Groupe les résultats filtrés pour l'affichage
  const grouped = useMemo(() => {
    return {
      national: filtered.filter((z) => z.type === 'national'),
      region: filtered.filter((z) => z.type === 'region'),
      dept: filtered.filter((z) => z.type === 'dept'),
    };
  }, [filtered]);

  const handleSelect = (code) => {
    onChange(code);
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      {/* Bouton trigger — même style que l'ancien select natif */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl py-3.5 pl-12 pr-10 text-[15px] font-semibold text-left bg-white relative transition-colors"
        style={{
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          height: '58px',
          color: selected ? '#0F172A' : '#9CA3AF',
        }}
      >
        <MapPin
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          size={18}
          color="#10B981"
          strokeWidth={2.4}
        />
        {selected ? selected.label : 'Choisir une zone…'}
        <ChevronDown
          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
          size={16}
          color="#9CA3AF"
          strokeWidth={2.4}
        />
      </button>

      {/* Modal sheet (bottom sheet sur mobile, centré sur desktop) */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          style={{
            background: 'rgba(15,23,42,0.45)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            animation: 'bp-fade-bg 220ms ease-out both',
          }}
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col"
            style={{
              maxHeight: '85vh',
              animation: 'bp-slide-up 280ms cubic-bezier(0.2,0.8,0.2,1) both',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header avec search */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[17px] font-bold text-gray-900 tracking-tight">
                  Choisir une zone
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="Fermer"
                >
                  <X size={18} color="#6B7280" strokeWidth={2.4} />
                </button>
              </div>
              <div className="relative">
                <Search
                  size={16}
                  color="#9CA3AF"
                  strokeWidth={2.4}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher ville, département…"
                  className="w-full rounded-xl bg-gray-100 py-2.5 pl-10 pr-9 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
                  style={{
                    fontSize: 16, /* évite zoom iOS */
                    color: '#0F172A', /* force visibilité du texte saisi */
                    caretColor: '#10B981',
                  }}
                />
                {query && (
                  <button
                    onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-200"
                    aria-label="Effacer"
                  >
                    <X size={14} color="#6B7280" strokeWidth={2.4} />
                  </button>
                )}
              </div>
            </div>

            {/* Liste scrollable */}
            <div className="flex-1 overflow-y-auto px-2 py-2" style={{ WebkitOverflowScrolling: 'touch' }}>
              {filtered.length === 0 && (
                <p className="text-center text-[13.5px] text-gray-400 py-10">
                  Aucune zone trouvée pour « {query} ».
                </p>
              )}

              {grouped.national.length > 0 && (
                <ZonePickerGroup title="Couverture nationale">
                  {grouped.national.map((z) => (
                    <ZonePickerItem key={z.code} zone={z} selected={z.code === value} onClick={() => handleSelect(z.code)} />
                  ))}
                </ZonePickerGroup>
              )}

              {grouped.region.length > 0 && (
                <ZonePickerGroup title={`Régions (${grouped.region.length})`}>
                  {grouped.region.map((z) => (
                    <ZonePickerItem key={z.code} zone={z} selected={z.code === value} onClick={() => handleSelect(z.code)} />
                  ))}
                </ZonePickerGroup>
              )}

              {grouped.dept.length > 0 && (
                <ZonePickerGroup title={`Départements (${grouped.dept.length})`}>
                  {grouped.dept.map((z) => (
                    <ZonePickerItem key={z.code} zone={z} selected={z.code === value} onClick={() => handleSelect(z.code)} />
                  ))}
                </ZonePickerGroup>
              )}
            </div>
          </div>
          <style>{`
            @keyframes bp-fade-bg { from { background: rgba(0,0,0,0); } to { background: rgba(15,23,42,0.45); } }
            @keyframes bp-slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          `}</style>
        </div>
      )}
    </>
  );
}

function ZonePickerGroup({ title, children }) {
  return (
    <div className="mb-3">
      <p className="text-[10.5px] font-bold uppercase tracking-[0.10em] text-gray-400 px-3 mt-2 mb-1.5">
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function ZonePickerItem({ zone, selected, onClick }) {
  const isPremium = zone.multiplier > 1;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-colors text-left"
      style={{
        background: selected ? '#ECFDF5' : 'transparent',
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = '#F9FAFB'; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span
          className="text-[14px] font-semibold truncate"
          style={{ color: selected ? '#047857' : '#0F172A' }}
        >
          {zone.label}
        </span>
        {isPremium && (
          <span
            className="flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-[0.04em]"
            style={{ background: '#FEF3C7', color: '#92400E' }}
          >
            Premium
          </span>
        )}
      </div>
      {selected && (
        <Check size={16} color="#10B981" strokeWidth={3} />
      )}
    </button>
  );
}

// Progress bar 1→2→3 : dot + label sous le dot
function ProgressDot({ n, label, active }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="flex items-center justify-center rounded-full transition-all"
        style={{
          width: '28px',
          height: '28px',
          background: active ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : '#F3F4F6',
          color: active ? 'white' : '#9CA3AF',
          fontSize: '12.5px',
          fontWeight: 700,
          boxShadow: active ? '0 4px 12px rgba(16,185,129,0.32)' : 'none',
        }}
      >
        {n}
      </div>
      <span
        className="text-[10px] font-bold uppercase tracking-[0.10em]"
        style={{ color: active ? '#047857' : '#9CA3AF' }}
      >
        {label}
      </span>
    </div>
  );
}

function ProgressLine({ active = false }) {
  // Ligne horizontale fine : emerald quand active (étape précédente OK), gris sinon.
  return (
    <div
      className="flex-1 h-[2px] rounded-full transition-all duration-300"
      style={{
        background: active
          ? 'linear-gradient(90deg, #10B981, #059669)'
          : '#E5E7EB',
        marginTop: '-10px',
        opacity: active ? 0.6 : 1,
      }}
    />
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
