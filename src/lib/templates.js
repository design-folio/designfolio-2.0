
export const TEMPLATE_IDS = {
  CANVAS: 0,
  CHATFOLIO: 1,
  SPOTLIGHT: 2,
  MONO: 3,
  RETRO_OS: 4,
};


export const TEMPLATES_BY_ID = {
  [TEMPLATE_IDS.CANVAS]: {
    id: TEMPLATE_IDS.CANVAS,
    value: "canvas",
    item: "Canvas",
    isNew: false,
  },
  [TEMPLATE_IDS.CHATFOLIO]: {
    id: TEMPLATE_IDS.CHATFOLIO,
    value: "chatfolio",
    item: "Chatfolio",
    isNew: false,
  },
  [TEMPLATE_IDS.SPOTLIGHT]: {
    id: TEMPLATE_IDS.SPOTLIGHT,
    value: "spotlight",
    item: "Spotlight",
    isNew: false,
  },
  [TEMPLATE_IDS.MONO]: {
    id: TEMPLATE_IDS.MONO,
    value: "mono",
    item: "Mono",
    isNew: false,
  },
  [TEMPLATE_IDS.RETRO_OS]: {
    id: TEMPLATE_IDS.RETRO_OS,
    value: "retro-os",
    item: "Retro OS",
    isNew: true,
  },
};


export const TEMPLATE_DISPLAY_ORDER = [
  TEMPLATE_IDS.CANVAS,  // 0 – 1st
  TEMPLATE_IDS.RETRO_OS,    // 4 – 2nd
  TEMPLATE_IDS.CHATFOLIO,     // 1
  TEMPLATE_IDS.SPOTLIGHT,    // 2
  TEMPLATE_IDS.MONO, // 3
];

/** Templates array in display order, for use in ThemePanel / dropdowns */
export const TEMPLATES_LIST = TEMPLATE_DISPLAY_ORDER.map((id) => TEMPLATES_BY_ID[id]);

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

export function getTemplatePreviewImage(templateId = TEMPLATE_IDS.CANVAS, theme = "light") {
  const entry = TEMPLATE_PREVIEW_IMAGES[templateId] ?? TEMPLATE_PREVIEW_IMAGES[TEMPLATE_IDS.CANVAS];
  if (typeof entry === "string") return entry;
  return entry[theme] ?? entry.light;
}
