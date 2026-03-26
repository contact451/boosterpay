const DASHBOARD_API_URL = import.meta.env.VITE_GOOGLE_SHEET_API_URL || '';

const USE_MOCK = false;

function generateMockData(partnerId) {
  const partnerNames = {
    '91ueq4ae0q': 'Irongymlimogessports',
    'default': 'Entreprise Partenaire',
  };

  const partnerName = partnerNames[partnerId] || partnerNames['default'];

  const dossiers = [
    {
      idImpaye: `F-${partnerId}-1`,
      clientDebiteur: 'AUGUSTE Nathan',
      emailDebiteur: 'nathan.auguste@gmail.com',
      telephone1: '0612345678',
      typeTel1: 'Mobile',
      telephone2: '',
      typeTel2: '',
      montant: 116.00,
      dateEcheance: '2026-02-15',
      joursRetard: 30,
      statutCRM: 'En attente',
      montantRecupere: 0,
      dateRecuperation: null,
      nbRelancesIA: 0,
      sourceImport: 'CSV',
      dateAjout: '2026-03-02',
      notes: '',
      numeroFacture: 'FC2065',
      relances: [],
      contestation: { motif: null, precisions: null, email: null, date: null, statut: null, fichiers: null },
      paiement: { stripeSessionId: null, paymentIntent: null, mode: null, montantPaye: null, commission: null, date: null },
    },
    {
      idImpaye: `F-${partnerId}-2`,
      clientDebiteur: 'MARTIN Sophie',
      emailDebiteur: 'sophie.martin@outlook.fr',
      telephone1: '0698765432',
      typeTel1: 'Mobile',
      telephone2: '0145678901',
      typeTel2: 'Fixe',
      montant: 450.00,
      dateEcheance: '2026-01-20',
      joursRetard: 55,
      statutCRM: 'En attente',
      montantRecupere: 0,
      dateRecuperation: null,
      nbRelancesIA: 0,
      sourceImport: 'Manuel',
      dateAjout: '2026-02-28',
      notes: 'Cliente fidele, premier impaye',
      numeroFacture: 'FC2041',
      relances: [],
      contestation: { motif: null, precisions: null, email: null, date: null, statut: null, fichiers: null },
      paiement: { stripeSessionId: null, paymentIntent: null, mode: null, montantPaye: null, commission: null, date: null },
    },
    {
      idImpaye: `F-${partnerId}-3`,
      clientDebiteur: 'SIMON Elouan',
      emailDebiteur: 'elouan.simon@mail.com',
      telephone1: '0757991276',
      typeTel1: 'Mobile',
      telephone2: '',
      typeTel2: '',
      montant: 89.00,
      dateEcheance: '2026-02-28',
      joursRetard: 16,
      statutCRM: 'En cours',
      montantRecupere: 0,
      dateRecuperation: null,
      nbRelancesIA: 1,
      sourceImport: 'CSV',
      dateAjout: '2026-03-05',
      notes: '',
      numeroFacture: '',
      relances: [],
      contestation: { motif: null, precisions: null, email: null, date: null, statut: null, fichiers: null },
      paiement: { stripeSessionId: null, paymentIntent: null, mode: null, montantPaye: null, commission: null, date: null },
    },
    {
      idImpaye: `F-${partnerId}-4`,
      clientDebiteur: 'DURAND Philippe',
      emailDebiteur: 'p.durand@entreprise.fr',
      telephone1: '0634567890',
      typeTel1: 'Mobile',
      telephone2: '',
      typeTel2: '',
      montant: 1226.00,
      dateEcheance: '2026-01-30',
      joursRetard: 45,
      statutCRM: 'En cours',
      montantRecupere: 0,
      dateRecuperation: null,
      nbRelancesIA: 2,
      sourceImport: 'Manuel',
      dateAjout: '2026-02-15',
      notes: 'Facture de reparation automobile',
      numeroFacture: '2618',
      relances: [
        {
          id: 'rel-001',
          date: '2026-03-01T10:30:00',
          telephone: '33634567890',
          statutRelance: 'INJOIGNABLE',
          resumeAppel: 'Le débiteur n\'a pas décroché, messagerie vocale. Statut : INJOIGNABLE. Aucune date de paiement mentionnée.',
          etapeFlow: 'INJOIGNABLE',
          prochaineAction: 'SMS premier contact',
          dateStatut: '2026-03-01',
        },
        {
          id: 'rel-002',
          date: '2026-03-08T14:15:00',
          telephone: '33634567890',
          statutRelance: 'PROMESSE',
          resumeAppel: 'Le débiteur a décroché et confirme son identité. Statut : PROMESSE. Engagement de paiement dans la semaine, problème bancaire résolu.',
          etapeFlow: 'PROMESSE',
          prochaineAction: 'SMS rappel J+5',
          dateStatut: '2026-03-08',
        },
      ],
      contestation: { motif: null, precisions: null, email: null, date: null, statut: null, fichiers: null },
      paiement: { stripeSessionId: null, paymentIntent: null, mode: null, montantPaye: null, commission: null, date: null },
    },
    {
      idImpaye: `F-${partnerId}-5`,
      clientDebiteur: 'LEFEBVRE Caroline',
      emailDebiteur: 'caroline.lefebvre@free.fr',
      telephone1: '0678901234',
      typeTel1: 'Mobile',
      telephone2: '',
      typeTel2: '',
      montant: 320.00,
      dateEcheance: '2026-02-10',
      joursRetard: 34,
      statutCRM: 'En cours',
      montantRecupere: 0,
      dateRecuperation: null,
      nbRelancesIA: 3,
      sourceImport: 'CSV',
      dateAjout: '2026-02-20',
      notes: '',
      numeroFacture: 'FC2052',
      relances: [
        {
          id: 'rel-003',
          date: '2026-03-03T09:00:00',
          telephone: '33678901234',
          statutRelance: 'PROMESSE',
          resumeAppel: 'La débitrice a décroché, reconnaît l\'oubli. Statut : PROMESSE. Paiement prévu ce soir via lien SMS.',
          etapeFlow: 'PROMESSE',
          prochaineAction: 'SMS rappel J+5',
          dateStatut: '2026-03-03',
        },
      ],
      contestation: { motif: null, precisions: null, email: null, date: null, statut: null, fichiers: null },
      paiement: { stripeSessionId: null, paymentIntent: null, mode: null, montantPaye: null, commission: null, date: null },
    },
    {
      idImpaye: `F-${partnerId}-6`,
      clientDebiteur: 'BERNARD Jean-Pierre',
      emailDebiteur: 'jpbernard@wanadoo.fr',
      telephone1: '0645678912',
      typeTel1: 'Mobile',
      telephone2: '0987654321',
      typeTel2: 'Fixe',
      montant: 780.00,
      dateEcheance: '2026-01-15',
      joursRetard: 60,
      statutCRM: 'En cours',
      montantRecupere: 0,
      dateRecuperation: null,
      nbRelancesIA: 4,
      sourceImport: 'Manuel',
      dateAjout: '2026-02-01',
      notes: 'Client professionnel - attention delicatesse',
      numeroFacture: 'FC2033',
      relances: [
        {
          id: 'rel-004',
          date: '2026-02-15T11:00:00',
          telephone: '33645678912',
          statutRelance: 'INJOIGNABLE',
          resumeAppel: 'Le débiteur n\'a pas décroché, sonnerie sans réponse. Statut : INJOIGNABLE.',
          etapeFlow: 'INJOIGNABLE',
          prochaineAction: 'SMS premier contact',
          dateStatut: '2026-02-15',
        },
        {
          id: 'rel-005',
          date: '2026-02-20T16:30:00',
          telephone: '33645678912',
          statutRelance: 'INJOIGNABLE',
          resumeAppel: 'Le débiteur n\'a pas décroché, messagerie vocale. Statut : INJOIGNABLE. Message laissé.',
          etapeFlow: 'INJOIGNABLE',
          prochaineAction: 'Email premier contact',
          dateStatut: '2026-02-20',
        },
      ],
      contestation: { motif: null, precisions: null, email: null, date: null, statut: null, fichiers: null },
      paiement: { stripeSessionId: null, paymentIntent: null, mode: null, montantPaye: null, commission: null, date: null },
    },
    {
      idImpaye: `F-${partnerId}-7`,
      clientDebiteur: 'ALLALI Karim',
      emailDebiteur: 'k.allali@hotmail.fr',
      telephone1: '0712345678',
      typeTel1: 'Mobile',
      telephone2: '',
      typeTel2: '',
      montant: 1252.00,
      dateEcheance: '2026-02-05',
      joursRetard: 39,
      statutCRM: 'En cours',
      montantRecupere: 0,
      dateRecuperation: null,
      nbRelancesIA: 2,
      sourceImport: 'CSV',
      dateAjout: '2026-02-10',
      notes: 'Conteste le montant',
      numeroFacture: '2618',
      relances: [
        {
          id: 'rel-006',
          date: '2026-02-25T14:00:00',
          telephone: '33712345678',
          statutRelance: 'LITIGE',
          resumeAppel: 'Le débiteur a décroché, conteste le montant (900€ vs 1252€ facturés). Statut : LITIGE. Justificatifs email promis.',
          etapeFlow: 'LITIGE',
          prochaineAction: 'Email accusé réception contestation',
          dateStatut: '2026-02-25',
        },
      ],
      contestation: {
        motif: 'Erreur de facturation',
        precisions: 'Le client affirme avoir recu un devis a 900 euros et non 1252 euros. Il dispose des emails de confirmation du devis initial.',
        email: 'k.allali@hotmail.fr',
        date: '2026-02-25',
        statut: 'EN COURS',
        fichiers: 'https://drive.google.com/file/d/xxx/devis-allali.pdf',
      },
      paiement: { stripeSessionId: null, paymentIntent: null, mode: null, montantPaye: null, commission: null, date: null },
    },
    {
      idImpaye: `F-${partnerId}-8`,
      clientDebiteur: 'PETIT Christophe',
      emailDebiteur: 'c.petit@gmail.com',
      telephone1: '0623456789',
      typeTel1: 'Mobile',
      telephone2: '',
      typeTel2: '',
      montant: 195.00,
      dateEcheance: '2026-02-01',
      joursRetard: 43,
      statutCRM: 'En cours',
      montantRecupere: 0,
      dateRecuperation: null,
      nbRelancesIA: 1,
      sourceImport: 'Manuel',
      dateAjout: '2026-02-10',
      notes: '',
      numeroFacture: 'FC2038',
      relances: [
        {
          id: 'rel-007',
          date: '2026-02-20T10:00:00',
          telephone: '33623456789',
          statutRelance: 'REFUS',
          resumeAppel: 'Le débiteur a décroché, refuse catégoriquement de payer. Statut : REFUS. Motif : insatisfaction du service, abonnement résilié.',
          etapeFlow: 'REFUS',
          prochaineAction: 'Email mise en demeure',
          dateStatut: '2026-02-20',
        },
      ],
      contestation: { motif: null, precisions: null, email: null, date: null, statut: null, fichiers: null },
      paiement: { stripeSessionId: null, paymentIntent: null, mode: null, montantPaye: null, commission: null, date: null },
    },
    {
      idImpaye: `F-${partnerId}-9`,
      clientDebiteur: 'MOREAU Marie',
      emailDebiteur: 'marie.moreau@yahoo.fr',
      telephone1: '0654321098',
      typeTel1: 'Mobile',
      telephone2: '',
      typeTel2: '',
      montant: 4200.00,
      dateEcheance: '2025-12-15',
      joursRetard: 91,
      statutCRM: 'En cours',
      montantRecupere: 4200.00,
      dateRecuperation: '2026-03-05',
      nbRelancesIA: 3,
      sourceImport: 'CSV',
      dateAjout: '2026-01-15',
      notes: 'Grosse facture - coaching premium 6 mois',
      numeroFacture: 'FC2019',
      relances: [
        {
          id: 'rel-008',
          date: '2026-02-01T09:30:00',
          telephone: '33654321098',
          statutRelance: 'PROMESSE',
          resumeAppel: 'La débitrice a décroché, difficultés financières mentionnées. Statut : PROMESSE. Intéressée par le paiement en 3x.',
          etapeFlow: 'PROMESSE',
          prochaineAction: null,
          dateStatut: '2026-02-01',
        },
        {
          id: 'rel-009',
          date: '2026-03-05T11:00:00',
          telephone: '33654321098',
          statutRelance: 'PAYÉ',
          resumeAppel: null,
          etapeFlow: 'PAYÉ',
          prochaineAction: null,
          dateStatut: '2026-03-05',
        },
      ],
      contestation: { motif: null, precisions: null, email: null, date: null, statut: null, fichiers: null },
      paiement: {
        stripeSessionId: 'cs_live_abc123moreau',
        paymentIntent: 'pi_3xyz789moreau',
        mode: '3x',
        montantPaye: 4200.00,
        commission: 420.00,
        date: '2026-03-05',
      },
    },
    {
      idImpaye: `F-${partnerId}-10`,
      clientDebiteur: 'GARCIA Antoine',
      emailDebiteur: 'a.garcia@live.fr',
      telephone1: '0687654321',
      typeTel1: 'Mobile',
      telephone2: '',
      typeTel2: '',
      montant: 75.00,
      dateEcheance: '2026-02-20',
      joursRetard: 24,
      statutCRM: 'En cours',
      montantRecupere: 75.00,
      dateRecuperation: '2026-03-10',
      nbRelancesIA: 1,
      sourceImport: 'Manuel',
      dateAjout: '2026-03-01',
      notes: '',
      numeroFacture: 'FC2070',
      relances: [
        {
          id: 'rel-010',
          date: '2026-03-05T15:00:00',
          telephone: '33687654321',
          statutRelance: 'PROMESSE',
          resumeAppel: 'Le débiteur a décroché, avait oublié. Statut : PROMESSE. Paiement immédiat via lien SMS.',
          etapeFlow: 'PROMESSE',
          prochaineAction: null,
          dateStatut: '2026-03-05',
        },
        {
          id: 'rel-011',
          date: '2026-03-10T10:00:00',
          telephone: '33687654321',
          statutRelance: 'PAYÉ',
          resumeAppel: null,
          etapeFlow: 'PAYÉ',
          prochaineAction: null,
          dateStatut: '2026-03-10',
        },
      ],
      contestation: { motif: null, precisions: null, email: null, date: null, statut: null, fichiers: null },
      paiement: {
        stripeSessionId: 'cs_live_def456garcia',
        paymentIntent: 'pi_3abc012garcia',
        mode: 'card',
        montantPaye: 75.00,
        commission: 7.50,
        date: '2026-03-10',
      },
    },
    {
      idImpaye: `F-${partnerId}-11`,
      clientDebiteur: 'ROUX Isabelle',
      emailDebiteur: 'i.roux@orange.fr',
      telephone1: '0676543210',
      typeTel1: 'Mobile',
      telephone2: '',
      typeTel2: '',
      montant: 2800.00,
      dateEcheance: '2025-11-30',
      joursRetard: 106,
      statutCRM: 'Contentieux',
      montantRecupere: 0,
      dateRecuperation: null,
      nbRelancesIA: 5,
      sourceImport: 'CSV',
      dateAjout: '2026-01-05',
      notes: 'Transmis au service contentieux le 01/03',
      numeroFacture: 'FC2008',
      relances: [
        {
          id: 'rel-012',
          date: '2026-01-15T10:00:00',
          telephone: '33676543210',
          statutRelance: 'INJOIGNABLE',
          resumeAppel: 'La débitrice n\'a pas décroché, messagerie. Statut : INJOIGNABLE.',
          etapeFlow: 'INJOIGNABLE',
          prochaineAction: null,
          dateStatut: '2026-01-15',
        },
        {
          id: 'rel-013',
          date: '2026-02-01T14:00:00',
          telephone: '33676543210',
          statutRelance: 'REFUS',
          resumeAppel: 'La débitrice a décroché, refuse de payer et demande de ne plus être contactée. Statut : REFUS. Escalade contentieux.',
          etapeFlow: 'REFUS',
          prochaineAction: null,
          dateStatut: '2026-02-01',
        },
      ],
      contestation: { motif: null, precisions: null, email: null, date: null, statut: null, fichiers: null },
      paiement: { stripeSessionId: null, paymentIntent: null, mode: null, montantPaye: null, commission: null, date: null },
    },
    {
      idImpaye: `F-${partnerId}-12`,
      clientDebiteur: 'DUPONT Laurent',
      emailDebiteur: 'l.dupont@sfr.fr',
      telephone1: '0632109876',
      typeTel1: 'Mobile',
      telephone2: '',
      typeTel2: '',
      montant: 25.00,
      dateEcheance: '2026-03-01',
      joursRetard: 15,
      statutCRM: 'En attente',
      montantRecupere: 0,
      dateRecuperation: null,
      nbRelancesIA: 0,
      sourceImport: 'API',
      dateAjout: '2026-03-10',
      notes: '',
      numeroFacture: 'FC2082',
      relances: [],
      contestation: { motif: null, precisions: null, email: null, date: null, statut: null, fichiers: null },
      paiement: { stripeSessionId: null, paymentIntent: null, mode: null, montantPaye: null, commission: null, date: null },
    },
  ];

  return {
    partner: { id: partnerId, name: partnerName },
    dossiers,
  };
}

export async function fetchPartnerDashboard(partnerId) {
  if (USE_MOCK || !DASHBOARD_API_URL) {
    await new Promise((r) => setTimeout(r, 100));
    return generateMockData(partnerId);
  }

  try {
    const res = await fetch(`${DASHBOARD_API_URL}?action=getDashboard&partnerId=${encodeURIComponent(partnerId)}`);
    const data = await res.json();
    if (!data || !data.partner) throw new Error('Partenaire introuvable');
    return data;
  } catch (err) {
    console.warn('Dashboard API error, fallback mock:', err.message);
    return generateMockData(partnerId);
  }
}

export function getEffectiveStatus(dossier) {
  const relances = dossier.relances || [];
  if (relances.length === 0) return dossier.statutCRM || 'En attente';

  const priority = ['PAYÉ', 'PROMESSE', 'LITIGE', 'REFUS', 'INJOIGNABLE'];
  for (const p of priority) {
    if (relances.some((r) => r.statutRelance === p)) return p;
  }
  return dossier.statutCRM || 'En attente';
}

export function formatMontant(n) {
  if (n == null || isNaN(n)) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export function formatDateLong(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
