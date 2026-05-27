import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Helper : redirige en gardant search/hash (sinon ?ref=XXX disparaît)
function NavigatePreserve({ to }) {
  const loc = useLocation();
  return <Navigate to={{ pathname: to, search: loc.search, hash: loc.hash }} replace />;
}

// Scroll automatique vers l'ancre #id quand on arrive sur la page avec un hash
// (le navigateur ne le fait pas seul sur une SPA car la section n'existe pas
//  encore au moment où il essaye de scroller).
// Retry car la section peut être plus bas dans la page et mounter en différé
// (animations / scrollReveal / heavy components).
function ScrollToHash() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const id = hash.replace('#', '');
    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        // scrollIntoView avec offset top pour compenser la navbar sticky
        const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
        return;
      }
      attempts++;
      if (attempts < 20) setTimeout(tryScroll, 100); // 2s max de retry
    };
    // Premier essai après que React a fini son rendu initial
    setTimeout(tryScroll, 50);
  }, [hash, pathname]);
  return null;
}
import BoosterPayLanding from './BoosterPayLanding';
import OnboardingStep2 from './OnboardingStep2';
import OnboardingSuccess from './OnboardingSuccess';
import MentionsLegales from './pages/MentionsLegales';
import CGV from './pages/CGV';
import PolitiqueConfidentialite from './pages/PolitiqueConfidentialite';
import FacturePage from './FacturePage';
import ContestationPage from './ContestationPage';
import PaiementConfirmePage from './pages/PaiementConfirmePage';
import DashboardPartenaire from './pages/DashboardPartenaire';
import ImpactAvisLanding from './pages/ImpactAvisLanding';
import NotationClient from './pages/NotationClient';
import IAVocaleLanding from './pages/IAVocaleLanding';
import MerciPage from './pages/MerciPage';
import Configurer from './pages/Configurer';
import InscriptionTrial from './pages/InscriptionTrial';
import EspaceAbonne from './pages/EspaceAbonne';
// Pages dédiées par service (mini landings Apple-style)
import Reception247 from './pages/services/Reception247';
import Renouvellement from './pages/services/Renouvellement';
import ConfirmationRdv from './pages/services/ConfirmationRdv';
import ImpactAvisService from './pages/services/ImpactAvis';
import Paiements from './pages/services/Paiements';
import RobotMesure from './pages/services/RobotMesure';

function App() {
  return (
    <BrowserRouter>
      <ScrollToHash />
      <Routes>
        {/* IA Vocale est désormais la page principale.
            Impact Avis et Accélération de paiements sont devenus des modules
            internes — leurs anciennes URLs redirigent vers les sections ancrées. */}
        <Route path="/" element={<IAVocaleLanding />} />
        {/* /ia-vocale et autres anciennes URLs : on préserve ?ref=, ?id=, ?lead= etc.
            sinon les flows SMS/Email perdraient leur ID au passage. */}
        <Route path="/ia-vocale" element={<NavigatePreserve to="/" />} />
        <Route path="/impact-avis" element={<NavigatePreserve to="/" />} />
        <Route path="/acceleration-paiements" element={<NavigatePreserve to="/" />} />
        {/* L'ancienne BoosterPayLanding reste accessible en /legacy-home si nécessaire */}
        <Route path="/legacy-home" element={<BoosterPayLanding />} />
        <Route path="/legacy-impact-avis" element={<ImpactAvisLanding />} />
        <Route path="/avis/:partnerId" element={<NotationClient />} />
        <Route path="/merci" element={<MerciPage />} />
        {/* Tunnel d'inscription au trial 7 jours (avant Stripe Checkout) */}
        <Route path="/inscription-trial" element={<InscriptionTrial />} />
        {/* Pages dédiées par service (mini-landings) */}
        <Route path="/services/reception" element={<Reception247 />} />
        <Route path="/services/renouvellement" element={<Renouvellement />} />
        <Route path="/services/rdv" element={<ConfirmationRdv />} />
        <Route path="/services/impact-avis" element={<ImpactAvisService />} />
        <Route path="/services/paiements" element={<Paiements />} />
        <Route path="/services/robot" element={<RobotMesure />} />
        {/* Espace de configuration tokenisé envoyé par mail au lead après essai */}
        <Route path="/configurer/:token" element={<Configurer />} />
        {/* /configurer?id=BP-XXX → nouvelle page espace abonné post-paiement */}
        <Route path="/configurer" element={<EspaceAbonne />} />
        <Route path="/onboarding/step2" element={<OnboardingStep2 />} />
        <Route path="/onboarding/import" element={<OnboardingStep2 />} />
        <Route path="/onboarding/success" element={<OnboardingSuccess />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/cgv" element={<CGV />} />
        <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
        <Route path="/facture" element={<FacturePage />} />
        <Route path="/contestation" element={<ContestationPage />} />
        <Route path="/paiement-confirme" element={<PaiementConfirmePage />} />
        <Route path="/dashboard" element={<Navigate to="/dashboard/91ueq4ae0q" replace />} />
        <Route path="/dashboard/:partnerId" element={<DashboardPartenaire />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
