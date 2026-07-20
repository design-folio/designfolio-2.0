import { TEMPLATE_IDS } from "./templates";
import { BACKGROUND_MODE, hasNoWallpaper } from "./wallpaper";

const WALLPAPER_FIELDS = ["value", "key", "originalName", "__isNew__", "effects", "color"];

export const TEMPLATE_DEFAULTS = {
  [TEMPLATE_IDS.RETRO_OS]: {
    theme: 0,
    backgroundMode: BACKGROUND_MODE.FULL_PAGE,
  },
  [TEMPLATE_IDS.MONO]: {
    backgroundMode: BACKGROUND_MODE.HEADER,
    fallbackWallpaperValue: 9,
  },
};

/**
 * Builds the wallpaper payload for a template's forced `backgroundMode` default, preserving
 * any existing wallpaper fields and only substituting `fallbackWallpaperValue` when the user
 * currently has no wallpaper applied. Returns null when the template forces no backgroundMode.
 */
export function buildTemplateWallpaperPayload(templateId, currentWallpaper, basePayload) {
  const defaults = TEMPLATE_DEFAULTS[templateId];
  if (!defaults || defaults.backgroundMode === undefined) return null;

  const wpPayload = { ...(basePayload || {}), mode: defaults.backgroundMode };

  if (wpPayload.value === undefined) {
    if (currentWallpaper && typeof currentWallpaper === "object") {
      WALLPAPER_FIELDS.forEach((field) => {
        if (currentWallpaper[field] !== undefined) wpPayload[field] = currentWallpaper[field];
      });
    } else if (currentWallpaper != null) {
      wpPayload.value = currentWallpaper;
    }
  }

  if (
    defaults.fallbackWallpaperValue !== undefined &&
    hasNoWallpaper(wpPayload.value, templateId)
  ) {
    wpPayload.value = defaults.fallbackWallpaperValue;
  }

  return wpPayload;
}
