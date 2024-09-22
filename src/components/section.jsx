import React from "react";
import Text from "./text";
import Button from "./button";
import EditIcon from "../../public/assets/svgs/edit.svg";

export default function Section({
  children,
  title,
  icon,
  onClick,
  edit,
  imageClassName = "w-[20px] h-[20px]",
  className = "w-[20px] h-[20px]",
}) {
  return (
    <div
      className={`bg-df-section-card-bg-color shadow-df-section-card-shadow rounded-[24px] p-4 lg:p-[32px] break-words`}
    >
      <div className="flex items-center justify-between">
        <Text size="p-small" className="text-project-card-heading-color">
          {title}
        </Text>
        {edit && icon && (
          <Button
            onClick={onClick}
            customClass="!p-[13.38px] !flex-shrink-0"
            type={"secondary"}
            icon={<EditIcon className="text-df-icon-color" />}
          />
        )}
      </div>
      <div className="mt-4 md:mt-5">{children}</div>
    </div>
  );
}
