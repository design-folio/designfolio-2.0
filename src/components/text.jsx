import customTwMerge from "@/lib/customTailwindMerge";
import React from "react";

const Text = ({
  as = "p", // Default element is <p>
  size = "p-medium", // Default size is medium paragraph
  className = "",
  required = false,
  children,
  ...rest
}) => {
  // Map sizes to Tailwind CSS classes
  const textSizes = {
    h1: "text-h1 leading-h1",
    h2: "text-h2 leading-h2",
    h3: "text-h3 leading-h3",
    "section-heading": "font-gsans font-semibold text-2xl sm:text-3xl md:text-4xl text-foreground",
    "section-heading-sm": "font-gsans font-semibold text-xl sm:text-2xl text-foreground",
    'section-card-title': "font-semibold text-lg text-foreground-title",
    "p-large": "text-p-large leading-p-large font-semibold",
    "p-medium": "text-p-medium leading-p-medium",
    "p-small": "text-p-small leading-p-small font-medium",
    "p-xsmall": "text-p-xsmall leading-p-xsmall font-medium",
    "p-xxsmall": "text-p-xxsmall leading-p-xxsmall font-medium",
    "p-xxxsmall": "text-p-xxxsmall leading-p-xxxsmall font-medium",
    "p-xs-uppercase": "text-xs font-medium uppercase tracking-wider",
  };

  // Determine default classes based on size type
  const isHeadingVariant = size === "section-heading" || size === "section-heading-sm";
  const defaultClasses = isHeadingVariant
    ? ""
    : "font-inter text-base-text-color text-left font-medium";

  const Element = as;

  return (
    <Element
      className={customTwMerge(
        defaultClasses,
        textSizes[size] || textSizes["p-medium"], // Default to medium paragraph size
        className
      )}
      {...rest}
    >
      {children}
      {required && <span className="text-df-orange-color">*</span>}
    </Element>
  );
};

export default Text;



