export const popovers = {
  landingMenu: "landing-menu",
  publishMenu: "publish-menu",
  themeMenu: "theme-menu",
  userMenu: "user-menu",
  loggedInMenu: "loggedin-menu",
  password: "password",
  task: "task",
};

export const modals = {
  onboarding: "onboarding",
  onBoardingNewUser: "onboardingNewUser",
  about: "about",
  project: "project",
  deleteProject: "delete-project",
  review: "review",
  tools: "tools",
  work: "works",
  resume: "resume",
  socialMedia: "social-media",
  portfolioLinks: "portfolio-links",
  aiProject: "aiProject",
  username: "username",
};

export const sidebars = {
  theme: "theme",
  work: "work",
  review: "review",
  footer: "footer",
  about: "about",
  tools: "tools",
  project: "project",
  sortProjects: "sortProjects",
  sortReviews: "sortReviews",
  sortWorks: "sortWorks",
  profile: "profile",
  skills: "skills",
  persona: "persona",
};

/** Canonical list of sidebar ids used across the app */
export const ALL_SIDEBARS = Object.values(sidebars);

/** Sidebars that cause header/card layout to shift on desktop (used by loggedInHeader and CourseCard) */
export const SIDEBARS_THAT_SHIFT = [...ALL_SIDEBARS];

export const isSidebarThatShifts = (activeSidebar) => SIDEBARS_THAT_SHIFT.includes(activeSidebar);

/** Shift width (px) per sidebar for header/card layout (used by loggedInHeader and CourseCard) */
export const SIDEBAR_SHIFT_WIDTHS = {
  [sidebars.work]: "500px",
  [sidebars.review]: "500px",
  [sidebars.project]: "500px",
  [sidebars.theme]: "400px",
  [sidebars.footer]: "320px",
  [sidebars.about]: "320px",
  [sidebars.tools]: "400px",
  [sidebars.sortProjects]: "400px",
  [sidebars.sortReviews]: "400px",
  [sidebars.sortWorks]: "400px",
  [sidebars.profile]: "400px",
  [sidebars.skills]: "400px",
  [sidebars.persona]: "400px",
};

export const getSidebarShiftWidth = (activeSidebar) =>
  SIDEBAR_SHIFT_WIDTHS[activeSidebar] ?? "400px";

// Ensure sectionOrder always contains all available sections (e.g. after adding new blocks)
export const normalizeSectionOrder = (rawOrder, availableSections = DEFAULT_SECTION_ORDER) => {
  if (!Array.isArray(availableSections) || availableSections.length === 0) return [];

  if (!Array.isArray(rawOrder) || rawOrder.length === 0) {
    return [...availableSections];
  }

  // Keep only known sections, preserve user ordering
  const filtered = rawOrder.filter((id) => availableSections.includes(id));
  // Append any newly-added sections the user doesn't have yet
  const missing = availableSections.filter((id) => !filtered.includes(id));

  return [...filtered, ...missing];
};

export function hasSubdomain() {
  let hostname = window.location.hostname;
  hostname = hostname.split(":")[0];

  // Check if the hostname is 'localhost'
  if (hostname === "localhost") {
    return false;
  }

  // Split the hostname into parts
  const parts = hostname.split(".");

  // Conditions for not having a subdomain:
  // 1. There are only two parts (example.com)
  // 2. There are two parts and the first is 'www' (www.example.com)
  if (parts.length === 2 || (parts.length === 3 && parts[0] === "www")) {
    return false;
  }

  // If none of the above conditions are met, there is a subdomain
  return true;
}

export const moveItemInArray = (array, from, to) => {
  if (to >= array.length) {
    let k = to - array.length + 1;
    while (k--) {
      array.push(undefined);
    }
  }
  array.splice(to, 0, array.splice(from, 1)[0]);
  return array; // This is optional if you're mutating the array directly
};

export const chatBubbleItems = {
  name: "name",
  bio: "bio",
  skillQuestion: "skill-question",
  skills: "skills",
  tools: "tools",
  projectQuestion: "project-question",
  projectChat: "project-chat",
  projects: "projects",
  workExperience: "work-experience",
  experience: "experience",
  otherPortfolioQuestion: "other-portfolio-question",
  otherPortfolios: "other-portfolios",
  socialMediaQuestion: "social-media-question",
  socialMedia: "social-media",
  scrollUp: "scroll-up",
};

export const DEFAULT_SECTION_ORDER = ["projects", "reviews", "tools", "about", "works"];

// ─── Container width (user-adjustable content max-width) ───────────────────────
// Stored on user.containerWidth as a px number; null = use the template default.
// Presets shown in the editor toolbar + Background tab; free drag clamps to [min, max].
export const CONTAINER_WIDTH_PRESETS = [640, 880, 1024, 1200, 1440];
export const CONTAINER_WIDTH_MIN = 640;
export const CONTAINER_WIDTH_MAX = 1440;

// Per-template width config. `default` mirrors each template's current hard-coded
// max-w-[…]; `max` is the largest the user can drag to (the toolbar's "max"). RetroOS is
// intentionally absent — its layout is a full-screen desktop, so width is not adjustable.
export const TEMPLATE_CONTAINER_WIDTHS = {
  0: { default: 848, min: CONTAINER_WIDTH_MIN, max: CONTAINER_WIDTH_MAX }, // Canvas
  1: { default: 700, min: CONTAINER_WIDTH_MIN, max: CONTAINER_WIDTH_MAX }, // Chatfolio
  2: { default: 848, min: CONTAINER_WIDTH_MIN, max: CONTAINER_WIDTH_MAX }, // Spotlight
  3: { default: 848, min: CONTAINER_WIDTH_MIN, max: CONTAINER_WIDTH_MAX }, // Mono
  5: { default: 700, min: CONTAINER_WIDTH_MIN, max: CONTAINER_WIDTH_MAX }, // Professional
};

// Resolve the effective content max-width (px) for a template given the stored value.
// Falls back to the template default when unset, then clamps to the template range.
export function resolveContainerWidth(templateId, storedWidth) {
  const cfg = TEMPLATE_CONTAINER_WIDTHS[templateId];
  if (!cfg) return null; // template has no width setting (e.g. RetroOS)
  if (storedWidth == null) return cfg.default;
  return Math.min(cfg.max, Math.max(cfg.min, storedWidth));
}

/**
 * Floating nav sections (Minimal/Portfolio template).
 * sectionId is the DOM id used in Minimal.jsx / Portfolio.jsx (section-* matches DEFAULT_SECTION_ORDER keys).
 */
export const FLOATING_NAV_SECTIONS = [
  { navId: "hero", sectionId: "hero", label: "Home" },
  { navId: "spotlight", sectionId: "section-projects", label: "Projects" },
  { navId: "tools", sectionId: "section-tools", label: "Tools" },
  { navId: "work", sectionId: "section-works", label: "Work" },
];

// ─── Project meta fields ──────────────────────────────────────────────────────
// Fixed order: index 0=client, 1=industry, 2=role, 3=platform.
// Each project stores these as metaFields: [{ label, value }, ...].
// The label is user-customisable; the value is the actual content.
export const DEFAULT_META_FIELDS = [
  { index: 0, defaultLabel: "Client" },
  { index: 1, defaultLabel: "Industry" },
  { index: 2, defaultLabel: "Role" },
  { index: 3, defaultLabel: "Platform" },
];

// Returns the display label for position i, falling back to the hardcoded default.
export function getMetaLabel(project, i) {
  const label = project?.metaFields?.[i]?.label;
  return label && label.trim() ? label.trim() : (DEFAULT_META_FIELDS[i]?.defaultLabel ?? "");
}

// Returns the value at position i.
export function getMetaValue(project, i) {
  return project?.metaFields?.[i]?.value ?? "";
}

// Builds a full metaFields array from a project, guaranteeing 4 entries with defaults.
export function resolveMetaFields(project) {
  return DEFAULT_META_FIELDS.map(({ defaultLabel }, i) => ({
    label: getMetaLabel(project, i) || defaultLabel,
    value: getMetaValue(project, i),
  }));
}
