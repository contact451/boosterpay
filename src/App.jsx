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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BoosterPayLanding />} />
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
