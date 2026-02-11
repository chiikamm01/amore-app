import { createContext, useContext, useState } from "react";

const CaptureContext = createContext(null);

export const useCapture = () => {
  const ctx = useContext(CaptureContext);
  if (!ctx) throw new Error("useCapture must be used within CaptureProvider");
  return ctx;
};

// TODO: Remove this mock data when backend is ready
const mockAnalysisResult = {
  skinToneName: "Spring Bright",
  skinToneDescription:
    "Vorem ipsum dolor sit amet, consectetur adipiscing elit. Vorem ipsum dolor sit amet, consectetur adipiscing elit.",
  foundationShades: [
    { code: "W22", rank: "BEST SHADE" },
    { code: "N21", rank: "SECOND BEST" },
    { code: "W21", rank: "THIRD BEST" },
  ],
  lipstickSwatches: [
    { color: "#6B3A2E", label: "W23", isPrimary: true },
    { color: "#8B4513", label: "C41", isPrimary: false },
    { color: "#A0522D", label: "N67", isPrimary: false },
    { color: "#CD853F", label: "W97", isPrimary: false },
    { color: "#D2691E", label: "C18", isPrimary: false },
  ],
  renderImageUrl: null,
  renderImageUrlsByLipstick: [],
};

export const CaptureProvider = ({ children }) => {
  const [capturedVideoUrl, setCapturedVideoUrl] = useState(null);
  // Start with null - will be set by API response
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const setCapturedVideo = (url) => {
    setCapturedVideoUrl(url);
  };

  const clearCapturedVideo = () => {
    if (capturedVideoUrl) {
      URL.revokeObjectURL(capturedVideoUrl);
    }
    setCapturedVideoUrl(null);
    // Optionally clear analysis result when starting over
    // setAnalysisResult(null);
  };

  return (
    <CaptureContext.Provider
      value={{
        capturedVideoUrl,
        setCapturedVideo,
        clearCapturedVideo,
        analysisResult,
        setAnalysisResult,
        isAnalyzing,
        setIsAnalyzing,
        error,
        setError,
      }}
    >
      {children}
    </CaptureContext.Provider>
  );
};
