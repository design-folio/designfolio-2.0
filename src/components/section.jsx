import React from "react";
import Text from "./text";
import { PencilIcon } from "lucide-react";
import { Button } from "./ui/buttonNew";


export default function Section({
  children,
  title,
  icon = <PencilIcon className="text-df-icon-color cursor-pointer" />,
  onClick,
  edit,
  btnType = "secondary",
}) {
  return (
    <div
      className={`bg-df-section-card-bg-color shadow-df-section-card-shadow rounded-[24px] p-4 lg:p-[32px] break-words`}
    >
      <div className="flex items-center justify-between">
        <Text
          size="p-small"
          className="text-project-card-heading-color font-semibold"
        >
          {title}
        </Text>
        {edit && icon && (
          <Button variant="secondary" className="h-11 w-11" onClick={onClick} type={btnType} size="icon" >{icon}</Button>
        )}
      </div>
      <div className="mt-4 md:mt-5">{children}</div>
    </div>
  );
}
