import { useGlobalContext } from "@/context/globalContext";
import Text from "./text";
import ClampableTiptapContent from "./ClampableTiptapContent";
import { Button } from "./ui/buttonNew";
import { PencilIcon } from "lucide-react";
import { useState } from "react";

export default function WorkCard({ work, onClick, show = true, edit, sorting = false }) {
  const { setSelectedWork } = useGlobalContext();
  const [expandedCards, setExpandedCards] = useState([]);

  const handleClick = () => {
    setSelectedWork(work);
    onClick();
  };

  const toggleExpand = (id) => {
    setExpandedCards((prev) =>
      prev.includes(id) ? prev.filter((cardId) => cardId !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-2 lg:gap-10">
      <div className="lg:w-[25%] hidden md:block">
        <Text size="p-xsmall" className="text-df-description-color">
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
              className="text-df-description-color md:hidden"
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
          <Text size="p-small" className="text-df-heading-color my-2">
            {work?.role}
          </Text>

          {!sorting && (
            <div className="text-df-description-color">
              <ClampableTiptapContent
                content={work?.description || ""}
                mode="work"
                enableBulletList={true}
                maxLines={3}
                itemId={work?._id}
                expandedIds={expandedCards}
                onToggleExpand={toggleExpand}
                buttonClassName="mt-2 text-foreground-landing/80 hover:text-foreground-landing inline-flex items-center gap-1 underline underline-offset-4"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
