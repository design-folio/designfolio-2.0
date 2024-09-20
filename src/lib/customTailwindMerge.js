import { extendTailwindMerge } from "tailwind-merge";

const customTwMerge = extendTailwindMerge({
  extend: {
    theme: {
      // Ensure to include only scales used in multiple class groups to save bundle size
      colors: ["landing-bg", "heading-text", "description-text"], // Example with custom colors
      fontSize: [
        "h1",
        "h2",
        "h3",
        "p-large",
        "p-medium",
        "p-small",
        "p-xsmall",
        "p-xxsmall",
      ], // Example with custom font sizes
      lineHeight: [
        "h1",
        "h2",
        "h3",
        "p-large",
        "p-medium",
        "p-small",
        "p-xsmall",
        "p-xxsmall",
      ], // Example with custom line heights
    },
    classGroups: {
      // Define class groups to manage conflicts
      "text-color": ["text-base-text"], // Example with text color classes
      "text-size": [
        "text-h1",
        "text-h2",
        "text-h3",
        "text-p-large",
        "text-p-medium",
        "text-p-small",
        "text-p-xsmall",
        "text-p-xxsmall",
      ], // Example with text size classes
      // Add other class groups as needed
    },
  },
});

export default customTwMerge;
