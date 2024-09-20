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
    "p-large": "text-p-large leading-p-large",
    "p-medium": "text-p-medium leading-p-medium",
    "p-small": "text-p-small leading-p-small",
    "p-xsmall": "text-p-xsmall leading-p-xsmall",
    "p-xxsmall": "text-p-xxsmall leading-p-xxsmall",
  };

  const Element = as;

  return (
    <Element
      className={customTwMerge(
        "font-inter text-base-text text-left",
        textSizes[size] || textSizes["p-medium"], // Default to medium paragraph size
        className
      )}
      {...rest}
    >
      {children}
      {required && <span className="text-tertiary-btn-bg">*</span>}
    </Element>
  );
};

export default Text;
