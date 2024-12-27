import React from "react";
import Text from "./text";
import Button from "./button";
import PreviewIcon from "../../public/assets/svgs/previewIcon.svg";

export default function GeneratorCard({ src, title, description }) {
  return (
    <div className="rounded-[24px] bg-white border border-[#E3E7ED] p-4">
      <div className="flex items-center gap-2">
        <img src={src} alt="generator tool" />
        <Text size="p-small">{title}</Text>
      </div>

      <Text size="p-xsmall" className="mt-4">
        {description}
      </Text>
      <Button
        type="secondary"
        text="Try now"
        customClass="w-full mt-4"
        icon={<PreviewIcon className="cursor-pointer" />}
        animation
      />
    </div>
  );
}
