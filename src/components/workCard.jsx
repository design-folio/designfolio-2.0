import { useGlobalContext } from "@/context/globalContext";
import Text from "./text";
import SimpleTiptapRenderer from "./SimpleTiptapRenderer";
import { Button } from "./ui/buttonNew";
import { PencilIcon, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { getPlainTextLength } from "@/lib/tiptapUtils";

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

  const isExpanded = expandedCards.includes(work?._id);
  const plainTextLength = getPlainTextLength(work?.description || "");
  const shouldShowToggle = plainTextLength > 180;

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
              <div className={shouldShowToggle && !isExpanded ? "max-h-[110px] overflow-hidden relative" : ""}>
                <SimpleTiptapRenderer
                  content={work?.description || ""}
                  mode="work"
                  enableBulletList={true}
                />
                {shouldShowToggle && !isExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-df-section-card-bg-color to-transparent pointer-events-none" />
                )}
              </div>
              {shouldShowToggle && (
                <button
                  onClick={() => toggleExpand(work?._id)}
                  className="mt-2 text-foreground/80 hover:text-foreground inline-flex items-center gap-1 underline underline-offset-4"
                >
                  {isExpanded ? (
                    <>
                      Show Less
                      <ChevronUp className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      View More
                      <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
