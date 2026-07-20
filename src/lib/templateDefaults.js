import { TEMPLATE_IDS } from "./templates";
import { BACKGROUND_MODE, hasNoWallpaper, pickWallpaperFields } from "./wallpaper";

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

export function buildTemplateWallpaperPayload(templateId, currentWallpaper, basePayload) {
  const defaults = TEMPLATE_DEFAULTS[templateId];
  if (!defaults || defaults.backgroundMode === undefined) return null;

  const wpPayload = { ...(basePayload || {}), mode: defaults.backgroundMode };

  if (wpPayload.value === undefined) {
    Object.assign(wpPayload, pickWallpaperFields(currentWallpaper));
  }

  if (
    defaults.fallbackWallpaperValue !== undefined &&
    hasNoWallpaper(wpPayload.value, templateId)
  ) {
    wpPayload.value = defaults.fallbackWallpaperValue;
  }

  return wpPayload;
}
