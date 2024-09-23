/* eslint-disable @next/next/no-img-element */
import React from "react";
import Text from "./text";

export default function AddItem({
  title = "title",
  className = "",
  onClick,
  iconLeft,
  iconRight,
}) {
  return (
    <div
      onClick={onClick}
      className={`flex gap-[8px] items-center justify-center rounded-[16px] px-[24px] py-[12px] bg-df-add-card-bg-color transition-all duration-150 ease-in   border border-df-add-card-border-color  hover:border-[3px] max-h-14 cursor-pointer ${className}`}
    >
      {!!iconLeft && iconLeft}
      <Text size="p-xxsmall" className="text-df-add-card-heading-color">
        {title}
      </Text>
      {!!iconRight && iconRight}
    </div>
  );
}
