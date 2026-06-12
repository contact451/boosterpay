// ─────────────────────────────────────────────────────────────────
//  EspaceIA — Page "Configurer l'IA de {nom_commerce}"
//
//  Q/R en première position, réponses pré-remplies adaptées au métier
//  (utilisent nom_commerce + ville pour personnaliser).
//  Précisions générales en deuxième position.
//
//  Pattern UI : Apple ultra premium, ludique, mobile-first.
// ─────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  MessageCircleQuestion,
  Plus,
  Trash2,
  Check,
  ArrowRight,
  Info,
  PhoneCall,
  Wand2,
  Briefcase,
  Search,
  X,
  ChevronDown,
} from 'lucide-react';
import EspaceLayout from '../components/EspaceLayout';
import { getCachedAbonne } from '../services/abonneCache';

const APPS_SCRIPT_URL = import.meta.env.VITE_VONAGE_CRM_APPS_SCRIPT_URL || '';

// ─────────────────────────────────────────────────────────────────
//  Templates Q/R par catégorie métier
//  → Réponses pré-remplies type, l'user édite à son contexte précis.
//  → Variables {NOM} et {VILLE} interpolées avec les vraies données.
// ─────────────────────────────────────────────────────────────────
const QA_TEMPLATES = {
  urgences: [
    { q: "Vous intervenez en urgence ?", a: "Oui, je suis disponible pour toutes les urgences. J'évalue avec vous la situation au téléphone et j'organise mon intervention au plus vite." },
    { q: "Quel est votre délai d'intervention ?", a: "Pour une urgence, je peux être chez vous en moins d'une heure. Pour une intervention planifiée, je vous propose un RDV sous 48 h." },
    { q: "Quel est le tarif d'une intervention ?", a: "Le déplacement est facturé à partir de 80 € HT. Le devis détaillé vous est remis avant toute intervention. Aucune surprise." },
    { q: "Quelle est votre zone d'intervention ?", a: "J'interviens dans un rayon de 20 km autour de {VILLE}." },
    { q: "Vous intervenez la nuit et le weekend ?", a: "Oui, je suis joignable 7j/7 pour les urgences. Une majoration peut s'appliquer en horaires de nuit ou jours fériés." },
    { q: "Comment puis-je payer l'intervention ?", a: "Je prends les paiements par CB, espèces ou virement. Une facture vous est remise systématiquement." },
  ],
  artisans: [
    { q: "Vous faites des devis gratuits ?", a: "Oui, le devis est totalement gratuit et sans engagement. Je peux passer chez vous pour évaluer les travaux sous quelques jours." },
    { q: "Sous combien de temps je reçois le devis ?", a: "Vous recevez votre devis détaillé sous 48 h ouvrées après ma visite." },
    { q: "Quelle est votre zone d'intervention ?", a: "Je travaille principalement à {VILLE} et dans un rayon de 25 km autour." },
    { q: "Vous êtes assuré décennale ?", a: "Oui, je dispose d'une assurance décennale en règle. Je peux vous fournir l'attestation sur simple demande." },
    { q: "Quels sont les délais pour démarrer les travaux ?", a: "Cela dépend de la nature et de la durée du chantier. Je vous communique un planning précis dans le devis." },
    { q: "Vous gérez l'approvisionnement des matériaux ?", a: "Oui, je fournis tous les matériaux nécessaires. Vous pouvez aussi en fournir vous-même si vous préférez." },
  ],
  sante: [
    { q: "Quels sont vos horaires d'ouverture ?", a: "Le cabinet {NOM} est ouvert du lundi au vendredi de 9 h à 19 h, et le samedi matin de 9 h à 13 h." },
    { q: "Où êtes-vous situés ?", a: "Le cabinet est situé à {VILLE}. L'adresse précise vous sera transmise lors de votre confirmation de RDV." },
    { q: "Quel est le délai pour un premier RDV ?", a: "En général, je peux vous proposer un créneau dans les 7 jours. Pour les urgences, je m'adapte selon vos disponibilités." },
    { q: "Combien coûte une consultation ?", a: "Le tarif d'une consultation est de 60 €. Si vous êtes patient régulier, des forfaits peuvent être proposés." },
    { q: "Êtes-vous conventionné ?", a: "Oui, je suis conventionné. Le remboursement sécurité sociale s'applique. Vérifiez vos garanties mutuelle." },
    { q: "Comment annuler ou modifier un RDV ?", a: "Vous pouvez annuler ou modifier en rappelant ce numéro au moins 24 h à l'avance, sans frais." },
  ],
  services: [
    { q: "Vous faites des devis sur mesure ?", a: "Oui, chaque prestation est étudiée sur mesure. Je vous propose un devis personnalisé sous 48 h après notre échange." },
    { q: "Quelle est votre zone de prestation ?", a: "Je travaille principalement sur {VILLE} et sa région. Pour les déplacements plus loin, des frais peuvent s'ajouter." },
    { q: "Comment réserver votre prestation ?", a: "Une fois le devis validé, un acompte de 30 % vous est demandé pour bloquer la date. Le solde est dû le jour de la prestation." },
    { q: "Quels moyens de paiement acceptez-vous ?", a: "J'accepte les paiements par virement, CB et espèces. Une facture vous est remise systématiquement." },
    { q: "Vous avez des disponibilités le weekend ?", a: "Oui, je travaille aussi le samedi et le dimanche, selon les disponibilités." },
    { q: "Quel est le délai minimum de réservation ?", a: "Pour une prestation classique, prévoyez au minimum 1 semaine. En urgence, je m'adapte selon mes disponibilités." },
  ],
  commerce: [
    { q: "Quels sont vos horaires d'ouverture ?", a: "Nous sommes ouverts du mardi au samedi de 9 h à 19 h, et le dimanche matin de 9 h à 13 h. Fermé le lundi." },
    { q: "Où êtes-vous situés ?", a: "Notre boutique {NOM} est située à {VILLE}. Vous pouvez nous trouver facilement, l'adresse est sur Google Maps." },
    { q: "Vous livrez à domicile ?", a: "Oui, nous proposons la livraison dans un rayon de 10 km autour de {VILLE}. Frais de livraison à partir de 5 €." },
    { q: "Vous prenez des commandes spéciales ?", a: "Bien sûr. Pour toute commande personnalisée, prévoyez au moins 48 h. Un acompte peut être demandé." },
    { q: "Quels moyens de paiement acceptez-vous ?", a: "Nous acceptons CB, espèces, sans contact, et paiements en ligne via lien sécurisé." },
    { q: "Vous proposez des cartes de fidélité ?", a: "Oui, demandez votre carte de fidélité en magasin. Toutes les 10 visites, une réduction vous est offerte." },
  ],
  // Catégorie spéciale réservée à BoosterPay (l'IA Léa commerciale qui pitche le produit)
  boosterpay: [
    { q: "C'est quoi BoosterPay ?", a: "BoosterPay, c'est une IA téléphonique qui décroche à votre place quand vous êtes occupé. Elle prend le message, qualifie le besoin et vous envoie un résumé clair par SMS et email. Vous ne ratez plus jamais une opportunité." },
    { q: "Combien ça coûte ?", a: "L'offre commence à 49 € HT par mois, sans engagement. Les 7 premiers jours sont gratuits. Vous pouvez résilier à tout moment depuis votre espace." },
    { q: "Comment ça s'installe ?", a: "Pas d'installation. On configure votre numéro virtuel et l'IA est opérationnelle en moins de 24 h. Vous gardez votre numéro existant, on ajoute simplement un transfert d'appel." },
    { q: "L'IA prend vraiment les RDV ?", a: "Oui. L'IA qualifie le besoin, propose des créneaux et vous notifie en temps réel. Vous validez en un clic depuis votre espace. Aucune réponse fantôme, tout est traçable." },
    { q: "Qui est derrière BoosterPay ?", a: "BoosterPay est édité par une équipe française basée en Bretagne. Le fondateur Nathan et son équipe sont à votre écoute si vous avez besoin d'un échange direct." },
    { q: "Vous proposez une démo ?", a: "Oui, je peux organiser une démo gratuite de 15 minutes avec Nathan, le fondateur. Donnez-moi votre numéro et votre métier, je vous rappelle pour caler un créneau." },
  ],
};

// ─────────────────────────────────────────────────────────────────
//  Liste de 43 métiers + mapping → catégorie (sync avec backend
//  METIER_TO_CATEGORY dans apps-script-boosterpay-vonage-crm.gs).
//  Le métier "boosterpay" est réservé pour Nathane (compte démo).
// ─────────────────────────────────────────────────────────────────
const TRADES = [
  // URGENCES
  { id: 'plombier', label: 'Plombier', cat: 'urgences' },
  { id: 'electricien', label: 'Électricien', cat: 'urgences' },
  { id: 'chauffagiste', label: 'Chauffagiste', cat: 'urgences' },
  { id: 'serrurier', label: 'Serrurier', cat: 'urgences' },
  { id: 'vitrier', label: 'Vitrier', cat: 'urgences' },
  { id: 'depannage_auto', label: 'Dépannage auto / remorquage', cat: 'urgences' },
  { id: 'antenniste', label: 'Antenniste', cat: 'urgences' },
  // ARTISANS
  { id: 'menuisier', label: 'Menuisier', cat: 'artisans' },
  { id: 'peintre', label: 'Peintre en bâtiment', cat: 'artisans' },
  { id: 'macon', label: 'Maçon', cat: 'artisans' },
  { id: 'carreleur', label: 'Carreleur', cat: 'artisans' },
  { id: 'platrier', label: 'Plaquiste / plâtrier', cat: 'artisans' },
  { id: 'couvreur', label: 'Couvreur / zingueur', cat: 'artisans' },
  { id: 'paysagiste', label: 'Paysagiste / jardinier', cat: 'artisans' },
  { id: 'piscine', label: 'Pisciniste', cat: 'artisans' },
  { id: 'ravalement', label: 'Ravalement de façade', cat: 'artisans' },
  { id: 'isolation', label: 'Isolation', cat: 'artisans' },
  { id: 'cuisiniste', label: 'Cuisiniste', cat: 'artisans' },
  // SANTÉ
  { id: 'medecin', label: 'Médecin généraliste', cat: 'sante' },
  { id: 'dentiste', label: 'Dentiste', cat: 'sante' },
  { id: 'kine', label: 'Kinésithérapeute', cat: 'sante' },
  { id: 'osteo', label: 'Ostéopathe', cat: 'sante' },
  { id: 'orthophoniste', label: 'Orthophoniste', cat: 'sante' },
  { id: 'psychologue', label: 'Psychologue', cat: 'sante' },
  { id: 'veterinaire', label: 'Vétérinaire', cat: 'sante' },
  { id: 'opticien', label: 'Opticien', cat: 'sante' },
  { id: 'audioprothesiste', label: 'Audioprothésiste', cat: 'sante' },
  // SERVICES
  { id: 'coach_sportif', label: 'Coach sportif', cat: 'services' },
  { id: 'professeur', label: 'Prof particulier / soutien', cat: 'services' },
  { id: 'photographe', label: 'Photographe', cat: 'services' },
  { id: 'videaste', label: 'Vidéaste / monteur', cat: 'services' },
  { id: 'avocat', label: 'Avocat', cat: 'services' },
  { id: 'comptable', label: 'Expert-comptable', cat: 'services' },
  { id: 'agent_immo', label: 'Agent immobilier', cat: 'services' },
  { id: 'auto_ecole', label: 'Auto-école', cat: 'services' },
  { id: 'pressing', label: 'Pressing / blanchisserie', cat: 'services' },
  // COMMERCE
  { id: 'boulanger', label: 'Boulangerie / pâtisserie', cat: 'commerce' },
  { id: 'fleuriste', label: 'Fleuriste', cat: 'commerce' },
  { id: 'coiffeur', label: 'Coiffeur / barbier', cat: 'commerce' },
  { id: 'estheticienne', label: 'Esthéticienne / institut', cat: 'commerce' },
  { id: 'restaurant', label: 'Restaurant / café / bar', cat: 'commerce' },
  { id: 'traiteur', label: 'Traiteur', cat: 'commerce' },
  { id: 'pharmacie', label: 'Pharmacie / parapharmacie', cat: 'commerce' },
  { id: 'tabac', label: 'Tabac / presse', cat: 'commerce' },
  // SPÉCIAL — BoosterPay (réservé compte démo)
  { id: 'boosterpay', label: 'BoosterPay — IA commerciale', cat: 'boosterpay' },
];

function findTrade(id) {
  return TRADES.find((t) => t.id === id) || null;
}

function catOfMetier(id) {
  const t = findTrade(id);
  return t ? t.cat : 'commerce';
}

function interpolate(text, nom, ville) {
  const safeNom = (nom || '').trim() || 'notre établissement';
  const safeVille = (ville || '').trim() || 'votre ville';
  return text.replace(/\{NOM\}/g, safeNom).replace(/\{VILLE\}/g, safeVille);
}

function getDefaultPairsByCategory(category, nom, ville) {
  const list = QA_TEMPLATES[category] || QA_TEMPLATES.commerce;
  return list.map((p) => ({
    q: interpolate(p.q, nom, ville),
    a: interpolate(p.a, nom, ville),
  }));
}

export default function EspaceIA() {
  const [searchParams] = useSearchParams();
  const commercantId = searchParams.get('id') || '';
  const cachedAbonne = commercantId ? getCachedAbonne(commercantId) : null;
  const nomCommerce = cachedAbonne?.nom_commerce || '';
  const ville = cachedAbonne?.ville || '';

  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(null);
  const [precisions, setPrecisions] = useState('');
  const [qaPairs, setQAPairs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Métier sélectionné par l'user (clé de TRADES). Sert à choisir les Q/R templates
  // et le prompt IA de base. Si le commerçant a déjà un metier en sheet → on l'init avec.
  const [metierId, setMetierId] = useState('');
  // Track si l'user a édité manuellement les Q/R (pour ne pas écraser au switch métier)
  const userTouchedQAs = useRef(false);

  const liveNom = info?.nom_commerce || nomCommerce;
  const liveVille = ville;
  const currentTrade = findTrade(metierId);

  // L'option "BoosterPay — IA commerciale" est réservée aux comptes démo internes
  // (Nathane + tout commerçant qui a déjà ce métier en sheet).
  const ADMIN_COMMERCANT_IDS = ['BP-MPNXNEQN'];
  const isAdminDemo =
    ADMIN_COMMERCANT_IDS.includes(commercantId) ||
    String(info?.metier || '').toLowerCase() === 'boosterpay';

  // Fetch initial : précisions + Q/R (custom user) sinon Q/R templates contextualisées
  useEffect(() => {
    if (!commercantId || !APPS_SCRIPT_URL) {
      // Pas d'ID/API → on charge quand même les Q/R commerce par défaut
      setQAPairs(getDefaultPairsByCategory('commerce', '', ''));
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'getIAPromptInfo', commercant_id: commercantId }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (json && json.ok) {
          setInfo(json);
          setPrecisions(json.precisions || '');

          // Métier déjà connu côté backend ?
          // → on l'init avec, sinon vide (l'user devra choisir)
          const backendMetier = String(json.metier || '').trim().toLowerCase();
          if (backendMetier && findTrade(backendMetier)) {
            setMetierId(backendMetier);
          }

          // Q/R user existantes ? → on les charge avec leurs réponses déjà saisies
          if (Array.isArray(json.qa_pairs) && json.qa_pairs.length > 0) {
            setQAPairs(json.qa_pairs);
            userTouchedQAs.current = true; // pour ne pas écraser au switch
          } else {
            // Sinon → templates par catégorie + interpolation nom_commerce/ville
            const cat = backendMetier ? catOfMetier(backendMetier) : (json.category || 'commerce');
            const nom = json.nom_commerce || nomCommerce || '';
            setQAPairs(getDefaultPairsByCategory(cat, nom, ville));
          }
        } else {
          setQAPairs(getDefaultPairsByCategory('commerce', nomCommerce, ville));
        }
      } catch (_e) {
        if (!cancelled) setQAPairs(getDefaultPairsByCategory('commerce', nomCommerce, ville));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [commercantId, nomCommerce, ville]);

  // Au changement de métier par l'user → on remplace les Q/R par les templates
  // de la nouvelle catégorie (sauf si l'user a déjà customisé ses Q/R).
  function handleSelectMetier(newId) {
    if (newId === metierId) return;
    setMetierId(newId);
    const cat = catOfMetier(newId);
    // Si l'user n'a pas encore touché aux Q/R → on swap au template du nouveau métier
    if (!userTouchedQAs.current) {
      setQAPairs(getDefaultPairsByCategory(cat, liveNom, liveVille));
    }
  }

  function updateQ(idx, value) {
    userTouchedQAs.current = true;
    setQAPairs((prev) => prev.map((p, i) => (i === idx ? { ...p, q: value.slice(0, 200) } : p)));
  }
  function updateA(idx, value) {
    userTouchedQAs.current = true;
    setQAPairs((prev) => prev.map((p, i) => (i === idx ? { ...p, a: value.slice(0, 1000) } : p)));
  }
  function removePair(idx) {
    userTouchedQAs.current = true;
    setQAPairs((prev) => prev.filter((_, i) => i !== idx));
  }
  function addPair() {
    userTouchedQAs.current = true;
    setQAPairs((prev) => [...prev, { q: '', a: '' }]);
  }

  async function handleSave() {
    if (saving) return;
    if (!metierId) {
      setErrorMsg('Choisis ton métier en haut de page pour que ton IA soit bien adaptée.');
      return;
    }
    setSaving(true);
    setErrorMsg('');
    setSavedFlash(false);
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'updateIAConfig',
          commercant_id: commercantId,
          metier: metierId,
          precisions: precisions,
          qa_pairs: qaPairs.filter((p) => p.q.trim() || p.a.trim()),
        }),
      });
      const json = await res.json();
      if (json && json.ok) {
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 4000);
      } else {
        const err = (json && json.error) || 'Erreur inconnue.';
        setErrorMsg(
          err === 'unauthorized'
            ? "Le serveur n'a pas encore la dernière mise à jour. Redéploie l'Apps Script en « Nouvelle version »."
            : err
        );
      }
    } catch (e) {
      setErrorMsg(e.message || 'Réseau indisponible.');
    } finally {
      setSaving(false);
    }
  }

  // Affichage personnalisé : "Configurer l'IA de {nom_commerce}"
  const headerTitle = liveNom
    ? `L'IA de ${liveNom}.`
    : `Personnaliser mon IA.`;

  // Compteur stats — totalQ avec réponse complétée
  const completedCount = useMemo(
    () => qaPairs.filter((p) => p.q.trim() && p.a.trim()).length,
    [qaPairs]
  );

  return (
    <EspaceLayout
      nomCommerce={liveNom}
      commercantId={commercantId}
      activeSection="modules"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-40">

        {/* ════ Header personnalisé ════ */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] mb-3 px-2.5 py-1 rounded-full" style={{ background: '#ECFDF5', color: '#047857' }}>
            <Sparkles className="w-3 h-3" strokeWidth={2.4} />
            Configuration sur mesure
          </div>
          <h1
            className="font-extrabold tracking-tight text-gray-900"
            style={{ fontSize: 'clamp(30px, 5.2vw, 42px)', letterSpacing: '-0.028em', lineHeight: 1.02 }}
          >
            {headerTitle}
          </h1>
          <p className="mt-4 text-[15.5px] text-gray-500 max-w-xl leading-relaxed">
            Indiquez à votre IA tout ce qu'elle doit savoir.<br />
            Les changements sont <strong className="text-emerald-700">effectifs immédiatement</strong>.
          </p>

          {/* Mini stats — pourcentage configuré + nombre de Q/R */}
          {!loading && (
            <div className="flex items-center gap-4 mt-5">
              <div className="flex items-center gap-2 text-[12.5px] text-gray-500">
                <div className="inline-flex items-center justify-center w-7 h-7 rounded-full" style={{ background: '#ECFDF5', color: '#047857' }}>
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </div>
                <span><strong className="text-gray-900">{completedCount}</strong> / {qaPairs.length} réponses configurées</span>
              </div>
            </div>
          )}
        </div>

        {/* ════ Sélecteur métier — sert de socle au prompt IA + Q/R ════ */}
        {!loading && (
          <MetierPicker
            selected={metierId}
            onSelect={handleSelectMetier}
            currentTrade={currentTrade}
            isAdminDemo={isAdminDemo}
          />
        )}

        {loading ? (
          <div className="space-y-3">
            <div className="bp-stat-skel h-32 rounded-2xl" />
            <div className="bp-stat-skel h-32 rounded-2xl" />
            <div className="bp-stat-skel h-32 rounded-2xl" />
          </div>
        ) : (
          <>
            {/* ═══════════════════════════════════════════════════════ */}
            {/* SECTION 1 — QUESTIONS & RÉPONSES (en 1er, primordial)  */}
            {/* ═══════════════════════════════════════════════════════ */}
            <Section
              icon={MessageCircleQuestion}
              title="Questions et réponses"
              sub="Les questions que vos clients posent souvent. L'IA répond mot pour mot."
            >
              <div className="space-y-3">
                {qaPairs.map((p, idx) => (
                  <QAPairCard
                    key={idx}
                    index={idx}
                    pair={p}
                    onChangeQ={(v) => updateQ(idx, v)}
                    onChangeA={(v) => updateA(idx, v)}
                    onRemove={() => removePair(idx)}
                  />
                ))}

                {/* Bouton "+ Ajouter ma propre question" */}
                <button
                  type="button"
                  onClick={addPair}
                  className="w-full rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 py-4 text-[14px] font-bold transition-all active:scale-[0.98]"
                  style={{
                    borderColor: '#A7F3D0',
                    color: '#047857',
                    background: '#F0FDF4',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#10B981';
                    e.currentTarget.style.background = '#ECFDF5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#A7F3D0';
                    e.currentTarget.style.background = '#F0FDF4';
                  }}
                >
                  <Plus className="w-4 h-4" strokeWidth={2.6} />
                  Ajouter ma propre question
                </button>

                <p className="text-[11.5px] text-gray-400 mt-2 text-center">
                  {qaPairs.length}/30 questions · L'IA respecte vos réponses à la lettre.
                </p>
              </div>
            </Section>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* SECTION 2 — PRÉCISIONS GÉNÉRALES (en 2e)              */}
            {/* ═══════════════════════════════════════════════════════ */}
            <Section
              icon={Info}
              title="Précisions générales"
              sub="Tout ce qui définit votre activité — services, zone, tarifs, contraintes…"
            >
              <AutoGrowTextarea
                value={precisions}
                onChange={(e) => setPrecisions(e.target.value.slice(0, 1500))}
                placeholder={liveVille
                  ? `Exemples : Tarif intervention 80 € HT. Déplacement ${liveVille} et 20 km autour. Urgences acceptées 7j/7 jusqu'à 22 h.`
                  : `Exemples : Tarif intervention 80 € HT. Déplacement jusqu'à 20 km. Urgences acceptées 7j/7 jusqu'à 22 h.`}
                maxLength={1500}
                minRows={4}
                className="w-full rounded-2xl bg-white px-4 py-3.5 text-[15px] text-gray-900 placeholder:text-gray-400 resize-none transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 overflow-hidden"
                style={{
                  border: '1px solid #E5E7EB',
                  fontSize: 16,
                  color: '#0F172A',
                  caretColor: '#10B981',
                  lineHeight: 1.5,
                  overflow: 'hidden',
                }}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-[11.5px] text-gray-400">
                  L'IA s'appuie en priorité sur ces précisions.
                </p>
                <p className="text-[11.5px] tabular-nums text-gray-400">
                  {precisions.length}/1500
                </p>
              </div>
            </Section>

            {/* ════ Footer rassurant ════ */}
            <div
              className="rounded-2xl p-5 mt-8 flex items-start gap-4"
              style={{
                background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)',
                border: '1px solid rgba(16,185,129,0.25)',
              }}
            >
              <div
                className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.85)' }}
              >
                <PhoneCall className="w-5 h-5 text-emerald-600" strokeWidth={2.4} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-bold text-gray-900 leading-tight">
                  Testez votre IA après la mise à jour.
                </p>
                <p className="text-[12.5px] text-gray-700 mt-1 leading-snug">
                  Appelez votre numéro {liveNom ? `(${liveNom})` : ''} depuis un autre téléphone. L'IA répond selon vos précisions et vos Q/R.
                </p>
              </div>
            </div>
          </>
        )}

      </div>

      {/* ════ Toast au-dessus du bouton sticky (succès OU erreur) ════ */}
      {(savedFlash || errorMsg) && (
        <div
          className="fixed left-0 right-0 md:left-64 z-40 px-4 sm:px-6 pointer-events-none"
          style={{
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px + 64px)', /* au-dessus du sticky button + tab bar */
            animation: 'bp-toast-in 360ms cubic-bezier(0.2,0.8,0.2,1) both',
          }}
        >
          <div className="max-w-3xl mx-auto">
            {savedFlash ? (
              <div
                className="pointer-events-auto rounded-2xl p-4 flex items-start gap-3 shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  boxShadow: '0 12px 32px rgba(16,185,129,0.45), 0 4px 8px rgba(0,0,0,0.10)',
                }}
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-white/25 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" strokeWidth={3} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14.5px] font-bold text-white leading-tight">
                    Votre IA est mise à jour.
                  </p>
                  <p className="text-[12.5px] text-white/90 mt-0.5 leading-snug">
                    Effective sur tous les appels qui arrivent maintenant.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSavedFlash(false)}
                  className="pointer-events-auto flex-shrink-0 w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-3.5 h-3.5 text-white" strokeWidth={2.6} />
                </button>
              </div>
            ) : (
              <div
                className="pointer-events-auto rounded-2xl p-4 flex items-start gap-3 shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
                  border: '1.5px solid rgba(220,38,38,0.30)',
                  boxShadow: '0 12px 32px rgba(220,38,38,0.20), 0 4px 8px rgba(0,0,0,0.06)',
                }}
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-500 flex items-center justify-center">
                  <X className="w-4.5 h-4.5 text-white" strokeWidth={3} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-red-900 leading-tight">
                    Mise à jour impossible.
                  </p>
                  <p className="text-[12.5px] text-red-800 mt-0.5 leading-snug">
                    {errorMsg}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMsg('')}
                  className="pointer-events-auto flex-shrink-0 w-7 h-7 rounded-full bg-red-500/15 hover:bg-red-500/25 flex items-center justify-center transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-3.5 h-3.5 text-red-700" strokeWidth={2.6} />
                </button>
              </div>
            )}
          </div>
          <style>{`
            @keyframes bp-toast-in {
              from { opacity: 0; transform: translateY(8px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}

      {/* ════ Bouton sticky "Mettre à jour mon IA" ════ */}
      {!loading && (
        <div
          className="fixed bottom-0 left-0 right-0 md:left-64 z-30 px-4 sm:px-6 py-4"
          style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderTop: '1px solid #E5E7EB',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px + 64px)', /* +64px pour bottom tab bar mobile */
          }}
        >
          <div className="max-w-3xl mx-auto">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl text-[15.5px] font-bold transition-transform active:scale-[0.98] disabled:opacity-60"
              style={{
                background: savedFlash
                  ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                  : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                boxShadow: '0 8px 22px rgba(16,185,129,0.45), 0 2px 6px rgba(0,0,0,0.06)',
              }}
            >
              {saving ? (
                'Mise à jour en cours…'
              ) : savedFlash ? (
                <>
                  <Check className="w-4 h-4" strokeWidth={3} />
                  Mise à jour effectuée
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" strokeWidth={2.6} />
                  Mettre à jour mon IA
                  <ArrowRight size={16} strokeWidth={2.6} />
                </>
              )}
            </button>
          </div>
          <style>{`
            @media (min-width: 768px) {
              .fixed.bottom-0 { padding-bottom: 16px !important; }
            }
          `}</style>
        </div>
      )}
    </EspaceLayout>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Section — wrapper avec icône + titre + sub
// ─────────────────────────────────────────────────────────────────
function Section({ icon: Icon, title, sub, children }) {
  return (
    <section className="mb-10">
      <div className="flex items-start gap-3 mb-5">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            boxShadow: '0 6px 14px rgba(16,185,129,0.30)',
          }}
        >
          <Icon className="w-5 h-5 text-white" strokeWidth={2.4} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[19px] font-bold text-gray-900 tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-[13.5px] text-gray-500 mt-1 leading-snug">
            {sub}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
//  QAPairCard — une carte Q/R éditable ultra propre
// ─────────────────────────────────────────────────────────────────
function QAPairCard({ index, pair, onChangeQ, onChangeA, onRemove }) {
  const hasAnswer = pair.a.trim().length > 0;
  return (
    <div
      className="rounded-2xl bg-white p-4 transition-all hover:shadow-md hover:shadow-emerald-100/40"
      style={{
        border: hasAnswer ? '1.5px solid rgba(16,185,129,0.40)' : '1px solid #E5E7EB',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.10em] text-gray-400">
          <span
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-extrabold"
            style={{
              background: hasAnswer ? '#10B981' : '#F3F4F6',
              color: hasAnswer ? '#FFFFFF' : '#9CA3AF',
            }}
          >
            {hasAnswer ? <Check className="w-3 h-3" strokeWidth={3.5} /> : (index + 1)}
          </span>
          Question
        </p>
        <button
          type="button"
          onClick={onRemove}
          className="flex-shrink-0 -mt-1 -mr-1 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-rose-50"
          aria-label="Supprimer cette question"
        >
          <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-rose-500" strokeWidth={2.2} />
        </button>
      </div>

      {/* Question */}
      <input
        type="text"
        value={pair.q}
        onChange={(e) => onChangeQ(e.target.value)}
        placeholder="Ex : Quels sont vos horaires d'ouverture ?"
        className="w-full bg-transparent border-none text-[15.5px] font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none mb-2"
        style={{ fontSize: 16, color: '#0F172A', caretColor: '#10B981' }}
        maxLength={200}
      />

      {/* Réponse */}
      <div
        className="rounded-xl px-3.5 py-2.5"
        style={{
          background: hasAnswer ? '#F0FDF4' : '#F8FAFC',
          border: hasAnswer ? '1px solid rgba(16,185,129,0.20)' : '1px solid #E2E8F0',
          transition: 'all 200ms',
        }}
      >
        <p className="text-[10.5px] font-bold uppercase tracking-[0.10em] text-emerald-700 mb-1.5">
          Réponse de l'IA
        </p>
        <AutoGrowTextarea
          value={pair.a}
          onChange={(e) => onChangeA(e.target.value)}
          placeholder="Tapez ou complétez la réponse exacte que l'IA doit donner."
          maxLength={1000}
        />
      </div>

      {pair.a.length > 0 && (
        <p className="text-[10.5px] tabular-nums text-gray-400 mt-1.5 text-right">
          {pair.a.length}/1000
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  AutoGrowTextarea — textarea qui s'étend automatiquement à la
//  hauteur exacte de son contenu. Plus de scroll interne, tout est
//  lisible d'un coup d'œil.
// ─────────────────────────────────────────────────────────────────
function AutoGrowTextarea({ value, onChange, placeholder, maxLength, minRows = 1, className, style }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={minRows}
      className={
        className ||
        'w-full bg-transparent border-none text-[14px] text-gray-700 placeholder:text-gray-400 resize-none focus:outline-none overflow-hidden'
      }
      style={{
        fontSize: 16,
        color: '#0F172A',
        caretColor: '#10B981',
        lineHeight: 1.5,
        overflow: 'hidden',
        ...style,
      }}
      maxLength={maxLength}
    />
  );
}

// ─────────────────────────────────────────────────────────────────
//  MetierPicker — sélecteur métier avec modal de recherche
//  → Si aucun métier choisi : grosse card incitative "Choisis ton métier"
//  → Sinon : pill avec le métier sélectionné + bouton "Changer"
// ─────────────────────────────────────────────────────────────────
function MetierPicker({ selected, onSelect, currentTrade, isAdminDemo }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Lock scroll quand modal open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // L'option "boosterpay" n'est exposée qu'aux comptes admin/démo
  const visibleTrades = isAdminDemo ? TRADES : TRADES.filter((t) => t.id !== 'boosterpay');

  const filtered = search.trim()
    ? visibleTrades.filter((t) => t.label.toLowerCase().includes(search.trim().toLowerCase()))
    : visibleTrades;

  // Groupés par catégorie pour l'affichage de la liste
  const CAT_LABELS = {
    urgences: 'Urgences', artisans: 'Artisans', sante: 'Santé',
    services: 'Services', commerce: 'Commerce', boosterpay: 'Spécial',
  };
  const grouped = filtered.reduce((acc, t) => {
    (acc[t.cat] = acc[t.cat] || []).push(t);
    return acc;
  }, {});
  const orderedCats = ['urgences', 'artisans', 'sante', 'services', 'commerce', 'boosterpay'];

  // CTA principale si rien de choisi
  if (!selected) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full mb-8 rounded-2xl p-5 flex items-center gap-4 text-left transition-all active:scale-[0.99] hover:shadow-md"
          style={{
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
            border: '1.5px solid rgba(245,158,11,0.40)',
            boxShadow: '0 4px 16px rgba(245,158,11,0.15)',
          }}
        >
          <div
            className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              boxShadow: '0 6px 14px rgba(245,158,11,0.30)',
            }}
          >
            <Briefcase className="w-5 h-5 text-white" strokeWidth={2.4} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.15em] text-amber-800 mb-0.5">
              Étape 1 — Important
            </p>
            <p className="text-[16px] font-bold text-gray-900 leading-tight">
              Choisis ton métier
            </p>
            <p className="text-[13px] text-gray-600 mt-1 leading-snug">
              Ton IA s'adapte à ton activité : questions, réponses, ton, vocabulaire.
            </p>
          </div>
          <ChevronDown className="w-5 h-5 text-amber-700 flex-shrink-0" strokeWidth={2.4} />
        </button>
        {open && (
          <MetierModal
            search={search}
            setSearch={setSearch}
            grouped={grouped}
            orderedCats={orderedCats}
            catLabels={CAT_LABELS}
            selected={selected}
            onSelect={(id) => { onSelect(id); setOpen(false); setSearch(''); }}
            onClose={() => { setOpen(false); setSearch(''); }}
          />
        )}
      </>
    );
  }

  // Pill compact avec métier sélectionné + bouton Changer
  return (
    <>
      <div
        className="mb-8 rounded-2xl p-4 flex items-center gap-3"
        style={{
          background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)',
          border: '1.5px solid rgba(16,185,129,0.30)',
        }}
      >
        <div
          className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            boxShadow: '0 4px 10px rgba(16,185,129,0.25)',
          }}
        >
          <Briefcase className="w-4.5 h-4.5 text-white" strokeWidth={2.4} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-emerald-700 mb-0.5">
            Ton métier
          </p>
          <p className="text-[15px] font-bold text-gray-900 leading-tight truncate">
            {currentTrade?.label || selected}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-bold bg-white border border-emerald-200 text-emerald-700 transition-colors hover:bg-emerald-50"
        >
          Changer
        </button>
      </div>
      {open && (
        <MetierModal
          search={search}
          setSearch={setSearch}
          grouped={grouped}
          orderedCats={orderedCats}
          catLabels={CAT_LABELS}
          selected={selected}
          onSelect={(id) => { onSelect(id); setOpen(false); setSearch(''); }}
          onClose={() => { setOpen(false); setSearch(''); }}
        />
      )}
    </>
  );
}

// Modal plein écran de sélection métier
function MetierModal({ search, setSearch, grouped, orderedCats, catLabels, selected, onSelect, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full md:max-w-lg md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col"
        style={{ maxHeight: '85svh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header modal */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[18px] font-bold text-gray-900">Choisis ton métier</h3>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 text-gray-600" strokeWidth={2.4} />
            </button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={2.2} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un métier…"
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white"
              style={{ fontSize: 16 }}
              autoFocus
            />
          </div>
        </div>

        {/* Liste métiers scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {orderedCats.map((cat) => {
            const list = grouped[cat];
            if (!list || list.length === 0) return null;
            return (
              <div key={cat} className="mb-5 last:mb-0">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2 px-1">
                  {catLabels[cat]}
                </p>
                <div className="space-y-1.5">
                  {list.map((t) => {
                    const isSel = t.id === selected;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => onSelect(t.id)}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all active:scale-[0.98]"
                        style={{
                          background: isSel ? '#ECFDF5' : 'transparent',
                          border: isSel ? '1.5px solid rgba(16,185,129,0.40)' : '1.5px solid transparent',
                        }}
                      >
                        <div
                          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                          style={{
                            background: isSel ? '#10B981' : '#F3F4F6',
                            color: isSel ? 'white' : '#9CA3AF',
                          }}
                        >
                          {isSel ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : null}
                        </div>
                        <span className={`text-[14.5px] flex-1 ${isSel ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {t.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {Object.keys(grouped).length === 0 && (
            <div className="py-12 text-center">
              <p className="text-[14px] text-gray-500">Aucun métier ne correspond à ta recherche.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
