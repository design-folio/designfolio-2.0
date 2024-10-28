import React, { useState } from "react";
import { twMerge } from "tailwind-merge"; // Import tailwind-merge
import { motion } from "framer-motion";

const Button = ({
  type = "primary",
  size = "large",
  icon = null,
  iconPosition = "left",
  iconClassName = "",
  isLoading = false,
  isDisabled = false,
  text,
  customClass = "",
  onClick,
  btnType = "button",
  form = "",
  animation = false,
  style,
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState(false); // State to track hover

  // Define size and style mappings
  const buttonSizes = {
    small: "p-2  text-sm rounded-[8px] font-medium",
    medium: "p-3 text-[16px] rounded-2xl font-inter font-medium",
    large: "p-4 text-[16px] rounded-2xl font-inter font-medium",
  };

  const buttonStyles = {
    primary: {
      base: "bg-primary-btn-bg-color hover:bg-primary-btn-bg-hover-color text-primary-btn-text-color border border-primary-btn-bg-color hover:border-primary-btn-bg-hover-color cursor-pointer",
      disabled:
        "bg-primary-btn-bg-color hover:bg-primary-btn-bg-hover-color text-primary-btn-text-color border border-primary-btn-bg-color opacity-70 cursor-not-allowed",
    },
    secondary: {
      base: "bg-secondary-btn-bg-color hover:bg-secondary-btn-bg-hover-color text-secondary-btn-text-color  border-solid border border-secondary-btn-border-color hover:secondary-btn-bg-hover-color hover:shadow-secondary-btn cursor-pointer",
      disabled:
        "bg-secondary-btn-bg-color  text-secondary-btn-text-color  border-solid border border-secondary-btn-border-color opacity-70 cursor-not-allowed",
    },
    tertiary: {
      base: "bg-tertiary-btn-bg-color hover:bg-tertiary-btn-bg-hover-color text-tertiary-btn-text-color border-solid border border-tertiary-btn-border-color hover:border-tertiary-btn-bg-hover-color cursor-pointer",
      disabled:
        "bg-tertiary-btn-bg-color text-tertiary-btn-text-color border-solid border border-tertiary-btn-border-color opacity-70 cursor-not-allowed",
    },
    normal: {
      base: "hover:bg-normal-btn-bg-hover-color text-normal-btn-text-color cursor-pointer",
      disabled: "text-normal-btn-text-color opacity-70 cursor-not-allowed",
    },
    delete: {
      base: "bg-delete-btn-bg-color hover:bg-delete-btn-bg-hover-color text-delete-btn-icon-color border border-solid border-delete-btn-border-color hover:border-delete-btn-border-hover-color hover:shadow-delete-btn cursor-pointer",
      disabled:
        "bg-delete-btn-bg-color  border-delete-btn-border-color  opacity-70 cursor-not-allowed",
    },
    modal: {
      base: "bg-modal-btn-bg-color hover:bg-modal-btn-bg-hover-color text-modal-btn-text-color border border-modal-btn-border-color hover:border-modal-btn-bg-hover-color cursor-pointer",
      disabled:
        "bg-modal-btn-bg-color hover:bg-modal-btn-bg-hover-color text-modal-btn-text-color border border-modal-btn-bg-color opacity-70 cursor-not-allowed",
    },
    ai: {
      base: "text-ai-btn-text-color border border-ai-btn-border-color cursor-pointer",
      disabled: "text-ai-btn-text-color border border-ai-btn-border-color",
    },
  };

  // Function to get the final button style
  const getButtonStyle = () => {
    const baseStyle = buttonStyles[type]?.base || "";
    const disabledStyle = buttonStyles[type]?.disabled || "";
    const sizeStyle = buttonSizes[size] || "";

    return twMerge(
      "inline-flex gap-2 items-center justify-center transition-shadow duration-500 ease-out rounded-2xl font-inter",
      sizeStyle,
      !isDisabled && !isLoading ? baseStyle : "",
      isDisabled || isLoading ? disabledStyle : "",
      customClass
    );
  };

  return (
    <button
      style={style}
      className={getButtonStyle()}
      onClick={onClick}
      onMouseEnter={() => animation && setIsHovered(true)}
      onMouseLeave={() => animation && setIsHovered(false)}
      disabled={isDisabled || isLoading}
      {...rest}
      form={form}
      type={btnType}
      aria-disabled={isDisabled || isLoading} // Better practice for disabled state
    >
      {icon && iconPosition === "left" && !isLoading && (
        <motion.span
          className={iconClassName}
          animate={{ x: isHovered ? 2 : 0, y: isHovered ? -2 : 0 }} // Use isHovered to control animation
          transition={{ type: "spring", stiffness: 300 }}
        >
          {icon}
        </motion.span>
      )}
      {isLoading && (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V2.5A9.5 9.5 0 002.5 12H4z"
          ></path>
        </svg>
      )}
      {text}
      {icon && iconPosition === "right" && !isLoading && (
        <motion.span
          className={iconClassName}
          animate={{ x: isHovered ? 2 : 0, y: isHovered ? -2 : 0 }} // Use isHovered to control animation
          transition={{ type: "spring", stiffness: 300 }}
        >
          {icon}
        </motion.span>
      )}
    </button>
  );
};

export default Button;
