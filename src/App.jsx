import { Routes, Route, useLocation } from "react-router-dom";
import { CaptureProvider } from "./context/CaptureContext";
import { LandingPage } from "./pages/LandingPage";
import { CapturePage } from "./pages/CapturePage";
import { LoadingPage } from "./pages/LoadingPage";
import { ResultsPage } from "./pages/ResultsPage";
import amorepacificBlackLogo from "./assets/Amorepacific_BlackLogo.png";
import amorepacificWhiteLogo from "./assets/Amorepacific_WhiteLogo.png";
import "./App.css";

function AppContent() {
  const location = useLocation();
  // Pages that show black logo: "/camera" (CapturePage) and "/results" (ResultsPage)
  const showBlackLogo = location.pathname === "/camera" || location.pathname === "/results";
  const logo = showBlackLogo ? amorepacificBlackLogo : amorepacificWhiteLogo;

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/camera" element={<CapturePage />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
      <img
        className="app__brand"
        alt="Amorepacific"
        src={logo}
      />
    </>
  );
}

function App() {
  return (
    <CaptureProvider>
      <AppContent />
    </CaptureProvider>
  );
}

export default App;
