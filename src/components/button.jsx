import React, { useState } from "react";
import { twMerge } from "tailwind-merge"; // Import tailwind-merge
import { motion } from "framer-motion";

const Button = ({
  type = "primary",
  size = "large",
  icon = null,
  iconPosition = "left",
  isLoading = false,
  isDisabled = false,
  text,
  customClass = "",
  onClick,
  btnType = "button",
  form = "",
  animation = false,
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState(false); // State to track hover

  // Define size and style mappings
  const buttonSizes = {
    small: "p-2 pl-3 text-sm rounded-[8px] font-medium",
    medium: "p-2 text-base leading-[19.36px] rounded-lg font-inter font-medium",
    large: "p-4 text-base leading-[19.36px] rounded-2xl font-inter font-medium",
  };

  const buttonStyles = {
    primary: {
      base: "bg-primary-btn-bg hover:bg-primary-btn-bg-hover text-white border border-primary-btn-bg hover:border-primary-btn-bg-hover",
      disabled:
        "bg-primary-btn-bg hover:bg-primary-btn-bg-hover text-white border border-primary-btn-bg opacity-70 cursor-not-allowed",
    },
    secondary: {
      base: "bg-secondary-btn-bg hover:secondary-btn-bg-hover text-secondary-btn-text  border-solid border border-secondary-btn-border hover:secondary-btn-bg-hover hover:shadow-secondary-btn-shadow",
      disabled:
        "bg-secondary-btn-bg  text-secondary-btn-text  border-solid border border-secondary-btn-border opacity-70 cursor-not-allowed",
    },
    tertiary: {
      base: "bg-tertiary-btn-bg hover:bg-tertiary-btn-bg-hover text-tertiary-btn-text border-solid border border-tertiary-btn-border hover:border-tertiary-btn-bg-hover",
      disabled:
        "bg-tertiary-btn-bg text-tertiary-btn-text border-solid border border-tertiary-btn-border opacity-70 cursor-not-allowed",
    },
    normal: {
      base: "hover:bg-normal-btn-bg-hover text-normal-btn-text",
      disabled: "text-normal-btn-text opacity-70 cursor-not-allowed",
    },
    delete: {
      base: "bg-delete-btn-bg hover:bg-delete-btn-bg-hover text-delete-btn-icon border border-solid border-delete-btn-border hover:border-delete-btn-border-hover hover:shadow-delete-btn-hover",
      disabled:
        "bg-delete-btn-bg  border-delete-btn-border  opacity-70 cursor-not-allowed",
    },
  };

  // Function to get the final button style
  const getButtonStyle = () => {
    const baseStyle = buttonStyles[type]?.base || "";
    const disabledStyle = buttonStyles[type]?.disabled || "";
    const sizeStyle = buttonSizes[size] || "";

    return twMerge(
      "inline-flex items-center justify-center transition-all duration-500 ease-out rounded-2xl font-inter",
      sizeStyle,
      !isDisabled && !isLoading ? baseStyle : "",
      isDisabled || isLoading ? disabledStyle : "",
      customClass
    );
  };

  return (
    <button
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
          className={text ? "mr-2" : ""}
          animate={{ x: isHovered ? 2 : 0, y: isHovered ? -2 : 0 }} // Use isHovered to control animation
          transition={{ type: "spring", stiffness: 300 }}
        >
          {icon}
        </motion.span>
      )}
      {isLoading && (
        <svg
          className="animate-spin h-5 w-5 mr-3"
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
          className={text ? "ml-2" : ""}
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
