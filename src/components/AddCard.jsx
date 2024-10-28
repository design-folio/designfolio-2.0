import ProjectIcon from "../../public/assets/svgs/projectIcon.svg";
import Button from "./button";
import Text from "./text";
import PlusIcon from "../../public/assets/svgs/plus.svg";
import AiIcon from "../../public/assets/svgs/ai.svg";
import { modals } from "@/lib/constant";

export default function AddCard({
  title = "title",
  className = "",
  subTitle = "",
  onClick,
  first = false,
  buttonTitle = "",
  secondaryButtonTitle,
  icon = <ProjectIcon />,
  openModal,
}) {
  const handleClick = (e) => {
    e.stopPropagation();
    openModal(modals.aiProject);
  };
  return (
    <div
      className={`bg-df-add-card-bg-color transition-shadow duration-500 ease-in   border border-df-add-card-border-color  hover:shadow-df-add-item-shadow rounded-[24px] min-h-[344px] cursor-pointer ${className}`}
      onClick={onClick}
    >
      {!first ? (
        <div className=" flex flex-col justify-center items-center  h-full">
          {icon}
          <Text size="p-small" className="text-df-add-card-heading-color mt-5">
            {title}
          </Text>

          <Text
            size="p-xxsmall"
            className="text-df-add-card-description-color mt-1 mb-6"
          >
            {subTitle}
          </Text>

          <div className="flex flex-col md:flex-row gap-2">
            <Button
              text={buttonTitle}
              customClass="w-fit gap-1 items-center"
              icon={
                <PlusIcon className="text-primary-btn-text-color w-[20px] h-[20px] mb-[2px]" />
              }
            />
            {secondaryButtonTitle && (
              <p className="text-df-add-card-description-color text-center md:hidden">
                {" "}
                or
              </p>
            )}

            {secondaryButtonTitle && (
              <Button
                onClick={handleClick}
                text={secondaryButtonTitle}
                type="secondary"
                customClass="w-fit gap-1 items-center"
                icon={
                  <AiIcon className="text-secondary-btn-text-color w-[22px] h-[22px] mb-[2px]" />
                }
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 justify-center items-center  h-full">
          <Button
            text={title}
            customClass="w-fit gap-1 items-center"
            icon={
              <PlusIcon className="text-primary-btn-text-color w-[20px] h-[20px] mb-[2px]" />
            }
          />
          {secondaryButtonTitle && (
            <p className="text-df-add-card-description-color"> or</p>
          )}

          {secondaryButtonTitle && (
            <Button
              onClick={handleClick}
              text={secondaryButtonTitle}
              type="secondary"
              customClass="w-fit gap-1 items-center"
              icon={
                <AiIcon className="text-secondary-btn-text-color w-[22px] h-[22px] mb-[2px]" />
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
