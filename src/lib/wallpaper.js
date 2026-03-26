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
        default:
            return null;
    }
};

export const extractWallpaperValue = (wallpaper) => {
    if (!wallpaper) return undefined;
    return (wallpaper && typeof wallpaper === 'object')
        ? (wallpaper.url || wallpaper.value)
        : wallpaper;
};

export const hasNoWallpaper = (value, templateId) => {
    const isRetroOS = templateId === TEMPLATE_IDS.RETRO_OS;
    // MacOS default (0) resolves to wall8 — not "no wallpaper"
    if (isRetroOS && (!value || value === 0)) return false;
    return !value || value === 0 || value === null || value === undefined || value === "";
};
