import { useGlobalContext } from "@/context/globalContext";
import Text from "./text";
import Button from "./button";
import EditIcon from "../../public/assets/svgs/edit.svg";
import TextWithLineBreaks from "./TextWithLineBreaks";

export default function WorkCard({ work, onClick, show = true, edit }) {
  const { setSelectedWork } = useGlobalContext();
  const handleClick = () => {
    setSelectedWork(work);
    onClick();
  };
  return (
    <div className="flex flex-col-reverse lg:flex-row gap-2 lg:gap-10">
      <div className="lg:w-[25%]">
        <Text size="p-xsmall" className="text-work-card-description-color">
          {`${work?.startMonth} ${work?.startYear} - ${
            work?.currentlyWorking
              ? "Present"
              : `${work?.endMonth} ${work?.endYear}`
          }  `}
        </Text>
      </div>
      <div className="flex-1">
        <div>
          <div className="flex justify-between">
            <Text size="p-xsmall" className="text-work-card-company-color">
              {work?.company}
            </Text>

            {edit && show && (
              <Button
                onClick={handleClick}
                customClass="!p-[13.38px] !flex-shrink-0"
                type={"secondary"}
                icon={<EditIcon className="text-df-icon-color" />}
              />
            )}
          </div>
          <Text size="p-small" className="text-work-card-heading-color my-2">
            {work?.role}
          </Text>

          <TextWithLineBreaks
            text={work?.description}
            color={"text-work-card-description-color"}
          />
        </div>
      </div>
    </div>
  );
}
