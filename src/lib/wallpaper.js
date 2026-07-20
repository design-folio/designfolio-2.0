// Utility functions for wallpaper - DOM manipulation moved to WallpaperBackground component

import { TEMPLATE_IDS } from "./templates";

export const getWallpaperUrl = (value, theme = "light", templateId) => {
  if (typeof value === "string") {
    return value;
  }
  const basePath = theme === "dark" ? "/wallpaper/darkui" : "/wallpaper";
  const isRetroOS = templateId === TEMPLATE_IDS.RETRO_OS;

  // Retro OS default is wall8 — resolve 0/null/undefined to wall8
  if (isRetroOS && (!value || value === 0)) {
    return `${basePath}/wall8.png`;
  }
  // Legacy: value 8 stored in DB for non-Retro OS — treat as no wallpaper
  if (value === 8 && !isRetroOS) {
    return null;
  }

  switch (value) {
    case 1:
      return `${basePath}/wall1.png`;
    case 2:
      return `${basePath}/wall2.png`;
    case 3:
      return `${basePath}/wall3.png`;
    case 4:
      return `${basePath}/wall4.png`;
    case 5:
      return `${basePath}/wall5.png`;
    case 6:
      return `${basePath}/wall6.png`;
    case 7:
      return `${basePath}/wall7.png`;
    case 8:
      return `${basePath}/wall8.png`;
    case 9:
      return `${basePath}/wall9.png`;
    case 10:
      return `${basePath}/wall10.png`;
    default:
      return null;
  }
};

/**
 * Background display mode for a wallpaper.
 * 0 = full-page (fixed, behind everything — default/legacy behavior)
 * 1 = header-only (image band behind the top section, fading into the page bg)
 */
export const BACKGROUND_MODE = { FULL_PAGE: 0, HEADER: 1 };

/**
 * Reads the background mode off a stored wallpaper value.
 * Wallpaper may be a bare number (legacy) or an object { value|key, effects, mode }.
 * Defaults to full-page (0) when absent so existing portfolios render unchanged.
 */
export const extractWallpaperMode = (wallpaper) => {
  if (wallpaper && typeof wallpaper === "object" && wallpaper.mode != null) {
    return wallpaper.mode;
  }
  return BACKGROUND_MODE.FULL_PAGE;
};

export const extractWallpaperValue = (wallpaper) => {
  if (!wallpaper) return undefined;
  return wallpaper && typeof wallpaper === "object" ? wallpaper.url || wallpaper.value : wallpaper;
};

const WALLPAPER_PAYLOAD_FIELDS = ["value", "key", "originalName", "__isNew__", "effects", "color"];

export const pickWallpaperFields = (wallpaper) => {
  const payload = {};
  if (wallpaper && typeof wallpaper === "object") {
    WALLPAPER_PAYLOAD_FIELDS.forEach((field) => {
      if (wallpaper[field] !== undefined) payload[field] = wallpaper[field];
    });
  } else if (wallpaper != null) {
    payload.value = wallpaper;
  }
  return payload;
};

/**
 * Solid background colour presets (stored inside `wallpaper.color`). Each pastel carries a
 * light `color` (the value we persist) and a `darkColor` shown when the portfolio is in dark
 * mode — mirrors the reference PASTELS. A colour background is an alternative to an image
 * wallpaper: picking one clears the image value and vice-versa.
 */
export const BACKGROUND_COLORS = [
  { id: "blush", color: "#FFD6E0", darkColor: "#3D1F2A", label: "Blush" },
  { id: "lavender", color: "#E2D9F3", darkColor: "#2A1F3D", label: "Lavender" },
  { id: "sage", color: "#C8E6C9", darkColor: "#1A2E20", label: "Sage" },
  { id: "sky", color: "#C5E3F7", darkColor: "#1A2A3D", label: "Sky" },
  { id: "peach", color: "#FFE0C8", darkColor: "#3D2A1A", label: "Peach" },
  { id: "butter", color: "#FFF4C2", darkColor: "#2E2A10", label: "Butter" },
  { id: "mint", color: "#C8F0E8", darkColor: "#1A2E2A", label: "Mint" },
  { id: "lilac", color: "#EDD5F0", darkColor: "#2E1F3D", label: "Lilac" },
];

const PASTEL_DARK_COLORS = BACKGROUND_COLORS.reduce((acc, c) => {
  acc[c.color.toUpperCase()] = c.darkColor;
  return acc;
}, {});

/**
 * Reads the solid background colour off a stored wallpaper (object form only). Returns the
 * light hex we persisted, or null when no colour is set (image / none).
 */
export const extractWallpaperColor = (wallpaper) => {
  if (wallpaper && typeof wallpaper === "object" && wallpaper.color) return wallpaper.color;
  return null;
};

/**
 * Resolves the stored (light) background colour to the value shown for the given theme.
 * Known pastels swap to their dark variant in dark mode; custom colours render as-is.
 */
export const resolveBackgroundColor = (color, theme) => {
  if (!color) return null;
  const isDark = theme === "dark" || theme === 1;
  if (!isDark) return color;
  return PASTEL_DARK_COLORS[color.toUpperCase()] ?? color;
};

/** Converts a hex colour ("#RRGGBB" / "#RGB") to an "r,g,b" string for the header glow. */
export const hexToRgbString = (hex) => {
  if (!hex || typeof hex !== "string") return null;
  let h = hex.replace("#", "").trim();
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length !== 6) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return `${r},${g},${b}`;
};

export const hasNoWallpaper = (value, templateId) => {
  const isRetroOS = templateId === TEMPLATE_IDS.RETRO_OS;
  // MacOS default (0) resolves to wall8 — not "no wallpaper"
  if (isRetroOS && (!value || value === 0)) return false;
  return !value || value === 0 || value === null || value === undefined || value === "";
};
