import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

const Button = ({
  type = "primary",
  size = "large",
  icon = null,
  iconPosition = "left",
  iconClassName = "",
  isLoading = false,
  isDisabled = false,
  isSelected = false,
  text,
  customClass = "",
  onClick,
  btnType = "button",
  form = "",
  animation = false,
  style,
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Define size mappings with rounded-full styling
  const buttonSizes = {
    small: "p-2 text-sm rounded-full font-medium",
    medium: "px-4 py-2 text-[16px] rounded-full font-inter font-medium",
    large: "px-6 py-[9px] text-[16px] rounded-full font-inter font-medium",
    icon: "p-4 text-[16px] rounded-full font-inter font-medium",
  };

  const buttonStyles = {
    primary: {
      base: "bg-primary-btn-bg-color hover:bg-primary-btn-bg-hover-color text-primary-btn-text-color border border-primary-btn-bg-color hover:border-primary-btn-bg-hover-color cursor-pointer",
      disabled:
        "bg-primary-btn-bg-color hover:bg-primary-btn-bg-hover-color text-primary-btn-text-color border border-primary-btn-bg-color opacity-70 cursor-not-allowed",
    },
    secondary: {
      base: "bg-secondary-btn-bg-color hover:bg-secondary-btn-bg-hover-color text-secondary-btn-text-color border-solid border border-secondary-btn-border-color hover:secondary-btn-bg-hover-color hover:shadow-secondary-btn cursor-pointer",
      disabled:
        "bg-secondary-btn-bg-color text-secondary-btn-text-color border-solid border border-secondary-btn-border-color opacity-70 cursor-not-allowed",
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
        "bg-delete-btn-bg-color border-delete-btn-border-color opacity-70 cursor-not-allowed",
    },
    modal: {
      base: "bg-modal-btn-bg-color hover:bg-modal-btn-bg-hover-color text-modal-btn-text-color border border-modal-btn-border-color hover:border-modal-btn-bg-hover-color cursor-pointer",
      disabled:
        "bg-modal-btn-bg-color hover:bg-modal-btn-bg-hover-color text-modal-btn-text-color border border-modal-btn-bg-color opacity-70 cursor-not-allowed",
    },
    ai: {
      base: "text-ai-btn-text-color border border-ai-btn-border-color cursor-pointer",
      disabled: "text-ai-btn-text-color border border-ai-btn-border-color opacity-70 cursor-not-allowed",
    },
    tools: {
      base: "bg-transparent text-[#404040] hover:bg-[#FFF] rounded-full",
      selected: "bg-white border border-[#CDCDC6] rounded-full",
      disabled:
        "bg-transparent text-[#404040] hover:bg-[#FFF] rounded-full opacity-40",
    },
    toggleVisibility: {
      base: "bg-secondary-btn-bg-color hover:bg-secondary-btn-bg-hover-color text-secondary-btn-text-color border-solid border border-secondary-btn-border-color hover:secondary-btn-bg-hover-color hover:shadow-secondary-btn cursor-pointer",
      selected: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-400 hover:bg-amber-100 hover:dark:bg-amber-950/30 hover:text-amber-700 hover:dark:text-amber-400 border rounded-full",
      disabled:
        "bg-white dark:bg-[#23252F] border-border text-foreground border rounded-full opacity-40",
    },
  };

  // Function to get the final button style
  const getButtonStyle = () => {
    const baseStyle = buttonStyles[type]?.base || "";
    const disabledStyle = buttonStyles[type]?.disabled || "";
    const sizeStyle = buttonSizes[size] || "";
    const selectedStyle = buttonStyles[type]?.selected || "";

    return twMerge(
      "inline-flex gap-2 items-center justify-center transition-shadow duration-500 ease-out font-inter",
      sizeStyle,
      !isDisabled && !isLoading ? baseStyle : "",
      isDisabled || isLoading ? disabledStyle : "",
      isSelected && selectedStyle,
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
      form={form || undefined}
      type={btnType}
      aria-disabled={isDisabled || isLoading}
    >
      {icon && iconPosition === "left" && !isLoading && (
        <motion.span
          className={iconClassName}
          animate={{ x: isHovered ? 2 : 0, y: isHovered ? -2 : 0 }}
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
          animate={{ x: isHovered ? 2 : 0, y: isHovered ? -2 : 0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {icon}
        </motion.span>
      )}
    </button>
  );
};

export default Button;
