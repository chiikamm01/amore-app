import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCapture } from "../context/CaptureContext";
import faceGuide from "../assets/face.svg";
import "./CapturePage.css";

const RECORD_DURATION_SEC = 15;

export const CapturePage = () => {
  const videoRef = useRef(null);
  const previewVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [mode, setMode] = useState("camera");
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [error, setError] = useState(null);
  const [capturedVideoUrl, setCapturedVideoUrl] = useState(null);
  const navigate = useNavigate();
  const { setCapturedVideo, clearCapturedVideo } = useCapture();

  // Start camera when in camera mode
  useEffect(() => {
    if (mode !== "camera") {
      // Stop stream when switching away from camera mode
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }
      return;
    }
    
    let currentStream = null;
    const startCamera = async () => {
      try {
        setError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        currentStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError("Camera access denied. Please allow camera and try again.");
      }
    };
    startCamera();
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [mode]);

  useEffect(() => {
    if (!stream || !videoRef.current || mode !== "camera") return;
    videoRef.current.srcObject = stream;
  }, [stream, mode]);

  useEffect(() => {
    if (!isRecording || countdown === null) return;
    if (countdown <= 0) {
      stopRecording();
      return;
    }
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [isRecording, countdown]);

  // Ensure preview video plays when switching to preview mode
  useEffect(() => {
    if (mode === "preview" && previewVideoRef.current && capturedVideoUrl) {
      const video = previewVideoRef.current;
      // Ensure video loads and plays
      const handleCanPlay = () => {
        video.play().catch((err) => {
          console.error("Error playing preview video:", err);
        });
      };
      
      video.addEventListener("canplay", handleCanPlay);
      video.load();
      
      // Also try to play immediately in case canplay already fired
      if (video.readyState >= 2) {
        video.play().catch((err) => {
          console.error("Error playing preview video:", err);
        });
      }
      
      return () => {
        video.removeEventListener("canplay", handleCanPlay);
      };
    }
  }, [mode, capturedVideoUrl]);

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setCapturedVideoUrl(url);
      setCapturedVideo(url); // Update context
      setMode("preview"); // Switch mode instead of navigating
    };
    recorder.start();
    setIsRecording(true);
    setCountdown(RECORD_DURATION_SEC);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setCountdown(null);
  };

  const handleStartOver = () => {
    // Clean up video URL
    if (capturedVideoUrl) {
      URL.revokeObjectURL(capturedVideoUrl);
    }
    setCapturedVideoUrl(null);
    clearCapturedVideo(); // Clear context
    setIsRecording(false);
    setCountdown(null);
    setMode("camera"); // Switch back to camera mode (useEffect will handle stream cleanup/restart)
  };

  const handleAnalyse = () => {
    navigate("/loading");
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="capture-page">
      <p className="capture-page__instruction">
        {mode === "camera" ? "PLEASE LOOK DIRECTLY AT CAMERA" : "PLEASE VERIFY VIDEO"}
      </p>

      <div className="capture-page__frame-container">
        {mode === "camera" ? (
          <div className="capture-page__frame">
            {error ? (
              <div className="capture-page__error">
                <p>{error}</p>
                <button type="button" onClick={() => window.location.reload()}>
                  Retry
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="capture-page__video"
                  autoPlay
                  playsInline
                  muted
                />
                <img src={faceGuide} className="capture-page__face-guide" alt="" aria-hidden />
                <div className="capture-page__corner capture-page__corner--top-left" aria-hidden />
                <div className="capture-page__corner capture-page__corner--top-right" aria-hidden />
                <div className="capture-page__corner capture-page__corner--bottom-left" aria-hidden />
                <div className="capture-page__corner capture-page__corner--bottom-right" aria-hidden />
                {isRecording && countdown !== null && (
                  <div className="capture-page__timer">{formatTime(countdown)}</div>
                )}
                <button
                  type="button"
                  className={`capture-page__record ${isRecording ? "capture-page__record--recording" : ""}`}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={!!error}
                  aria-label={isRecording ? "Stop recording" : "Start recording"}
                >
                  <span className="capture-page__record-ellipse" />
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="capture-page__frame">
              {capturedVideoUrl ? (
                <video
                  key={capturedVideoUrl}
                  ref={previewVideoRef}
                  src={capturedVideoUrl}
                  className="capture-page__video"
                  autoPlay
                  playsInline
                  muted
                  loop
                  onError={(e) => {
                    console.error("Video playback error:", e);
                    setError("Failed to load video. Please try recording again.");
                  }}
                  onLoadedData={() => {
                    if (previewVideoRef.current) {
                      previewVideoRef.current.play().catch((err) => {
                        console.error("Error playing video:", err);
                      });
                    }
                  }}
                />
              ) : (
                <div className="capture-page__error">
                  <p>No video available</p>
                </div>
              )}
            </div>
            <div className="capture-page__actions">
              <button
                type="button"
                className="capture-page__start-over"
                onClick={handleStartOver}
                aria-label="Start over and re-record"
              >
                <span>START OVER</span>
                <svg
                  className="capture-page__refresh-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M1 4v6h6" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              </button>
              <button
                type="button"
                className="capture-page__analyse"
                onClick={handleAnalyse}
              >
                ANALYSE
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
