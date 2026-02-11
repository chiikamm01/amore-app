import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCapture } from "../context/CaptureContext";
import { uploadVideoAndAnalyze } from "../services/api";
import "./LoadingPage.css";
import loadingVideo from "../assets/loading.mp4";

export const LoadingPage = () => {
  const navigate = useNavigate();
  const { capturedVideoUrl, setAnalysisResult } = useCapture();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const hasAnalyzedRef = useRef(false); // Prevent duplicate API calls

  useEffect(() => {
    if (!capturedVideoUrl) {
      // If no video, redirect back to camera
      navigate("/camera");
      return;
    }

    // Prevent duplicate API calls (React StrictMode in dev can cause double execution)
    if (hasAnalyzedRef.current) {
      return;
    }
    hasAnalyzedRef.current = true;

    // Call backend API for analysis
    const analyzeVideo = async () => {
      try {
        setError(null);
        setProgress(0);
        
        // Simulate progress updates (backend doesn't support progress yet)
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) return prev; // Stop at 90% until API responds
            return prev + 2;
          });
        }, 200);

        const result = await uploadVideoAndAnalyze(capturedVideoUrl);
        
        clearInterval(progressInterval);
        setProgress(100);
        
        // Update context with analysis result
        setAnalysisResult(result);
        
        // Navigate to results after a brief delay
        setTimeout(() => {
          navigate("/results");
        }, 500);
      } catch (err) {
        setProgress(0);
        const msg = err.message || "Analysis failed. Please try again.";
        setError(msg);
        console.error("Analysis error:", err);
        // Optionally redirect back to camera after error
        // setTimeout(() => navigate("/camera"), 3000);
      }
    };

    analyzeVideo();
  }, [capturedVideoUrl, navigate, setAnalysisResult]);

  useEffect(() => {
    // Ensure video plays even if autoplay fails
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn("Autoplay prevented:", err);
      });
    }
  }, []);

  return (
    <div className="loading-page">
      <video
        ref={videoRef}
        className="loading-page__video"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        onError={(e) => {
          console.error("Loading page video error:", e);
          console.error("Video source:", e.target.src);
        }}
        onLoadedData={() => {
          console.log("Loading page video loaded");
          if (videoRef.current) {
            videoRef.current.play().catch((err) => {
              console.warn("Video play failed:", err);
            });
          }
        }}
        onCanPlay={() => {
          if (videoRef.current) {
            videoRef.current.play().catch((err) => {
              console.warn("Video play on canPlay failed:", err);
            });
          }
        }}
      >
        <source src={loadingVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="loading-page__overlay" aria-hidden />

      <div className="loading-page__content">
        <p className="loading-page__analyzing">ANALYZING YOUR TONE...</p>
        {error && (
          <p className="loading-page__error" style={{ color: "#ff6b6b", marginTop: "16px" }}>
            {error}
          </p>
        )}
        <div className="loading-page__bar-wrap">
          <div
            className="loading-page__bar-fill"
            style={{ "--progress-width": `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
