import { useGlobalContext } from "@/context/globalContext";
import Text from "./text";


import TextWithLineBreaks from "./TextWithLineBreaks";
import { Button } from "./ui/buttonNew";
import { PencilIcon } from "lucide-react";

export default function WorkCard({ work, onClick, show = true, edit }) {
  const { setSelectedWork } = useGlobalContext();
  const handleClick = () => {
    setSelectedWork(work);
    onClick();
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-2 lg:gap-10">
      <div className="lg:w-[25%] hidden md:block">
        <Text size="p-xsmall" className="text-work-card-description-color">
          {`${work?.startMonth} ${work?.startYear} - ${work?.currentlyWorking
            ? "Present"
            : `${work?.endMonth} ${work?.endYear}`
            }  `}
        </Text>
      </div>

      <div className="flex-1">
        <div>
          <div className="flex flex-col md:flex-row gap-2 justify-between">
            <Text size="p-xsmall" className="text-work-card-company-color">
              {work?.company}
            </Text>
            <Text
              size="p-xsmall"
              className="text-work-card-description-color md:hidden"
            >
              {`${work?.startMonth} ${work?.startYear} - ${work?.currentlyWorking
                ? "Present"
                : `${work?.endMonth} ${work?.endYear}`
                }  `}
            </Text>

            {edit && show && (
              <Button
                className="h-11 w-11"
                onClick={handleClick}
                variant={"secondary"}
              ><PencilIcon className="text-df-icon-color cursor-pointer" /></Button>
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
