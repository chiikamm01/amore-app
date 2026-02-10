import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LANGUAGES = [
  { id: "kr", label: "KR", name: "Korean" },
  { id: "en", label: "EN", name: "English" },
];

export const LandingPage = () => {
  const [language, setLanguage] = useState("en");
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    // Ensure video plays even if autoplay fails
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn("Autoplay prevented:", err);
      });
    }
  }, []);

  return (
    <div className="main_window">
      <video
        ref={videoRef}
        className="main_window__video"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden
        onError={(e) => {
          console.error("Video loading error:", e);
          console.error("Video source:", e.target.src);
        }}
        onLoadedData={() => {
          console.log("Landing page video loaded");
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
        <source src="/video/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="image" />

      <div className="hero-center">
        <div className="find-your-personal">FIND YOUR<br />PERSONAL TONE</div>
        <div className="btn" role="button" tabIndex={0} onClick={() => navigate("/camera")} onKeyDown={(e) => e.key === "Enter" && navigate("/camera")}>
          <div className="button">START</div>
        </div>
      </div>

      <nav className="language-menu" aria-label="Language selection">
        <ul className="language-menu__list">
          {LANGUAGES.map((lang) => (
            <li key={lang.id}>
              <button
                type="button"
                className={`language-menu__option ${language === lang.id ? "language-menu__option--active" : ""}`}
                onClick={() => setLanguage(lang.id)}
                aria-pressed={language === lang.id}
                aria-label={lang.name}
              >
                {lang.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
