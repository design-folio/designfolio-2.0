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
      className={`bg-background shadow-df-add-card-inset-shadow border-border/30 hover:shadow-df-add-item-shadow min-h-[344px] cursor-pointer rounded-2xl transition-shadow duration-500 ease-in ${className}`}
      onClick={onClick}
    >
      {!first ? (
        <div className="flex h-full flex-col items-center justify-center">
          {icon}
          <Text size="p-small" className="text-df-add-card-heading-color mt-5">
            {title}
          </Text>

          <Text size="p-xxsmall" className="text-df-add-card-description-color mt-1 mb-6">
            {subTitle}
          </Text>

          <div className="flex flex-col gap-2 md:flex-row">
            <Button className="w-fit items-center gap-1">
              <PlusIcon className="" />
              {buttonTitle}
            </Button>
            {secondaryButtonTitle && (
              <p className="text-df-add-card-description-color text-center md:hidden"> or</p>
            )}

            {secondaryButtonTitle && (
              <Button
                onClick={handleClick}
                variant="secondary"
                className="w-fit items-center gap-1 rounded-full"
              >
                <AiIcon className="text-secondary-btn-text-color mb-[2px] h-[22px] w-[22px] cursor-pointer" />
                {secondaryButtonTitle}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <Button className="w-fit items-center gap-1">
            <PlusIcon className="text-primary-btn-text-color mb-[2px] h-[20px] w-[20px] cursor-pointer" />
            {title}
          </Button>
          {secondaryButtonTitle && <p className="text-df-add-card-description-color"> or</p>}

          {secondaryButtonTitle && (
            <Button
              onClick={handleClick}
              variant="secondary"
              className="w-fit items-center gap-1 rounded-full"
            >
              <AiIcon className="text-secondary-btn-text-color mb-[2px] h-[22px] w-[22px] cursor-pointer" />
              {secondaryButtonTitle}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
