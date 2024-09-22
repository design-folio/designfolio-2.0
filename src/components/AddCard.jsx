import ProjectIcon from "../../public/assets/svgs/projectIcon.svg";
import Button from "./button";
import Text from "./text";
import PlusIcon from "../../public/assets/svgs/plus.svg";

export default function AddCard({
  title = "title",
  className = "",
  subTitle = "",
  onClick,
  first = false,
  buttonTitle = "",

  icon = <ProjectIcon />,
}) {
  return (
    <div
      className={`bg-df-add-card-bg-color transition-all duration-150 ease-in   border border-df-add-card-border-color  hover:border-[3px] rounded-[24px] min-h-[344px] cursor-pointer ${className}`}
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

          <Button
            text={buttonTitle}
            size="small"
            type="secondary"
            customClass="w-fit gap-0"
            icon={<PlusIcon className="text-df-icon-color" />}
          />
        </div>
      ) : (
        <div className=" flex flex-col justify-center items-center  h-full">
          <Button
            icon={
              <PlusIcon className="text-primary-btn-text-color w-[20px] h-[20px]" />
            }
            text={"Add case study"}
            customClass="gap-0"
          />
        </div>
      )}
    </div>
  );
}
