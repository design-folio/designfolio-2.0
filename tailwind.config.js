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
        inter: ["var(--font-inter)"],
      },
      colors: {
        "landing-bg-color": "var(--landing-bg-color)",
        "landing-header-bg-color": "var(--landing-header-bg-color)",
        "landng-header-border-color": "var(--landng-header-border-color)",
        "landing-nav-link-color": "var(--landing-nav-link-color)",
        "landing-nav-link-hover-color": "var(--landing-nav-link-hover-color)",
        "landing-nav-link-bg-hover-color":
          "var(--landing-nav-link-bg-hover-color)",
        "landing-nav-link-base-color": "var(--landing-nav-link-base-color)",
        "landing-heading-text-color": "var(--landing-heading-text-color)",
        "landing-description-text-color":
          "var(--landing-description-text-color)",
        "landing-card-bg-color": "var(--landing-card-bg-color)",
        "landing-card-border-color": "var(--landing-card-border-color)",
        "landing-card-step-text-color": "var(--landing-card-step-text-color)",
        "landing-card-step-bg-color": "var(--landing-card-step-bg-color)",
        "landing-card-step-border-color":
          "var(--landing-card-step-border-color)",
        "landing-card-heading-color": "var(--landing-card-heading-color)",
        "landing-card-description-color":
          "var(--landing-card-description-color)",
        "landing-footer-heading-color": "var(--landing-footer-heading-color)",
        "landing-footer-link-color": "var(--landing-footer-link-color)",

        // Buttons
        "primary-btn-bg-color": "var(--primary-btn-bg-color)",
        "primary-btn-text-color": "var(--primary-btn-text-color)",
        "primary-btn-bg-hover-color": "var(--primary-btn-bg-hover-color)",
        "primary-btn-text-hover-color": "var(--primary-btn-text-hover-color)",

        "secondary-btn-bg-color": "var(--secondary-btn-bg-color)",
        "secondary-btn-text-color": "var(--secondary-btn-text-color)",
        "secondary-btn-bg-hover-color": "var(--secondary-btn-bg-hover-color)",
        "secondary-btn-text-hover-color":
          "var(--secondary-btn-text-hover-color)",
        "secondary-btn-border-color": "var(--secondary-btn-border-color)",
        "secondary-btn-border-hover-color":
          "var(--secondary-btn-border-hover-color)",
        "secondary-btn-shadow": "var(--secondary-btn-shadow)",

        "tertiary-btn-bg-color": "var(--tertiary-btn-bg-color)",
        "tertiary-btn-text-color": "var(--tertiary-btn-text-color)",
        "tertiary-btn-bg-hover-color": "var(--tertiary-btn-bg-hover-color)",
        "tertiary-btn-text-hover-color": "var(--tertiary-btn-text-hover-color)",
        "tertiary-btn-border-color": "var(--tertiary-btn-border-color)",
        "tertiary-btn-border-hover-color":
          "var(--tertiary-btn-border-hover-color)",

        "normal-btn-text-color": "var(--normal-btn-text-color)",
        "normal-btn-bg-hover-color": "var(--normal-btn-bg-hover-color)",

        "modal-btn-text-color": "var(--modal-btn-text-color)",
        "modal-btn-bg-color": "var(--modal-btn-bg-color)",
        "modal-btn-border-color": "var(--modal-btn-border-color)",
        "modal-btn-bg-hover-color": "var(--modal-btn-bg-hover-color)",
        "modal-btn-border-hover-color": "var(--modal-btn-border-hover-color)",

        "delete-btn-bg-color": "var(--delete-btn-bg-color)",
        "delete-btn-bg-hover-color": "var(--delete-btn-bg-hover-color)",
        "delete-btn-icon-color": "var(--delete-btn-icon-color)",
        "delete-btn-border-color": "var(--delete-btn-border-color)",
        "delete-btn-border-hover-color": "var(--delete-btn-border-hover-color)",
        "delete-btn-shadow-color": "var(--delete-btn-shadow-color)",

        "ai-btn-text-color": "var(--ai-btn-text-color)",
        "ai-btn-bg-color": "var(--ai-btn-bg-color)",
        "ai-btn-border-color": "var(--ai-btn-border-color)",

        "radio-btn-bg-color": "var(--radio-btn-bg-color)",
        "radio-btn-border-color": "var(--radio-btn-border-color)",
        "radio-btn-text-color": "var(--radio-btn-text-color)",
        "radio-btn-bg-hover-color": "var(--radio-btn-bg-hover-color)",
        "radio-btn-bg-selected-color": "var(--radio-btn-bg-selected-color)",
        "radio-btn-selected-fill-color": "var(--radio-btn-selected-fill-color)",
        "radio-btn-selected-stroke-color":
          "var(--radio-btn-selected-stroke-color)",

        // Application
        "df-bg-color": "var(--df-bg-color)",
        "df-base-text-color": "var(--df-base-text-color)",
        "df-orange-color": "var(--df-orange-color)",
        "df-secondary-text-color": "var(--df-secondary-text-color)",
        "df-placeholder-color": "var(--df-placeholder-color)",
        "df-logo-text-color": "var(--df-logo-text-color)",
        "df-header-bg-color": "var(--df-header-bg-color)",
        "df-icon-color": "var(--df-icon-color)",
        "df-section-card-bg-color": "var(--df-section-card-bg-color)",
        "df-section-card-heading-color": "var(--df-section-card-heading-color)",
        "df-add-card-bg-color": "var(--df-add-card-bg-color)",
        "df-add-card-border-color": "var(--df-add-card-border-color)",
        "df-add-card-heading-color": "var(--df-add-card-heading-color)",
        "df-add-card-description-color": "var(--df-add-card-description-color)",
        "df-tip-color": "var(--df-tip-color)",
        "credit-text-color": "var(--credit-text-color)",

        // Profile card
        "profile-card-heading-color": "var(--profile-card-heading-color)",
        "profile-card-description-color":
          "var(--profile-card-description-color)",
        "profile-card-skill-color": "var(--profile-card-skill-color)",

        // Project card
        "project-card-bg-color": "var(--project-card-bg-color)",
        "project-card-border-color": "var(--project-card-border-color)",
        "project-card-heading-color": "var(--project-card-heading-color)",
        "project-card-description-color":
          "var(--project-card-description-color)",
        "project-card-reorder-btn-bg-color":
          "var(--project-card-reorder-btn-bg-color)",
        "project-card-reorder-btn-bg-hover-color":
          "var(--project-card-reorder-btn-bg-hover-color)",
        "project-card-reorder-btn-icon-color":
          "var(--project-card-reorder-btn-icon-color)",

        // Project Info card
        "project-info-card-heading-color":
          "var(--project-info-card-heading-color)",
        "project-info-card-description-color":
          "var(--project-info-card-description-color)",

        // Review card
        "review-card-bg-color": "var(--review-card-bg-color)",
        "review-card-border-color": "var(--review-card-border-color)",
        "review-card-heading-color": "var(--review-card-heading-color)",
        "review-card-description-color": "var(--review-card-description-color)",
        "review-card-text-color": "var(--review-card-text-color)",

        // Tool-box card
        "tools-card-item-bg-color": "var(--tools-card-item-bg-color)",
        "tools-card-item-border-color": "var(--tools-card-item-border-color)",
        "tools-card-item-text-color": "var(--tools-card-item-text-color)",

        // Work experience card
        "work-card-heading-color": "var(--work-card-heading-color)",
        "work-card-description-color": "var(--work-card-description-color)",
        "work-card-company-color": "var(--work-card-company-color)",
        "work-card-sort-icon-color": "var(--work-card-sort-icon-color)",

        // Modal
        "modal-heading-color": "var(--modal-heading-color)",
        "modal-bg-color": "var(--modal-bg-color)",
        "modal-footer-bg-color": "var(--modal-footer-bg-color)",

        // Popover
        "popover-bg-color": "var(--popover-bg-color)",
        "popover-border-color": "var(--popover-border-color)",
        "popover-heading-color": "var(--popover-heading-color)",

        // Theme-popover
        "default-theme-box-bg-color": "var(--default-theme-box-bg-color)",
        "default-theme-box-border-color":
          "var(--default-theme-box-border-color)",
        "default-theme-selected-color": "var(--default-theme-selected-color)",
        "default-theme-bg-hover-color": "var(--default-theme-bg-hover-color)",

        "theme-box-bg-color": "var(--theme-box-bg-color)",
        "theme-box-border-color": "var(--theme-box-border-color)",
        "theme-selected-color": "var(--theme-selected-color)",
        "theme-bg-hover-color": "var(--theme-bg-hover-color)",

        // Publish-popover
        "publish-popover-text-color": "var(--publish-popover-text-color)",
        "publish-popover-description-color":
          "var(--publish-popover-description-color)",

        // Task
        "progress-active-color": "var(--progress-active-color)",
        "progress-text-color": "var(--progress-text-color)",
        "progess-trail-color": "var(--progess-trail-color)",
        "checked-list-item-bg-color": "var(--checked-list-item-bg-color)",
        "checked-list-item-border-color":
          "var(--checked-list-item-border-color)",
        "checked-list-item-bg-hover-color":
          "var(--checked-list-item-bg-hover-color)",
        "checked-list-item-icon-color": "var(--checked-list-item-icon-color)",
        "checked-list-item-text-color": "var(--checked-list-item-text-color)",
        "check-list-empty-border-color": "var(--check-list-empty-border-color)",

        // Inputs
        "input-border-color": "var(--input-border-color)",
        "input-bg-color": "var(--input-bg-color)",
        "input-text-color": "var(--input-text-color)",
        "input-border-focus-color": "var(--input-border-focus-color)",
        "input-border-focus-shadow": "var(--input-border-focus-shadow)",
        "input-border-hover-shadow": "var(--input-border-hover-shadow)",
        "input-button-color": "var(--input-button-color)",
        "input-placeholder-color": "var(--input-placeholder-color)",
        "input-success-color": "var(--input-success-color)",
        "input-error-color": "var(--input-error-color)",
        "input-error-shadow": "var(--input-error-shadow)",
        "input-upload-border-color": "var(--input-upload-border-color)",
        "input-upload-bg-color": "var(--input-upload-bg-color)",
        "input-upload-heading-color": "var(--input-upload-heading-color)",
        "input-upload-description-color":
          "var(--input-upload-description-color)",
        "input-upload-icon-color": "var(--input-upload-icon-color)",
        "input-password-bg-color": "var(--input-password-bg-color)",
        "input-password-heading-color": "var(--input-password-heading-color)",
        "input-password-description-color":
          "var(--input-password-description-color)",
        "bottom-navigation-active-stroke":
          "var(--bottom-navigation-active-stroke)",
        "bottom-navigation-active-fill": "var(--bottom-navigation-active-fill)",
        "bottom-navigation-inactive-stroke":
          "var(--bottom-navigation-inactive-stroke)",
        "bottom-navigation-inactive-fill":
          "var(--bottom-navigation-inactive-fill)",
        "used-credit-text-color": "var(--used-credit-text-color)",
        "good-bg-color": "var(--good-bg-color)",
        "good-text-color": "var(--good-text-color)",
        "not-bad-bg-color": "var(--not-bad-bg-color)",
        "not-bad-text-color": "var(--not-bad-text-color)",
        "bad-bg-color": "var(--bad-bg-color)",
        "bad-text-color": "var(--bad-text-color)",
      },
      boxShadow: {
        // Landing page
        "landing-nav-link-hover": "0 1px 3px rgba(0, 0, 0, 0.1)",

        // Buttons
        "primary-btn": "0 4px 6px rgba(0, 0, 0, 0.1)",
        "secondary-btn": "var(--secondary-btn-shadow)",
        "tertiary-btn": "0 2px 4px rgba(255, 85, 62, 0.2)",
        "normal-btn": "0 2px 4px rgba(0, 0, 0, 0.1)",
        "modal-btn": "0 4px 6px rgba(0, 0, 0, 0.1)",
        "delete-btn": "inset 0 0 0 1px rgba(255, 59, 48, 0.5)",

        // Application
        "df-section-card": "0 2px 4px rgba(0, 0, 0, 0.2)",
        "df-add-card": "0 2px 4px rgba(0, 0, 0, 0.1)",

        // Profile card, Project card, Review card, etc.
        card: "0 2px 4px rgba(0, 0, 0, 0.1)",

        // Inputs
        "input-border-focus-shadow": "var(--input-border-focus-shadow)",
        "input-border-hover-shadow": "var(--input-border-hover-shadow)",
        "input-focus": "var(--input-border-focus-shadow",
        "input-hover": "var(--input-border-hover-shadow)",
        "input-error-shadow": "var(--input-error-shadow)",
        "popver-shadow": "var(--popver-shadow)",
        "df-add-item-shadow": "var(--df-add-item-shadow)",
        "df-section-card-shadow": "var(--df-section-card-shadow)",
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
        "p-xxxsmall": "12px",
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
        "p-xxxsmall": "16px",
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
