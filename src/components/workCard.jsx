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

  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    // Initial check
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-2 lg:gap-10">
      {!isMobileView && (
        <div className="lg:w-[25%]">
          <Text size="p-xsmall" className="text-work-card-description-color">
            {`${work?.startMonth} ${work?.startYear} - ${
              work?.currentlyWorking
                ? "Present"
                : `${work?.endMonth} ${work?.endYear}`
            }  `}
          </Text>
        </div>
      )}

      <div className="flex-1">
        <div>
          <div className="flex justify-between">
            <Text size="p-xsmall" className="text-work-card-company-color">
              {work?.company}
              {isMobileView && (
                <p
                  className={`${
                    theme == "dark" ? "text-[#B4B8C6]" : "text-[#788095]"
                  } text-[12.8px] lg:text-[16px] font-[500] font-inter`}
                >
                  {`${work?.startMonth} ${work?.startYear} - ${
                    work?.currentlyWorking
                      ? "Present"
                      : `${work?.endMonth} ${work?.endYear}`
                  }  `}
                </p>
              )}
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
