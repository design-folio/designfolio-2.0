import React from "react";
import Text from "./text";

export default function AddItem({ title = "title", className = "", onClick, iconLeft, iconRight }) {
  return (
    <div
      onClick={onClick}
      className={`bg-background border-df-add-card-border-color hover:shadow-df-add-item-shadow flex max-h-14 cursor-pointer items-center justify-center gap-[8px] rounded-[16px] border px-[24px] py-[12px] transition-shadow duration-500 ease-in ${className}`}
    >
      {!!iconLeft && iconLeft}
      <Text size="p-xxsmall" className="text-df-add-card-heading-color">
        {title}
      </Text>
      {!!iconRight && iconRight}
    </div>
  );
}
