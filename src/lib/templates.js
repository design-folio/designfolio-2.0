
export const TEMPLATE_IDS = {
  DEFAULT: 0,
  CHAT: 1,
  PRISM: 2,
  PRISTINE: 3,
  MACOS: 4,
};


export const TEMPLATES_BY_ID = {
  [TEMPLATE_IDS.DEFAULT]: {
    id: TEMPLATE_IDS.DEFAULT,
    value: "default",
    item: "Default",
    isNew: false,
  },
  [TEMPLATE_IDS.CHAT]: {
    id: TEMPLATE_IDS.CHAT,
    value: "chat",
    item: "Chat Box",
    isNew: false,
  },
  [TEMPLATE_IDS.PRISM]: {
    id: TEMPLATE_IDS.PRISM,
    value: "prism",
    item: "Prism",
    isNew: true,
  },
  [TEMPLATE_IDS.PRISTINE]: {
    id: TEMPLATE_IDS.PRISTINE,
    value: "pristine",
    item: "Pristine",
    isNew: true,
  },
  [TEMPLATE_IDS.MACOS]: {
    id: TEMPLATE_IDS.MACOS,
    value: "macos",
    item: "MacOS",
    isNew: true,
  },
};


export const TEMPLATE_DISPLAY_ORDER = [
  TEMPLATE_IDS.DEFAULT,  // 0 – 1st
  TEMPLATE_IDS.MACOS,    // 4 – 2nd
  TEMPLATE_IDS.CHAT,     // 1
  TEMPLATE_IDS.PRISM,    // 2
  TEMPLATE_IDS.PRISTINE, // 3
];

/** Templates array in display order, for use in ThemePanel / dropdowns */
export const TEMPLATES_LIST = TEMPLATE_DISPLAY_ORDER.map((id) => TEMPLATES_BY_ID[id]);

export const TEMPLATE_PREVIEW_IMAGES = {
  [TEMPLATE_IDS.DEFAULT]: {
    light: "/assets/png/white-default-theme.png",
    dark: "/assets/png/dark-default-theme.png",
  },
  [TEMPLATE_IDS.CHAT]: {
    light: "/assets/png/white-chat-box-theme.png",
    dark: "/assets/png/dark-chat-box-theme.png",
  },
  [TEMPLATE_IDS.PRISM]: {
    light: "/assets/png/prism-light.png",
    dark: "/assets/png/prism-dark.png",
  },
  [TEMPLATE_IDS.PRISTINE]: {
    light: "/assets/png/pristine-light.png",
    dark: "/assets/png/pristine-dark.png",
  },
  [TEMPLATE_IDS.MACOS]: "/assets/png/macos-theme.png",
};

export function getTemplatePreviewImage(templateId = TEMPLATE_IDS.DEFAULT, theme = "light") {
  const entry = TEMPLATE_PREVIEW_IMAGES[templateId] ?? TEMPLATE_PREVIEW_IMAGES[TEMPLATE_IDS.DEFAULT];
  if (typeof entry === "string") return entry;
  return entry[theme] ?? entry.light;
}
