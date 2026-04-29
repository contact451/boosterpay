import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* IA Vocale est désormais la page principale.
            Impact Avis et Accélération de paiements sont devenus des modules
            internes — leurs anciennes URLs redirigent vers les sections ancrées. */}
        <Route path="/" element={<IAVocaleLanding />} />
        <Route path="/ia-vocale" element={<Navigate to="/" replace />} />
        <Route path="/impact-avis" element={<Navigate to="/#impact-avis" replace />} />
        <Route path="/acceleration-paiements" element={<Navigate to="/#paiements" replace />} />
        {/* L'ancienne BoosterPayLanding reste accessible en /legacy-home si nécessaire */}
        <Route path="/legacy-home" element={<BoosterPayLanding />} />
        <Route path="/legacy-impact-avis" element={<ImpactAvisLanding />} />
        <Route path="/avis/:partnerId" element={<NotationClient />} />
        <Route path="/merci" element={<MerciPage />} />
        {/* Espace de configuration tokenisé envoyé par mail au lead après essai */}
        <Route path="/configurer/:token" element={<Configurer />} />
        <Route path="/configurer" element={<Navigate to="/" replace />} />
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
