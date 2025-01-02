import React from "react";
import Text from "./text";
import Button from "./button";
import PreviewIcon from "../../public/assets/svgs/previewIcon.svg";
import { useRouter } from "next/router";

export default function GeneratorCard({
  src,
  title,
  description,
  buttonText = "Try now",
  route = "/",
}) {
  const router = useRouter();

  const handleRoute = () => {
    router.push(route);
  };
  return (
    <div className="rounded-[24px] bg-white border border-[#E3E7ED] p-6">
      <div className="flex items-center gap-2">
        <img src={src} alt="generator tool" />
        <Text size="p-small">{title}</Text>
      </div>

      <Text size="p-xsmall" className="mt-4">
        {description}
      </Text>
      <Button
        type="secondary"
        text={buttonText}
        customClass="w-full mt-4"
        icon={<PreviewIcon className="cursor-pointer" />}
        animation
        onClick={handleRoute}
      />
    </div>
  );
}
