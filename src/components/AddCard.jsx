import Text from "./text";
import AiIcon from "../../public/assets/svgs/ai.svg";
import { modals } from "@/lib/constant";
import { Button } from "./ui/buttonNew";
import { PlusIcon } from "lucide-react";
import MemoCasestudy from "./icons/Casestudy";

export default function AddCard({
  title = "title",
  className = "",
  subTitle = "",
  onClick,
  first = false,
  buttonTitle = "",
  secondaryButtonTitle,
  icon = <MemoCasestudy className="size-[72px]" />,
  openModal,
}) {
  const handleClick = (e) => {
    e.stopPropagation();
    openModal(modals.aiProject);
  };
  return (
    <div
      className={`bg-df-add-card-bg-color shadow-df-add-card-inset-shadow transition-shadow duration-500 ease-in border-border/30 hover:shadow-df-add-item-shadow rounded-2xl min-h-[344px] cursor-pointer ${className}`}
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
              className="w-fit gap-1 items-center"
            >
              <PlusIcon className="" />
              {buttonTitle}
            </Button>
            {secondaryButtonTitle && (
              <p className="text-df-add-card-description-color text-center md:hidden">
                {" "}
                or
              </p>
            )}

            {secondaryButtonTitle && (
              <Button
                onClick={handleClick}
                variant="secondary"
                className="w-fit gap-1 items-center rounded-full"
              ><AiIcon className="text-secondary-btn-text-color w-[22px] h-[22px] mb-[2px] cursor-pointer" />
                {secondaryButtonTitle}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 justify-center items-center  h-full">
          <Button
            className="w-fit gap-1 items-center"
          >
            <PlusIcon className="text-primary-btn-text-color w-[20px] h-[20px] mb-[2px] cursor-pointer" />
            {title}
          </Button>
          {secondaryButtonTitle && (
            <p className="text-df-add-card-description-color"> or</p>
          )}

          {secondaryButtonTitle && (
            <Button
              onClick={handleClick}
              variant="secondary"
              className="w-fit gap-1 items-center rounded-full"
            >
              <AiIcon className="text-secondary-btn-text-color w-[22px] h-[22px] mb-[2px] cursor-pointer" />
              {secondaryButtonTitle}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
