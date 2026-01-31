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
};

/** Sidebars that cause header/card layout to shift on desktop (used by loggedInHeader and CourseCard) */
export const SIDEBARS_THAT_SHIFT = [
  sidebars.theme,
  sidebars.review,
  sidebars.work,
  sidebars.footer,
  sidebars.about,
];

export const isSidebarThatShifts = (activeSidebar) =>
  SIDEBARS_THAT_SHIFT.includes(activeSidebar);

/** Shift width (px) per sidebar for header/card layout (used by loggedInHeader and CourseCard) */
export const SIDEBAR_SHIFT_WIDTHS = {
  [sidebars.work]: "500px",
  [sidebars.review]: "500px",
  [sidebars.theme]: "320px",
  [sidebars.footer]: "320px",
  [sidebars.about]: "320px",
};

export const getSidebarShiftWidth = (activeSidebar) =>
  SIDEBAR_SHIFT_WIDTHS[activeSidebar] ?? "0";

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


export const DEFAULT_SECTION_ORDER = ['projects', 'reviews', 'tools', 'about', 'works',];