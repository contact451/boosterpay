/**
 * Service pour envoyer les leads vers Google Sheets via Google Apps Script
 */

const GOOGLE_SHEET_API_URL = import.meta.env.VITE_GOOGLE_SHEET_API_URL || '';
const B2B_SHEET_API_URL = import.meta.env.VITE_B2B_SHEET_API_URL || '';
// CRM API (Apps Script) — pour notifier la conversion des leads IA B2B
const CRM_API_URL = import.meta.env.VITE_CRM_API_URL || 'https://script.google.com/macros/s/AKfycbztp_6rllQCg2MPXrrWOyudvaGcUlIdG6pZdVQjpU7-Z-8_3brmGHqoD2nrlCv0mMYe/exec';

/**
 * Envoie un lead vers Google Sheets
 * @param {Object} leadData - Données du lead
 * @returns {Promise<Object>} Réponse
 */
export const submitLead = async (leadData) => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const urlParams = new URLSearchParams(window.location.search);

  const payload = {
    ref: urlParams.get('ref') || '',
    email: leadData.email,
    telephone: leadData.phone || leadData.telephone,
    source: leadData.source || 'website',
    estimation: leadData.estimation || 0,
    factures_mois: leadData.factures_mois || 0,
    montant_moyen: leadData.montant_moyen || 0,
    appareil: isMobile ? 'mobile' : 'desktop',
    utm_source: urlParams.get('utm_source') || '',
    utm_campaign: urlParams.get('utm_campaign') || '',
    timestamp: new Date().toISOString()
  };

  console.log('📤 Envoi du lead vers Google Sheets:', payload);

  if (!GOOGLE_SHEET_API_URL) {
    console.warn('⚠️ VITE_GOOGLE_SHEET_API_URL non configurée — lead non envoyé');
    return { success: true, warning: 'URL non configurée' };
  }

  try {
    const response = await fetch(GOOGLE_SHEET_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log('✅ Lead envoyé avec succès:', result);

    // Notifier Sheet 1 (B2B) pour stopper la séquence SMS/Email — fire & forget
    if (B2B_SHEET_API_URL && payload.ref) {
      fetch(B2B_SHEET_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          ref: payload.ref,
          email: payload.email,
          action: 'converted',
          timestamp: payload.timestamp,
        }),
      }).catch(() => {});
    }

    // Notifier le CRM si le lead vient d'une campagne IA (ref = AVIS-xxx ou RELIA-xxx)
    if (CRM_API_URL && payload.ref && (payload.ref.startsWith('AVIS-') || payload.ref.startsWith('RELIA-') || payload.ref.startsWith('REL-IA'))) {
      fetch(CRM_API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'convertLeadIA',
          ref: payload.ref,
          email: payload.email,
          statut: 'INSCRIT',
          timestamp: payload.timestamp,
        }),
      }).catch(() => {});
    }

    return result;
  } catch (error) {
    // Fallback silencieux — la capture ne doit JAMAIS bloquer l'UX
    console.warn('⚠️ Erreur envoi lead (non bloquant):', error.message);
    return { success: true, warning: 'Envoi échoué silencieusement' };
  }
};

/**
 * Envoie un lead avec les données du simulateur
 * @param {Object} simulatorData - Données du simulateur
 * @returns {Promise<Object>}
 */
export const submitSimulatorLead = async (simulatorData) => {
  return submitLead({
    ...simulatorData,
    source: 'simulateur'
  });
};

/**
 * Capture un lead depuis les landing pages (impact-avis / ia-vocale).
 * Fire-and-forget : ne bloque JAMAIS le parcours utilisateur.
 * @param {Object} data - { companyName, email, plan, contactCount, source, contacts }
 */
export const captureLeadFromSite = (data) => {
  if (!CRM_API_URL) {
    console.warn('CRM_API_URL non configurée — lead site non envoyé');
    return;
  }

  const payload = {
    action: 'captureLeadFromSite',
    companyName: data.companyName,
    email: data.email,
    plan: data.plan,
    contactCount: data.contactCount,
    source: data.source,
    contacts: data.contacts || [],
    timestamp: new Date().toISOString(),
  };

  console.log('📤 Capture lead site vers CRM:', payload);

  fetch(CRM_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload),
  }).then((res) => {
    console.log('✅ captureLeadFromSite réponse:', res.status);
    return res.text().then(t => console.log('📋 Réponse CRM:', t));
  }).catch((err) => {
    console.warn('⚠️ captureLeadFromSite échoué (non bloquant):', err.message);
  });
};

/**
 * Démarre un essai gratuit / souscription depuis le popup email de la landing IA Vocale.
 * Fire-and-forget — ne doit jamais bloquer l'UX.
 *
 * @param {Object} data
 * @param {string} data.email     — email du prospect
 * @param {string} [data.entreprise]
 * @param {'gratuit'|'a-la-carte'|'pro'|'business'} [data.plan='gratuit']
 * @param {string} [data.source]  — origine du clic (hero, pricing, floating…)
 *
 * Côté Apps Script, l'action POST attendue est `startTrial` (à ajouter dans
 * apps-script-api.gs : crée la ligne dans le sheet ESSAIS, envoie le mail
 * de confirmation avec le lien tokenisé /configurer/{token}).
 */
export const submitTrialSignup = async (data) => {
  if (!CRM_API_URL) {
    console.warn('CRM_API_URL non configurée — essai non envoyé');
    return { success: false, error: 'API non configurée' };
  }

  const urlParams = new URLSearchParams(window.location.search);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const payload = {
    action: 'startTrial',
    email: data.email,
    entreprise: data.entreprise || '',
    plan: data.plan || 'gratuit',
    source: data.source || 'unknown',
    appareil: isMobile ? 'mobile' : 'desktop',
    utm_source: urlParams.get('utm_source') || '',
    utm_campaign: urlParams.get('utm_campaign') || '',
    ref: urlParams.get('ref') || '',
    timestamp: new Date().toISOString(),
  };

  console.log('📤 Trial signup vers Apps Script:', payload);

  try {
    const response = await fetch(CRM_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({ success: true }));
    console.log('✅ Trial signup OK:', result);
    return result;
  } catch (error) {
    console.warn('⚠️ Trial signup échoué (non bloquant):', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Envoie un message de contact depuis le bouton flottant chat-email.
 *
 * @param {Object} data
 * @param {string} data.email
 * @param {string} data.message
 * @param {string} [data.source='floating_chat']
 *
 * Côté Apps Script, action POST `submitContactMessage` :
 *   - log dans le sheet CONTACT_MESSAGES
 *   - email auto-réponse au visiteur
 *   - notification interne contact@booster-pay.com
 */
export const submitContactMessage = async (data) => {
  if (!CRM_API_URL) {
    console.warn('CRM_API_URL non configurée');
    return { success: false, error: 'API non configurée' };
  }

  const payload = {
    action: 'submitContactMessage',
    email: data.email,
    message: data.message,
    source: data.source || 'floating_chat',
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(CRM_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({ success: true }));
    return result;
  } catch (error) {
    console.warn('⚠️ submitContactMessage échoué:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère un essai par son token (page /configurer/:token).
 * Action GAS : GET ?action=getEssaiByToken&token=...
 */
export const fetchEssaiByToken = async (token) => {
  if (!CRM_API_URL || !token) return { success: false, error: 'API ou token manquant' };
  try {
    const res = await fetch(CRM_API_URL + '?action=getEssaiByToken&token=' + encodeURIComponent(token));
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Injecte une liste de contacts dans un module donné.
 * @param {Object} payload { token, module, contacts: [{ nom, telephone, email?, dateRdv?, montant?, refFacture?, notes? }] }
 */
export const injectContacts = async (payload) => {
  if (!CRM_API_URL) return { success: false, error: 'API non configurée' };
  try {
    const res = await fetch(CRM_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'injectContacts', ...payload, timestamp: new Date().toISOString() }),
    });
    return await res.json().catch(() => ({ success: true }));
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Met à jour la config d'un essai (numéro de téléphone de transfert pour Réception 24/7).
 */
export const updateTrialConfig = async (payload) => {
  if (!CRM_API_URL) return { success: false, error: 'API non configurée' };
  try {
    const res = await fetch(CRM_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'updateTrialConfig', ...payload, timestamp: new Date().toISOString() }),
    });
    return await res.json().catch(() => ({ success: true }));
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Annule l'essai/plan d'un lead. Action GAS : cancelTrial.
 * @param {Object} data { token, raison? }
 */
export const cancelTrial = async (data) => {
  if (!CRM_API_URL) return { success: false, error: 'API non configurée' };
  try {
    const res = await fetch(CRM_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'cancelTrial', ...data, timestamp: new Date().toISOString() }),
    });
    return await res.json().catch(() => ({ success: true }));
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Log l'intention de changement de plan AVANT redirection Stripe.
 * Action GAS : requestPlanChange.
 * @param {Object} data { token, plan_demande, source? }
 */
export const requestPlanChange = async (data) => {
  if (!CRM_API_URL) return { success: false, error: 'API non configurée' };
  try {
    const res = await fetch(CRM_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'requestPlanChange', ...data, timestamp: new Date().toISOString() }),
    });
    return await res.json().catch(() => ({ success: true }));
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Envoie les données de l'onboarding Step 2.
 * Le Apps Script RETROUVE le lead par email et le met à jour (statut → "Converti").
 */
export const submitOnboarding = async (payload) => {
  const GAS_URL = GOOGLE_SHEET_API_URL;

  if (!GAS_URL) {
    console.warn('⚠️ VITE_GOOGLE_SHEET_API_URL non configurée — onboarding non envoyé');
    return { success: false, error: 'URL backend non configurée' };
  }

  const maxRetries = 1;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('✅ Onboarding envoyé:', result);

      // Notifier Sheet 1 (B2B) pour stopper la séquence — fire & forget
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref') || '';
      if (B2B_SHEET_API_URL && ref) {
        fetch(B2B_SHEET_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            ref: ref,
            email: payload.email,
            action: 'converted',
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {});
      }

      // Notifier le CRM si lead IA — passage en CONVERTI (onboarding terminé)
      if (CRM_API_URL && ref && (ref.startsWith('AVIS-') || ref.startsWith('RELIA-') || ref.startsWith('REL-IA'))) {
        fetch(CRM_API_URL, {
          method: 'POST',
          body: JSON.stringify({
            action: 'convertLeadIA',
            ref: ref,
            email: payload.email,
            statut: 'CONVERTI',
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {});
      }

      return result;

    } catch (error) {
      if (attempt === maxRetries) {
        console.error('❌ submitOnboarding failed:', error);
        return { success: false, error: error.message };
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }
};
