import React from "react";
import Button from "./button";
import { Button as ButtonNew } from "@/components/ui/buttonNew";
import MenuIcon from "../../public/assets/svgs/menu-tabular.svg";
import CloseIcon from "../../public/assets/svgs/close-tabular.svg";

export default function MobileMenuButton({ isOpen, onToggle, className }) {
  const iconContent = (
    <div className="relative flex h-4 w-4 items-center justify-center">
      <MenuIcon
        className={`absolute cursor-pointer transition-all duration-300 ease-in-out ${
          isOpen ? "scale-75 opacity-0" : "scale-100 opacity-100"
        }`}
      />
      <CloseIcon
        className={`absolute cursor-pointer transition-all duration-300 ease-in-out ${
          isOpen ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      />
    </div>
  );

  return (
    <Button
      size="medium"
      customClass={`md:hidden border-border hover:border-border ${className}`}
      type="secondary"
      icon={iconContent}
      onClick={onToggle}
    />
  );
}
