import { modals } from "@/lib/constant";
import Section from "./section";
import Text from "./text";
import Button from "./button";
import PlusIcon from "../../public/assets/svgs/plus.svg";

export default function Tools({ userDetails, openModal, edit }) {
  return (
    <Section
      title={"My toolbox"}
      onClick={() => openModal(modals.tools)}
      edit={edit}
    >
      <div className="flex flex-wrap items-center gap-4 md:gap-5">
        {userDetails?.tools?.map((tool, i) => (
          <div
            title={tool?.label}
            key={i}
            className={`cursor-default h-full flex gap-2 justify-between items-center bg-tools-card-item-bg-color text-tools-card-item-text-color border-tools-card-item-border-color  border border-solid rounded-[16px] p-3`}
          >
            {tool?.image && (
              <img
                src={tool?.image}
                alt={tool?.label}
                className="w-[34px] h-[34px] "
              />
            )}
            <Text size="p-xsmall" className="text-tools-card-item-text-color">
              {tool?.label}
            </Text>
          </div>
        ))}
        {edit && (
          <Button
            type="secondary"
            icon={
              <PlusIcon className="text-secondary-btn-text-color w-[18px] h-[18px] cursor-pointer" />
            }
            onClick={() => openModal("tools")}
          />
        )}
      </div>
    </Section>
  );
}
