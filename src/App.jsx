import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BoosterPayLanding from './BoosterPayLanding';
import OnboardingStep2 from './OnboardingStep2';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BoosterPayLanding />} />
        <Route path="/onboarding/import" element={<OnboardingStep2 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
