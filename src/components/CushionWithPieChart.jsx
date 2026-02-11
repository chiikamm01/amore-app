import { useEffect, useRef } from "react";
import lottie from "lottie-web";
import cushionAnimation from "../assets/cushion.json";
import "./CushionWithPieChart.css";

function polarToCartesian(cx, cy, r, a) {
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function makePiePaths(shades, cx, cy, r) {
  const total = shades.reduce((sum, s) => sum + s.percentage, 0);
  const values = total > 0 ? shades.map((s) => s.percentage / total) : shades.map(() => 1 / shades.length);
  let start = -Math.PI / 2; // Start at top (12 o'clock)

  return values.map((v, i) => {
    const end = start + v * Math.PI * 2;
    const [x1, y1] = polarToCartesian(cx, cy, r, start);
    const [x2, y2] = polarToCartesian(cx, cy, r, end);
    const largeArc = end - start > Math.PI ? 1 : 0;

    const d = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");

    const slice = { d, fill: shades[i].color, centerAngle: (start + end) / 2, shade: shades[i] };
    start = end;
    return slice;
  });
}

function injectPieChart(anim, foundationShades) {
  if (!anim || !anim.renderer) return false;

  const layerEl = anim.renderer.getElementByPath(["Ellipse 19"]);
  if (!layerEl || !layerEl.layerElement) return false;

  // Clear existing children (grey shapes)
  while (layerEl.layerElement.firstChild) {
    layerEl.layerElement.removeChild(layerEl.layerElement.firstChild);
  }

  // Lottie layer coord space: Ellipse 19 has anchor ~82.59, 82.59
  const cx = 82.59;
  const cy = 82.59;
  const r = 78;

  const slices = makePiePaths(foundationShades, cx, cy, r);
  const svgNS = "http://www.w3.org/2000/svg";

  slices.forEach(({ d, fill, centerAngle, shade }) => {
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", fill);
    path.setAttribute("stroke", "#fff");
    path.setAttribute("stroke-width", "2");
    layerEl.layerElement.appendChild(path);

    // Add label in center of segment
    const labelR = r * 0.55;
    const lx = cx + labelR * Math.cos(centerAngle);
    const ly = cy + labelR * Math.sin(centerAngle);

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", lx);
    text.setAttribute("y", ly);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("fill", "white");
    text.setAttribute("font-size", "12");
    text.setAttribute("font-weight", "700");

    const tspan1 = document.createElementNS(svgNS, "tspan");
    tspan1.setAttribute("x", lx);
    tspan1.setAttribute("dy", "-5");
    tspan1.textContent = shade.code;

    const tspan2 = document.createElementNS(svgNS, "tspan");
    tspan2.setAttribute("x", lx);
    tspan2.setAttribute("dy", "12");
    tspan2.setAttribute("font-size", "8");
    tspan2.setAttribute("font-weight", "400");
    tspan2.textContent = shade.rank;

    text.appendChild(tspan1);
    text.appendChild(tspan2);
    layerEl.layerElement.appendChild(text);
  });

  // Hide overlapping highlight layers
  ["Ellipse 20", "Ellipse 21"].forEach((layerName) => {
    const el = anim.renderer.getElementByPath([layerName]);
    if (el?.layerElement) {
      el.layerElement.style.display = "none";
    }
  });

  return true;
}

export function CushionWithPieChart({ foundationShades }) {
  const containerRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !foundationShades?.length) return;

    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: false,
      autoplay: true,
      animationData: JSON.parse(JSON.stringify(cushionAnimation)),
    });

    animRef.current = anim;

    const onDOMLoaded = () => {
      injectPieChart(anim, foundationShades);
    };

    if (anim.isLoaded) {
      onDOMLoaded();
    } else {
      anim.addEventListener("DOMLoaded", onDOMLoaded);
    }

    return () => {
      anim.removeEventListener("DOMLoaded", onDOMLoaded);
      anim.destroy();
      animRef.current = null;
    };
  }, [foundationShades]);

  return <div ref={containerRef} className="cushion-with-pie" aria-hidden="true" />;
}
