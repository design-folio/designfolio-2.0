/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        satoshi: ["var(--font-satoshi)", "sans-serif"],
        sfpro: ["var(--font-sfpro)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        "landing-bg": "var(--landing-bg)",
        "heading-text": "var(--heading-text)",
        "sub-heading-text-color": "var(--sub-heading-text-color)",
        "description-text": "var(--description-text)",
        "description-sub-text-color": "var(--description-sub-text-color)",
        "df-bg": "var(--df-bg)",
        "logo-text-color": "var(--logo-text-color)",
        "header-bg-color": "var(--header-bg-color)",
        "icon-color": "var(--icon-color)",
        "base-text": "var(--base-text)",
        "placeholder-color": "var( --placeholder-color)",
        "nav-link": "var(--nav-link)",
        "nav-link-hover": "var(--nav-link-hover)",
        "nav-link-bg-hover": "var(--nav-link-bg-hover)",
        "nav-link-base": "var(--nav-link-base)",
        "popover-bg": "var(--popover-bg)",
        "popover-border": "var(--popover-border)",
        "primary-btn-bg": "var(--primary-btn-bg)",
        "primary-btn-text": "var(--primary-btn-text)",
        "primary-btn-bg-hover": "var(--primary-btn-bg-hover)",
        "primary-btn-text-hover": "var(--primary-btn-text-hover)",
        "secondary-btn-bg": "var(--secondary-btn-bg)",
        "secondary-btn-text": "var(--secondary-btn-text)",
        "secondary-btn-bg-hover": "var(--secondary-btn-bg-hover)",
        "secondary-btn-text-hover": "var(--secondary-btn-text-hover)",
        "secondary-btn-border": "var(--secondary-btn-border)",
        "secondary-btn-border-hover": "var(--secondary-btn-border-hover)",
        "tertiary-btn-bg": "var(--tertiary-btn-bg)",
        "tertiary-btn-text": "var(--tertiary-btn-text)",
        "tertiary-btn-bg-hover": "var(--tertiary-btn-bg-hover)",
        "tertiary-btn-text-hover": "var(--tertiary-btn-text-hover)",
        "tertiary-btn-border": "var(--tertiary-btn-border)",
        "tertiary-btn-border-hover": "var(--tertiary-btn-border-hover)",
        "normal-btn-text": "var(--normal-btn-text)",
        "normal-btn-bg-hover": "var(--normal-btn-bg-hover)",
        "delete-btn-bg": "var(--delete-btn-bg)",
        "delete-btn-bg-hover": "var(--delete-btn-bg-hover)",
        "delete-btn-icon": "var(--delete-btn-icon)",
        "delete-btn-border": "var(--delete-btn-border)",
        "delete-btn-border-hover": "var(--delete-btn-border-hover)",
        "landing-card-border": "var(--landing-card-border)",
        "landing-card-background": "var(--landing-card-background)",
        "landing-card-heading": "var(--landing-card-heading)",
        "landing-card-description": "var(--landing-card-description)",
        "section-card-bg": "var(--section-card-bg)",
        "builder-section-card-heading-text":
          "var(--builder-section-card-heading-text)",
        "profile-card-intro-text": "var(--profile-card-intro-text)",
        "profile-card-description-text": "var(--profile-card-description-text)",
        "profile-card-skills-text": "var(--profile-card-skills-text)",
        "project-card-bg": "var(--project-card-bg)",
        "project-card-title": "var(--project-card-title)",
        "project-description": "var(--project-description)",
        "project-card-border": "var(--project-card-border)",
        "add-card-bg": "var(--add-card-bg)",
        "add-card-border": "var(--add-card-border)",
        "add-card-title": "var(--add-card-title)",
        "add-card-description": "var(--add-card-description)",
        "tools-card-item-border": "var(--tools-card-item-border)",
        "tools-card-item-text": "var(--tools-card-item-text)",
        "input-button-color": "var(--input-button-color)",
        "input-success-color": "var( --input-success-color)",
        "input-error-color": "var( --input-error-color)",
        "theme-bg-color": "var(--theme-bg-color)",
        "theme-border-color": "var( --theme-border-color)",
        "popover-heading-color": "var(--popover-heading-color)",
        "default-theme-box-bg-color": "var(--default-theme-box-bg-color)",
        "default-theme-box-border-color":
          "var(--default-theme-box-border-color)",
        "default-theme-selected-color": "var(--default-theme-selected-color)",
        "default-theme-bg-hover-color": "var(--default-theme-bg-hover-color)",
        "theme-box-bg-color": "var(--theme-box-bg-color)",
        "theme-box-border-color": "var(--theme-box-border-color)",
        "theme-selected-color": "var(--theme-selected-color)",
        "theme-bg-hover-color": "var(--theme-bg-hover-color)",
      },
      boxShadow: {
        "secondary-btn-shadow": "var(--secondary-btn-shadow)", // Use the CSS variable here
        "delete-btn-hover": "var(--delete-btn-shadow)",
        "popover-shadow": "var(--popover-shadow)",
        "card-shadow": "var(--card-shadow)",
        "input-error-shadow": "var(--input-error-shadow)",
        "header-shadow": "var(--header-shadow)",
      },
      fontSize: {
        h1: "61px",
        h2: "49px",
        h3: "39px",
        "p-large": "31px",
        "p-medium": "25px",
        "p-small": "20px",
        "p-xsmall": "16px",
        "p-xxsmall": "14px",
      },
      lineHeight: {
        h1: "79.3px",
        h2: "63.7px",
        h3: "50.7px",
        "p-large": "40.3px",
        "p-medium": "32.5px",
        "p-small": "26px",
        "p-xsmall": "22.8px",
        "p-xxsmall": "20.2px",
      },
      translate: {
        4.5: "4.5px", // Custom translate value
        3.2: "3.2px",
        2.5: "2.5px",
      },
    },
  },
  variants: {
    extend: {
      boxShadow: ["hover"],
      transitionProperty: ["hover"],
      transitionDuration: ["hover"],
      transitionTimingFunction: ["hover"],
    },
  },
  plugins: [],
};
