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
