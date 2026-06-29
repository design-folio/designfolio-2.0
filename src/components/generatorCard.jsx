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
    <div className="hover:shadow-ai-card group rounded-[24px] border border-[#E3E7ED] bg-white p-6 transition-shadow duration-500 ease-out">
      <div className="flex items-center gap-2">
        <img src={src} alt="generator tool" />
        <Text as="h3" size="section-card-title">
          {title}
        </Text>
      </div>

      <Text size="p-xsmall" className="text-muted-foreground mt-4 text-sm font-normal">
        {description}
      </Text>
      <Button
        text={buttonText}
        customClass="w-full mt-4 text-[#293547] bg-[#fff] border-[#E0E6EB] group-hover:!bg-[#293547] group-hover:!text-[#fff] transition-all duration-500 ease-out"
        icon={<PreviewIcon className="cursor-pointer" />}
        animation
        onClick={handleRoute}
      />
    </div>
  );
}
