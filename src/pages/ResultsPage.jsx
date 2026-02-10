import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCapture } from "../context/CaptureContext";
import "./ResultsPage.css";

export const ResultsPage = () => {
  const navigate = useNavigate();
  const { analysisResult, capturedVideoUrl } = useCapture();
  const videoRef = useRef(null);
  const [frameImageUrl, setFrameImageUrl] = useState(null);

  // Redirect if no analysis result
  if (!analysisResult) {
    navigate("/camera");
    return null;
  }

  const {
    skinToneName,
    skinToneDescription,
    foundationShades,
    lipstickSwatches,
    renderImageUrl,
    renderImageUrlsByLipstick,
  } = analysisResult;

  const [selectedLipstickIndex, setSelectedLipstickIndex] = useState(
    lipstickSwatches.findIndex((s) => s.isPrimary) >= 0
      ? lipstickSwatches.findIndex((s) => s.isPrimary)
      : 0
  );

  // Use rendered image URLs from API, or fallback to captured video
  const displayImageUrl = analysisResult.renderImageUrlsByLipstick?.[selectedLipstickIndex] 
    || renderImageUrl 
    || capturedVideoUrl;

  // Use real data from API instead of random generation
  const shadeData = {
    percentages: foundationShades.map(shade => shade.percentage),
    colors: foundationShades.map(shade => shade.color)
  };

  // Calculate pie chart segments with random distributions
  let currentAngle = -90; // Start from top (-90 to start at 12 o'clock)
  const pieSegments = foundationShades.map((shade, index) => {
    const percentage = shadeData.percentages[index];
    const segmentAngle = (percentage / 100) * 360; // Convert percentage to degrees
    const startAngle = currentAngle;
    const endAngle = currentAngle + segmentAngle;
    const centerAngle = (startAngle + endAngle) / 2; // Center angle of the segment
    
    currentAngle = endAngle; // Move to next segment
    
    return {
      shade,
      color: shadeData.colors[index],
      percentage,
      startAngle,
      endAngle,
      segmentAngle,
      centerAngle,
    };
  });

  // Extract a frame from video and convert to image
  useEffect(() => {
    if (!capturedVideoUrl || renderImageUrl) {
      setFrameImageUrl(null);
      return;
    }

    const video = document.createElement("video");
    video.src = capturedVideoUrl;
    video.muted = true;
    video.playsInline = true;

    const handleLoadedMetadata = () => {
      // Seek to 0.5 seconds (or middle of video if shorter)
      const seekTime = Math.min(0.5, video.duration / 2);
      video.currentTime = seekTime;
    };

    const handleSeeked = () => {
      try {
        // Create canvas and draw video frame
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to image URL
        const imageUrl = canvas.toDataURL("image/jpeg", 0.9);
        setFrameImageUrl(imageUrl);
      } catch (error) {
        console.error("Error extracting frame:", error);
        // Fallback: use video URL directly
        setFrameImageUrl(null);
      }

      // Cleanup
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("seeked", handleSeeked);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("seeked", handleSeeked);
    video.load();

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("seeked", handleSeeked);
    };
  }, [capturedVideoUrl, renderImageUrl]);

  return (
    <div className="results-page">
      <div className="results-page__left">
        <div className="results-page__tone-section">
          <p className="results-page__label">YOUR TONE</p>
          <h2 className="results-page__tone-name">{skinToneName}</h2>
          <p className="results-page__description">{skinToneDescription}</p>
        </div>

        <div className="results-page__foundation-section">
          <p className="results-page__label results-page__label--center">YOUR BEST FACE COLOR</p>
          <div className="results-page__foundation-circle">
            <svg
              className="results-page__unified-chart"
              viewBox="0 0 500 500"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Cushion illustration */}
              <g className="cushion-illustration" aria-hidden="true" transform="translate(250, 255) scale(1.35) translate(-162.426, -192.5)">
                <circle cx="162.331" cy="192.501" r="102.208" transform="rotate(-24.4183 162.331 192.501)" fill="#A0A0A0"/>
                <path d="M217.009 44.0101L20.1854 133.369L108.071 57.1789L217.009 44.0101Z" fill="#A0A0A0"/>
                <rect x="90.8262" y="86.3921" width="33.9319" height="25.0661" transform="rotate(-27.1674 90.8262 86.3921)" fill="#A0A0A0"/>
                <circle cx="162.426" cy="188.959" r="102.137" transform="rotate(-24.4183 162.426 188.959)" fill="#D9D9D9"/>
                <path d="M90.9018 230.253C99.992 245.997 114.023 258.303 130.82 265.26C147.617 272.217 166.239 273.438 183.8 268.733C201.361 264.027 216.879 253.659 227.946 239.235C239.014 224.812 245.013 207.139 245.013 188.959L162.425 188.959L90.9018 230.253Z" fill="#9B9B9B"/>
                <path d="M226.287 241.328C233.677 232.317 239.076 221.844 242.129 210.597C245.182 199.351 245.821 187.585 244.003 176.074C242.184 164.563 237.951 153.567 231.58 143.809C225.209 134.051 216.845 125.752 207.037 119.457L162.426 188.959L226.287 241.328Z" fill="#9B9B9B"/>
                <path d="M237.627 154.817C232.39 143.282 224.569 133.107 214.771 125.078C204.972 117.049 193.458 111.381 181.119 108.514C168.78 105.647 155.946 105.656 143.611 108.542C131.277 111.428 119.771 117.113 109.985 125.157C100.198 133.201 92.3934 143.388 87.1739 154.931C81.9545 166.474 79.4603 179.062 79.8844 191.723C80.3084 204.384 83.6393 216.778 89.6194 227.945C95.5994 239.113 104.068 248.755 114.371 256.126L162.426 188.959L237.627 154.817Z" fill="#9B9B9B"/>
                <path d="M1.56358 92.7714C1.56358 92.7714 60.2058 61.9937 100.32 43.7815C140.435 25.5694 198.318 3.44391 198.318 3.44391L216.635 43.788C216.635 43.788 157.411 65.6007 118.29 83.3617C79.1691 101.123 19.88 133.115 19.88 133.115L1.56358 92.7714Z" fill="#D9D9D9"/>
              </g>

              {/* Pie chart segments */}
              <g className="pie-chart">
                {pieSegments.map((segment) => {
                  const pieCenterX = 250;
                  const pieCenterY = 250;
                  const pieRadius = 115;
                  const largeArcFlag = segment.segmentAngle > 180 ? 1 : 0;
                  const startX = pieCenterX + pieRadius * Math.cos((segment.startAngle * Math.PI) / 180);
                  const startY = pieCenterY + pieRadius * Math.sin((segment.startAngle * Math.PI) / 180);
                  const endX = pieCenterX + pieRadius * Math.cos((segment.endAngle * Math.PI) / 180);
                  const endY = pieCenterY + pieRadius * Math.sin((segment.endAngle * Math.PI) / 180);
                  
                  return (
                    <path
                      key={segment.shade.code}
                      d={`M ${pieCenterX} ${pieCenterY} L ${startX} ${startY} A ${pieRadius} ${pieRadius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                      fill={segment.color}
                      stroke="#fff"
                      strokeWidth="2"
                    />
                  );
                })}
              </g>

              {/* Labels - positioned inside pie segments */}
              <g className="labels">
                {pieSegments.map((segment) => {
                  const pieCenterX = 250;
                  const pieCenterY = 250;
                  const pieRadius = 115;
                  const angleRad = (segment.centerAngle * Math.PI) / 180;
                  
                  // Position labels at the center of each pie segment
                  // Use a radius that's about 60% of the pie radius to place them inside
                  const labelRadius = pieRadius * 0.6;
                  const labelX = pieCenterX + labelRadius * Math.cos(angleRad);
                  const labelY = pieCenterY + labelRadius * Math.sin(angleRad);
                  
                  return (
                    <text
                      key={`label-${segment.shade.code}`}
                      x={labelX}
                      y={labelY}
                      className="results-page__shade-label"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan className="results-page__shade-code" x={labelX} dy="-6">{segment.shade.code}</tspan>
                      <tspan className="results-page__shade-rank" x={labelX} dy="12">{segment.shade.rank}</tspan>
                    </text>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>
      </div>

      <div className="results-page__right">
        <div className="results-page__image-container">
          <div className="results-page__image-wrap">
            {displayImageUrl ? (
              displayImageUrl.startsWith("blob:") && !frameImageUrl ? (
                <video
                  ref={videoRef}
                  src={displayImageUrl}
                  className="results-page__main-image results-page__main-image--hidden"
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={frameImageUrl || displayImageUrl}
                  alt="Your result with makeup"
                  className="results-page__main-image"
                />
              )
            ) : (
              <div className="results-page__main-image results-page__main-image--placeholder" />
            )}
            <button
              type="button"
              className="results-page__refresh"
              onClick={() => navigate("/")}
              aria-label="Start over"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M1 4v6h6" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </button>
          </div>

          <div className="results-page__swatches-container">
            <p className="results-page__click-switch">
              <svg className="results-page__arrow" viewBox="0 0 46 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.90009 40.7666L0.000269971 35.7742L5.77375 35.7591L2.90009 40.7666ZM2.92661 37.709L2.42678 37.6959C2.44498 37.002 2.47143 36.3208 2.50593 35.652L3.00527 35.6777L3.5046 35.7035C3.47055 36.3637 3.44442 37.0365 3.42644 37.7221L2.92661 37.709ZM3.13545 33.6757L2.637 33.6364C2.69205 32.9385 2.75631 32.2549 2.82953 31.5854L3.32656 31.6397L3.8236 31.6941C3.75151 32.3534 3.68818 33.0269 3.6339 33.715L3.13545 33.6757ZM3.57723 29.6437L3.08223 29.5732C3.18035 28.884 3.28851 28.2107 3.40639 27.5529L3.89855 27.641L4.39071 27.7292C4.275 28.375 4.16872 29.0365 4.07224 29.7141L3.57723 29.6437ZM4.2959 25.6475L3.8076 25.54C3.9568 24.8626 4.11698 24.203 4.28774 23.5605L4.77096 23.689L5.25418 23.8174C5.08719 24.4456 4.93038 25.0914 4.78419 25.7551L4.2959 25.6475ZM5.3349 21.7504L4.8583 21.5993C5.07068 20.9296 5.29542 20.2805 5.53196 19.6511L6 19.827L6.46804 20.0029C6.23778 20.6155 6.01874 21.2482 5.81151 21.9016L5.3349 21.7504ZM6.76596 17.9509L6.30872 17.7486C6.59169 17.1091 6.88789 16.4923 7.19661 15.8973L7.64042 16.1276L8.08423 16.3579C7.78522 16.9341 7.49796 17.5323 7.2232 18.1532L6.76596 17.9509ZM8.63019 14.3654L8.2028 14.1059C8.56586 13.5079 8.94276 12.935 9.33256 12.386L9.74024 12.6754L10.1479 12.9649C9.77213 13.4942 9.40836 14.0472 9.05758 14.6249L8.63019 14.3654ZM10.9727 11.0709L10.5881 10.7514C11.0348 10.2136 11.4952 9.70246 11.968 9.21665L12.3263 9.56537L12.6846 9.91409C12.2301 10.3811 11.7873 10.8728 11.3574 11.3903L10.9727 11.0709ZM13.7957 8.1717L13.4664 7.79541C13.9905 7.33685 14.5268 6.90513 15.074 6.49869L15.3721 6.90007L15.6703 7.30145C15.1442 7.69227 14.6286 8.10727 14.1249 8.54798L13.7957 8.1717ZM17.0442 5.75716L16.7783 5.33373C17.3646 4.96553 17.9607 4.6227 18.5651 4.3035L18.7986 4.74562L19.0321 5.18775C18.4491 5.49568 17.8746 5.82608 17.3101 6.18059L17.0442 5.75716ZM20.6219 3.86425L20.42 3.40678C21.0502 3.1288 21.6871 2.87345 22.3291 2.63891L22.5007 3.10856L22.6723 3.5782C22.0497 3.80561 21.433 4.05288 20.8237 4.32171L20.6219 3.86425ZM24.4232 2.4716L24.2799 1.99256C24.9375 1.79591 25.5987 1.6186 26.2616 1.45872L26.3788 1.94479L26.4961 2.43085C25.8496 2.58675 25.2059 2.75943 24.5664 2.95064L24.4232 2.4716ZM28.3589 1.51855L28.2652 1.0274C28.9384 0.899089 29.6117 0.786673 30.2835 0.688197L30.356 1.18291L30.4286 1.67762C29.7699 1.77417 29.1107 1.88425 28.4525 2.00971L28.3589 1.51855ZM32.3645 0.927733L32.3106 0.430651C32.9928 0.356646 33.6717 0.295157 34.3452 0.244108L34.383 0.742678L34.4208 1.24125C33.7571 1.29155 33.089 1.35208 32.4185 1.42482L32.3645 0.927733ZM36.4064 0.617963L36.3823 0.118547C37.0696 0.0853172 37.7492 0.0610899 38.4189 0.0435536L38.432 0.543382L38.4451 1.04321C37.7817 1.06058 37.1095 1.08455 36.4306 1.11738L36.4064 0.617963ZM40.457 0.508122L40.4522 0.00814526C41.142 0.00151138 41.8184 -0.00023205 42.4785 0.000134045L42.4782 0.50013L42.4779 1.00013C41.8199 0.999772 41.1471 1.00151 40.4618 1.0081L40.457 0.508122ZM44.5102 0.505055L44.5116 0.00505846C44.8521 0.00599682 45.1868 0.00669104 45.5156 0.00669098L45.5156 0.506691L45.5156 1.00669C45.1855 1.00669 44.8497 1.00599 44.5089 1.00505L44.5102 0.505055Z" fill="#12144E" fillOpacity="0.3"/>
              </svg>
              <span>CLICK TO<br />SWITCH</span>
            </p>
            <div className="results-page__swatches">
              {lipstickSwatches.map((swatch, i) => (
                <button
                  key={i}
                  type="button"
                  className={`results-page__swatch ${i === selectedLipstickIndex ? "results-page__swatch--selected" : ""}`}
                  style={{ "--swatch-color": swatch.color }}
                  onClick={() => setSelectedLipstickIndex(i)}
                  aria-label={`Lipstick shade ${i + 1}`}
                  aria-pressed={i === selectedLipstickIndex}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
