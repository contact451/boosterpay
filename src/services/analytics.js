// ============================================
// GA4 Analytics Module — Centralized tracking
// ============================================

const GA_MEASUREMENT_ID = 'G-7D7V6H12FT';
const IS_DEV = import.meta.env.DEV;

// Simple hash for emails (never send plain emails to GA4)
const hashEmail = (email) => {
  if (!email) return '';
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36);
};

// Check if gtag is available
const isGtagReady = () => typeof window !== 'undefined' && typeof window.gtag === 'function';

// Debug logger
const debugLog = (type, name, params) => {
  if (IS_DEV) {
    console.log(
      `%c[GA4 ${type}]%c ${name}`,
      'background: #4285f4; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
      'color: #4285f4; font-weight: bold;',
      params || ''
    );
  }
};

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Track a page view (important for SPA)
 */
export const trackPageView = (path, title) => {
  const params = {
    page_path: path || window.location.pathname,
    page_title: title || document.title,
  };
  debugLog('pageview', path || window.location.pathname, params);
  if (isGtagReady()) {
    window.gtag('config', GA_MEASUREMENT_ID, params);
  }
};

/**
 * Track a custom event
 */
export const trackEvent = (eventName, params = {}) => {
  debugLog('event', eventName, params);
  if (isGtagReady()) {
    window.gtag('event', eventName, params);
  }
};

/**
 * Track a conversion event (same as trackEvent but semantically distinct)
 * Mark these as conversions in GA4 admin panel
 */
export const trackConversion = (eventName, params = {}) => {
  debugLog('CONVERSION', eventName, params);
  if (isGtagReady()) {
    window.gtag('event', eventName, params);
  }
};

// ============================================
// NAVIGATION / ENGAGEMENT EVENTS
// ============================================

export const trackCTAClickTopbar = () => {
  trackEvent('cta_click_topbar', { location: 'topbar' });
};

export const trackNavLinkClick = (label, href) => {
  trackEvent('nav_link_click', { link_label: label, link_href: href });
};

export const trackMobileMenuOpen = () => {
  trackEvent('mobile_menu_open');
};

export const trackAudioPlay = (currentTime) => {
  trackEvent('audio_play', { audio_time: Math.round(currentTime) });
};

export const trackAudioComplete = (duration) => {
  trackEvent('audio_complete', { duration: Math.round(duration) });
};

export const trackFAQOpen = (index, questionText) => {
  trackEvent('faq_open', { question_index: index, question_text: questionText });
};

export const trackScrollDepth = (depth) => {
  trackEvent('scroll_depth', { depth });
};

export const trackVirtualPageView = (sectionId) => {
  trackEvent('virtual_page_view', {
    page_path: `/#${sectionId}`,
    section: sectionId,
  });
};

// ============================================
// CONVERSION EVENTS
// ============================================

export const trackLeadEmailSubmit = (email, source) => {
  trackConversion('lead_email_submit', {
    email_hash: hashEmail(email),
    source,
  });
  // Also fire generate_lead for ad ROI tracking
  trackConversion('generate_lead', {
    currency: 'EUR',
    value: 1,
    source,
  });
};

export const trackLeadFormSubmit = (email, source) => {
  trackConversion('lead_form_submit', {
    email_hash: hashEmail(email),
    source,
  });
  trackConversion('generate_lead', {
    currency: 'EUR',
    value: 1,
    source,
  });
};

export const trackTestAISubmit = (debiteurTest, montantTest) => {
  trackConversion('test_ai_submit', {
    debiteur_test: debiteurTest,
    montant_test: montantTest,
    source: 'test_ai',
  });
};

export const trackTestAIManualStart = (clientName, amount) => {
  trackConversion('test_ai_manual_start', {
    client_name: clientName,
    amount,
  });
};

export const trackTestAIImportFile = (fileName) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  trackConversion('test_ai_import_file', {
    file_name: fileName,
    file_type: ext,
  });
};

export const trackBookingModalOpen = (triggerSource) => {
  trackConversion('booking_modal_open', {
    trigger_source: triggerSource || 'unknown',
  });
};

export const trackPricingCTAClick = (planName, planPrice, billing) => {
  trackConversion('pricing_cta_click', {
    plan_name: planName,
    plan_price: planPrice,
    billing,
  });
  // Also fire begin_checkout e-commerce event
  trackConversion('begin_checkout', {
    currency: 'EUR',
    value: planPrice,
    items: [{ item_name: planName }],
  });
};

export const trackPricingToggle = (billingPeriod) => {
  trackEvent('pricing_toggle', { billing_period: billingPeriod });
};

export const trackFooterEmailSubmit = () => {
  trackConversion('footer_email_submit', { source: 'footer' });
  trackConversion('generate_lead', {
    currency: 'EUR',
    value: 1,
    source: 'footer',
  });
};

export const trackExitIntentShown = () => {
  trackConversion('exit_intent_shown');
};

export const trackExitIntentEmail = (email) => {
  trackConversion('exit_intent_email', {
    email_hash: hashEmail(email),
    source: 'exit_intent',
  });
  trackConversion('generate_lead', {
    currency: 'EUR',
    value: 1,
    source: 'exit_intent',
  });
};

export const trackMobileCTAExpand = () => {
  trackEvent('mobile_cta_expand');
};

export const trackMobileCTASubmit = (email) => {
  trackConversion('mobile_cta_submit', {
    email_hash: hashEmail(email),
    source: 'mobile_cta',
  });
  trackConversion('generate_lead', {
    currency: 'EUR',
    value: 1,
    source: 'mobile_cta',
  });
};

export const trackSimulatorReveal = (invoices, avgAmount, recovered) => {
  trackEvent('simulator_reveal', {
    invoices,
    avg_amount: avgAmount,
    estimated_recovery: recovered,
  });
};
