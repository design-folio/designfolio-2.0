export const TEMPLATE_IDS = {
  CANVAS: 0,
  CHATFOLIO: 1,
  SPOTLIGHT: 2,
  MONO: 3,
  RETRO_OS: 4,
  PROFESSIONAL: 5,
};

export const TEMPLATES_BY_ID = {
  [TEMPLATE_IDS.CANVAS]: {
    id: TEMPLATE_IDS.CANVAS,
    value: "canvas",
    item: "Canvas",
    isNew: false,
    isPro: false,
  },
  [TEMPLATE_IDS.CHATFOLIO]: {
    id: TEMPLATE_IDS.CHATFOLIO,
    value: "chatfolio",
    item: "Chatfolio",
    isNew: false,
    isPro: false,
  },
  [TEMPLATE_IDS.SPOTLIGHT]: {
    id: TEMPLATE_IDS.SPOTLIGHT,
    value: "spotlight",
    item: "Spotlight",
    isNew: false,
    isPro: false,
  },
  [TEMPLATE_IDS.MONO]: {
    id: TEMPLATE_IDS.MONO,
    value: "mono",
    item: "Mono",
    isNew: false,
    isPro: false,
  },
  [TEMPLATE_IDS.RETRO_OS]: {
    id: TEMPLATE_IDS.RETRO_OS,
    value: "retro-os",
    item: "Retro OS",
    isNew: false,
    isPro: true,
  },
  [TEMPLATE_IDS.PROFESSIONAL]: {
    id: TEMPLATE_IDS.PROFESSIONAL,
    value: "professional",
    item: "Gridline", //Professional
    isNew: true,
    isPro: false,
  },
};

export const TEMPLATE_DISPLAY_ORDER = [
  TEMPLATE_IDS.CANVAS, // 0 – 1st
  TEMPLATE_IDS.MONO, // 3
  TEMPLATE_IDS.PROFESSIONAL, // 5 – last
  TEMPLATE_IDS.RETRO_OS, // 4 – 2nd
  TEMPLATE_IDS.CHATFOLIO, // 1
  TEMPLATE_IDS.SPOTLIGHT, // 2
];

/** Templates array in display order, for use in ThemePanel / dropdowns */
export const TEMPLATES_LIST = TEMPLATE_DISPLAY_ORDER.map(
  (id) => TEMPLATES_BY_ID[id],
);

export const TEMPLATE_PREVIEW_IMAGES = {
  [TEMPLATE_IDS.CANVAS]: {
    light: "/assets/png/template-thumbnails/canvas.png",
    dark: "/assets/png/template-thumbnails/canvas-dark.png",
  },
  [TEMPLATE_IDS.CHATFOLIO]: {
    light: "/assets/png/template-thumbnails/chatfolio.png",
    dark: "/assets/png/template-thumbnails/chatfolio-dark.png",
  },
  [TEMPLATE_IDS.SPOTLIGHT]: {
    light: "/assets/png/template-thumbnails/spotlight.png",
    dark: "/assets/png/template-thumbnails/spotlight-dark.png",
  },
  [TEMPLATE_IDS.MONO]: {
    light: "/assets/png/template-thumbnails/mono.png",
    dark: "/assets/png/template-thumbnails/mono-dark.png",
  },
  [TEMPLATE_IDS.RETRO_OS]: "/assets/png/template-thumbnails/retro-os.png",
};

export function getTemplatePreviewImage(
  templateId = TEMPLATE_IDS.CANVAS,
  theme = "light",
) {
  const entry =
    TEMPLATE_PREVIEW_IMAGES[templateId] ??
    TEMPLATE_PREVIEW_IMAGES[TEMPLATE_IDS.CANVAS];
  if (typeof entry === "string") return entry;
  return entry[theme] ?? entry.light;
}
