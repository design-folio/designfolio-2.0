import { useState, useEffect } from "react";

// Extracts the dominant colour ("r,g,b") from the bottom band of an image, where
// landscape/wallpaper colours usually sit. Used to tint the header-mode bottom glow.
function extractDominantColor(img) {
  try {
    const canvas = document.createElement("canvas");
    const size = 80;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "150,150,150";

    // Sample the bottom 45% of the image
    ctx.drawImage(
      img,
      0,
      Math.floor(img.naturalHeight * 0.55),
      img.naturalWidth,
      Math.floor(img.naturalHeight * 0.45),
      0,
      0,
      size,
      size
    );

    const data = ctx.getImageData(0, 0, size, size).data;
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;

    for (let i = 0; i < data.length; i += 16) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }

    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);

    // Slightly boost the dominant channel for a more saturated glow
    const max = Math.max(r, g, b);
    const boost = 1.2;
    r = Math.min(255, Math.round(r * (max === r ? boost : 1)));
    g = Math.min(255, Math.round(g * (max === g ? boost : 1)));
    b = Math.min(255, Math.round(b * (max === b ? boost : 1)));

    return `${r},${g},${b}`;
  } catch {
    return "150,150,150";
  }
}

/**
 * Returns the dominant colour of an image as an "r,g,b" string (or null while loading /
 * when no src). Same-origin images only — no crossOrigin so the canvas isn't tainted.
 */
export function useImageColor(src) {
  const [color, setColor] = useState(null);

  useEffect(() => {
    let cancelled = false;

    if (!src) {
      const resetId = window.setTimeout(() => {
        if (!cancelled) setColor(null);
      }, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(resetId);
      };
    }

    const resetId = window.setTimeout(() => {
      if (!cancelled) setColor(null);
    }, 0);

    const img = new Image();
    img.onload = () => {
      if (!cancelled) setColor(extractDominantColor(img));
    };
    img.onerror = () => {
      if (!cancelled) setColor("150,150,150");
    };
    img.src = src;

    return () => {
      cancelled = true;
      window.clearTimeout(resetId);
    };
  }, [src]);

  return color;
}
