import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BoosterPayLanding from './BoosterPayLanding';
import OnboardingStep2 from './OnboardingStep2';
import OnboardingSuccess from './OnboardingSuccess';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BoosterPayLanding />} />
        <Route path="/onboarding/step2" element={<OnboardingStep2 />} />
        <Route path="/onboarding/import" element={<OnboardingStep2 />} />
        <Route path="/onboarding/success" element={<OnboardingSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
