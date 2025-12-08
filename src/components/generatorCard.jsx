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
    <div className="rounded-[24px] bg-white border border-[#E3E7ED] p-6 hover:shadow-ai-card transition-shadow duration-500 ease-out group">
      <div className="flex items-center gap-2">
        <img src={src} alt="generator tool" />
        <Text
          size="p-small"
          className="font-gsans font-semibold text-xl sm:text-2xl text-foreground"
        >
          {title}
        </Text>
      </div>

      <Text
        size="p-xsmall"
        className="mt-4 text-sm sm:text-base text-muted-foreground"
      >
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
